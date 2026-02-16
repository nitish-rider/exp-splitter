import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const runtime = 'edge';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; categoryId: string }> }
) {
  try {
    const userId = request.cookies.get('user_session')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { name, icon, color } = body

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const db = getDb()
    const { groupId, categoryId } = await params

    // Verify user is a member of this group
    const membership = await db
      .prepare('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?')
      .bind(groupId, userId)
      .first()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Verify category exists and belongs to this group
    const category = await db
      .prepare('SELECT id FROM categories WHERE id = ? AND group_id = ?')
      .bind(categoryId, groupId)
      .first()

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if another category with same name exists (excluding current category)
    const existing = await db
      .prepare('SELECT id FROM categories WHERE group_id = ? AND name = ? AND id != ?')
      .bind(groupId, name.trim(), categoryId)
      .first()

    if (existing) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 })
    }

    // Update category
    await db
      .prepare(`
        UPDATE categories 
        SET name = ?, icon = ?, color = ?
        WHERE id = ?
      `)
      .bind(name.trim(), icon || null, color || null, categoryId)
      .run()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; categoryId: string }> }
) {
  try {
    const userId = request.cookies.get('user_session')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const db = getDb()
    const { groupId, categoryId } = await params

    // Verify user is a member of this group
    const membership = await db
      .prepare('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?')
      .bind(groupId, userId)
      .first()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Verify category exists and belongs to this group
    const category = await db
      .prepare('SELECT id FROM categories WHERE id = ? AND group_id = ?')
      .bind(categoryId, groupId)
      .first()

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Delete category (expenses with this category will have NULL category)
    await db
      .prepare('DELETE FROM categories WHERE id = ?')
      .bind(categoryId)
      .run()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
