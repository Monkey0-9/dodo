import os

from dodo.config import dodoConfig
from dodo.constants import dodo_DIR


class TestMGPTConfig(dodoConfig):
    config_path: str = os.getenv("TEST_DODO_CONFIG_PATH") or os.getenv("DODO_CONFIG_PATH") or os.path.join(dodo_DIR, "config")


