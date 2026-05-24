import pytest
from fastapi.testclient import TestClient
from dodo.server.rest_api.app import app
import os

client = TestClient(app)

def test_login_success():
    # Use the default password from env or the hardcoded one in router
    password = os.getenv("DODO_SERVER_PASSWORD", "dodo-secret")
    response = client.post(
        "/v1/auth/login",
        data={"username": "admin", "password": password}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_failure():
    response = client.post(
        "/v1/auth/login",
        data={"username": "admin", "password": "wrong-password"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect password"

def test_protected_route_without_auth():
    # Any V1 route should be protected by CheckPasswordMiddleware
    response = client.get("/v1/agents")
    assert response.status_code == 401

def test_protected_route_with_jwt():
    password = os.getenv("DODO_SERVER_PASSWORD", "dodo-secret")
    login_response = client.post(
        "/v1/auth/login",
        data={"username": "admin", "password": password}
    )
    token = login_response.json()["access_token"]
    
    response = client.get(
        "/v1/agents",
        headers={"Authorization": f"Bearer {token}"}
    )
    # Even if it returns 200 or 500 (depending on DB setup in test), 
    # as long as it's not 401, the middleware passed.
    assert response.status_code != 401
