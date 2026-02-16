import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const runtime = 'edge';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; expenseId: string }> }
) {
  try {
    const userId = request.cookies.get('user_session')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const db = getDb()
    const { groupId, expenseId } = await params

    // Verify user is a member of this group
    const membership = await db
      .prepare('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?')
      .bind(groupId, userId)
      .first()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Verify expense exists and belongs to this group
    const expense = await db
      .prepare('SELECT id FROM expenses WHERE id = ? AND group_id = ?')
      .bind(expenseId, groupId)
      .first()

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Delete expense splits first (foreign key constraint)
    await db
      .prepare('DELETE FROM expense_splits WHERE expense_id = ?')
      .bind(expenseId)
      .run()

    // Delete expense
    await db
      .prepare('DELETE FROM expenses WHERE id = ?')
      .bind(expenseId)
      .run()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
