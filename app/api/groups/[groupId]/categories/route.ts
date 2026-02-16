import { NextRequest, NextResponse } from 'next/server'
import { getDb, generateId, getCurrentTimestamp, type Category } from '@/lib/db'

export const runtime = 'edge';

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

    // Get all categories for this group
    const categories = await db
      .prepare(`
        SELECT * FROM categories
        WHERE group_id = ?
        ORDER BY name ASC
      `)
      .bind(groupId)
      .all<Category>()

    return NextResponse.json(categories.results)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
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
    const { name, icon, color } = body

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
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

    // Check if category with same name already exists
    const existing = await db
      .prepare('SELECT id FROM categories WHERE group_id = ? AND name = ?')
      .bind(groupId, name.trim())
      .first()

    if (existing) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 })
    }

    const categoryId = generateId('category')
    const now = getCurrentTimestamp()

    // Create category
    await db
      .prepare(`
        INSERT INTO categories (id, group_id, name, icon, color, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(categoryId, groupId, name.trim(), icon || null, color || null, now)
      .run()

    const newCategory: Category = {
      id: categoryId,
      group_id: groupId,
      name: name.trim(),
      icon: icon || null,
      color: color || null,
      created_at: now,
    }

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
