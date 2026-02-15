# Network Access Setup Guide

This guide will help you run your expense tracker on your network IP so you can access it from other devices (phones, tablets, other computers) on the same network.

## Your Network IP Address

Your current local network IP is: **192.168.88.7**

## Quick Start

### Option 1: Automatic Network Mode (Recommended)

I've created a special script that automatically configures network access:

```bash
pnpm run dev:network
```

Then access your app at:
- **From this computer**: http://192.168.88.7:3000 or http://localhost:3000
- **From other devices**: http://192.168.88.7:3000

### Option 2: Update .env.local (For Permanent Network Access)

If you want network access all the time:

1. **Replace your `.env.local` with the network configuration:**

```bash
# Backup your current .env.local
cp .env.local .env.local.backup

# Use the network configuration
cp .env.network .env.local
```

2. **Run the dev server:**

```bash
pnpm dev
```

3. **Access from any device on your network:**
   - Open browser to: http://192.168.88.7:3000

## Discord OAuth Configuration

✅ **GOOD NEWS**: The app now automatically detects your IP address for OAuth redirects!

### Recommended: Update Discord Developer Portal (Optional but Better)

While the app will work automatically, adding your IP to Discord's allowed redirects provides better reliability:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application (ID: 1472534503028293683)
3. Go to **OAuth2** → **General**
4. In **Redirects**, add this URL:
   ```
   http://192.168.88.7:3000/api/auth/discord/callback
   ```
5. Keep the localhost URL too (for when you want to use localhost):
   ```
   http://localhost:3000/api/auth/discord/callback
   ```
6. Click **Save Changes**

**Note**: The app will work even if you skip this step, as it now uses smart URL detection!

## Testing

### Test from This Computer

1. Open browser: http://192.168.88.7:3000
2. Try signing in with Discord
3. Create a group and add an expense

### Test from Phone/Tablet

1. Make sure your device is on the **same WiFi network**
2. Open browser: http://192.168.88.7:3000
3. Test all features

## Troubleshooting

### Can't Access from Other Devices

**Check your firewall:**

```bash
# macOS - Allow Node/Next.js through firewall
# Go to: System Settings → Network → Firewall
# Make sure Node is allowed
```

**Verify the server is listening on 0.0.0.0:**
When you run `pnpm run dev:network`, you should see:
```
- Local:        http://localhost:3000
- Network:      http://192.168.88.7:3000
```

### Discord OAuth Not Working

1. Make sure you added the callback URL in Discord Developer Portal
2. Verify the URL in `.env.local` or `.env.network` matches your IP
3. Try clearing browser cache and cookies
4. Restart the dev server after changing `.env` files

### IP Address Changed

Your IP address might change if:
- You reconnect to WiFi
- Your router restarts
- Your network admin changes settings

**To check your current IP:**

```bash
# macOS/Linux
ipconfig getifaddr en0

# Or check in System Settings → Network
```

**If IP changed:**
1. Update `.env.network` with the new IP
2. Update Discord OAuth callback URL
3. Restart the dev server

## Switch Back to Localhost Only

To go back to localhost-only mode:

```bash
# Restore original .env.local
cp .env.local.backup .env.local

# Or manually edit .env.local to use:
# NEXTAUTH_URL=http://localhost:3000

# Then run regular dev
pnpm dev
```

## Production Deployment

When you deploy to production (Cloudflare Pages):
- Use your actual domain name (e.g., https://yourdomain.com)
- Update NEXTAUTH_URL in production environment variables
- Update Discord OAuth with production callback URL
- SSL/HTTPS is automatically handled by Cloudflare

## Security Notes

- **Local network only**: Your app is only accessible within your local network, not from the internet
- **Development mode**: The dev server is not production-ready, don't expose it to the internet
- **Firewall**: Your computer's firewall may block incoming connections - you may need to allow Node.js
- **HTTPS**: The dev server uses HTTP, not HTTPS (production will use HTTPS automatically)

## Common Use Cases

### Testing on Mobile While Developing
- Use `pnpm run dev:network`
- Keep both tabs open (computer + phone) to test responsive design

### Sharing with Family Members
- They can all access the app from their devices on the same network
- Each person signs in with their own Discord account

### Demo to Someone on Same WiFi
- They can access your development version
- No need to deploy to show features

---

**Current Configuration Summary:**
- **Network IP**: 192.168.88.7
- **Port**: 3000
- **Network URL**: http://192.168.88.7:3000
- **Command**: `pnpm run dev:network`
