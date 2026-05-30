"""Safe json/pickle serialization wrapper for Modal sandbox.

This module provides defensive serialization utilities to prevent segmentation
faults and other crashes when passing complex objects to Modal containers.
It uses secure JSON serialization instead of pickle to prevent arbitrary code execution.
"""

import json
import sys
from typing import Any, Optional, Tuple

from dodo.log import get_logger

logger = get_logger(__name__)

# Serialization limits
MAX_JSON_SIZE = 10 * 1024 * 1024  # 10MB limit
MAX_RECURSION_DEPTH = 50  # Prevent deep object graphs


class SafePickleError(Exception):
    """Raised when safe serialization fails (retaining name for compatibility)."""


class SafeJSONError(SafePickleError):
    """Raised when safe JSON serialization fails."""


def serialize_to_json_compatible(obj: Any) -> Any:
    """Recursively convert an object to JSON-compatible primitives."""
    if obj is None:
        return None
    if isinstance(obj, (str, int, float, bool)):
        return obj
    if isinstance(obj, (list, tuple, set)):
        return [serialize_to_json_compatible(x) for x in obj]
    if isinstance(obj, dict):
        return {str(k): serialize_to_json_compatible(v) for k, v in obj.items()}
    if hasattr(obj, "model_dump") and callable(obj.model_dump):
        return serialize_to_json_compatible(obj.model_dump())
    if hasattr(obj, "dict") and callable(obj.dict):
        return serialize_to_json_compatible(obj.dict())
    return str(obj)


def safe_pickle_dumps(obj: Any, max_size: int = MAX_JSON_SIZE) -> bytes:
    """Safely serialize an object to JSON bytes with size and recursion limits.

    Args:
        obj: The object to serialize
        max_size: Maximum allowed size in bytes

    Returns:
        bytes: The JSON serialized object encoded in UTF-8

    Raises:
        SafePickleError: If serialization fails or exceeds limits
    """
    try:
        # Check recursion depth by traversing the object
        def check_depth(obj, depth=0):
            if depth > MAX_RECURSION_DEPTH:
                raise SafePickleError(f"Object graph too deep (depth > {MAX_RECURSION_DEPTH})")

            if isinstance(obj, (list, tuple, set)):
                for item in obj:
                    check_depth(item, depth + 1)
            elif isinstance(obj, dict):
                for value in obj.values():
                    check_depth(value, depth + 1)
            elif hasattr(obj, "__dict__"):
                check_depth(obj.__dict__, depth + 1)

        check_depth(obj)

        json_compatible = serialize_to_json_compatible(obj)
        serialized = json.dumps(json_compatible).encode("utf-8")

        if len(serialized) > max_size:
            raise SafePickleError(f"Serialized JSON size {len(serialized)} exceeds limit {max_size}")

        logger.debug(f"Successfully serialized object of size {len(serialized)} bytes")
        return serialized

    except SafePickleError:
        raise
    except RecursionError as e:
        raise SafePickleError(f"Object graph too deep: {e}")
    except Exception as e:
        raise SafePickleError(f"Failed to serialize object: {e}")


def safe_pickle_loads(data: bytes) -> Any:
    """Safely deserialize JSON data with error handling.

    Args:
        data: The JSON bytes

    Returns:
        Any: The deserialized object

    Raises:
        SafePickleError: If deserialization fails
    """
    if not data:
        raise SafePickleError("Cannot deserialize empty data")

    if len(data) > MAX_JSON_SIZE:
        raise SafePickleError(f"Data size {len(data)} exceeds limit {MAX_JSON_SIZE}")

    try:
        obj = json.loads(data.decode("utf-8"))
        logger.debug(f"Successfully deserialized object from {len(data)} bytes")
        return obj
    except Exception as e:
        raise SafePickleError(f"Failed to deserialize data: {e}")


def try_pickle_with_fallback(obj: Any, fallback_value: Any = None, max_size: int = MAX_JSON_SIZE) -> Tuple[Optional[bytes], bool]:
    """Try to serialize an object with fallback on failure.

    Args:
        obj: The object to serialize
        fallback_value: Value to use if serialization fails
        max_size: Maximum allowed size

    Returns:
        Tuple of (serialized_data or None, success_flag)
    """
    try:
        serialized = safe_pickle_dumps(obj, max_size)
        return serialized, True
    except SafePickleError as e:
        logger.warning(f"Failed to serialize object, using fallback: {e}")
        if fallback_value is not None:
            try:
                serialized = safe_pickle_dumps(fallback_value, max_size)
                return serialized, False
            except SafePickleError:
                pass
    return None, False


def validate_pickleable(obj: Any) -> bool:
    """Check if an object can be safely serialized.

    Args:
        obj: The object to validate

    Returns:
        bool: True if the object can be serialized safely
    """
    try:
        safe_pickle_dumps(obj, max_size=MAX_JSON_SIZE)
        return True
    except SafePickleError:
        return False


def sanitize_for_pickle(obj: Any) -> Any:
    """Sanitize an object for safe serialization."""
    return serialize_to_json_compatible(obj)


# Add JSON aliases for modernization
safe_json_dumps = safe_pickle_dumps
safe_json_loads = safe_pickle_loads
try_json_with_fallback = try_pickle_with_fallback
validate_jsonable = validate_pickleable
sanitize_for_json = sanitize_for_pickle
