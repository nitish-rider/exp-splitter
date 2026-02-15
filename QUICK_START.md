# Quick Start Guide - Cloudflare Deployment

**Time to deploy: ~15 minutes**

Follow this checklist to deploy your expense tracker to Cloudflare Pages.

---

## 📋 Pre-Deployment Checklist

Before starting, have these ready:
- [ ] GitHub account
- [ ] Cloudflare account (free)
- [ ] Discord account (for OAuth)
- [ ] Your code pushed to GitHub

---

## 🚀 5-Step Deployment

### Step 1: Login to Cloudflare (2 min)

```bash
# In your project directory
npm run cf:login
```

This opens your browser - authorize Wrangler.

---

### Step 2: Create & Migrate Database (3 min)

```bash
# Create D1 database
npm run db:create

# Copy the database_id from output
# Update wrangler.toml with your database_id

# Run migrations
npm run db:migrate:remote
```

**Verify it worked:**
```bash
npx wrangler d1 execute splitter-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"
```

You should see: `users`, `groups`, `expenses`, etc.

---

### Step 3: Set Up Discord OAuth (3 min)

1. Go to https://discord.com/developers/applications
2. Create New Application → Name: "Splitter"
3. OAuth2 → Add Redirect URL:
   ```
   https://splitter.pages.dev/api/auth/discord/callback
   ```
   (Replace `splitter` with your project name)
4. Copy **Client ID** and **Client Secret**

---

### Step 4: Deploy to Cloudflare Pages (5 min)

#### Option A: Via Dashboard (Recommended)

1. Go to Cloudflare Dashboard → Pages → Create a project
2. Connect to GitHub → Select your repository
3. Build settings:
   - Framework: Next.js
   - Build command: `npm run build`
   - Build output: `.next`
4. Click "Save and Deploy" (will fail - that's OK!)

5. Go to Settings → Environment variables → Add:
   ```
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_CLIENT_SECRET=your_client_secret
   DISCORD_REDIRECT_URI=https://YOUR-PROJECT.pages.dev/api/auth/discord/callback
   SESSION_SECRET=generate_with_openssl_rand_base64_32
   NODE_VERSION=20
   ```

6. Go to Settings → Functions → D1 database bindings:
   - Variable name: `DB`
   - Database: `splitter-db`

7. Retry deployment or push a commit

#### Option B: Manual Deploy

```bash
npm run deploy:pages
```

---

### Step 5: Set Up GitHub Actions (2 min)

1. Get Cloudflare API Token:
   - Dashboard → My Profile → API Tokens → Create Token
   - Use "Edit Cloudflare Workers" template
   - Copy token

2. Get Account ID:
   - Cloudflare Dashboard → Copy from sidebar

3. Add to GitHub Secrets:
   - Repo → Settings → Secrets → Actions
   - Add:
     - `CLOUDFLARE_API_TOKEN`
     - `CLOUDFLARE_ACCOUNT_ID`

4. Push to main branch:
   ```bash
   git add .
   git commit -m "Setup Cloudflare deployment"
   git push origin main
   ```

---

## ✅ Verify Deployment

Visit your site: `https://YOUR-PROJECT.pages.dev`

Test:
1. Click "Login with Discord"
2. Create a group
3. Add an expense
4. Check balances

---

## 🔄 Automated Deployments

Every push to `main` branch will:
1. ✅ Run database migrations automatically
2. ✅ Build the app
3. ✅ Deploy to Cloudflare Pages

No manual steps needed! 🎉

---

## 📝 Common Issues

### "Database not found"
```bash
# Verify D1 binding in Cloudflare Pages
# Settings → Functions → D1 database bindings
# Should show: DB → splitter-db
```

### "Discord OAuth error"
```bash
# Check redirect URI matches exactly
# Update in Discord App settings and Cloudflare env vars
```

### Build fails
```bash
# Check Node version is 20
# Check all environment variables are set
# View logs in Cloudflare Pages deployment
```

---

## 🛠️ Useful Commands

```bash
# Run migrations locally
npm run db:migrate:local

# Run migrations on production
npm run db:migrate:remote

# Deploy manually
npm run deploy:pages

# View live logs
npx wrangler pages deployment tail

# Check database
npx wrangler d1 execute splitter-db --remote --command="SELECT * FROM users"
```

---

## 📚 Need More Help?

See `DEPLOYMENT.md` for detailed step-by-step guide.

---

## 🎯 Next Steps

After deployment:
- [ ] Set up custom domain (Optional)
- [ ] Test all features
- [ ] Invite team members
- [ ] Start tracking expenses!

**Congratulations! Your app is live! 🎊**
