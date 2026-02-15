#!/bin/bash

# Pre-deployment checklist script
# Run this before deploying to ensure everything is configured

echo "🔍 Checking deployment readiness..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check if wrangler.toml exists
if [ -f "wrangler.toml" ]; then
  echo -e "${GREEN}✓${NC} wrangler.toml found"
  
  # Check if database_id is set
  if grep -q "database_id = \".*\"" wrangler.toml; then
    echo -e "${GREEN}✓${NC} database_id configured in wrangler.toml"
  else
    echo -e "${RED}✗${NC} database_id not set in wrangler.toml"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${RED}✗${NC} wrangler.toml not found"
  ERRORS=$((ERRORS + 1))
fi

# Check if init-db.sql exists
if [ -f "scripts/init-db.sql" ]; then
  echo -e "${GREEN}✓${NC} Database migration script found"
else
  echo -e "${RED}✗${NC} scripts/init-db.sql not found"
  ERRORS=$((ERRORS + 1))
fi

# Check if GitHub Actions workflow exists
if [ -f ".github/workflows/deploy-with-migrations.yml" ]; then
  echo -e "${GREEN}✓${NC} GitHub Actions workflow configured"
else
  echo -e "${YELLOW}⚠${NC} GitHub Actions workflow not found (optional)"
  WARNINGS=$((WARNINGS + 1))
fi

# Check if package.json has required scripts
if [ -f "package.json" ]; then
  echo -e "${GREEN}✓${NC} package.json found"
  
  if grep -q "\"build\"" package.json; then
    echo -e "${GREEN}✓${NC} Build script configured"
  else
    echo -e "${RED}✗${NC} Build script missing in package.json"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${RED}✗${NC} package.json not found"
  ERRORS=$((ERRORS + 1))
fi

# Check if .env.example exists
if [ -f ".env.example" ]; then
  echo -e "${GREEN}✓${NC} .env.example found"
else
  echo -e "${YELLOW}⚠${NC} .env.example not found (recommended)"
  WARNINGS=$((WARNINGS + 1))
fi

# Check if _routes.json exists
if [ -f "public/_routes.json" ]; then
  echo -e "${GREEN}✓${NC} Cloudflare routes configuration found"
else
  echo -e "${YELLOW}⚠${NC} public/_routes.json not found (recommended)"
  WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "📊 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✓ All critical checks passed!${NC}"
  echo ""
  echo "You're ready to deploy! 🚀"
  echo ""
  echo "Next steps:"
  echo "1. Login to Cloudflare: npm run cf:login"
  echo "2. Create database: npm run db:create"
  echo "3. Run migrations: npm run db:migrate:remote"
  echo "4. Deploy: Push to GitHub or run 'npm run deploy:pages'"
  exit 0
else
  echo -e "${RED}✗ Found $ERRORS error(s)${NC}"
  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ Found $WARNINGS warning(s)${NC}"
  fi
  echo ""
  echo "Please fix the errors above before deploying."
  exit 1
fi
