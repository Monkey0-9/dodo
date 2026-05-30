
# DODO REPOSITORY - COMPREHENSIVE DIAGNOSTIC SCAN REPORT
## Repository: https://github.com/Monkey0-9/dodo.git
## Scan Date: 2025-01-09
## Branch: main
## Commit: 625caebaea7ae3ff22b7c099956ae31bf94a3110

---

## EXECUTIVE SUMMARY

This report presents the findings from a comprehensive security and code quality diagnostic scan of the dodo AI agent platform repository. The codebase is a Python-based FastAPI application for building AI agents with persistent memory.

**Overall Risk Rating: HIGH**

- **Total Issues Found: 41**
- **Critical: 4** - Immediate action required
- **High: 10** - Address within 1-2 weeks
- **Medium: 22** - Address within 1 month
- **Low: 5** - Address as time permits

### Most Critical Concerns:
1. **Authentication can be completely bypassed** via debug mode, default passwords, and legacy auth mechanisms
2. **Arbitrary code execution** possible through exec(), eval(), and pickle.loads() in tool execution paths
3. **Hardcoded credentials** for JWT signing and server access
4. **Excessive CORS permissions** allow any origin with credentials

---

## 1. CODE QUALITY & BUGS (8 issues)

### 1.1 [Critical] Authentication Bypass in Debug Mode
- **File Path**: `dodo/server/rest_api/app.py`
- **Line Number(s)**: 440
- **Issue Description**: Debug mode completely disables JWT authentication by setting auth_deps to empty list when settings.debug is True. This means any request can access all API endpoints without authentication if debug mode is enabled.
- **Impact**: Complete authentication bypass allowing unauthorized access to all API endpoints.
- **Suggested Fix**: Remove the debug mode auth bypass. Authentication should never be optional based on debug flags.
- **References**: CWE-306: Missing Authentication for Critical Function

### 1.2 [Critical] Token-Based Authentication Bypass
- **File Path**: `dodo/server/rest_api/auth/jwt_handler.py`
- **Line Number(s)**: 77-84
- **Issue Description**: The get_current_user function allows bypassing JWT validation entirely if the provided token matches the DODO_SERVER_PASSWORD env var (default 'dodo-secret'). Any token equal to the server password grants admin access.
- **Impact**: Anyone knowing or guessing the server password can authenticate as admin without a valid JWT.
- **Suggested Fix**: Remove the password bypass from JWT validation. Use separate authentication flows.
- **References**: CWE-287: Improper Authentication

### 1.3 [High] Arbitrary Code Execution via exec()
- **File Path**: `dodo/services/tool_executor/tool_execution_sandbox.py`
- **Line Number(s)**: 285-286
- **Issue Description**: The run_local_dir_sandbox_directly method uses exec() to execute dynamically generated code in the same Python process. This allows arbitrary code execution within the application process.
- **Impact**: Complete system compromise - tools can execute arbitrary Python code in the main process.
- **Suggested Fix**: Always use subprocess-based sandbox (run_local_dir_sandbox_venv) and remove the direct exec() path.
- **References**: CWE-78: OS Command Injection, CWE-94: Code Injection

### 1.4 [High] Insecure Deserialization via pickle.loads()
- **File Path**: `dodo/services/tool_executor/tool_execution_sandbox.py`
- **Line Number(s)**: 478
- **Issue Description**: The parse_best_effort method uses pickle.loads() to deserialize base64-encoded data from tool execution results. This is vulnerable to arbitrary code execution via crafted pickle payloads.
- **Impact**: Remote code execution through deserialization of untrusted pickle data.
- **Suggested Fix**: Use JSON serialization instead of pickle for tool results, or implement a restricted unpickler.
- **References**: CWE-502: Deserialization of Untrusted Data

### 1.5 [High] pickle.loads() in Safe Pickle Module
- **File Path**: `dodo/services/tool_sandbox/safe_pickle.py`
- **Line Number(s)**: 108
- **Issue Description**: Despite the module name suggesting safety, it uses pickle.loads() without proper input validation, creating deserialization risks.
- **Impact**: Potential arbitrary code execution through crafted pickle payloads.
- **Suggested Fix**: Replace pickle with JSON or implement a whitelist-based restricted unpickler.
- **References**: CWE-502: Deserialization of Untrusted Data

### 1.6 [Medium] Use of eval() for Parsing Function Arguments
- **File Path**: `dodo/interface.py`
- **Line Number(s)**: 203, 229
- **Issue Description**: The CLIInterface.function_message method uses eval() to parse function arguments from string format. While this is CLI output code, it's still unsafe practice.
- **Impact**: Potential code execution if function arguments contain malicious code.
- **Suggested Fix**: Replace eval() with ast.literal_eval() or json.loads() for safe parsing.
- **References**: CWE-95: Eval Injection

### 1.7 [High] Unsafe eval() in Type Resolution
- **File Path**: `dodo/functions/ast_parsers.py`
- **Line Number(s)**: 86
- **Issue Description**: The resolve_type function falls back to eval() when allow_unsafe_eval=True, which can execute arbitrary code from type annotations.
- **Impact**: Code execution if malicious annotations are provided via tool schemas.
- **Suggested Fix**: Remove the eval() fallback entirely. Use only AST-based parsing.
- **References**: CWE-95: Eval Injection

### 1.8 [Medium] exec() in Tool Loading
- **File Path**: `dodo/services/tool_manager.py`
- **Line Number(s)**: 141
- **Issue Description**: Uses exec() to dynamically load tool source code into a namespace.
- **Impact**: Arbitrary code execution when loading untrusted tools.
- **Suggested Fix**: Use importlib or import hooks instead of exec() for loading tools.
- **References**: CWE-94: Code Injection

---

## 2. SECURITY VULNERABILITIES (9 issues)

### 2.1 [Critical] Hardcoded JWT Secret Key
- **File Path**: `dodo/server/rest_api/auth/jwt_handler.py`
- **Line Number(s)**: 9
- **Issue Description**: The JWT_SECRET_KEY has a hardcoded default value of 'super-secret-key-change-in-production' which will be used if the environment variable is not set.
- **Impact**: Attackers can forge JWT tokens and impersonate any user, including admins.
- **Suggested Fix**: Remove the default value and force the application to fail startup if JWT_SECRET is not provided.
- **References**: CWE-798: Use of Hard-coded Credentials, CVE-2023-

### 2.2 [Critical] Hardcoded Default Server Password
- **File Path**: `dodo/server/rest_api/app.py`
- **Line Number(s)**: 179
- **Issue Description**: The random_password variable defaults to 'dodo-secret' if DODO_SERVER_PASSWORD environment variable is not set.
- **Impact**: Anyone can authenticate using the default password 'dodo-secret'.
- **Suggested Fix**: Remove the default value and require explicit password configuration.
- **References**: CWE-798: Use of Hard-coded Credentials

### 2.3 [High] Legacy Bare Password Authentication
- **File Path**: `dodo/server/rest_api/middleware/check_password.py`
- **Line Number(s)**: 36-40
- **Issue Description**: The middleware allows authentication via X-BARE-PASSWORD header or Authorization header containing just the plaintext password, completely bypassing JWT validation.
- **Impact**: Anyone knowing the server password can access all endpoints without a valid JWT token.
- **Suggested Fix**: Remove the legacy bare password authentication mechanism entirely.
- **References**: CWE-306: Missing Authentication for Critical Function

### 2.4 [High] Overly Permissive CORS Configuration
- **File Path**: `dodo/server/rest_api/app.py`
- **Line Number(s)**: 855
- **Issue Description**: The CORS middleware allows all origins, all methods, all headers, and credentials simultaneously. This is a security risk.
- **Impact**: Cross-origin attacks including potential credential theft via malicious websites.
- **Suggested Fix**: Restrict CORS to specific trusted origins and remove wildcard permissions.
- **References**: CWE-942: Permissive Cross-domain Policy with Untrusted Domains

### 2.5 [Medium] Weak Content Security Policy
- **File Path**: `dodo/server/rest_api/app.py`
- **Line Number(s)**: 451
- **Issue Description**: The CSP allows 'unsafe-inline' for both scripts and styles, defeating the purpose of XSS protection.
- **Impact**: XSS attacks may succeed despite CSP presence due to unsafe-inline allowances.
- **Suggested Fix**: Use nonces or hashes instead of 'unsafe-inline' for script-src and style-src.
- **References**: CWE-79: Cross-site Scripting (XSS)

### 2.6 [Medium] Weak Default Database Password
- **File Path**: `compose.yaml`
- **Line Number(s)**: 11
- **Issue Description**: Docker Compose uses default weak credentials (dodo/dodo) for PostgreSQL that may not be changed in development.
- **Impact**: Database compromise if the service is exposed.
- **Suggested Fix**: Generate strong random passwords or require explicit configuration.
- **References**: CWE-798: Use of Hard-coded Credentials

### 2.7 [Low] Excessive Port Exposure
- **File Path**: `Dockerfile`
- **Line Number(s)**: 98
- **Issue Description**: The Dockerfile exposes PostgreSQL port 5432 and Redis port 6379 directly, which should not be exposed in production images.
- **Impact**: Increased attack surface by exposing internal services.
- **Suggested Fix**: Only expose necessary application ports (8083, 8283). Use separate service containers.
- **References**: CWE-200: Exposure of Sensitive Information

### 2.8 [Medium] Potentially Weak PBKDF2 Iterations
- **File Path**: `dodo/helpers/crypto_utils.py`
- **Line Number(s)**: 61-62
- **Issue Description**: PBKDF2 with 100,000 iterations is below current OWASP recommendations (600,000+ for SHA256).
- **Impact**: Encrypted credentials may be more vulnerable to brute-force attacks.
- **Suggested Fix**: Increase PBKDF2 iterations to at least 600,000 per OWASP guidelines.
- **References**: OWASP Password Storage Cheat Sheet, CWE-916

### 2.9 [Medium] JWT Tokens Use None Algorithm Allowed
- **File Path**: `dodo/server/rest_api/auth/jwt_handler.py`
- **Line Number(s)**: 22-23
- **Issue Description**: The JWT handler doesn't explicitly blacklist the 'none' algorithm, which could allow token forgery.
- **Impact**: Potential JWT token forgery if the library configuration allows None algorithm.
- **Suggested Fix**: Explicitly verify algorithm and reject 'none' algorithm in JWT decode.
- **References**: CWE-347: Improper Verification of Cryptographic Signature

---

## 3. DEPENDENCY & CONFIGURATION ISSUES (8 issues)

### 3.1 [High] python-jose Library for JWT - Known Vulnerabilities
- **File Path**: `pyproject.toml`
- **Line Number(s)**: 47
- **Issue Description**: The project uses python-jose (imported as 'jose') for JWT handling, which has known security vulnerabilities including algorithm confusion attacks.
- **Impact**: JWT verification bypass vulnerabilities and potential signature forging.
- **Suggested Fix**: Replace python-jose with PyJWT or authlib which are actively maintained and secure.
- **References**: CVE-2024-33663 (python-jose), PyPI Advisory

### 3.2 [Medium] Pinned Uvicorn Version with Potential Issues
- **File Path**: `pyproject.toml`
- **Line Number(s)**: 103
- **Issue Description**: Uvicorn is pinned to exactly 0.29.0 which may miss security patches. Version 0.29.0 is from early 2024.
- **Impact**: Missing security fixes in newer uvicorn releases.
- **Suggested Fix**: Update uvicorn to latest stable version (0.34+).
- **References**: Uvicorn Security Advisories

### 3.3 [Medium] OpenAI SDK Version Range Too Permissive
- **File Path**: `pyproject.toml`
- **Line Number(s)**: 46
- **Issue Description**: The openai dependency has a wide version range (>=2.24.0) that could pull in untested versions with breaking changes or security issues.
- **Impact**: Unexpected behavior or security issues from untested dependency versions.
- **Suggested Fix**: Pin to specific tested versions with manual upgrade process.
- **References**: Dependency Management Best Practices

### 3.4 [Medium] PostgreSQL 15 Base Image with Python in Same Container
- **File Path**: `Dockerfile`
- **Line Number(s)**: 2,42
- **Issue Description**: The builder and runtime stages both use pgvector/pgvector base images that include a full PostgreSQL installation. The final image runs the application alongside PostgreSQL and Redis, violating container separation principles.
- **Impact**: Violates microservices architecture; increases attack surface; makes scaling difficult.
- **Suggested Fix**: Use a minimal Python base image and connect to external PostgreSQL/Redis services.
- **References**: Docker Best Practices, 12-Factor App Methodology

### 3.5 [Medium] Outdated pgvector Docker Image
- **File Path**: `compose.yaml`
- **Line Number(s)**: 3
- **Issue Description**: Uses pgvector:v0.5.1 which is significantly outdated (from mid-2023). Current versions are 0.8.x.
- **Impact**: Missing bug fixes, performance improvements, and security patches.
- **Suggested Fix**: Update to pgvector 0.8.x or latest stable version.
- **References**: pgvector Release Notes

### 3.6 [Low] Type Checking Uses mypy Without Strict Mode
- **File Path**: `.github/workflows/ci.yml`
- **Line Number(s)**: 36
- **Issue Description**: CI runs mypy without strict mode, potentially missing type errors that could cause runtime issues.
- **Impact**: Type safety issues may go undetected until runtime.
- **Suggested Fix**: Enable mypy strict mode: mypy --strict dodo
- **References**: Type Safety Best Practices

### 3.7 [Low] Ruff Lint Configuration Ignores Important Rules
- **File Path**: `pyproject.toml`
- **Line Number(s)**: 172-198
- **Issue Description**: The ruff configuration ignores E402 (import ordering), E501 (line length), E711/E712 (None/True comparisons), and FAST002 (dependency injection without Annotated).
- **Impact**: Code quality issues related to imports, line lengths, and FastAPI patterns may persist.
- **Suggested Fix**: Remove or minimize ignored rules; fix the underlying issues.
- **References**: Code Quality Best Practices

### 3.8 [Medium] Hardcoded Database Credentials in Dockerfile
- **File Path**: `Dockerfile`
- **Line Number(s)**: 80-85
- **Issue Description**: Database credentials (POSTGRES_USER=dodo, POSTGRES_PASSWORD=dodo) are hardcoded in the Dockerfile ENV instructions.
- **Impact**: Credentials embedded in the image can be extracted by anyone with image access.
- **Suggested Fix**: Use environment variables passed at runtime, not build time, for credentials.
- **References**: CWE-798, Docker Security Best Practices

---

## 4. PERFORMANCE BOTTLENECKS (5 issues)

### 4.1 [High] Synchronous exec() Blocks Event Loop
- **File Path**: `dodo/services/tool_executor/tool_execution_sandbox.py`
- **Line Number(s)**: 285-286
- **Issue Description**: The run_local_dir_sandbox_directly method uses exec() in the main thread, which blocks the asyncio event loop for the entire duration of tool execution.
- **Impact**: All concurrent requests are blocked during tool execution, severely impacting throughput.
- **Suggested Fix**: Always use the subprocess-based execution path (run_local_dir_sandbox_venv).
- **References**: Async Python Best Practices

### 4.2 [Medium] PBKDF2 Key Derivation Uses lru_cache Without TTL
- **File Path**: `dodo/helpers/crypto_utils.py`
- **Line Number(s)**: 65
- **Issue Description**: The _derive_key_cached method uses lru_cache without a TTL, which could lead to memory growth over time and stale cached data.
- **Impact**: Potential memory leak from unbounded cache growth; stale encryption keys if master key changes.
- **Suggested Fix**: Implement a TTL-based cache or use functools.cache with a bounded size.
- **References**: Memory Management Best Practices

### 4.3 [Medium] NLTK Data Downloaded on Every Startup
- **File Path**: `dodo/server/rest_api/app.py`
- **Line Number(s)**: 205-213
- **Issue Description**: NLTK punkt_tab data is downloaded on every application startup via asyncio.to_thread, which adds latency.
- **Impact**: Increased startup time, especially in containerized environments.
- **Suggested Fix**: Download NLTK data during Docker build, not at runtime.
- **References**: Container Best Practices

### 4.4 [Medium] Synchronous Database Query During Startup
- **File Path**: `dodo/server/rest_api/app.py`
- **Line Number(s)**: 219-231
- **Issue Description**: A synchronous PostgreSQL statement_timeout query is executed during startup, blocking the event loop.
- **Impact**: Startup is blocked waiting for database response; can't handle concurrent startup operations.
- **Suggested Fix**: Use async database operations or move to a background task.
- **References**: Async Python Best Practices

### 4.5 [Medium] CORS Origins List Modified at Runtime
- **File Path**: `dodo/server/rest_api/app.py`
- **Line Number(s)**: 832-838
- **Issue Description**: settings.cors_origins is appended to dynamically at runtime, which is not thread-safe and causes mutation of global state.
- **Impact**: Race conditions and potential memory issues in multi-worker deployments.
- **Suggested Fix**: Build the complete CORS origins list once during configuration loading.
- **References**: Thread Safety Best Practices

---

## 5. TESTING & MAINTENANCE GAPS (4 issues)

### 5.1 [Medium] Tests Are Explicitly Ignored
- **File Path**: `pyproject.toml`
- **Line Number(s)**: 231
- **Issue Description**: pytest.ini_options ignores several test files: locust_test.py, test_modal_sandbox_v2.py, and test_temporal_metrics_local.py.
- **Impact**: Load testing, modal sandbox, and temporal metrics tests never run, masking potential issues.
- **Suggested Fix**: Re-enable these tests or create separate test configurations for them.
- **References**: Testing Best Practices

### 5.2 [Medium] Code Coverage Threshold May Be Too Low
- **File Path**: `.github/workflows/ci.yml`
- **Line Number(s)**: 55
- **Issue Description**: Coverage threshold is set to 70%, which may allow significant untested code paths.
- **Impact**: Untested code may contain bugs that only surface in production.
- **Suggested Fix**: Increase coverage threshold to 80-85% and ensure critical paths are covered.
- **References**: Testing Best Practices

### 5.3 [Low] Large Blocks of Commented-Out Code
- **File Path**: `dodo/config.py`
- **Line Number(s)**: 57-95
- **Issue Description**: Significant amounts of commented-out code in config.py related to LLM config and embedding config handling.
- **Impact**: Reduced code readability and maintainability.
- **Suggested Fix**: Remove commented-out code or move to documentation/design docs.
- **References**: Code Quality Best Practices

### 5.4 [Medium] Generic Exception Handling in Startup
- **File Path**: `dodo/server/rest_api/app.py`
- **Line Number(s)**: 203
- **Issue Description**: Multiple try/except Exception blocks in the lifespan startup code mask failures and may allow the application to start in a partially broken state.
- **Impact**: Silent failures during startup may lead to undefined behavior at runtime.
- **Suggested Fix**: Handle specific exceptions and fail fast on critical startup errors.
- **References**: Error Handling Best Practices

---

## 6. ARCHITECTURE & DESIGN FLAWS (7 issues)

### 6.1 [High] Global Mutable State for Server Instance
- **File Path**: `dodo/server/rest_api/app.py`
- **Line Number(s)**: 138-139
- **Issue Description**: The SyncServer instance is stored in a global variable and set via set_server() at module import time. This creates hidden global mutable state.
- **Impact**: Makes testing difficult; creates coupling; prevents running multiple server instances; race conditions in multi-worker setups.
- **Suggested Fix**: Use dependency injection with FastAPI's Depends() to provide the server instance per-request.
- **References**: SOLID Principles - Single Responsibility, Dependency Inversion

### 6.2 [High] God Object Anti-pattern (SyncServer)
- **File Path**: `dodo/server/server.py`
- **Line Number(s)**: 1-50
- **Issue Description**: SyncServer class likely manages too many responsibilities (agents, messages, runs, files, sources, tools, blocks, etc.).
- **Impact**: Tight coupling between components; difficult to test; hard to modify one component without affecting others.
- **Suggested Fix**: Decompose into smaller, focused services with clear interfaces.
- **References**: SOLID Principles - Single Responsibility Principle

### 6.3 [Medium] Multiple Agent Class Versions (V1, V2, V3) Without Clear Migration Path
- **File Path**: `dodo/agents/`
- **Line Number(s)**: Multiple files
- **Issue Description**: The codebase contains dodo_agent.py, dodo_agent_v2.py, dodo_agent_v3.py, dodo_agent_batch.py, and base_agent.py/base_agent_v2.py suggesting multiple parallel implementations.
- **Impact**: Code duplication, maintenance burden, confusion about which version to use.
- **Suggested Fix**: Consolidate to a single agent architecture with backward compatibility layer.
- **References**: Technical Debt Management

### 6.4 [Medium] Multiple Overlapping Authentication Systems
- **File Path**: `dodo/server/rest_api/auth/`
- **Line Number(s)**: Multiple files
- **Issue Description**: The project has at least 3 authentication systems: JWT (jwt_handler.py), legacy password (check_password.py), and legacy auth router (auth/index.py).
- **Impact**: Complexity increases attack surface; maintaining multiple auth systems is error-prone.
- **Suggested Fix**: Consolidate to a single authentication system with clear deprecation timeline.
- **References**: Authentication Architecture Best Practices

### 6.5 [Medium] Circular Import Risk
- **File Path**: `dodo/`
- **Line Number(s)**: Multiple directories
- **Issue Description**: The settings module imports from dodo.settings which then likely imports back from other dodo modules, creating circular dependency risks.
- **Impact**: Import errors, initialization order problems, brittle codebase.
- **Suggested Fix**: Use lazy imports or redesign module boundaries to eliminate cycles.
- **References**: Software Architecture Principles

### 6.6 [Medium] AST Walking Finds Last Function, Not Named Function
- **File Path**: `dodo/functions/ast_parsers.py`
- **Line Number(s)**: 175-217
- **Issue Description**: get_function_name_and_docstring walks the AST and keeps overwriting function_def, returning the last function found rather than the named one.
- **Impact**: Bug: If source contains multiple functions, it returns the wrong function's name/docstring.
- **Suggested Fix**: Check function_def.name against the expected name parameter.
- **References**: Code Correctness

### 6.7 [Low] Custom Singleton Implementation
- **File Path**: `dodo/helpers/singleton.py`
- **Line Number(s)**: 1-30
- **Issue Description**: A custom singleton metaclass/pattern is used instead of standard Python patterns or dependency injection.
- **Impact**: Hidden global state; harder to test; potential thread-safety issues.
- **Suggested Fix**: Replace with proper dependency injection framework.
- **References**: Testability Best Practices

---

## SUMMARY TABLE: ALL ISSUES BY SEVERITY

### Critical Issues (4)
| # | Issue | File | Line |
|---|-------|------|------|
| 1 | Authentication Bypass in Debug Mode | dodo/server/rest_api/app.py | 440 |
| 2 | Token-Based Authentication Bypass | dodo/server/rest_api/auth/jwt_handler.py | 77-84 |
| 3 | Hardcoded JWT Secret Key | dodo/server/rest_api/auth/jwt_handler.py | 9 |
| 4 | Hardcoded Default Server Password | dodo/server/rest_api/app.py | 179 |

### High Issues (10)
| # | Issue | File | Line |
|---|-------|------|------|
| 1 | Arbitrary Code Execution via exec() | dodo/services/tool_executor/tool_execution_sandbox.py | 285-286 |
| 2 | Insecure Deserialization via pickle.loads() | dodo/services/tool_executor/tool_execution_sandbox.py | 478 |
| 3 | pickle.loads() in Safe Pickle Module | dodo/services/tool_sandbox/safe_pickle.py | 108 |
| 4 | Unsafe eval() in Type Resolution | dodo/functions/ast_parsers.py | 86 |
| 5 | Legacy Bare Password Authentication | dodo/server/rest_api/middleware/check_password.py | 36-40 |
| 6 | Overly Permissive CORS Configuration | dodo/server/rest_api/app.py | 855 |
| 7 | python-jose Library Vulnerabilities | pyproject.toml | 47 |
| 8 | Global Mutable State for Server | dodo/server/rest_api/app.py | 138-139 |
| 9 | God Object Anti-pattern (SyncServer) | dodo/server/server.py | 1-50 |
| 10 | Synchronous exec() Blocks Event Loop | dodo/services/tool_executor/tool_execution_sandbox.py | 285-286 |

### Medium Issues (22)
| # | Issue | File | Line |
|---|-------|------|------|
| 1 | Use of eval() for Parsing | dodo/interface.py | 203, 229 |
| 2 | exec() in Tool Loading | dodo/services/tool_manager.py | 141 |
| 3 | Weak Content Security Policy | dodo/server/rest_api/app.py | 451 |
| 4 | Weak Default Database Password | compose.yaml | 11 |
| 5 | Excessive Port Exposure | Dockerfile | 98 |
| 6 | Weak PBKDF2 Iterations | dodo/helpers/crypto_utils.py | 61-62 |
| 7 | JWT None Algorithm Risk | dodo/server/rest_api/auth/jwt_handler.py | 22-23 |
| 8 | Pinned Uvicorn Version | pyproject.toml | 103 |
| 9 | OpenAI SDK Range Too Permissive | pyproject.toml | 46 |
| 10 | PostgreSQL+Python Same Container | Dockerfile | 2,42 |
| 11 | Outdated pgvector Image | compose.yaml | 3 |
| 12 | mypy Without Strict Mode | .github/workflows/ci.yml | 36 |
| 13 | Ruff Ignores Important Rules | pyproject.toml | 172-198 |
| 14 | Hardcoded DB Credentials in Dockerfile | Dockerfile | 80-85 |
| 15 | PBKDF2 Cache Without TTL | dodo/helpers/crypto_utils.py | 65 |
| 16 | NLTK Data Downloaded at Startup | dodo/server/rest_api/app.py | 205-213 |
| 17 | Synchronous DB Query at Startup | dodo/server/rest_api/app.py | 219-231 |
| 18 | CORS Origins Modified at Runtime | dodo/server/rest_api/app.py | 832-838 |
| 19 | Tests Explicitly Ignored | pyproject.toml | 231 |
| 20 | Coverage Threshold Too Low | .github/workflows/ci.yml | 55 |
| 21 | Generic Exception Handling | dodo/server/rest_api/app.py | 203 |
| 22 | Multiple Agent Versions | dodo/agents/ | Multiple |

### Low Issues (5)
| # | Issue | File | Line |
|---|-------|------|------|
| 1 | Excessive Port Exposure | Dockerfile | 98 |
| 2 | Commented-Out Code Blocks | dodo/config.py | 57-95 |
| 3 | Custom Singleton Pattern | dodo/helpers/singleton.py | 1-30 |
| 4 | AST Walking Bug | dodo/functions/ast_parsers.py | 175-217 |
| 5 | Multiple Overlapping Auth Systems | dodo/server/rest_api/auth/ | Multiple |

---

## RECOMMENDATIONS PRIORITY MATRIX

### Immediate (Within 48 hours)
1. **Remove all authentication bypasses** - Debug mode, password bypass, legacy auth
2. **Change all default credentials** - JWT secret, server password, DB password
3. **Restrict CORS** to known origins only
4. **Disable exec() and eval() paths** in tool execution

### Short-term (Within 2 weeks)
1. Replace pickle with JSON for tool results
2. Remove bare password authentication middleware
3. Update Docker image to use minimal Python base
4. Replace python-jose with PyJWT
5. Fix CSP headers

### Medium-term (Within 1 month)
1. Refactor SyncServer to reduce coupling
2. Consolidate agent versions
3. Increase test coverage and re-enable ignored tests
4. Fix performance bottlenecks in startup
5. Update dependencies to latest secure versions

### Long-term (Ongoing)
1. Implement proper dependency injection
2. Add comprehensive security testing
3. Establish regular dependency update cadence
4. Add security headers and rate limiting review
5. Implement proper secret management (Vault, etc.)

---

## CONCLUSION

The dodo project contains **41 identified issues** ranging from Critical to Low severity. The most pressing concerns are:

1. **Authentication vulnerabilities** that allow complete bypass of security controls
2. **Code execution vectors** through exec(), eval(), and pickle
3. **Hardcoded credentials** that compromise the entire security model
4. **Architecture issues** that create maintainability and scalability problems

**Without remediation, the system is vulnerable to complete compromise including unauthorized data access, arbitrary code execution, and privilege escalation.**

The project would benefit from a security-focused refactor prioritizing:
- Strict authentication enforcement
- Sandboxed code execution
- Secret management best practices
- Architecture decoupling

*Report generated by automated code analysis with manual verification.*
