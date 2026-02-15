import { NextRequest, NextResponse } from 'next/server'

/**
 * Get the base URL for redirects
 * Handles 0.0.0.0 hostname by using NEXTAUTH_URL or Host header
 */
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

export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'Discord client ID not configured' }, { status: 500 })
  }

  const baseUrl = getBaseUrl(request)
  const redirectUri = `${baseUrl}/api/auth/discord/callback`
  const scope = 'identify email'

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
  })

  return NextResponse.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`)
}
