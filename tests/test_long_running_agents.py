import os
import threading
import time

import httpx
import pytest
import requests
from dotenv import load_dotenv
from dodo.client import dodo, MessageCreate, TextContent

from tests.helpers.utils import upload_test_agentfile_from_disk

RESEARCH_INSTRUCTIONS = "\n    Lead Name: Kian Jones\n    Lead Title: Software Engineer\n    Lead LinkedIn URL: https://www.linkedin.com/in/kian-jones\n    Company Name: dodo\n    Company Domain: dodo.com\n    Company Industry: technology/software/ai\n    \n**Research Instructions**\n"
DEEP_RESEARCH_INSTRUCTIONS = "Let's get started, we have to research mantis shrimps. I need to know everything there is, or my grandmother will die. Please begin immediately and do a great job, they are scaring me."


@pytest.fixture(scope="module")
def server_url() -> str:
    """
    Provides the URL for the dodo server.
    If dodo_SERVER_URL is not set, starts the server in a background thread
    and polls until it's accepting connections.
    """

    def _run_server() -> None:
        load_dotenv()
        from dodo.server.rest_api.app import start_server

        start_server(debug=True)

    api_url = os.getenv("dodo_API_URL")
    if api_url:
        return api_url

    url: str = os.getenv("dodo_SERVER_URL", "http://localhost:8283")

    if not os.getenv("dodo_SERVER_URL"):
        thread = threading.Thread(target=_run_server, daemon=True)
        thread.start()

        # Poll until the server is up (or timeout)
        timeout_seconds = 60
        deadline = time.time() + timeout_seconds
        while time.time() < deadline:
            try:
                resp = requests.get(url + "/v1/health")
                if resp.status_code < 500:
                    break
            except requests.exceptions.RequestException:
                pass
            time.sleep(0.1)
        else:
            raise RuntimeError(f"Could not reach {url} within {timeout_seconds}s")

    return url


@pytest.fixture(scope="module")
def client(server_url: str) -> dodo:
    """
    Creates and returns a synchronous dodo REST client for testing.
    """
    api_url = os.getenv("dodo_API_URL")
    api_key = os.getenv("dodo_API_KEY")

    if api_url and not api_key:
        raise ValueError("dodo_API_KEY is required when passing dodo_API_URL")

    client_instance = dodo(token=api_key, base_url=api_url if api_url else server_url)
    return client_instance


async def test_deep_research_agent(client: dodo, server_url, disable_e2b_api_key):
    imported_af = upload_test_agentfile_from_disk(client, "deep-thought.af")

    agent_id = imported_af.agent_ids[0]

    try:
        response = client.agents.messages.create_stream(
            agent_id=agent_id,
            stream_tokens=True,
            include_pings=True,
            messages=[
                MessageCreate(
                    role="user",
                    content=[
                        TextContent(
                            text=DEEP_RESEARCH_INSTRUCTIONS,
                        )
                    ],
                )
            ],
        )
        for chunk in response:
            if chunk.message_type is not None:
                print(chunk)
    except httpx.ReadTimeout as e:
        print("Timeout on create_stream. Consider enabling pings in create_stream if you have long running agents. ", e)
        assert False
    finally:
        client.agents.delete(agent_id=agent_id)


async def test_kylie_agent(client: dodo, server_url, disable_e2b_api_key):
    imported_af = upload_test_agentfile_from_disk(client, "long_running_kylie.af")

    agent_id = imported_af.agent_ids[0]

    try:
        response = client.agents.messages.create_stream(
            agent_id=agent_id,
            include_pings=True,
            stream_tokens=True,
            messages=[
                MessageCreate(
                    role="user",
                    content=[
                        TextContent(
                            text=RESEARCH_INSTRUCTIONS,
                        )
                    ],
                )
            ],
        )
        for chunk in response:
            if chunk.message_type is not None:
                print(chunk)
    except httpx.ReadTimeout as e:
        print("Timeout on create_stream. Consider enabling pings in create_stream if you have long running agents. ", e)
        assert False
    finally:
        client.agents.delete(agent_id=agent_id)

