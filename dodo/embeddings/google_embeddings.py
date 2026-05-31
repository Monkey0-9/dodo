from typing import List

import httpx


class GoogleEmbeddings:
    def __init__(self, api_key: str, model: str = "text-embedding-004", base_url: str = "https://generativelanguage.googleapis.com"):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url

    def get_text_embedding(self, text: str) -> List[float]:
        """Get the embedding for a single text string."""
        url = f"{self.base_url}/v1beta/models/{self.model}:embedContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "model": f"models/{self.model}",
            "content": {
                "parts": [{"text": text}]
            }
        }

        with httpx.Client() as client:
            response = client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data["embedding"]["values"]

    async def get_text_embedding_async(self, text: str) -> List[float]:
        """Get the embedding for a single text string asynchronously."""
        url = f"{self.base_url}/v1beta/models/{self.model}:embedContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "model": f"models/{self.model}",
            "content": {
                "parts": [{"text": text}]
            }
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data["embedding"]["values"]
