import { NextRequest, NextResponse } from 'next/server'

// Mock authentication - Replace with actual OAuth implementation
// For now, this stores user data in cookies

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, user } = body

    // Validate provider
    if (!['discord'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    // Create response
    const response = NextResponse.json({ success: true })

    // Store user info in session cookie (in production, use proper session management)
    const userJSON = JSON.stringify(user)
    response.cookies.set('user_session', userJSON, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
