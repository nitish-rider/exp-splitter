-- Migration to add categories table
-- Run this if you already have an existing database

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups(id),
  UNIQUE(group_id, name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_categories_group ON categories(group_id);

-- Optional: Insert some default categories for existing groups
-- Uncomment and modify as needed:
-- INSERT INTO categories (id, group_id, name, icon, color, created_at)
-- SELECT 
--   'category_' || g.id || '_food',
--   g.id,
--   'Food',
--   '🍔',
--   '#ef4444',
--   CURRENT_TIMESTAMP
-- FROM groups g
-- WHERE NOT EXISTS (SELECT 1 FROM categories WHERE group_id = g.id AND name = 'Food');
