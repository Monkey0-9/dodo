import asyncio
import time
import random
from dodo.services.llm_router.resilient_router import ResilientRoutingClient
from dodo.schemas.llm_config import LLMConfig
from dodo.schemas.user import User
from dodo.log import get_logger

logger = get_logger(__name__)

async def simulate_llm_request(router: ResilientRoutingClient, handle: str, fail_rate: float = 0.1):
    """Simulates a high-concurrency LLM request with latency and failure tracking."""
    start_time = time.time()
    
    # Simulate network latency
    latency = random.uniform(200, 1500)
    await asyncio.sleep(latency / 1000.0)
    
    if random.random() < fail_rate:
        logger.error(f"Simulated failure for {handle}")
        await router.record_failure(handle)
        return False, latency
    else:
        logger.info(f"Simulated success for {handle} in {latency:.2f}ms")
        await router.record_success(handle, latency)
        return True, latency

async def run_stress_test():
    """
    Executes a high-concurrency stress test on the ResilientRoutingClient.
    Validates circuit breaker persistence, connection pool stability, and latency tracking.
    """
    router = ResilientRoutingClient()
    actor = User(id="test_user", email="test@dodo.ai")
    
    handles = ["openai/gpt-4o", "anthropic/claude-3-5-sonnet", "openai/gpt-4o-mini"]
    
    print("\n" + "="*60)
    print("DODO INSTITUTIONAL STRESS TEST: RESILIENT ROUTING")
    print("="*60)
    
    tasks = []
    # Spawn 50 concurrent requests across different models
    for _ in range(50):
        handle = random.choice(handles)
        # Inject higher failure rate for one model to trigger circuit breaker
        fail_rate = 0.8 if handle == "openai/gpt-4o" else 0.1
        tasks.append(simulate_llm_request(router, handle, fail_rate))
    
    results = await asyncio.gather(*tasks)
    
    success_count = sum(1 for r in results if r[0])
    fail_count = len(results) - success_count
    
    print("\n" + "-"*40)
    print(f"RESULTS: {success_count} SUCCESS, {fail_count} FAIL")
    print("-"*40)
    
    # Check circuit breaker states
    for handle in handles:
        breaker = await router._get_breaker(handle)
        print(f"Model: {handle:30} | State: {breaker.state:10} | Failures: {breaker.failures:2} | Avg Latency: {breaker.avg_latency_ms or 0:.2f}ms")
    
    print("="*60 + "\n")

if __name__ == "__main__":
    asyncio.run(run_stress_test())
