# Start with Python base for builder
FROM python:3.11-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

ARG dodo_ENVIRONMENT=DEV
ENV dodo_ENVIRONMENT=${dodo_ENVIRONMENT} \
    UV_NO_PROGRESS=1 \
    UV_PYTHON_PREFERENCE=system \
    UV_CACHE_DIR=/tmp/uv_cache

# Set version
ARG dodo_VERSION
ENV dodo_VERSION=${dodo_VERSION}

WORKDIR /app

# Create virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy uv from official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

# Copy dependency files first
COPY pyproject.toml uv.lock ./
# Copy app code
COPY . .

RUN uv sync --python 3.11 --no-dev --all-extras

# Runtime stage
FROM python:3.11-slim AS runtime

# Overridable Node.js version
ARG NODE_VERSION=22
# OpenTelemetry Collector version
ARG OTEL_VERSION=0.96.0
ARG TARGETARCH

RUN set -eux; \
    case "${TARGETARCH:-amd64}" in \
      arm64|aarch64) OTEL_ARCH=arm64 ;; \
      amd64|x86_64|x64) OTEL_ARCH=amd64 ;; \
      *) OTEL_ARCH=amd64 ;; \
    esac; \
    apt-get update && \
    apt-get install -y curl git libpq-dev && \
    # Install Node.js
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - && \
    apt-get install -y nodejs && \
    # Install OpenTelemetry Collector
    OTEL_FILENAME="otelcol-contrib_${OTEL_VERSION}_linux_${OTEL_ARCH}.tar.gz"; \
    curl -L "https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v${OTEL_VERSION}/${OTEL_FILENAME}" -o /tmp/otel-collector.tar.gz && \
    tar xzf /tmp/otel-collector.tar.gz -C /usr/local/bin && \
    rm /tmp/otel-collector.tar.gz && \
    mkdir -p /etc/otel && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Add OpenTelemetry Collector configs
COPY otel/otel-collector-config-file.yaml /etc/otel/config-file.yaml
COPY otel/otel-collector-config-clickhouse.yaml /etc/otel/config-clickhouse.yaml
COPY otel/otel-collector-config-signoz.yaml /etc/otel/config-signoz.yaml

ARG dodo_ENVIRONMENT=DEV
ENV dodo_ENVIRONMENT=${dodo_ENVIRONMENT} \
    VIRTUAL_ENV="/app/.venv" \
    PATH="/app/.venv/bin:$PATH"

ARG dodo_VERSION
ENV dodo_VERSION=${dodo_VERSION}

WORKDIR /app

# Copy virtual environment and app from builder
COPY --from=builder /app .

# Pre-download NLTK data to global directory
RUN /app/.venv/bin/python -m nltk.downloader -d /usr/local/share/nltk_data punkt_tab

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Limit ports exposure to application ports
EXPOSE 8083 8283

# Set up non-root user
RUN groupadd -r dodo && useradd -r -m -g dodo dodo && \
    chown -R dodo:dodo /app

USER dodo

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["./dodo/server/startup.sh"]
