#!/bin/bash

# Migration script for Cloudflare D1
# This script runs all migrations in order

set -e

DB_NAME="splitter-db"
ENVIRONMENT="${1:-remote}"  # Default to remote, pass 'local' for local dev

echo "🚀 Running database migrations for $DB_NAME ($ENVIRONMENT)..."
echo ""

# Determine the flag based on environment
if [ "$ENVIRONMENT" = "local" ]; then
  FLAG="--local"
else
  FLAG="--remote"
fi

# Run init schema (main tables)
echo "📋 Running init-db.sql..."
npx wrangler d1 execute $DB_NAME $FLAG --file=./scripts/init-db.sql
echo "✅ init-db.sql completed"
echo ""

# Run additional migrations if they exist
if [ -f "./scripts/add-categories-migration.sql" ]; then
  echo "📋 Running add-categories-migration.sql..."
  npx wrangler d1 execute $DB_NAME $FLAG --file=./scripts/add-categories-migration.sql
  echo "✅ add-categories-migration.sql completed"
  echo ""
fi

# Add more migrations here as needed
# Example:
# if [ -f "./scripts/migration-002.sql" ]; then
#   echo "📋 Running migration-002.sql..."
#   npx wrangler d1 execute $DB_NAME $FLAG --file=./scripts/migration-002.sql
#   echo "✅ migration-002.sql completed"
#   echo ""
# fi

echo "🎉 All migrations completed successfully!"
echo ""

# Verify tables were created
echo "📊 Verifying database tables..."
npx wrangler d1 execute $DB_NAME $FLAG --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
echo ""
echo "✨ Migration process complete!"
