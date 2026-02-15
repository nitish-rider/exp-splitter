# D1 Database Setup Guide

The application now uses Cloudflare D1 for production and a local SQLite database for development.

## For Local Development

### 1. Install Dependencies

```bash
pnpm install
```

This will install `better-sqlite3` which provides a local SQLite database compatible with D1.

### 2. Initialize Local Database

The local database will be automatically created in `.db/splitter.db` when you first run the app.

### 3. Start Development Server

```bash
pnpm dev
```

The app will automatically:
- Create a `.db` directory
- Initialize the database with the schema from `scripts/init-db.sql`
- Use the local SQLite database for all operations

## For Production (Cloudflare)

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

### 3. Create D1 Database

```bash
wrangler d1 create splitter-db
```

This will output a database ID. Copy it.

### 4. Update wrangler.toml

Update the `database_id` in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "splitter-db"
database_id = "your-actual-database-id-here"
```

### 5. Initialize Remote Database

```bash
pnpm run db:remote
```

Or manually:

```bash
wrangler d1 execute splitter-db --remote --file=scripts/init-db.sql
```

### 6. Deploy to Cloudflare Pages

```bash
wrangler pages deploy
```

Or connect your repository to Cloudflare Pages dashboard for automatic deployments.

## Database Schema

The database includes the following tables:
- **users** - User accounts with OAuth provider info
- **groups** - Expense groups
- **group_members** - Group membership
- **expenses** - Recorded expenses
- **expense_splits** - Individual expense shares
- **settlements** - Payment records

## Environment Variables

### Development (.env.local)
```
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### Production (Cloudflare Pages)
Set these in your Cloudflare Pages project settings:
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)

## Database Commands

```bash
# Initialize local database
pnpm run db:local

# Initialize remote (production) database
pnpm run db:remote

# Query local database (using wrangler)
wrangler d1 execute splitter-db --local --command "SELECT * FROM users"

# Query remote database
wrangler d1 execute splitter-db --remote --command "SELECT * FROM users"
```

## Troubleshooting

### Local Database Issues

If you encounter issues with the local database:

1. Delete the `.db` directory:
   ```bash
   rm -rf .db
   ```

2. Restart the development server - it will reinitialize the database

### TypeScript Errors

If you see TypeScript errors related to `better-sqlite3`, run:

```bash
pnpm install
```

### D1 Binding Not Found

If deployed to Cloudflare but getting "Database not available" errors:

1. Verify `wrangler.toml` has correct database_id
2. Ensure database is created: `wrangler d1 list`
3. Initialize database: `pnpm run db:remote`
4. Redeploy your application

## Testing with Wrangler Dev

To test with actual D1 locally:

```bash
wrangler pages dev
```

This will use Wrangler's local D1 emulation instead of better-sqlite3.

## Migration from Mock Data

If you were using the mock in-memory data before:
- All data was lost on restart (no persistence)
- Now all data is persisted in SQLite (local) or D1 (production)
- Existing sessions will be invalid - users need to log in again

## Next Steps

1. Install dependencies: `pnpm install`
2. Start dev server: `pnpm dev`
3. Test the application with local database
4. When ready for production, follow the Cloudflare setup steps above
