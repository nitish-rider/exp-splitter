import { NextRequest, NextResponse } from 'next/server'
import { getDb, generateId, getCurrentTimestamp, type Settlement } from '@/lib/db'

interface SettlementWithUsers extends Settlement {
  from_user_name: string
  to_user_name: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const userId = request.cookies.get('user_session')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const db = getDb()
    const { groupId } = await params

    // Verify user is a member of this group
    const membership = await db
      .prepare('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?')
      .bind(groupId, userId)
      .first()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Get all settlements with user names
    const settlements = await db
      .prepare(`
        SELECT 
          s.*,
          u1.name as from_user_name,
          u2.name as to_user_name
        FROM settlements s
        INNER JOIN users u1 ON s.from_user = u1.id
        INNER JOIN users u2 ON s.to_user = u2.id
        WHERE s.group_id = ?
        ORDER BY s.created_at DESC
      `)
      .bind(groupId)
      .all<SettlementWithUsers>()

    return NextResponse.json(settlements.results)
  } catch (error) {
    console.error('Error fetching settlements:', error)
    return NextResponse.json({ error: 'Failed to fetch settlements' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const userId = request.cookies.get('user_session')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { from_user, to_user, amount } = body

    if (!from_user || !to_user || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 })
    }

    const db = getDb()
    const { groupId } = await params

    // Verify user is a member of this group
    const membership = await db
      .prepare('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?')
      .bind(groupId, userId)
      .first()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Verify both users are members of this group
    const [fromMember, toMember] = await Promise.all([
      db.prepare('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?')
        .bind(groupId, from_user)
        .first(),
      db.prepare('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?')
        .bind(groupId, to_user)
        .first()
    ])

    if (!fromMember || !toMember) {
      return NextResponse.json({ error: 'Users must be members of this group' }, { status: 400 })
    }

    // Create settlement
    const settlementId = generateId('settlement')
    const now = getCurrentTimestamp()

    await db
      .prepare(`
        INSERT INTO settlements (id, group_id, from_user, to_user, amount, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'pending', ?)
      `)
      .bind(settlementId, groupId, from_user, to_user, amount, now)
      .run()

    // Get the created settlement with user names
    const settlement = await db
      .prepare(`
        SELECT 
          s.*,
          u1.name as from_user_name,
          u2.name as to_user_name
        FROM settlements s
        INNER JOIN users u1 ON s.from_user = u1.id
        INNER JOIN users u2 ON s.to_user = u2.id
        WHERE s.id = ?
      `)
      .bind(settlementId)
      .first<SettlementWithUsers>()

    return NextResponse.json(settlement, { status: 201 })
  } catch (error) {
    console.error('Error creating settlement:', error)
    return NextResponse.json({ error: 'Failed to create settlement' }, { status: 500 })
  }
}
