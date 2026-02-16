import { NextRequest, NextResponse } from 'next/server'
import { getDb, generateId, getCurrentTimestamp, type User } from '@/lib/db'

export const runtime = 'edge';

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
  
  // Cloudflare Pages always uses HTTPS, use http only for localhost
  const protocol = host?.includes('localhost') ? 'http' : 'https'
  
  if (host) {
    return `${protocol}://${host}`
  }
  
  // Fallback to localhost
  return 'http://localhost:3000'
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const baseUrl = getBaseUrl(request)

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', baseUrl))
  }

  const clientId = process.env.DISCORD_CLIENT_ID!
  const clientSecret = process.env.DISCORD_CLIENT_SECRET!
  const redirectUri = `${baseUrl}/api/auth/discord/callback`

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Discord token error:', await tokenResponse.text())
      return NextResponse.redirect(new URL('/?error=token_failed', baseUrl))
    }

    const tokenData = await tokenResponse.json()

    // Fetch user info from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      console.error('Discord user info error:', await userResponse.text())
      return NextResponse.redirect(new URL('/?error=user_info_failed', baseUrl))
    }

    const discordUser = await userResponse.json()

    // Get database connection
    const db = getDb()
    
    // Check if user already exists
    const existingUser = await db
      .prepare('SELECT * FROM users WHERE provider = ? AND provider_id = ?')
      .bind('discord', discordUser.id)
      .first<User>()

    let user: User

    if (existingUser) {
      // Update existing user
      const now = getCurrentTimestamp()
      await db
        .prepare(`
          UPDATE users 
          SET email = ?, name = ?, avatar_url = ?, updated_at = ?
          WHERE id = ?
        `)
        .bind(
          discordUser.email || `${discordUser.username}@discord.user`,
          discordUser.global_name || discordUser.username,
          discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null,
          now,
          existingUser.id
        )
        .run()
      
      user = { ...existingUser, updated_at: now }
    } else {
      // Create new user
      const userId = generateId('user')
      const now = getCurrentTimestamp()
      
      await db
        .prepare(`
          INSERT INTO users (id, email, name, avatar_url, provider, provider_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          userId,
          discordUser.email || `${discordUser.username}@discord.user`,
          discordUser.global_name || discordUser.username,
          discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null,
          'discord',
          discordUser.id,
          now,
          now
        )
        .run()

      user = {
        id: userId,
        email: discordUser.email || `${discordUser.username}@discord.user`,
        name: discordUser.global_name || discordUser.username,
        avatar_url: discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : null,
        provider: 'discord',
        provider_id: discordUser.id,
        created_at: now,
        updated_at: now,
      }
    }

    // Set session cookie with user ID only
    const response = NextResponse.redirect(new URL('/', baseUrl))
    response.cookies.set('user_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error('Discord OAuth error:', error)
    return NextResponse.redirect(new URL('/?error=oauth_failed', baseUrl))
  }
}
