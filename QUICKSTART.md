# Quick Start Guide

Your expense tracker now has full database integration with Cloudflare D1!

## Get Started in 2 Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Development Server

```bash
pnpm dev
```

That's it! 🎉

The application will:
- Automatically create a local SQLite database at `.db/splitter.db`
- Initialize the database schema from `scripts/init-db.sql`
- Run on http://localhost:3000

## What Changed?

### ✅ Before: Mock Data (In-Memory)
- Data lost on restart
- Not production-ready

### ✨ Now: Real Database (Persistent)
- All data persisted to database
- Production-ready
- Works locally and on Cloudflare

## Features Now Working

All features are now fully functional with database persistence:

- ✅ **User Authentication** - Discord OAuth with database storage
- ✅ **Groups** - Create and manage expense groups
- ✅ **Members** - Add people to groups
- ✅ **Expenses** - Record and split expenses
- ✅ **Balances** - See who owes whom
- ✅ **Settlements** - Track payments

## Database Location

### Local Development
- Database file: `.db/splitter.db`
- Automatically created on first run
- Persists between restarts

### Production (Cloudflare)
- Uses Cloudflare D1
- See `D1_SETUP.md` for deployment instructions

## Test It Out

1. Start the dev server: `pnpm dev`
2. Open http://localhost:3000
3. Click "Sign in with Discord"
4. Create a group
5. Add an expense
6. See the balances update

## Database Commands

```bash
# Reinitialize local database
pnpm run db:local

# For production setup
pnpm run db:remote
```

## Need Help?

- **Setup Instructions**: See `D1_SETUP.md`
- **Implementation Details**: See `D1_IMPLEMENTATION.md`
- **Original Guide**: See `SETUP_GUIDE.md`

## Troubleshooting

### Reset Local Database

If you want to start fresh:

```bash
rm -rf .db
pnpm dev
```

### TypeScript Errors

If you see TypeScript errors:

```bash
rm -rf node_modules
pnpm install
```

## Next Steps

Your app is ready to use! When you're ready to deploy to production:

1. Create a Cloudflare account
2. Follow the production setup in `D1_SETUP.md`
3. Deploy to Cloudflare Pages

Enjoy your fully functional expense tracker! 🚀
