/**
 * Database utility for Cloudflare D1
 * 
 * For production: Uses Cloudflare D1 binding
 * For development: Uses better-sqlite3 for local SQLite database
 */

// Type definitions for D1 database
export interface D1Database {
  prepare(query: string): D1PreparedStatement
  dump(): Promise<ArrayBuffer>
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>
  exec(query: string): Promise<D1ExecResult>
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement
  first<T = unknown>(colName?: string): Promise<T | null>
  run(): Promise<D1Response>
  all<T = unknown>(): Promise<D1Result<T>>
  raw<T = unknown>(): Promise<T[]>
}

export interface D1Response {
  success: boolean
  meta: {
    duration: number
    changes: number
    last_row_id: number
  }
}

export interface D1Result<T = unknown> {
  success: boolean
  results: T[]
  meta: {
    duration: number
  }
}

export interface D1ExecResult {
  count: number
  duration: number
}

// Database models
export interface User {
  id: string
  email: string
  name: string
  avatar_url: string | null
  provider: string
  provider_id: string
  created_at: string
  updated_at: string
}

export interface Group {
  id: string
  name: string
  description: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  joined_at: string
}

export interface Expense {
  id: string
  group_id: string
  paid_by: string
  description: string
  amount: number
  category: string | null
  created_at: string
  updated_at: string
}

export interface ExpenseSplit {
  id: string
  expense_id: string
  user_id: string
  amount: number
}

export interface Settlement {
  id: string
  group_id: string
  from_user: string
  to_user: string
  amount: number
  status: string
  created_at: string
  settled_at: string | null
}

export interface Category {
  id: string
  group_id: string
  name: string
  icon: string | null
  color: string | null
  created_at: string
}

/**
 * Get database instance
 * In Cloudflare Workers/Pages, this will be the D1 binding
 * For local development with Vercel/Node.js, uses local SQLite database
 */
export function getDb(): D1Database {
  // Check if we're in Cloudflare Workers environment with D1 binding
  if (typeof process !== 'undefined' && process.env.DB) {
    return (process.env as any).DB as D1Database
  }

  // Check for Cloudflare binding in edge runtime
  if (typeof globalThis !== 'undefined' && (globalThis as any).DB) {
    return (globalThis as any).DB as D1Database
  }

  // For local development, use better-sqlite3 adapter
  // Import dynamically to avoid bundling issues
  try {
    const { getLocalD1Database } = require('./db-local')
    return getLocalD1Database()
  } catch (error) {
    console.error('Failed to load local database:', error)
    throw new Error('Database not available. Install dependencies with: pnpm install')
  }
}

/**
 * Helper to generate UUIDs for IDs
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Helper to format current timestamp for SQLite
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString()
}

/**
 * Execute a query with error handling
 */
export async function executeQuery<T>(
  db: D1Database,
  query: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const stmt = db.prepare(query)
    const bound = params.length > 0 ? stmt.bind(...params) : stmt
    const result = await bound.all<T>()
    return result.results
  } catch (error) {
    console.error('Database query error:', error)
    throw new Error('Database operation failed')
  }
}

/**
 * Execute an insert/update/delete query
 */
export async function executeWrite(
  db: D1Database,
  query: string,
  params: any[] = []
): Promise<D1Response> {
  try {
    const stmt = db.prepare(query)
    const bound = params.length > 0 ? stmt.bind(...params) : stmt
    return await bound.run()
  } catch (error) {
    console.error('Database write error:', error)
    throw new Error('Database operation failed')
  }
}
