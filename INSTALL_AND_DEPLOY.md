# 🚀 Install & Deploy - Step by Step

Fixed for Cloudflare Pages compatibility!

---

## Step 1: Install Dependencies

```bash
# Navigate to your project
cd /Users/nitish_rider/Downloads/household-expense-tracker

# Install all dependencies (including Cloudflare adapter)
npm install
```

This installs:
- ✅ Next.js and React
- ✅ Cloudflare Next.js adapter (`@cloudflare/next-on-pages`)
- ✅ Wrangler (Cloudflare CLI)
- ✅ All other dependencies

---

## Step 2: Check Deployment Readiness

```bash
npm run deploy:check
```

This verifies:
- ✅ All required files exist
- ✅ Configuration is correct
- ✅ You're ready to deploy

---

## Step 3: Setup Cloudflare

### 3.1 Login to Cloudflare
```bash
npm run cf:login
```

Browser opens → Authorize Wrangler → Done ✅

### 3.2 Create D1 Database
```bash
npm run db:create
```

**IMPORTANT:** Copy the `database_id` from output!

Example output:
```
✅ Successfully created DB 'splitter-db'!

[[d1_databases]]
binding = "DB"
database_name = "splitter-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  ← COPY THIS!
```

### 3.3 Update wrangler.toml
Open `wrangler.toml` and update line 8:
```toml
database_id = "YOUR-COPIED-DATABASE-ID-HERE"
```

### 3.4 Run Database Migrations
```bash
npm run db:migrate:remote
```

Verify:
```bash
npx wrangler d1 execute splitter-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"
```

You should see: `users`, `groups`, `expenses`, `settlements`, `categories` ✅

---

## Step 4: Setup Discord OAuth

### 4.1 Create Discord Application
1. Go to: https://discord.com/developers/applications
2. Click **"New Application"**
3. Name: **"Splitter"** (or your choice)
4. Click **"Create"**

### 4.2 Configure OAuth
1. Go to **OAuth2** → **General**
2. Add **Redirect URLs**:
   ```
   http://localhost:3000/api/auth/discord/callback
   https://splitter.pages.dev/api/auth/discord/callback
   ```
   (Replace `splitter` with your actual project name)

3. **Copy** your:
   - Client ID
   - Client Secret (click "Reset Secret" if needed)

### 4.3 Generate Session Secret
```bash
openssl rand -base64 32
```

Copy the output - this is your `SESSION_SECRET`

---

## Step 5: Test Locally (Optional but Recommended)

### 5.1 Create .env.local
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback
SESSION_SECRET=your_generated_secret_here
```

### 5.2 Initialize Local Database
```bash
npm run db:local
```

### 5.3 Start Dev Server
```bash
npm run dev
```

Visit: http://localhost:3000

Test:
- ✅ Login with Discord
- ✅ Create a group
- ✅ Add an expense

If everything works → Ready to deploy! 🎉

---

## Step 6: Build for Cloudflare

```bash
# Build with Cloudflare adapter
npm run pages:build
```

You should see:
```
⚡️ Completed successfully!
✨ Compiled Worker successfully
```

Verify output:
```bash
ls .vercel/output/static/_worker.js
```

If `_worker.js` exists → Build successful! ✅

---

## Step 7: Deploy to Cloudflare Pages

### Option A: Via Cloudflare Dashboard (Recommended for first time)

#### 7.1 Create Pages Project
1. Go to: https://dash.cloudflare.com
2. Pages → **Create a project**
3. **Connect to Git** → Select your GitHub repository
4. **Configure builds:**
   ```
   Framework preset: Next.js (Experimental)
   Build command: npx @cloudflare/next-on-pages
   Build output directory: .vercel/output/static
   Root directory: (leave empty)
   ```

5. Click **"Save and Deploy"**
   - First deployment will fail - that's expected!

#### 7.2 Add Environment Variables
1. Go to: Settings → **Environment variables**
2. Add for **Production**:
   
   | Variable | Value |
   |----------|-------|
   | `NODE_VERSION` | `20` |
   | `DISCORD_CLIENT_ID` | Your Discord Client ID |
   | `DISCORD_CLIENT_SECRET` | Your Discord Client Secret |
   | `DISCORD_REDIRECT_URI` | `https://YOUR-PROJECT.pages.dev/api/auth/discord/callback` |
   | `SESSION_SECRET` | Your generated secret |

3. Click **"Save"**

#### 7.3 Bind D1 Database
1. Go to: Settings → **Functions**
2. Scroll to **D1 database bindings**
3. Click **"Add binding"**:
   ```
   Variable name: DB
   D1 database: splitter-db
   ```
4. Click **"Save"**

#### 7.4 Retry Deployment
1. Go to: **Deployments**
2. Click the failed deployment
3. Click **"Retry deployment"**

Or just push a new commit:
```bash
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

### Option B: Manual Deploy via CLI

```bash
# Deploy directly with Wrangler
npm run deploy:pages
```

This builds and deploys in one command!

---

## Step 8: Setup GitHub Actions (Auto-Deploy)

### 8.1 Get Cloudflare Credentials

**Get API Token:**
1. Cloudflare Dashboard → My Profile → **API Tokens**
2. Click **"Create Token"**
3. Use template: **"Edit Cloudflare Workers"**
4. Or custom with permissions:
   - Account → Cloudflare Pages → Edit
   - Account → D1 → Edit
5. Click **"Continue to summary"** → **"Create Token"**
6. **COPY THE TOKEN** (shown only once!)

**Get Account ID:**
1. Cloudflare Dashboard
2. Right sidebar → Copy **Account ID**

### 8.2 Add GitHub Secrets

1. Go to: GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add two secrets:

   **Secret 1:**
   ```
   Name: CLOUDFLARE_API_TOKEN
   Value: (paste your API token)
   ```

   **Secret 2:**
   ```
   Name: CLOUDFLARE_ACCOUNT_ID
   Value: (paste your account ID)
   ```

4. Click **"Add secret"** for each

### 8.3 Verify Workflow File

Check that `.github/workflows/deploy-with-migrations.yml` exists and has:
```yaml
projectName: splitter  # Change if your project has different name
```

---

## Step 9: Deploy! 🚀

```bash
# Add all changes
git add .

# Commit
git commit -m "Setup Cloudflare deployment with Next.js adapter"

# Push to trigger auto-deployment
git push origin main
```

### Watch Deployment

**GitHub:**
- Go to: Actions tab
- Watch workflow progress

**Cloudflare:**
- Go to: Pages → Your project → Deployments
- See build logs and status

---

## Step 10: Verify Deployment

### 10.1 Check Your Live Site
Visit: `https://YOUR-PROJECT.pages.dev`

### 10.2 Test Everything
- ✅ Click "Login with Discord"
- ✅ Authorize the app
- ✅ Create a group
- ✅ Add members
- ✅ Add expenses
- ✅ Check balances
- ✅ Test settlements
- ✅ Add categories

### 10.3 Check Database
```bash
npx wrangler d1 execute splitter-db --remote --command="SELECT * FROM users"
```

Should show your user! ✅

---

## 🎉 Success!

Your app is now:
- ✅ Live on Cloudflare Pages
- ✅ Auto-deploys on every push
- ✅ Runs database migrations automatically
- ✅ Uses Cloudflare D1 database
- ✅ Hosted for free (Cloudflare free tier)

---

## 🔄 Future Deployments

Every time you push to `main`:
1. GitHub Actions runs automatically
2. Migrations execute
3. App builds with Cloudflare adapter
4. Deploys to Cloudflare Pages
5. Goes live automatically

**No manual work needed!** 🎊

---

## 📝 Quick Commands Reference

```bash
# Development
npm run dev                    # Start local dev server
npm run preview               # Test with Cloudflare dev server

# Database
npm run db:migrate:local      # Run migrations locally
npm run db:migrate:remote     # Run migrations on production

# Build & Deploy
npm run pages:build           # Build for Cloudflare
npm run deploy:pages          # Build and deploy
npm run deploy:check          # Check readiness

# Cloudflare
npm run cf:login              # Login to Cloudflare
npm run db:create             # Create D1 database
```

---

## 🆘 Troubleshooting

### "Missing entry-point" error
→ Make sure you ran `npm install` to get `@cloudflare/next-on-pages`
→ Use `npm run pages:build` instead of `npm run build`

### Discord OAuth not working
→ Check redirect URI matches exactly in Discord app settings
→ Verify environment variables in Cloudflare Pages

### Database errors
→ Verify D1 binding: Settings → Functions → D1 database bindings
→ Check database_id in wrangler.toml

### Build fails
→ Check build command: `npx @cloudflare/next-on-pages`
→ Check output directory: `.vercel/output/static`
→ Verify NODE_VERSION=20 in environment variables

---

## 🎯 Next Steps

- [ ] Set up custom domain (optional)
- [ ] Configure error monitoring
- [ ] Set up database backups
- [ ] Invite team members
- [ ] Start tracking expenses!

**Congratulations! You're live! 🎊**
