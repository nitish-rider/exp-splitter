import { NextRequest, NextResponse } from 'next/server'
import { getDb, type User } from '@/lib/db'

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const userCookie = request.cookies.get('user_session')

    if (!userCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user ID from cookie
    const userId = userCookie.value

    // Fetch user from database
    const db = getDb()
    const user = await db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(userId)
      .first<User>()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ error: 'Session error' }, { status: 500 })
  }
}
