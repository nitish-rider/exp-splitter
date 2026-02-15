#!/bin/bash

# Network Access Setup Script
# This script helps you set up network access for your expense tracker

set -e

echo "🌐 Expense Tracker - Network Access Setup"
echo "=========================================="
echo ""

# Get the current IP address
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")

if [ -z "$IP" ]; then
    echo "❌ Could not automatically detect your IP address"
    echo "Please find your IP manually:"
    echo "  - macOS: System Settings → Network"
    echo "  - Run: ipconfig getifaddr en0"
    exit 1
fi

echo "✅ Detected your network IP: $IP"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    echo "Please copy .env.example to .env.local first"
    exit 1
fi

# Backup existing .env.local if not already backed up
if [ ! -f .env.local.backup ]; then
    echo "📦 Backing up your current .env.local..."
    cp .env.local .env.local.backup
    echo "✅ Backup created: .env.local.backup"
else
    echo "ℹ️  Backup already exists: .env.local.backup"
fi

# Update NEXTAUTH_URL in .env.local
echo ""
echo "🔧 Updating NEXTAUTH_URL to use network IP..."
sed -i '' "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=http://$IP:3000|g" .env.local
echo "✅ Updated .env.local with IP: $IP"

echo ""
echo "=========================================="
echo "✨ Setup Complete!"
echo "=========================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Update Discord OAuth Settings:"
echo "   → Go to: https://discord.com/developers/applications"
echo "   → Add redirect URL: http://$IP:3000/api/auth/discord/callback"
echo ""
echo "2. Start the dev server:"
echo "   → Run: pnpm run dev:network"
echo ""
echo "3. Access your app:"
echo "   → From this computer: http://$IP:3000"
echo "   → From other devices: http://$IP:3000"
echo ""
echo "4. To revert back to localhost:"
echo "   → Run: cp .env.local.backup .env.local"
echo ""
echo "📖 Full guide: See NETWORK_SETUP.md"
echo ""
