import os
from unittest.mock import patch

import pytest

import dodo.utils as utils
from dodo.agents.agent_loop import AgentLoop
from dodo.schemas.enums import MessageRole, ProviderType
from dodo.schemas.providers import Provider as PydanticProvider, ProviderCreate
from dodo.schemas.user import User

utils.DEBUG = True
from dodo.config import dodoConfig
from dodo.orm.errors import NoResultFound
from dodo.schemas.agent import CreateAgent
from dodo.schemas.message import MessageCreate
from dodo.schemas.run import Run as PydanticRun
from dodo.server.server import SyncServer


@pytest.fixture(autouse=True)
def mock_openai_client():
    async def mock_request_async(self, request_data: dict, llm_config):
        model = llm_config.model if llm_config else "mock-model"
        if "input" in request_data and "messages" not in request_data:
            outputs = []
            if request_data.get("tools"):
                tool_names = []
                for t in request_data["tools"]:
                    if "name" in t:
                        tool_names.append(t["name"])
                    elif "function" in t and "name" in t["function"]:
                        tool_names.append(t["function"]["name"])
                target_tool = "send_message" if "send_message" in tool_names else (tool_names[0] if tool_names else "send_message")
                outputs.append({
                    "type": "function_call",
                    "call_id": "call-mock-tool",
                    "name": target_tool,
                    "arguments": '{"message": "Mock Responses API response"}'
                })
            else:
                outputs.append({
                    "type": "message",
                    "content": [
                        {
                            "type": "output_text",
                            "text": "Mock Responses API response"
                        }
                    ]
                })
            return {
                "id": "resp-mock",
                "object": "response",
                "created_at": 1677652288,
                "model": model,
                "status": "completed",
                "output": outputs,
                "usage": {
                    "input_tokens": 10,
                    "output_tokens": 20,
                    "total_tokens": 30
                }
            }
        else:
            tool_calls = None
            if request_data.get("tools"):
                tool_names = []
                for t in request_data["tools"]:
                    if "function" in t and "name" in t["function"]:
                        tool_names.append(t["function"]["name"])
                    elif "name" in t:
                        tool_names.append(t["name"])
                target_tool = "send_message" if "send_message" in tool_names else (tool_names[0] if tool_names else "send_message")
                tool_calls = [
                    {
                        "id": "call-mock-tool",
                        "type": "function",
                        "function": {
                            "name": target_tool,
                            "arguments": '{"message": "Mock standard response text"}'
                        }
                    }
                ]
            return {
                "id": "chatcmpl-mock",
                "object": "chat.completion",
                "created": 1677652288,
                "model": model,
                "choices": [
                    {
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": None if tool_calls else "Mock standard response text",
                            "tool_calls": tool_calls
                        },
                        "finish_reason": "tool_calls" if tool_calls else "stop"
                    }
                ],
                "usage": {
                    "prompt_tokens": 10,
                    "completion_tokens": 20,
                    "total_tokens": 30
                }
            }

    async def mock_request_embeddings(self, inputs, embedding_config):
        return [[0.0] * 1536 for _ in inputs]

    with patch("dodo.llm_api.openai_client.OpenAIClient.request_async", mock_request_async), \
         patch("dodo.llm_api.openai_client.OpenAIClient.request_embeddings", mock_request_embeddings):
        yield


@pytest.fixture
async def server():
    config = dodoConfig.load()
    config.save()
    server = SyncServer(init_with_default_org_and_user=True)
    await server.init_async()
    await server.tool_manager.upsert_base_tools_async(actor=server.default_user)

    yield server


@pytest.fixture
async def org_id(server):
    # create org
    org = await server.organization_manager.create_default_organization_async()

    yield org.id

    # cleanup
    await server.organization_manager.delete_organization_by_id_async(org.id)


@pytest.fixture
async def user(server, org_id):
    user = await server.user_manager.create_default_actor_async(org_id=org_id)
    yield user


@pytest.fixture
def user_id(server, user):
    # create user
    yield user.id


provider_name = "custom-anthropic29"


@pytest.fixture
async def custom_anthropic_provider(server: SyncServer, user_id: str):
    actor = await server.user_manager.get_actor_or_default_async()

    # check if provider already exists
    existing_providers = await server.provider_manager.list_providers_async(actor=actor)
    for provider in existing_providers:
        if provider.name == provider_name:
            # delete provider
            await server.provider_manager.delete_provider_by_id_async(provider.id, actor=actor)

    provider = await server.provider_manager.create_provider_async(
        ProviderCreate(
            name=provider_name,
            provider_type=ProviderType.anthropic,
            api_key=os.getenv("ANTHROPIC_API_KEY") or "mock-anthropic-key",
        ),
        actor=actor,
    )
    yield provider
    # Try to delete provider if it still exists (test may have already deleted it)
    try:
        await server.provider_manager.delete_provider_by_id_async(provider.id, actor=actor)
    except NoResultFound:
        pass  # Provider was already deleted in the test


@pytest.fixture
async def agent(server: SyncServer, user: User):
    await server.user_manager.get_actor_or_default_async()
    agent = await server.create_agent_async(
        CreateAgent(
            agent_type="dodo_v2_agent",
        ),
    )
    return agent


@pytest.mark.asyncio
async def test_messages_with_provider_override(server: SyncServer, custom_anthropic_provider: PydanticProvider, user):
    # list the models
    models = await server.list_llm_models_async(actor=user)
    for model in models:
        if model.provider_name == provider_name:
            print(model.model)

    actor = await server.user_manager.get_actor_or_default_async()
    agent = await server.create_agent_async(
        CreateAgent(
            agent_type="dodo_v1_agent",
            memory_blocks=[],
            model=f"{provider_name}/claude-sonnet-4-5-20250929",
            context_window_limit=100000,
            embedding="openai/text-embedding-ada-002",
            include_base_tools=False,
        ),
        actor=actor,
    )

    existing_messages = await server.message_manager.list_messages(agent_id=agent.id, actor=actor)

    # send a message
    run = await server.run_manager.create_run(
        pydantic_run=PydanticRun(
            agent_id=agent.id,
            background=False,
        ),
        actor=actor,
    )
    agent_loop = AgentLoop.load(agent_state=agent, actor=actor)
    response = await agent_loop.step(
        input_messages=[MessageCreate(role=MessageRole.user, content="Test message")],
        run_id=run.id,
    )
    usage = response.usage

    get_messages_response = await server.message_manager.list_messages(agent_id=agent.id, actor=actor, after=existing_messages[-1].id)

    # usage = await server.message_manager.create_message(user_id=actor.id, agent_id=agent.id, message="Test message")
    # assert usage, "Sending message failed"

    # get_messages_response = await server.message_manager.list_messages_for_agent_async(agent_id=agent.id, actor=actor, after=existing_messages[-1].id)
    # assert len(get_messages_response) > 0, "Retrieving messages failed"

    step_ids = set([msg.step_id for msg in get_messages_response])
    completion_tokens, prompt_tokens, total_tokens = 0, 0, 0
    for step_id in step_ids:
        step = await server.step_manager.get_step_async(step_id=step_id, actor=actor)
        assert step, "Step was not logged correctly"
        # assert step.provider_id == custom_anthropic_provider.id
        assert step.provider_name == agent.llm_config.model_endpoint_type
        assert step.model == agent.llm_config.model
        assert step.context_window_limit == agent.llm_config.context_window
        completion_tokens += int(step.completion_tokens)
        prompt_tokens += int(step.prompt_tokens)
        total_tokens += int(step.total_tokens)

    assert completion_tokens == usage.completion_tokens
    assert prompt_tokens == usage.prompt_tokens
    assert total_tokens == usage.total_tokens

    # await server.provider_manager.delete_provider_by_id_async(custom_anthropic_provider.id, actor=actor)

    # existing_messages = await server.message_manager.list_messages(agent_id=agent.id, actor=actor)

    ## with pytest.raises(NoResultFound):
    # agent_loop = AgentLoop.load(agent_state=agent, actor=actor)
    # response = await agent_loop.step(
    #    input_messages=[MessageCreate(role=MessageRole.user, content="Test message")],
    #    run_id=run.id,
    # )
    # print("RESULT", response)

    # usage = await server.message_manager.create_user_message_async(user_id=actor.id, agent_id=agent.id, message="Test message")
    # assert usage, "Sending message failed"

    # get_messages_response = await server.message_manager.list_messages_for_agent_async(agent_id=agent.id, actor=actor, after=existing_messages[-1].id)
    # assert len(get_messages_response) > 0, "Retrieving messages failed"

    # step_ids = set([msg.step_id for msg in get_messages_response])
    # completion_tokens, prompt_tokens, total_tokens = 0, 0, 0
    # for step_id in step_ids:
    #    step = await server.step_manager.get_step_async(step_id=step_id, actor=actor)
    #    assert step, "Step was not logged correctly"
    #    assert step.provider_id == None
    #    assert step.provider_name == agent.llm_config.model_endpoint_type
    #    assert step.model == agent.llm_config.model
    #    assert step.context_window_limit == agent.llm_config.context_window
    #    completion_tokens += int(step.completion_tokens)
    #    prompt_tokens += int(step.prompt_tokens)
    #    total_tokens += int(step.total_tokens)

    # assert completion_tokens == usage.completion_tokens
    # assert prompt_tokens == usage.prompt_tokens
    # assert total_tokens == usage.total_tokens


@pytest.mark.asyncio
async def test_messages_with_provider_override_legacy_agent(server: SyncServer, custom_anthropic_provider: PydanticProvider, user):
    # list the models
    models = await server.list_llm_models_async(actor=user)
    for model in models:
        if model.provider_name == provider_name:
            print(model.model)

    actor = await server.user_manager.get_actor_or_default_async()
    agent = await server.create_agent_async(
        CreateAgent(
            agent_type="dodo_v2_agent",
            memory_blocks=[],
            model=f"{provider_name}/claude-sonnet-4-5-20250929",
            context_window_limit=100000,
            embedding="openai/text-embedding-ada-002",
        ),
        actor=actor,
    )

    existing_messages = await server.message_manager.list_messages(agent_id=agent.id, actor=actor)

    # send a message
    run = await server.run_manager.create_run(
        pydantic_run=PydanticRun(
            agent_id=agent.id,
            background=False,
        ),
        actor=actor,
    )
    agent_loop = AgentLoop.load(agent_state=agent, actor=actor)
    response = await agent_loop.step(
        input_messages=[MessageCreate(role=MessageRole.user, content="Test message")],
        run_id=run.id,
    )
    usage = response.usage

    get_messages_response = await server.message_manager.list_messages(agent_id=agent.id, actor=actor, after=existing_messages[-1].id)

    # usage = await server.message_manager.create_message(user_id=actor.id, agent_id=agent.id, message="Test message")
    # assert usage, "Sending message failed"

    # get_messages_response = await server.message_manager.list_messages_for_agent_async(agent_id=agent.id, actor=actor, after=existing_messages[-1].id)
    # assert len(get_messages_response) > 0, "Retrieving messages failed"

    step_ids = set([msg.step_id for msg in get_messages_response])
    completion_tokens, prompt_tokens, total_tokens = 0, 0, 0
    for step_id in step_ids:
        step = await server.step_manager.get_step_async(step_id=step_id, actor=actor)
        assert step, "Step was not logged correctly"
        # assert step.provider_id == custom_anthropic_provider.id
        assert step.provider_name == agent.llm_config.model_endpoint_type
        assert step.model == agent.llm_config.model
        assert step.context_window_limit == agent.llm_config.context_window
        completion_tokens += int(step.completion_tokens)
        prompt_tokens += int(step.prompt_tokens)
        total_tokens += int(step.total_tokens)

    assert completion_tokens == usage.completion_tokens
    assert prompt_tokens == usage.prompt_tokens
    assert total_tokens == usage.total_tokens

    # await server.provider_manager.delete_provider_by_id_async(custom_anthropic_provider.id, actor=actor)

    # existing_messages = await server.message_manager.list_messages(agent_id=agent.id, actor=actor)

    ## with pytest.raises(NoResultFound):
    # agent_loop = AgentLoop.load(agent_state=agent, actor=actor)
    # response = await agent_loop.step(
    #    input_messages=[MessageCreate(role=MessageRole.user, content="Test message")],
    #    run_id=run.id,
    # )
    # print("RESULT", response)


@pytest.mark.asyncio
async def test_unique_handles_for_provider_configs(server: SyncServer, user: User):
    models = await server.list_llm_models_async(actor=user)
    model_handles = [model.handle for model in models]
    assert sorted(model_handles) == sorted(list(set(model_handles))), "All models should have unique handles"
    embeddings = await server.list_embedding_models_async(actor=user)
    embedding_handles = [embedding.handle for embedding in embeddings]
    assert sorted(embedding_handles) == sorted(list(set(embedding_handles))), "All embeddings should have unique handles"


