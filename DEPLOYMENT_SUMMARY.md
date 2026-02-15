# 🚀 Deployment Setup Complete!

Your Household Expense Tracker is now ready to deploy to Cloudflare Pages with automated database migrations.

## 📁 Files Created/Updated

### Deployment Configuration
- ✅ `.github/workflows/deploy-with-migrations.yml` - GitHub Actions for automated deployment
- ✅ `public/_routes.json` - Cloudflare routing configuration
- ✅ `.env.example` - Environment variables template
- ✅ `wrangler.toml` - Cloudflare D1 database configuration (update database_id!)

### Scripts
- ✅ `scripts/run-migrations.sh` - Automated migration runner
- ✅ `scripts/check-deployment-ready.sh` - Pre-deployment checklist

### Documentation
- ✅ `DEPLOYMENT.md` - Complete deployment guide (detailed)
- ✅ `QUICK_START.md` - Quick deployment guide (15 minutes)
- ✅ `DEPLOYMENT_SUMMARY.md` - This file

### Updated Files
- ✅ `package.json` - Added deployment scripts

---

## 🎯 Quick Deploy (Copy & Paste)

### Prerequisites
```bash
# Make sure you're in your project directory
cd /Users/nitish_rider/Downloads/household-expense-tracker

# Check if everything is ready
npm run deploy:check
```

### Step 1: Cloudflare Setup
```bash
# Login to Cloudflare
npm run cf:login

# Create database
npm run db:create

# IMPORTANT: Copy the database_id from output and update wrangler.toml!

# Run migrations
npm run db:migrate:remote
```

### Step 2: Discord OAuth
1. Go to https://discord.com/developers/applications
2. Create application → Get Client ID & Secret
3. Add redirect: `https://YOUR-PROJECT.pages.dev/api/auth/discord/callback`

### Step 3: Cloudflare Pages
1. Dashboard → Pages → Create project
2. Connect GitHub repo
3. Build settings:
   - Build command: `npm run build`
   - Output: `.next`
4. Environment variables:
   ```
   DISCORD_CLIENT_ID=xxx
   DISCORD_CLIENT_SECRET=xxx
   DISCORD_REDIRECT_URI=https://YOUR-PROJECT.pages.dev/api/auth/discord/callback
   SESSION_SECRET=$(openssl rand -base64 32)
   NODE_VERSION=20
   ```
5. Functions → D1 bindings:
   - Name: `DB`
   - Database: `splitter-db`

### Step 4: GitHub Secrets
1. Get Cloudflare API Token: Dashboard → API Tokens → Create
2. Get Account ID: Dashboard → Right sidebar
3. GitHub → Settings → Secrets → Add:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

### Step 5: Deploy!
```bash
git add .
git commit -m "Setup Cloudflare deployment with auto-migrations"
git push origin main
```

---

## 🔄 How Auto-Migrations Work

Every time you push to `main`:

1. **GitHub Actions triggers** (`.github/workflows/deploy-with-migrations.yml`)
2. **Migrations run first** - Updates database schema
3. **App builds** - Creates production build
4. **Deploys to Cloudflare** - Goes live automatically

### Adding New Migrations

```bash
# 1. Create new migration file
cat > scripts/migration-20260215-add-feature.sql << 'EOF'
-- Add new column
ALTER TABLE expenses ADD COLUMN receipt_url TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_expenses_receipt ON expenses(receipt_url);
EOF

# 2. Update GitHub Actions workflow
# Edit .github/workflows/deploy-with-migrations.yml
# Add your migration to the "Run database migrations" step

# 3. Commit and push
git add .
git commit -m "Add receipt URL feature"
git push origin main

# Migrations run automatically! ✨
```

---

## 🛠️ Useful Commands

```bash
# Check deployment readiness
npm run deploy:check

# Login to Cloudflare
npm run cf:login

# Create D1 database
npm run db:create

# Run migrations locally (for testing)
npm run db:migrate:local

# Run migrations on production
npm run db:migrate:remote

# Deploy manually (without GitHub Actions)
npm run deploy:pages

# View live logs
npx wrangler pages deployment tail

# Execute SQL on production
npx wrangler d1 execute splitter-db --remote --command="SELECT * FROM users LIMIT 5"

# Backup database
npx wrangler d1 export splitter-db --remote --output=backup.sql

# List all tables
npx wrangler d1 execute splitter-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"
```

---

## 📚 Documentation

Choose your guide:

1. **QUICK_START.md** - Fast deployment (15 min)
   - Perfect for: Getting live quickly
   - Covers: Essential steps only

2. **DEPLOYMENT.md** - Complete guide (detailed)
   - Perfect for: Understanding everything
   - Covers: All options, troubleshooting, advanced setup

3. **This file** - Command reference
   - Perfect for: Copy-paste commands
   - Covers: Quick commands and workflows

---

## ✅ Deployment Checklist

Before pushing to production:

- [ ] Updated `wrangler.toml` with your `database_id`
- [ ] Created Discord OAuth app
- [ ] Configured Cloudflare Pages project
- [ ] Set all environment variables
- [ ] Bound D1 database to Pages
- [ ] Added GitHub secrets
- [ ] Ran `npm run deploy:check`
- [ ] Tested locally with `npm run dev`
- [ ] Ran migrations: `npm run db:migrate:remote`
- [ ] Pushed to GitHub

---

## 🎯 Production URLs

After deployment, update these:

### Discord OAuth
```
https://YOUR-PROJECT.pages.dev/api/auth/discord/callback
```

### Your Live App
```
https://YOUR-PROJECT.pages.dev
```

### Custom Domain (Optional)
```
https://yourdomain.com
```

Don't forget to update environment variables if you change domains!

---

## 🐛 Troubleshooting

### Build fails?
```bash
# Check Cloudflare Pages logs in dashboard
# Common fixes:
# 1. Set NODE_VERSION=20 in environment variables
# 2. Verify all environment variables are set
# 3. Check build logs for specific errors
```

### Database not connecting?
```bash
# Verify D1 binding
# Cloudflare Pages → Settings → Functions → D1 database bindings
# Should show: DB → splitter-db

# Test database
npx wrangler d1 execute splitter-db --remote --command="SELECT 1"
```

### OAuth errors?
```bash
# Verify redirect URI matches exactly (including trailing slash)
# Check DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET
# Ensure DISCORD_REDIRECT_URI is set correctly
```

### Migrations not running?
```bash
# Check GitHub Actions logs
# Manually run: npm run db:migrate:remote
# Verify database_id in wrangler.toml
```

---

## 🎉 Next Steps

After successful deployment:

1. ✅ Visit your live site
2. ✅ Test Discord login
3. ✅ Create a test group
4. ✅ Add an expense
5. ✅ Verify balances work
6. ✅ Test settlements
7. ✅ Set up custom domain (optional)
8. ✅ Invite your team!

---

## 📞 Support

If you run into issues:

1. Check the deployment logs in Cloudflare Pages
2. Check GitHub Actions logs
3. Verify all environment variables
4. Run `npm run deploy:check`
5. See DEPLOYMENT.md for detailed troubleshooting

---

## 🌟 You're All Set!

Your expense tracker is configured for:
- ✅ Automated deployments on every push
- ✅ Automatic database migrations
- ✅ Production-ready infrastructure
- ✅ Scalable D1 database

**Happy tracking! 💰✨**
