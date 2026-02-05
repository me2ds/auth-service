#!/bin/bash
# Health check script for Docker/Kubernetes

API_URL="${API_URL:-http://localhost:8000}"
HEALTH_ENDPOINT="${HEALTH_ENDPOINT:-/health}"

# Check if the API is responding on the health endpoint
if curl -s -f "${API_URL}${HEALTH_ENDPOINT}" > /dev/null 2>&1; then
    exit 0
else
    exit 1
fi
