import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

interface Balance {
  user_id: string
  user_name: string
  total_paid: number
  total_owed: number
  balance: number
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

    // Get all members
    const members = await db
      .prepare(`
        SELECT u.id, u.name
        FROM users u
        INNER JOIN group_members gm ON u.id = gm.user_id
        WHERE gm.group_id = ?
      `)
      .bind(groupId)
      .all<{ id: string; name: string }>()

    const balances: Balance[] = []

    for (const member of members.results) {
      // Calculate total paid by this user (from expenses)
      const paidResult = await db
        .prepare(`
          SELECT COALESCE(SUM(amount), 0) as total
          FROM expenses
          WHERE group_id = ? AND paid_by = ?
        `)
        .bind(groupId, member.id)
        .first<{ total: number }>()

      // Calculate total owed by this user (from expense splits)
      const owedResult = await db
        .prepare(`
          SELECT COALESCE(SUM(es.amount), 0) as total
          FROM expense_splits es
          INNER JOIN expenses e ON es.expense_id = e.id
          WHERE e.group_id = ? AND es.user_id = ?
        `)
        .bind(groupId, member.id)
        .first<{ total: number }>()

      // Calculate settled settlements received by this user
      const settlementsReceivedResult = await db
        .prepare(`
          SELECT COALESCE(SUM(amount), 0) as total
          FROM settlements
          WHERE group_id = ? AND to_user = ? AND status = 'settled'
        `)
        .bind(groupId, member.id)
        .first<{ total: number }>()

      // Calculate settled settlements paid by this user
      const settlementsPaidResult = await db
        .prepare(`
          SELECT COALESCE(SUM(amount), 0) as total
          FROM settlements
          WHERE group_id = ? AND from_user = ? AND status = 'settled'
        `)
        .bind(groupId, member.id)
        .first<{ total: number }>()

      const totalPaid = paidResult?.total || 0
      const totalOwed = owedResult?.total || 0
      const settlementsReceived = settlementsReceivedResult?.total || 0
      const settlementsPaid = settlementsPaidResult?.total || 0
      
      const balance = totalPaid - totalOwed - settlementsReceived + settlementsPaid

      balances.push({
        user_id: member.id,
        user_name: member.name,
        total_paid: totalPaid,
        total_owed: totalOwed,
        balance: balance,
      })
    }

    return NextResponse.json(balances)
  } catch (error) {
    console.error('Error fetching balances:', error)
    return NextResponse.json({ error: 'Failed to fetch balances' }, { status: 500 })
  }
}
