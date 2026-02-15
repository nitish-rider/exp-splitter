# 💰 Household Expense Tracker

A modern, collaborative expense tracking application built with Next.js and deployed on Cloudflare Pages with D1 database.

## ✨ Features

- 🔐 **Discord OAuth Authentication** - Secure login with Discord
- 👥 **Group Management** - Create and manage expense groups
- 💵 **Expense Tracking** - Record and categorize shared expenses
- 📊 **Balance Calculations** - Automatic balance tracking for group members
- 🎯 **Smart Settlements** - Optimized payment suggestions to settle debts
- 📝 **Settlement History** - Track all payments and their status
- 🏷️ **Custom Categories** - Create and manage expense categories
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Real-time Updates** - React Query for automatic data synchronization

## 🚀 Quick Deploy to Cloudflare

```bash
# 1. Check readiness
npm run deploy:check

# 2. Login to Cloudflare
npm run cf:login

# 3. Create database
npm run db:create

# 4. Update wrangler.toml with your database_id

# 5. Run migrations
npm run db:migrate:remote

# 6. Push to GitHub (triggers auto-deployment)
git push origin main
```

See **[QUICK_START.md](./QUICK_START.md)** for detailed 15-minute deployment guide.

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Fast deployment guide (15 min)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide (detailed)
- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - Commands reference

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: Discord OAuth
- **State Management**: TanStack React Query
- **Deployment**: Cloudflare Pages
- **CI/CD**: GitHub Actions

## 🏃 Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Discord OAuth credentials

# Initialize local database
npm run db:local

# Start development server
npm run dev
```

Visit http://localhost:3000

## 📦 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:create        # Create D1 database on Cloudflare
npm run db:migrate:local # Run migrations locally
npm run db:migrate:remote # Run migrations on production
npm run db:local         # Initialize local database
npm run db:remote        # Initialize remote database

# Deployment
npm run deploy:check     # Check deployment readiness
npm run deploy:pages     # Manual deploy to Cloudflare Pages
npm run cf:login         # Login to Cloudflare
```

## 🌐 Environment Variables

Required environment variables (see `.env.example`):

```bash
# Discord OAuth
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback

# Session
SESSION_SECRET=your_random_32+_character_secret

# Cloudflare (for deployment)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

## 🔄 Automated Deployments

Every push to `main` branch automatically:
1. ✅ Runs database migrations
2. ✅ Builds the application
3. ✅ Deploys to Cloudflare Pages

No manual steps needed!

## 📊 Database Schema

- **users** - User accounts (Discord OAuth)
- **groups** - Expense groups
- **group_members** - Group membership
- **expenses** - Individual expenses
- **expense_splits** - Expense distribution
- **settlements** - Payment records
- **categories** - Custom expense categories

## 🎯 Features in Detail

### Balance Calculation
Automatically calculates balances based on:
- Expenses paid by each member
- Expense splits (who owes what)
- Recorded settlement payments

### Smart Settlement Algorithm
Uses a greedy algorithm to minimize the number of transactions needed to settle all debts within a group.

### Real-time Synchronization
React Query automatically:
- Refetches data after mutations
- Invalidates related queries
- Provides loading and error states

## 🔐 Security

- Discord OAuth for authentication
- Session-based authentication with secure cookies
- Environment variable protection
- SQL injection prevention (parameterized queries)
- CORS configuration

## 🚢 Deployment Architecture

```
GitHub Repository
       ↓
GitHub Actions (on push to main)
       ↓
   Migrations → Cloudflare D1 Database
       ↓
   Build → Next.js Application
       ↓
   Deploy → Cloudflare Pages
       ↓
   Live Application ✨
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Hosted on [Cloudflare Pages](https://pages.cloudflare.com/)
- Database: [Cloudflare D1](https://developers.cloudflare.com/d1/)

## 📞 Support

Having issues? Check out:
- [Deployment Guide](./DEPLOYMENT.md)
- [Quick Start](./QUICK_START.md)
- [GitHub Issues](https://github.com/yourusername/household-expense-tracker/issues)

---

Made with ❤️ for splitting expenses fairly
