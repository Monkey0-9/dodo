"""Modal function executor for tool sandbox v2.

This module contains the executor function that runs inside Modal containers
to execute tool functions with dynamically passed arguments.

Security: Uses JSON serialization instead of pickle to prevent arbitrary code execution.
"""

import faulthandler
import json
import signal
from typing import Any, Dict

import modal

# List of safe modules that can be imported in schema code
SAFE_IMPORT_MODULES = {
    "typing",
    "datetime",
    "uuid",
    "enum",
    "decimal",
    "collections",
    "abc",
    "dataclasses",
    "pydantic",
    "typing_extensions",
}


def _json_serialize(obj: Any) -> Any:
    """Recursively convert an object to JSON-serializable primitives."""
    if obj is None:
        return None
    if isinstance(obj, (str, int, float, bool)):
        return obj
    if isinstance(obj, (list, tuple, set)):
        return [_json_serialize(x) for x in obj]
    if isinstance(obj, dict):
        return {str(k): _json_serialize(v) for k, v in obj.items()}
    if hasattr(obj, "model_dump") and callable(obj.model_dump):
        return _json_serialize(obj.model_dump())
    if hasattr(obj, "dict") and callable(obj.dict):
        return _json_serialize(obj.dict())
    return str(obj)


class ModalFunctionExecutor:
    """Executes tool functions in Modal with dynamic argument passing.
    
    Uses JSON for all serialization — no pickle to prevent arbitrary code execution.
    """

    @staticmethod
    def execute_tool_dynamic(
        tool_source: str,
        tool_name: str,
        args_json: str,
        agent_state_json: str | None,
        inject_agent_state: bool,
        is_async: bool,
        args_schema_code: str | None,
    ) -> dict[str, Any]:
        """Execute a tool function with dynamically passed arguments.

        This function runs inside the Modal container and receives all parameters
        at runtime rather than having them embedded in a script.
        Uses JSON instead of pickle for security.
        """
        import asyncio
        import sys
        import traceback
        from io import StringIO

        # Enable fault handler for better debugging of segfaults
        faulthandler.enable()

        stdout_capture = StringIO()
        stderr_capture = StringIO()
        old_stdout = sys.stdout
        old_stderr = sys.stderr

        try:
            sys.stdout = stdout_capture
            sys.stderr = stderr_capture

            # Safely parse JSON arguments
            if not args_json:
                raise ValueError("No arguments provided")

            if len(args_json) > 10 * 1024 * 1024:  # 10MB limit
                raise ValueError(f"JSON args too large: {len(args_json)} bytes")

            try:
                args = json.loads(args_json)
            except Exception as e:
                raise ValueError(f"Failed to parse JSON arguments: {e}")

            agent_state = None
            if agent_state_json:
                if len(agent_state_json) > 10 * 1024 * 1024:  # 10MB limit
                    raise ValueError(f"JSON agent state too large: {len(agent_state_json)} bytes")
                try:
                    agent_state_dict = json.loads(agent_state_json)
                    # Reconstruct AgentState from JSON
                    try:
                        from dodo.schemas.agent import AgentState
                        agent_state = AgentState.model_validate(agent_state_dict)
                    except Exception:
                        # Fall back to dict if AgentState is not available
                        agent_state = agent_state_dict
                except Exception as e:
                    # Log but don't fail - agent state is optional
                    print(f"Warning: Failed to parse agent state JSON: {e}", file=sys.stderr)
                    agent_state = None

            exec_globals = {
                "__name__": "__main__",
                "__builtins__": __builtins__,
            }

            if args_schema_code:
                import ast

                try:
                    tree = ast.parse(args_schema_code)

                    for node in ast.walk(tree):
                        if isinstance(node, ast.Import):
                            for alias in node.names:
                                module_name = alias.name.split(".")[0]
                                if module_name not in SAFE_IMPORT_MODULES:
                                    raise ValueError(f"Import of '{module_name}' not allowed in schema code")
                        elif isinstance(node, ast.ImportFrom):
                            if node.module:
                                module_name = node.module.split(".")[0]
                                if module_name not in SAFE_IMPORT_MODULES:
                                    raise ValueError(f"Import from '{module_name}' not allowed in schema code")

                    exec(compile(tree, "<schema>", "exec"), exec_globals)
                except (SyntaxError, ValueError) as e:
                    raise ValueError(f"Invalid or unsafe schema code: {e}")

            exec(tool_source, exec_globals)

            if tool_name not in exec_globals:
                raise ValueError(f"Function '{tool_name}' not found in tool source code")

            func = exec_globals[tool_name]

            kwargs = dict(args)
            if inject_agent_state:
                kwargs["agent_state"] = agent_state

            try:
                from dodo.functions.ast_parsers import coerce_dict_args_by_annotations

                annotations = getattr(func, "__annotations__", {})
                kwargs = coerce_dict_args_by_annotations(
                    kwargs,
                    annotations,
                    allow_unsafe_eval=True,
                    extra_globals=func.__globals__,
                )
            except Exception:
                pass

            if is_async:
                result = asyncio.run(func(**kwargs))
            else:
                result = func(**kwargs)

            # Serialize result to JSON-safe format
            serialized_result = _json_serialize(result)

            # Serialize agent_state to JSON-safe dict for return
            agent_state_out = None
            if agent_state is not None:
                agent_state_out = _json_serialize(
                    agent_state.model_dump() if hasattr(agent_state, "model_dump") else agent_state
                )

            return {
                "result": serialized_result,
                "agent_state": agent_state_out,
                "stdout": stdout_capture.getvalue(),
                "stderr": stderr_capture.getvalue(),
                "error": None,
            }

        except Exception as e:
            return {
                "result": None,
                "agent_state": None,
                "stdout": stdout_capture.getvalue(),
                "stderr": stderr_capture.getvalue(),
                "error": {
                    "name": type(e).__name__,
                    "value": str(e),
                    "traceback": traceback.format_exc(),
                },
            }
        finally:
            sys.stdout = old_stdout
            sys.stderr = old_stderr


def setup_signal_handlers():
    """Setup signal handlers for better debugging."""

    def handle_segfault(signum, frame):
        import sys
        import traceback

        print(f"SEGFAULT detected! Signal: {signum}", file=sys.stderr)
        print("Stack trace:", file=sys.stderr)
        traceback.print_stack(frame, file=sys.stderr)
        sys.exit(139)  # Standard segfault exit code

    def handle_abort(signum, frame):
        import sys
        import traceback

        print(f"ABORT detected! Signal: {signum}", file=sys.stderr)
        print("Stack trace:", file=sys.stderr)
        traceback.print_stack(frame, file=sys.stderr)
        sys.exit(134)  # Standard abort exit code

    # Register signal handlers
    signal.signal(signal.SIGSEGV, handle_segfault)
    signal.signal(signal.SIGABRT, handle_abort)


def execute_tool_wrapper(
    tool_source: str,
    tool_name: str,
    args_json: str,
    agent_state_json: str | None,
    inject_agent_state: bool,
    is_async: bool,
    args_schema_code: str | None,
    environment_vars: Dict[str, str],
) -> Dict[str, Any]:
    """Wrapper function that runs in Modal container with enhanced error handling.
    
    Accepts JSON strings instead of pickled bytes for security.
    """
    import os
    import sys
    import traceback

    # Setup signal handlers for better crash debugging
    setup_signal_handlers()

    # Enable fault handler with file output
    try:
        faulthandler.enable(file=sys.stderr, all_threads=True)
    except Exception:
        pass  # Faulthandler might not be available

    # Set resource limits to prevent runaway processes (Linux-only)
    try:
        import resource
        # Limit memory usage to 1GB
        resource.setrlimit(resource.RLIMIT_AS, (1024 * 1024 * 1024, 1024 * 1024 * 1024))
        # Limit stack size to 8MB (default is often unlimited)
        resource.setrlimit(resource.RLIMIT_STACK, (8 * 1024 * 1024, 8 * 1024 * 1024))
    except Exception:
        pass  # Resource limits might not be available on all platforms

    # Set environment variables
    for key, value in environment_vars.items():
        os.environ[key] = str(value)

    # Add debugging environment variables
    os.environ["PYTHONFAULTHANDLER"] = "1"
    os.environ["PYTHONDEVMODE"] = "1"

    try:
        # Execute the tool
        return ModalFunctionExecutor.execute_tool_dynamic(
            tool_source=tool_source,
            tool_name=tool_name,
            args_json=args_json,
            agent_state_json=agent_state_json,
            inject_agent_state=inject_agent_state,
            is_async=is_async,
            args_schema_code=args_schema_code,
        )
    except Exception as e:
        # Enhanced error reporting
        return {
            "result": None,
            "agent_state": None,
            "stdout": "",
            "stderr": f"Container execution failed: {traceback.format_exc()}",
            "error": {
                "name": type(e).__name__,
                "value": str(e),
                "traceback": traceback.format_exc(),
            },
        }
