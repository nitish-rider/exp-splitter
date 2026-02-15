import { NextRequest, NextResponse } from 'next/server'
import { getDb, getCurrentTimestamp } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; settlementId: string }> }
) {
  try {
    const userId = request.cookies.get('user_session')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const db = getDb()
    const { groupId, settlementId } = await params

    // Verify user is a member of this group
    const membership = await db
      .prepare('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?')
      .bind(groupId, userId)
      .first()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Verify settlement exists and belongs to this group
    const settlement = await db
      .prepare('SELECT id FROM settlements WHERE id = ? AND group_id = ?')
      .bind(settlementId, groupId)
      .first()

    if (!settlement) {
      return NextResponse.json({ error: 'Settlement not found' }, { status: 404 })
    }

    // Update settlement status
    const now = getCurrentTimestamp()
    await db
      .prepare(`
        UPDATE settlements 
        SET status = ?, settled_at = ?
        WHERE id = ?
      `)
      .bind(status, status === 'settled' ? now : null, settlementId)
      .run()

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error('Error updating settlement:', error)
    return NextResponse.json({ error: 'Failed to update settlement' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; settlementId: string }> }
) {
  try {
    const userId = request.cookies.get('user_session')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const db = getDb()
    const { groupId, settlementId } = await params

    // Verify user is a member of this group
    const membership = await db
      .prepare('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?')
      .bind(groupId, userId)
      .first()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Verify settlement exists and belongs to this group
    const settlement = await db
      .prepare('SELECT id FROM settlements WHERE id = ? AND group_id = ?')
      .bind(settlementId, groupId)
      .first()

    if (!settlement) {
      return NextResponse.json({ error: 'Settlement not found' }, { status: 404 })
    }

    // Delete the settlement
    await db
      .prepare('DELETE FROM settlements WHERE id = ?')
      .bind(settlementId)
      .run()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting settlement:', error)
    return NextResponse.json({ error: 'Failed to delete settlement' }, { status: 500 })
  }
}
