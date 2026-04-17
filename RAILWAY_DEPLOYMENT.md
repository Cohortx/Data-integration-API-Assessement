# Railway Deployment Guide

This project is configured for deployment on [Railway](https://railway.app).

## Prerequisites

1. **Railway Account** - Sign up at https://railway.app
2. **Git Repository** - Push your code to GitHub
3. **Environment Variables** - Set up in Railway dashboard

## Deployment Steps

### 1. Connect Your Repository

1. Log in to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect the Dockerfile and build accordingly

### 2. Configure Environment Variables

In the Railway Dashboard, go to **Variables** and add:

```
VITE_SUPABASE_URL=https://yqqfxhsksdausepxjwza.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
PORT=5000
```

**Note:** Railway automatically exposes `PORT` (default 5000), but you can override it in Variables.

### 3. Deploy

Railway will automatically:
1. Build the Docker image
2. Run `npm ci` and `npm run build` to create `dist/`
3. Start with `node server.js`
4. Assign a public URL

The app will be live within 2-5 minutes!

## What's Included

- **server.js** - Express server serving built frontend as static files
- **Dockerfile** - Multi-stage Docker build (optimized, ~150MB final image)
- **railway.json** - Railway-specific configuration (Docker builder)
- **.dockerignore** - Excludes unnecessary files from Docker build

## Architecture

```
Frontend (React/Vite) → Runs on Railway → Calls Supabase APIs
                         [Express Server]
                           (port 5000)
                         
Backend → Supabase Edge Functions (hosted separately)
```

The frontend is built as static files and served by Express. All API calls go directly to Supabase Cloud Functions.

## Monitoring

- **Logs**: View in Railway Dashboard → **Deployments** → **Logs**
- **Health Check**: Visit `/health` endpoint (returns `{"status": "ok"}`).

## Troubleshooting

### Build Fails

- Check **Build Logs** in Railway Dashboard
- Ensure `npm install` dependencies are compatible
- Verify Vite build succeeds locally: `npm run build`

### App Crashes

- View **Runtime Logs** for errors
- Check environment variables are set correctly
- Verify `dist/index.html` exists (from build)

### Port Issues

- Railway automatically assigns a port; don't hardcode `5000`
- Server reads `process.env.PORT` unless manually overridden

### CORS Issues with Supabase

- Already handled by Supabase Edge Functions (`Access-Control-Allow-Origin: *`)
- Frontend environment variables (Supabase URL/key) are embedded at build time

## Rolling Back

In Railway Dashboard, go to **Deployments** and select a previous version to redeploy.

## Custom Domain

1. In Railway Project Settings → **Domains**
2. Add custom domain or use Railway's `.railway.app` subdomain
3. Configure DNS if using custom domain

## Database Migration (if needed)

If using Supabase migrations, run them **before** deploying:

```bash
npx supabase db push
```

Or use Supabase Dashboard to run SQL migrations directly.

## Performance Tips

- Build logs show bundle size; keep vendor dependencies minimal
- Frontend is pre-built as static files (fast)
- Use Supabase indexes for database queries (already configured)
- Enable Railway's auto-scaling for traffic spikes

## Next Steps

After deployment:

1. Test `/health` endpoint
2. Visit your app URL and verify it loads
3. Test API calls to Supabase
4. Monitor logs for errors
5. Set up GitHub Actions for CI/CD (optional)

For more info, see [Railway Docs](https://docs.railway.app).
