# Dodo

Dodo is a powerful framework for building AI agents with advanced, long-term memory and the ability to self-improve through interaction.

## Features

- **Long-term Memory**: Persistent state across sessions.
- **Custom Tools**: Easily integrate external APIs and functions.
- **Model Agnostic**: Works with OpenAI, Anthropic, and local LLMs.
- **Self-Improvement**: Agents can update their own memory and skills.

## Quick Start

### Installation

```bash
pip install dodo-framework
```

### Basic Usage

```python
from dodo import DodoClient

client = DodoClient()

# Create an agent
agent = client.create_agent(
    name="Assistant",
    memory="You are a helpful AI assistant."
)

# Send a message
response = agent.send_message("Hello!")
print(response)
```

## Documentation

For full documentation, visit [docs.dodo-ai.org](https://docs.dodo-ai.org).

## License

This project is licensed under the Apache 2.0 License.
