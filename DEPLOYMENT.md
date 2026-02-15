# Deployment Guide - Cloudflare Pages + D1 Database

This guide will walk you through deploying your Household Expense Tracker to Cloudflare Pages with automated database migrations.

## Prerequisites

- GitHub account with your project repository
- Cloudflare account (free tier works)
- Your project pushed to GitHub

---

## Step 1: Set Up Cloudflare D1 Database

### 1.1 Create D1 Database

```bash
# Login to Cloudflare (if not already logged in)
npx wrangler login

# Create the D1 database
npx wrangler d1 create splitter-db
```

**Important**: Copy the `database_id` from the output. It will look like:
```
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 1.2 Update wrangler.toml

Open `wrangler.toml` and update the `database_id` with the one you just created:

```toml
name = "splitter"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "splitter-db"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace with your actual database_id
```

### 1.3 Run Initial Migration

```bash
# Run the initial database schema
npx wrangler d1 execute splitter-db --remote --file=./scripts/init-db.sql
```

Verify the migration worked:
```bash
npx wrangler d1 execute splitter-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"
```

---

## Step 2: Set Up Discord OAuth (Authentication)

### 2.1 Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Name it "Splitter" (or your preferred name)
4. Go to OAuth2 → General
5. Add Redirect URLs:
   - For production: `https://YOUR-PROJECT-NAME.pages.dev/api/auth/discord/callback`
   - For local dev: `http://localhost:3000/api/auth/discord/callback`

6. Copy your **Client ID** and **Client Secret**

---

## Step 3: Set Up Cloudflare Pages Project

### 3.1 Create Pages Project via Dashboard

1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project"
3. Connect to your GitHub repository
4. Select your repository
5. Configure build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/` (leave empty if repo root)

6. Click "Save and Deploy" (it will fail first time - that's OK!)

### 3.2 Configure Environment Variables

In Cloudflare Pages dashboard:

1. Go to your project → Settings → Environment variables
2. Add the following variables for **Production**:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `DISCORD_CLIENT_ID` | Your Discord Client ID | From Step 2.1 |
| `DISCORD_CLIENT_SECRET` | Your Discord Client Secret | From Step 2.1 |
| `DISCORD_REDIRECT_URI` | `https://YOUR-PROJECT.pages.dev/api/auth/discord/callback` | Replace with your actual URL |
| `SESSION_SECRET` | Random 32+ character string | Generate with: `openssl rand -base64 32` |
| `NODE_VERSION` | `20` | Ensures Node 20 is used |

### 3.3 Bind D1 Database to Pages

1. In Cloudflare Pages → Settings → Functions
2. Scroll to "D1 database bindings"
3. Click "Add binding"
   - Variable name: `DB`
   - D1 database: Select `splitter-db`
4. Click "Save"

---

## Step 4: Set Up GitHub Actions (Automated Deployments + Migrations)

### 4.1 Get Cloudflare API Token

1. Go to Cloudflare Dashboard → My Profile → API Tokens
2. Click "Create Token"
3. Use template "Edit Cloudflare Workers"
4. Or create custom token with permissions:
   - Account → Cloudflare Pages → Edit
   - Account → D1 → Edit
5. Copy the token (you won't see it again!)

### 4.2 Get Cloudflare Account ID

1. Go to Cloudflare Dashboard
2. In the right sidebar, copy your **Account ID**

### 4.3 Add GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add these secrets:

| Secret Name | Value | How to get |
|-------------|-------|------------|
| `CLOUDFLARE_API_TOKEN` | Your API Token | From Step 4.1 |
| `CLOUDFLARE_ACCOUNT_ID` | Your Account ID | From Step 4.2 |

---

## Step 5: Configure Next.js for Cloudflare Pages

### 5.1 Update next.config.mjs

The config should work with Cloudflare Pages runtime:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Enable in production
  },
  images: {
    unoptimized: true, // Required for static export
  },
}

export default nextConfig
```

### 5.2 Create \_routes.json for Cloudflare

Create `public/_routes.json`:

```json
{
  "version": 1,
  "include": [
    "/api/*"
  ],
  "exclude": [
    "/_next/static/*",
    "/images/*",
    "/favicon.ico"
  ]
}
```

---

## Step 6: Deploy!

### 6.1 Commit and Push

```bash
git add .
git commit -m "Add Cloudflare deployment configuration"
git push origin main
```

### 6.2 Verify Deployment

1. GitHub Actions will automatically:
   - Run database migrations
   - Build your Next.js app
   - Deploy to Cloudflare Pages

2. Watch the deployment:
   - GitHub: Actions tab → See workflow progress
   - Cloudflare: Pages → Your project → Deployments

3. Once complete, visit: `https://YOUR-PROJECT.pages.dev`

---

## Step 7: Set Up Custom Domain (Optional)

1. In Cloudflare Pages → Custom domains
2. Click "Set up a custom domain"
3. Enter your domain (must be on Cloudflare DNS)
4. Follow the instructions

Don't forget to update Discord OAuth redirect URL!

---

## Testing & Verification

### Test Database Connection

```bash
# List all tables
npx wrangler d1 execute splitter-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"

# Check if users table exists
npx wrangler d1 execute splitter-db --remote --command="SELECT * FROM users LIMIT 1"
```

### Test Deployment

1. Visit your deployment URL
2. Try logging in with Discord
3. Create a group
4. Add an expense
5. Check balances and settlements

---

## Automated Migrations on Every Deploy

The GitHub Actions workflow automatically runs migrations before each deployment. 

### To add new migrations:

1. Create a new SQL file in `scripts/` folder:
   ```bash
   scripts/migration-001-add-feature.sql
   ```

2. Update `.github/workflows/deploy.yml` to include new migration:
   ```yaml
   - name: Run database migrations
     run: |
       npx wrangler d1 execute splitter-db --remote --file=./scripts/init-db.sql
       npx wrangler d1 execute splitter-db --remote --file=./scripts/migration-001-add-feature.sql
   ```

3. Commit and push - migrations run automatically!

---

## Troubleshooting

### Build Fails

```bash
# Check build logs in Cloudflare Pages dashboard
# Common issues:
# 1. Missing environment variables
# 2. Wrong Node version (should be 20)
# 3. TypeScript errors
```

### Database Connection Issues

```bash
# Verify D1 binding
# In Cloudflare Pages → Settings → Functions → D1 database bindings
# Should show: DB → splitter-db

# Test locally
npm run dev
```

### Discord OAuth Not Working

1. Check redirect URI matches exactly (including trailing slash)
2. Verify Client ID and Secret are correct
3. Check environment variables in Cloudflare Pages

### Migrations Not Running

```bash
# Manually run migration
npx wrangler d1 execute splitter-db --remote --file=./scripts/init-db.sql

# Check GitHub Actions logs for errors
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start local dev server (uses local SQLite)
npm run dev

# Run local migrations
npm run db:local
```

---

## Useful Commands

```bash
# View logs
npx wrangler pages deployment tail

# Execute SQL command
npx wrangler d1 execute splitter-db --remote --command="YOUR SQL HERE"

# Backup database
npx wrangler d1 export splitter-db --remote --output=backup.sql

# Deploy manually (without GitHub Actions)
npm run build
npx wrangler pages deploy .next
```

---

## Production Checklist

- [ ] D1 database created and migrated
- [ ] Discord OAuth app configured
- [ ] Cloudflare Pages project created
- [ ] Environment variables set
- [ ] D1 database bound to Pages
- [ ] GitHub secrets configured
- [ ] First deployment successful
- [ ] Can log in with Discord
- [ ] Can create groups and expenses
- [ ] (Optional) Custom domain configured

---

## Support

If you run into issues:
1. Check Cloudflare Pages deployment logs
2. Check GitHub Actions logs
3. Verify all environment variables
4. Check Discord OAuth settings
5. Test database connection with Wrangler CLI

Happy deploying! 🚀
