# ✅ Fixed: Pages Deploy Command Error

**Error:** "It looks like you've run a Workers-specific command in a Pages project"

## What Was Fixed

Changed from using the GitHub Action to directly running `wrangler pages deploy` command.

### Before ❌
```yaml
- name: Deploy to Cloudflare Pages
  uses: cloudflare/pages-action@v1
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    projectName: splitter
    directory: .vercel/output/static
```

### After ✅
```yaml
- name: Deploy to Cloudflare Pages
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
  run: |
    npx wrangler pages deploy .vercel/output/static --project-name=splitter
```

---

## ✅ What's Updated

1. **GitHub Actions Workflow** - Uses correct Pages deploy command
2. **package.json** - Updated deploy script

---

## 🚀 Deploy Now

```bash
# Commit the fix
git add .
git commit -m "Fix Pages deployment command"

# Push to trigger deployment
git push origin main
```

The deployment will now work correctly! 🎉

---

## 🧪 Test Locally

```bash
# Build
pnpm run pages:build

# Deploy manually
pnpm run deploy:pages
```

---

## 📝 Notes

- The `cloudflare/pages-action@v1` GitHub Action was trying to use a Workers command
- Direct `wrangler pages deploy` command works properly for Pages projects
- Project name is specified with `--project-name=splitter`

---

## ✅ Status

**Fixed!** Your deployment will now succeed on the next push.
