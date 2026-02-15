# Splitter - Expense Tracker Setup Guide

This is a collaborative expense tracking application built with Next.js 16, React, and Cloudflare D1.

## Current Status

The app has a complete UI and mock API endpoints. You need to:
1. Set up Cloudflare D1 database
2. Implement OAuth authentication (Google & Discord)
3. Connect the API routes to the real database

## Setup Steps

### 1. Database Setup (Cloudflare D1)

1. Create a Cloudflare D1 database:
   ```bash
   wrangler d1 create splitter-db
   ```

2. Run the database migrations:
   ```bash
   wrangler d1 execute splitter-db --file=scripts/init-db.sql
   ```

3. Update `wrangler.toml` to reference your D1 database (if using Wrangler for local dev):
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "splitter-db"
   database_id = "your-database-id"
   ```

### 2. Authentication Setup

This app uses OAuth with Google and Discord. You need to:

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret

#### Discord OAuth:
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 settings
4. Add redirect URIs:
   - `http://localhost:3000/api/auth/callback/discord`
   - `https://yourdomain.com/api/auth/callback/discord`
5. Copy Client ID and Client Secret

### 3. Environment Variables

Create a `.env.local` file with:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000
```

For production deployment on Vercel:
- Add these environment variables in Vercel project settings
- Update NEXTAUTH_URL to your production domain

### 4. Implementation Tasks

The following API endpoints need to be connected to D1:

#### Authentication Routes (`app/api/auth/*`)
- Currently uses cookie-based mock auth
- Replace with OAuth implementation using a library like [Auth.js](https://authjs.dev)
- Store user data in D1 users table

#### Groups Routes (`app/api/groups/*`)
- GET `/api/groups` - List user's groups
- POST `/api/groups` - Create new group
- GET `/api/groups/[groupId]/members` - List group members
- POST `/api/groups/[groupId]/members` - Add member to group

#### Expenses Routes (`app/api/groups/[groupId]/expenses/*`)
- GET `/api/groups/[groupId]/expenses` - List expenses
- POST `/api/groups/[groupId]/expenses` - Add expense
- DELETE `/api/groups/[groupId]/expenses/[expenseId]` - Delete expense

#### Balances Routes (`app/api/groups/[groupId]/balances`)
- GET - Calculate who owes whom

#### Settlements Routes (`app/api/groups/[groupId]/settlements/*`)
- GET - List pending settlements
- PATCH - Mark settlement as complete

## Database Schema

The database schema is in `scripts/init-db.sql`. Key tables:

- **users** - Registered users
- **groups** - Expense groups
- **group_members** - Group membership
- **expenses** - Recorded expenses
- **expense_splits** - How much each person owes
- **settlements** - Payment records

## Recommended Libraries

For implementation:
- **Auth.js** - OAuth and session management
- **@databases/d1** - D1 database client
- **zod** - Data validation
- **uuid** - ID generation

## Testing

Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to test the UI.

## Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel project settings
3. Deploy to Vercel

## Notes

- The app currently uses in-memory mock data for demonstration
- All API routes are structured but need D1 implementation
- OAuth redirects need to be configured during auth setup
- Consider adding rate limiting and input validation before production
