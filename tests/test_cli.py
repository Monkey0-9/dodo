import os
import re
import shutil
import sys

import pexpect
import pytest

from dodo.local_llm.constants import ASSISTANT_MESSAGE_CLI_SYMBOL, INNER_THOUGHTS_CLI_SYMBOL

original_dodo_path = os.path.expanduser("~/.dodo")
backup_dodo_path = os.path.expanduser("~/.dodo_backup")


def close_and_remove_file_handlers():
    import logging
    root_logger = logging.getLogger()
    for handler in list(root_logger.handlers):
        if isinstance(handler, logging.FileHandler):
            try:
                handler.close()
            except Exception:
                pass
            root_logger.removeHandler(handler)

    for logger_name, logger_obj in logging.Logger.manager.loggerDict.items():
        if isinstance(logger_obj, logging.Logger):
            for handler in list(logger_obj.handlers):
                if isinstance(handler, logging.FileHandler):
                    try:
                        handler.close()
                    except Exception:
                        pass
                    logger_obj.removeHandler(handler)


@pytest.fixture
def swap_dodo_config():
    close_and_remove_file_handlers()
    if os.path.exists(backup_dodo_path):
        print("\nDelete the backup ~/.dodo directory\n")
        shutil.rmtree(backup_dodo_path)

    if os.path.exists(original_dodo_path):
        print("\nBackup the original ~/.dodo directory\n")
        shutil.move(original_dodo_path, backup_dodo_path)

    try:
        # Run the test
        yield
    finally:
        # Ensure this runs no matter what
        close_and_remove_file_handlers()
        print("\nClean up ~/.dodo and restore the original directory\n")
        if os.path.exists(original_dodo_path):
            shutil.rmtree(original_dodo_path)

        if os.path.exists(backup_dodo_path):
            shutil.move(backup_dodo_path, original_dodo_path)


@pytest.mark.skip(reason="dodo run CLI command is deprecated/not implemented in this version")
def test_dodo_run_create_new_agent(swap_dodo_config):
    child = pexpect.spawn("uv run dodo run", encoding="utf-8")
    try:
        # Start the dodo run command
        child.logfile = sys.stdout
        child.expect("Creating new agent", timeout=20)
        # Optional: LLM model selection
        try:
            child.expect("Select LLM model:", timeout=20)
            child.sendline("")
        except (pexpect.TIMEOUT, pexpect.EOF):
            print("[WARNING] LLM model selection step was skipped.")

        # Optional: Context window selection
        try:
            child.expect("Select LLM context window limit", timeout=20)
            child.sendline("")
        except (pexpect.TIMEOUT, pexpect.EOF):
            print("[WARNING] Context window selection step was skipped.")

        # Optional: Embedding model selection
        try:
            child.expect("Select embedding model:", timeout=20)
            child.sendline("text-embedding-3-small")
        except (pexpect.TIMEOUT, pexpect.EOF):
            print("[WARNING] Embedding model selection step was skipped.")

        child.expect("Created new agent", timeout=20)
        child.sendline("")

        # Get initial response
        child.expect("Enter your message:", timeout=60)
        # Capture the output up to this point
        full_output = child.before
        assert full_output is not None, "No output was captured."
        # Count occurrences of inner thoughts
        cloud_emoji_count = full_output.count(INNER_THOUGHTS_CLI_SYMBOL)
        assert cloud_emoji_count == 1, "It appears that there are multiple instances of inner thought outputted."
        # Count occurrences of assistant messages
        robot = full_output.count(ASSISTANT_MESSAGE_CLI_SYMBOL)
        assert robot == 1, "It appears that there are multiple instances of assistant messages outputted."
    finally:
        try:
            child.close(force=True)
        except Exception:
            pass


def test_dodo_version_prints_only_version(swap_dodo_config):
    import subprocess

    # Start the dodo version command
    result = subprocess.run(
        [sys.executable, "-m", "dodo.main", "version"],
        capture_output=True,
        text=True,
        check=True
    )
    output = result.stdout

    # Remove ANSI escape sequences and whitespace
    output = re.sub(r"\x1b\[[0-9;]*[mK]", "", output).strip()

    from dodo import __version__

    # Get the full output and verify it contains only the version
    assert output == __version__, f"Expected only '{__version__}', but got '{repr(output)}'"

