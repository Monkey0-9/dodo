#!/bin/bash

# Wait for image to be ready
echo "Waiting for dodo/dodo:latest image to be built..."
while [ -z "$(docker images -q dodo/dodo:latest 2>/dev/null)" ]; do
  sleep 5
  echo "Still building..."
done

echo "Image is ready! Starting Docker Compose..."
docker compose up --pull always

