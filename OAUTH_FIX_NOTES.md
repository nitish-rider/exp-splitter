# OAuth Redirect Fix - Technical Notes

## Issue Fixed

When running the dev server with `pnpm run dev:network` (which uses `--hostname 0.0.0.0`), users were being redirected to `http://0.0.0.0:3000/` after Discord login, which doesn't work in browsers.

## Root Cause

The Discord OAuth callback was using `request.url` to construct redirect URLs. When the server binds to `0.0.0.0`, this resulted in redirects to:
- `http://0.0.0.0:3000/?error=...`
- `http://0.0.0.0:3000/`

The `0.0.0.0` hostname is not routable from browsers.

## Solution

Added a `getBaseUrl()` helper function that intelligently determines the correct URL:

1. **First priority**: Use `NEXTAUTH_URL` environment variable if set
2. **Second priority**: Use the `Host` header from the request (e.g., `192.168.88.7:3000`)
3. **Fallback**: Use `http://localhost:3000`

### Files Modified

- `app/api/auth/discord/route.ts` - Login initiation
- `app/api/auth/discord/callback/route.ts` - OAuth callback handler

### How It Works

```typescript
function getBaseUrl(request: NextRequest): string {
  // Use NEXTAUTH_URL if set (for network access)
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // Use the Host header to construct URL
  const host = request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'http'
  
  if (host) {
    return `${protocol}://${host}`
  }
  
  // Fallback to localhost
  return 'http://localhost:3000'
}
```

When a user accesses the app via `http://192.168.88.7:3000`, the `Host` header contains `192.168.88.7:3000`, so all redirects use that URL.

## Benefits

1. **Works automatically** - No need to set NEXTAUTH_URL for basic usage
2. **Flexible** - Still respects NEXTAUTH_URL when set
3. **Smart detection** - Uses the actual host from the request
4. **Backwards compatible** - Still works with localhost

## Testing

Tested scenarios:
- ✅ `pnpm dev` → redirects to `localhost:3000`
- ✅ `pnpm run dev:network` without NEXTAUTH_URL → redirects to actual IP
- ✅ `pnpm run dev:network` with NEXTAUTH_URL → respects env variable
- ✅ Access from phone → redirects correctly to IP

## Migration Notes

No migration needed for existing setups. The fix is backwards compatible:
- If you already set NEXTAUTH_URL, it continues to work
- If you didn't set it, it now works automatically
- The setup-network.sh script still sets NEXTAUTH_URL for best reliability
