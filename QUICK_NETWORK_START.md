# 🚀 Quick Start - Network Access

Access your app from any device on your network in 3 simple steps!

## Your Network IP: `192.168.88.7`

---

## Method 1: Super Quick (Works without extra setup!)

**Just want to test?**

```bash
pnpm run dev:network
```

Access at: **http://192.168.88.7:3000**

✅ **Discord login now works automatically!** The app will use your device's IP address.

⚠️ **Note**: For best results, update Discord OAuth settings (see Method 2)

---

## Method 2: Full Setup (With Discord OAuth)

### Step 1: Update Discord Developer Portal

1. Go to: https://discord.com/developers/applications
2. Click your application
3. Go to **OAuth2** → **General**  
4. Under **Redirects**, click **Add Redirect**
5. Add: `http://192.168.88.7:3000/api/auth/discord/callback`
6. Click **Save Changes**

### Step 2: Run the Setup Script

```bash
./setup-network.sh
```

This will automatically:
- Backup your `.env.local`
- Update it with your network IP
- Show you next steps

### Step 3: Start the Server

```bash
pnpm run dev:network
```

### Step 4: Access Your App

**From this computer:**
- http://192.168.88.7:3000
- http://localhost:3000 (still works!)

**From phone/tablet/other devices:**
- http://192.168.88.7:3000
- *(Make sure they're on the same WiFi)*

---

## Testing Checklist

- [ ] Can access from your computer
- [ ] Can access from your phone
- [ ] Discord login works
- [ ] Can create groups
- [ ] Can add expenses
- [ ] Can add members

---

## Switch Back to Localhost

```bash
cp .env.local.backup .env.local
pnpm dev
```

---

## Troubleshooting

### "Connection Refused" from other devices

**Check firewall settings:**
- macOS: System Settings → Network → Firewall
- Allow Node.js/Next.js through firewall

**Verify server started correctly:**
When you run `pnpm run dev:network`, you should see:
```
- Local:   http://localhost:3000
- Network: http://192.168.88.7:3000
```

### Discord OAuth Error

1. Make sure you added the redirect URL in Discord Portal
2. Wait a minute after saving (Discord takes time to update)
3. Clear browser cache and try again
4. Restart dev server

### Can't Find Your Phone's Browser

1. Make sure phone is on same WiFi network
2. Type the IP address carefully: `http://192.168.88.7:3000`
3. Don't use https:// (use http://)

---

## Need More Help?

See the full guide: **NETWORK_SETUP.md**
