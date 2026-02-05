# Quick Start

## Development
```bash
bun install
bun run start:dev    # Starts with WebSocket support
```

## Kubernetes Deployment
```bash
# Generate manifests
bun run k8s:generate

# Deploy to cluster
bun run k8s:deploy

# For Helm deployments (alternative)
helm install desme-audio ./helm/desme-audio
```

## Vercel Deployment
```bash
# Automatic via git
git push origin main

# Or manual
vercel deploy --prod

# First: Configure secrets in Vercel dashboard
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
# - JWT_SECRET
# - DATABASE_URL
```

## Real-time Sync Options

**Kubernetes (Recommended):**
- Use WebSocket: `src/websocket/playback.gateway.ts`
- Full-featured real-time collaboration

**Vercel:**
- Use REST polling: `/api/sync/rooms/:roomId/updates`
- Poll every 1-5 seconds for updates
- Alternative to WebSocket due to serverless limitations

See `DEPLOYMENT.md` for more details.
