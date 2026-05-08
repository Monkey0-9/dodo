import httpx
from typing import Any, Dict, List, Optional, Union

from dodo.errors import dodoError
from dodo.schemas.agent import AgentState, AgentStepResponse, CreateAgent, UpdateAgent
from dodo.schemas.block import Block, CreateBlock
from dodo.schemas.job import Job
from dodo.schemas.message import Message, MessageCreate
from dodo.schemas.organization import Organization
from dodo.schemas.source import Source
from dodo.schemas.tool import Tool
from dodo.schemas.user import User


class DodoClient:
    """Institutional-grade Dodo SDK client for interacting with the Dodo server.

    Optimized for high-concurrency and production-ready operational integrity.
    """

    def __init__(
        self,
        base_url: str = "http://localhost:8283",
        token: Optional[str] = None,
        timeout: float = 60.0,
    ):
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.headers = {"Content-Type": "application/json"}
        if token:
            self.headers["Authorization"] = f"Bearer {token}"

        self.client = httpx.Client(
            base_url=self.base_url,
            headers=self.headers,
            timeout=timeout,
        )

        # Resources
        self.agents = AgentsResource(self)
        self.tools = ToolsResource(self)
        self.blocks = BlocksResource(self)
        self.sources = SourcesResource(self)
        self.jobs = JobsResource(self)
        self.users = UsersResource(self)
        self.organizations = OrganizationsResource(self)

    def _request(self, method: str, path: str, **kwargs) -> Any:
        try:
            resp = self.client.request(method, path, **kwargs)
            resp.raise_for_status()
            if resp.status_code == 204:
                return None
            return resp.json()
        except httpx.HTTPStatusError as e:
            # Handle specific error types if needed
            raise dodoError(f"API Error: {e.response.text}") from e
        except Exception as e:
            raise dodoError(f"Connection Error: {e}") from e

    def get(self, path: str, **kwargs) -> Any:
        return self._request("GET", path, **kwargs)

    def post(self, path: str, **kwargs) -> Any:
        return self._request("POST", path, **kwargs)

    def patch(self, path: str, **kwargs) -> Any:
        return self._request("PATCH", path, **kwargs)

    def delete(self, path: str, **kwargs) -> Any:
        return self._request("DELETE", path, **kwargs)


class BaseResource:
    def __init__(self, client: DodoClient):
        self.client = client


class AgentsResource(BaseResource):
    def create(self, **kwargs) -> AgentState:
        data = kwargs
        resp = self.client.post("/v1/agents", json=data)
        return AgentState(**resp)

    def get(self, agent_id: str) -> AgentState:
        resp = self.client.get(f"/v1/agents/{agent_id}")
        return AgentState(**resp)

    def update(self, agent_id: str, **kwargs) -> AgentState:
        resp = self.client.patch(f"/v1/agents/{agent_id}", json=kwargs)
        return AgentState(**resp)

    def delete(self, agent_id: str):
        self.client.delete(f"/v1/agents/{agent_id}")

    def list(self) -> List[AgentState]:
        resp = self.client.get("/v1/agents")
        return [AgentState(**a) for a in resp]

    @property
    def messages(self):
        return MessagesResource(self.client)


class MessagesResource(BaseResource):
    def list(self, agent_id: str, **kwargs) -> List[Message]:
        resp = self.client.get(f"/v1/agents/{agent_id}/messages", params=kwargs)
        return [Message(**m) for m in resp]

    def create(self, agent_id: str, **kwargs) -> AgentStepResponse:
        resp = self.client.post(f"/v1/agents/{agent_id}/messages", json=kwargs)
        return AgentStepResponse(**resp)


class ToolsResource(BaseResource):
    def create(self, **kwargs) -> Tool:
        resp = self.client.post("/v1/tools", json=kwargs)
        return Tool(**resp)

    def get(self, tool_id: str) -> Tool:
        resp = self.client.get(f"/v1/tools/{tool_id}")
        return Tool(**resp)

    def update(self, tool_id: str, **kwargs) -> Tool:
        resp = self.client.patch(f"/v1/tools/{tool_id}", json=kwargs)
        return Tool(**resp)

    def delete(self, tool_id: str):
        self.client.delete(f"/v1/tools/{tool_id}")

    def list(self) -> List[Tool]:
        resp = self.client.get("/v1/tools")
        return [Tool(**t) for t in resp]

    def upsert_from_function(self, func, tags: Optional[List[str]] = None):
        """Helper to create or update a tool from a Python function."""
        from dodo.functions.functions import parse_source_code

        source_code = parse_source_code(func)
        name = func.__name__
        return self.create(name=name, source_code=source_code, source_type="python", tags=tags or [])


class BlocksResource(BaseResource):
    def create(self, **kwargs) -> Block:
        resp = self.client.post("/v1/blocks", json=kwargs)
        return Block(**resp)

    def get(self, block_id: str) -> Block:
        resp = self.client.get(f"/v1/blocks/{block_id}")
        return Block(**resp)

    def update(self, block_id: str, **kwargs) -> Block:
        resp = self.client.patch(f"/v1/blocks/{block_id}", json=kwargs)
        return Block(**resp)

    def delete(self, block_id: str):
        self.client.delete(f"/v1/blocks/{block_id}")

    def list(self) -> List[Block]:
        resp = self.client.get("/v1/blocks")
        return [Block(**b) for b in resp]


class SourcesResource(BaseResource):
    def create(self, **kwargs) -> Source:
        resp = self.client.post("/v1/sources", json=kwargs)
        return Source(**resp)

    def get(self, source_id: str) -> Source:
        resp = self.client.get(f"/v1/sources/{source_id}")
        return Source(**resp)

    def delete(self, source_id: str):
        self.client.delete(f"/v1/sources/{source_id}")

    def list(self) -> List[Source]:
        resp = self.client.get("/v1/sources")
        return [Source(**s) for s in resp]

    def load_file_to_source(self, filename: str, source_id: str, blocking: bool = True) -> Job:
        # Implementation depends on server-side file upload endpoint
        # This is a placeholder for the logic seen in client_helper.py
        with open(filename, "rb") as f:
            files = {"file": f}
            resp = self.client.post(f"/v1/sources/{source_id}/upload", files=files)
        return Job(**resp)


class JobsResource(BaseResource):
    def get(self, job_id: str) -> Job:
        resp = self.client.get(f"/v1/jobs/{job_id}")
        return Job(**resp)

    def list(self) -> List[Job]:
        resp = self.client.get("/v1/jobs")
        return [Job(**j) for j in resp]

    def list_active_jobs(self) -> List[Job]:
        resp = self.client.get("/v1/jobs/active")
        return [Job(**j) for j in resp]


class UsersResource(BaseResource):
    def create(self, **kwargs) -> User:
        resp = self.client.post("/v1/users", json=kwargs)
        return User(**resp)

    def get_current(self) -> User:
        resp = self.client.get("/v1/users/me")
        return User(**resp)


class OrganizationsResource(BaseResource):
    def create(self, **kwargs) -> Organization:
        resp = self.client.post("/v1/organizations", json=kwargs)
        return Organization(**resp)

    def get_current(self) -> Organization:
        resp = self.client.get("/v1/organizations/me")
        return Organization(**resp)
