# Deployment Options

## Kubernetes (Recommended for Production)

- **Real-time**: WebSocket support via `src/websocket/`
- **Generate manifests**: `bun run k8s:generate`
- **Deploy**: `bun run k8s:deploy`
- **Scaling**: Edit `k8s/config.ts` environment variables
- **Helm alternative**: Use `helm/desme-audio/` for Helm deployments

## Vercel (REST API only)

- **Build**: `bun run build:bun`
- **Deploy**: `git push origin main` or `vercel deploy --prod`
- **Real-time fallback**: Use `/api/sync/*` polling endpoints instead of WebSocket
- **Limits**: 30s max duration, 1GB memory per function
- **Note**: Configure secrets in Vercel dashboard for `AWS_ACCESS_KEY_ID`, etc.

## Local Development

- **Start**: `bun run start:dev`
- **WebSocket**: Enabled automatically
- **Sync endpoints**: Available at `http://localhost:3000/api/sync/`
