import { NextRequest, NextResponse } from 'next/server'
import { getDb, generateId, getCurrentTimestamp, type Expense } from '@/lib/db'

interface ExpenseWithUser extends Expense {
  paid_by_name: string
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

    // Get all expenses with user names
    const expenses = await db
      .prepare(`
        SELECT 
          e.*,
          u.name as paid_by_name
        FROM expenses e
        INNER JOIN users u ON e.paid_by = u.id
        WHERE e.group_id = ?
        ORDER BY e.created_at DESC
      `)
      .bind(groupId)
      .all<ExpenseWithUser>()

    return NextResponse.json(expenses.results)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
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
    const { description, amount, category, paid_by, split_members, split_amount } = body

    if (!description || !amount || !paid_by || !split_members || !split_amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    const expenseId = generateId('expense')
    const now = getCurrentTimestamp()

    // Create expense
    await db
      .prepare(`
        INSERT INTO expenses (id, group_id, paid_by, description, amount, category, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(expenseId, groupId, paid_by, description, amount, category || null, now, now)
      .run()

    // Create splits for each member
    for (const memberId of split_members) {
      const splitId = generateId('split')
      await db
        .prepare(`
          INSERT INTO expense_splits (id, expense_id, user_id, amount)
          VALUES (?, ?, ?, ?)
        `)
        .bind(splitId, expenseId, memberId, split_amount)
        .run()
    }

    // Get the created expense with user name
    const newExpense = await db
      .prepare(`
        SELECT 
          e.*,
          u.name as paid_by_name
        FROM expenses e
        INNER JOIN users u ON e.paid_by = u.id
        WHERE e.id = ?
      `)
      .bind(expenseId)
      .first<ExpenseWithUser>()

    return NextResponse.json(newExpense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
