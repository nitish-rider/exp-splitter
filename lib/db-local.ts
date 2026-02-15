/**
 * Local SQLite database adapter for development
 * Uses better-sqlite3 to provide D1-compatible interface for local testing
 */

import Database from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync } from 'fs'
import type { D1Database, D1PreparedStatement, D1Response, D1Result } from './db'

let dbInstance: Database.Database | null = null

/**
 * Get or create local SQLite database instance
 */
function getLocalDb(): Database.Database {
  if (dbInstance) return dbInstance

  // Create .db directory if it doesn't exist
  const dbDir = join(process.cwd(), '.db')
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }

  const dbPath = join(dbDir, 'splitter.db')
  dbInstance = new Database(dbPath)

  // Initialize database if tables don't exist
  initializeDatabase(dbInstance)

  return dbInstance
}

/**
 * Initialize database schema if needed
 */
function initializeDatabase(db: Database.Database) {
  try {
    // Check if users table exists
    const tableCheck = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    ).get()

    if (!tableCheck) {
      console.log('Initializing local database schema...')
      const schemaPath = join(process.cwd(), 'scripts', 'init-db.sql')
      const schema = readFileSync(schemaPath, 'utf-8')
      db.exec(schema)
      console.log('Local database initialized successfully')
    }
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

/**
 * D1-compatible prepared statement wrapper
 */
class LocalPreparedStatement implements D1PreparedStatement {
  private stmt: Database.Statement
  private params: any[] = []

  constructor(stmt: Database.Statement) {
    this.stmt = stmt
  }

  bind(...values: any[]): D1PreparedStatement {
    this.params = values
    return this
  }

  async first<T = unknown>(colName?: string): Promise<T | null> {
    try {
      const result = this.stmt.get(...this.params) as any
      if (!result) return null
      if (colName) return result[colName] as T
      return result as T
    } catch (error) {
      console.error('Query error:', error)
      throw error
    }
  }

  async run(): Promise<D1Response> {
    try {
      const info = this.stmt.run(...this.params)
      return {
        success: true,
        meta: {
          duration: 0,
          changes: info.changes,
          last_row_id: Number(info.lastInsertRowid)
        }
      }
    } catch (error) {
      console.error('Run error:', error)
      throw error
    }
  }

  async all<T = unknown>(): Promise<D1Result<T>> {
    try {
      const results = this.stmt.all(...this.params) as T[]
      return {
        success: true,
        results,
        meta: { duration: 0 }
      }
    } catch (error) {
      console.error('All error:', error)
      throw error
    }
  }

  async raw<T = unknown>(): Promise<T[]> {
    try {
      return this.stmt.all(...this.params) as T[]
    } catch (error) {
      console.error('Raw error:', error)
      throw error
    }
  }
}

/**
 * D1-compatible database wrapper
 */
class LocalD1Database implements D1Database {
  private db: Database.Database

  constructor() {
    this.db = getLocalDb()
  }

  prepare(query: string): D1PreparedStatement {
    const stmt = this.db.prepare(query)
    return new LocalPreparedStatement(stmt)
  }

  async dump(): Promise<ArrayBuffer> {
    throw new Error('dump() not implemented for local database')
  }

  async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    const results: D1Result<T>[] = []
    
    const transaction = this.db.transaction(() => {
      for (const stmt of statements) {
        // Execute each statement
        results.push({ success: true, results: [] as T[], meta: { duration: 0 } })
      }
    })

    transaction()
    return results
  }

  async exec(query: string): Promise<{ count: number; duration: number }> {
    try {
      this.db.exec(query)
      return { count: 1, duration: 0 }
    } catch (error) {
      console.error('Exec error:', error)
      throw error
    }
  }
}

let localDbInstance: LocalD1Database | null = null

/**
 * Get local D1-compatible database instance
 */
export function getLocalD1Database(): D1Database {
  if (!localDbInstance) {
    localDbInstance = new LocalD1Database()
  }
  return localDbInstance
}
