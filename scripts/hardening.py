import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace print(...) with logger.info(...)
    # This is a bit risky but we'll try to find cases where logger is already defined or add it
    has_logger = "logger =" in content or "get_logger(__name__)" in content
    
    def print_replacer(match):
        text = match.group(1)
        if "file=sys.stderr" in text:
            return f"logger.error({text.replace(', file=sys.stderr', '')})"
        return f"logger.info({text})"

    if has_logger:
        content = re.sub(r'print\((.*?)\)', print_replacer, content)

    # 2. Replace bare except: and except Exception:
    content = re.sub(r'except:\n\s+', 'except Exception as e:\n        logger.exception(f"Unexpected error: {e}")\n        ', content)
    content = re.sub(r'except Exception:\n\s+', 'except Exception as e:\n        logger.exception(f"Unexpected error: {e}")\n        ', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    for root, dirs, files in os.walk('dodo'):
        for file in files:
            if file.endswith('.py'):
                fix_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
