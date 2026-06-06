import threading
from functools import wraps


def singleton(cls):
    """Decorator to make a class a Singleton class in a thread-safe manner."""
    instances = {}
    lock = threading.Lock()

    @wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            with lock:
                if cls not in instances:
                    instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    return get_instance
