import os
import re
import shutil
import sys

import pexpect
import pytest

from dodo.local_llm.constants import ASSISTANT_MESSAGE_CLI_SYMBOL, INNER_THOUGHTS_CLI_SYMBOL

original_dodo_path = os.path.expanduser("~/.dodo")
backup_dodo_path = os.path.expanduser("~/.dodo_backup")


@pytest.fixture
def swap_dodo_config():
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
        print("\nClean up ~/.dodo and restore the original directory\n")
        if os.path.exists(original_dodo_path):
            shutil.rmtree(original_dodo_path)

        if os.path.exists(backup_dodo_path):
            shutil.move(backup_dodo_path, original_dodo_path)


def test_dodo_run_create_new_agent(swap_dodo_config):
    child = pexpect.spawn("uv run dodo run", encoding="utf-8")
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


def test_dodo_version_prints_only_version(swap_dodo_config):
    # Start the dodo version command
    output = pexpect.run("uv run dodo version", encoding="utf-8")

    # Remove ANSI escape sequences and whitespace
    output = re.sub(r"\x1b\[[0-9;]*[mK]", "", output).strip()

    from dodo import __version__

    # Get the full output and verify it contains only the version
    assert output == __version__, f"Expected only '{__version__}', but got '{repr(output)}'"

