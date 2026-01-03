# Blood Donation Support System - Deployment Guide

## Deploy to Vercel

### Prerequisites
1. Create a Vercel account at https://vercel.com
2. Install Vercel CLI (optional): `npm i -g vercel`

### Steps to Deploy

#### 1. Push your code to Git repository (GitHub, GitLab, or Bitbucket)

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

#### 2. Deploy via Vercel Website

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure your project:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install --legacy-peer-deps`

#### 3. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | Your backend API URL | Production |

Example:
```
NEXT_PUBLIC_API_URL=https://your-backend-api.azurewebsites.net
```

#### 4. Deploy

Click **Deploy** and Vercel will:
- Install dependencies
- Build your Next.js app
- Deploy to production

### Build Configuration Notes

⚠️ **Important**: Due to the `canvas` package requiring native dependencies, you may need to:

1. Use the custom install command in Vercel:
```bash
npm install --legacy-peer-deps --ignore-scripts
```

2. If `canvas` causes build issues, consider removing it if not essential:
```bash
npm uninstall canvas
```

### Custom Domain (Optional)

After deployment:
1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed

### Environment Variables by Stage

- **Development**: Use `.env.local` (already created)
- **Production**: Configure in Vercel Dashboard

### Troubleshooting

**Build fails due to canvas package:**
- Add build configuration in Vercel: Build Command = `npm run build`
- Install Command = `npm install --legacy-peer-deps --ignore-scripts`

**API connection issues:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Ensure backend API allows CORS from Vercel domain

**Next.js security warning:**
- Consider upgrading Next.js: `npm install next@latest`

### Deployment via CLI (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Automatic Deployments

Once connected to Git:
- Push to `main` branch → Auto-deploy to Production
- Push to other branches → Auto-deploy to Preview environments

---

## Current Configuration

✅ Environment files created:
- `.env.example` - Template for environment variables
- `.env.local` - Local development configuration

✅ Vercel configuration:
- `vercel.json` - Vercel-specific settings

✅ API Configuration:
- Located in `src/config/constants.ts`
- Uses `NEXT_PUBLIC_API_URL` environment variable
- Falls back to `http://localhost:5222` for local development
