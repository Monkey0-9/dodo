#!/bin/bash
# Dodo Project Initialization Script

set -e

echo -e "\033[0;36mInitializing Dodo Project...\033[0m"

# 1. Check for Python
if ! command -v python3 &> /dev/null; then
    echo -e "\033[0;31mError: python3 is not installed.\033[0m"
    exit 1
fi

# 2. Create .env file if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "\033[0;33mCreated .env from .env.example. Please update your API keys.\033[0m"
    else
        echo "dodo_ENCRYPTION_KEY=$(openssl rand -hex 16)" > .env
        echo -e "\033[0;33mCreated new .env file with a generated encryption key.\033[0m"
    fi
fi

# 3. Install dependencies
echo -e "\033[0;36mInstalling dependencies...\033[0m"
pip install -e .

# 4. Initialize Database
echo -e "\033[0;36mInitializing database migrations...\033[0m"
alembic upgrade head

echo -e "\n\033[0;32mInitialization Complete!\033[0m"
echo -e "\033[0;36mTo start the Dodo server, run:\033[0m"
echo -e "dodo server"
