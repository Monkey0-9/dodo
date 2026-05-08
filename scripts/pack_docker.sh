export DODO_VERSION=$(dodo version)
docker buildx build --platform=linux/amd64,linux/arm64,linux/x86_64 --build-arg DODO_ENVIRONMENT=RELEASE -t dodo/dodo-server:${DODO_VERSION} .
docker push dodo/dodo-server:${DODO_VERSION}


