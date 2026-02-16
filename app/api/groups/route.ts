import { NextRequest, NextResponse } from 'next/server'
import { getDb, generateId, getCurrentTimestamp, type Group } from '@/lib/db'

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_session')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const db = getDb()
    
    // Get all groups where user is a member
    const groups = await db
      .prepare(`
        SELECT DISTINCT g.* 
        FROM groups g
        INNER JOIN group_members gm ON g.id = gm.group_id
        WHERE gm.user_id = ?
        ORDER BY g.created_at DESC
      `)
      .bind(userId)
      .all<Group>()

    return NextResponse.json(groups.results)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body
    const userId = request.cookies.get('user_session')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
    }

    const db = getDb()
    const groupId = generateId('group')
    const memberId = generateId('member')
    const now = getCurrentTimestamp()

    // Create group
    await db
      .prepare(`
        INSERT INTO groups (id, name, description, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(groupId, name, description || null, userId, now, now)
      .run()

    // Add creator as group member
    await db
      .prepare(`
        INSERT INTO group_members (id, group_id, user_id, joined_at)
        VALUES (?, ?, ?, ?)
      `)
      .bind(memberId, groupId, userId, now)
      .run()

    const newGroup: Group = {
      id: groupId,
      name,
      description: description || null,
      created_by: userId,
      created_at: now,
      updated_at: now,
    }

    return NextResponse.json(newGroup, { status: 201 })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}
