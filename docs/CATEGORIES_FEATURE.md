# Categories Feature Documentation

## Overview

A complete category management system has been added to your expense tracker, allowing users to create, organize, and use custom categories for their expenses.

## Features

### ✨ What's New

1. **Category Management UI**
   - Visual category manager with icon and color selection
   - Create, edit, and delete categories
   - Per-group categories (each group has its own set)

2. **Smart Category Selector**
   - Visual category picker in expense form
   - Quick access to manage categories
   - Optional categories (expenses can have no category)

3. **Category API**
   - Full CRUD operations
   - Group-based categorization
   - Validation and error handling

## How to Use

### For Users

#### Creating Categories

1. Open a group
2. Click **"Manage Categories"** button in the dashboard
3. Click **"Add New Category"**
4. Enter a name (e.g., "Food", "Transport", "Entertainment")
5. Choose an icon (optional) 🍔 ☕ 🚗 ✈️
6. Pick a color
7. Click **"Create"**

#### Using Categories

1. When adding an expense, you'll see your categories
2. Click on a category to select it
3. The expense will be tagged with that category
4. Categories are optional - you can skip this step

#### Managing Categories

- **Edit**: Click the pencil icon next to a category
- **Delete**: Click the trash icon (expenses keep their category name)
- **Quick Access**: Use the "Manage" link in the expense form

### For Developers

#### Database Schema

```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups(id),
  UNIQUE(group_id, name)
);
```

#### API Endpoints

**List Categories**
```
GET /api/groups/[groupId]/categories
Returns: Category[]
```

**Create Category**
```
POST /api/groups/[groupId]/categories
Body: { name: string, icon?: string, color?: string }
Returns: Category
```

**Update Category**
```
PATCH /api/groups/[groupId]/categories/[categoryId]
Body: { name: string, icon?: string, color?: string }
Returns: { success: boolean }
```

**Delete Category**
```
DELETE /api/groups/[groupId]/categories/[categoryId]
Returns: { success: boolean }
```

#### TypeScript Types

```typescript
interface Category {
  id: string
  group_id: string
  name: string
  icon: string | null
  color: string | null
  created_at: string
}
```

## Migration

### For Existing Databases

If you already have a running database, you need to add the categories table:

```bash
# Local database
wrangler d1 execute splitter-db --local --file=scripts/add-categories-migration.sql

# Production database
wrangler d1 execute splitter-db --remote --file=scripts/add-categories-migration.sql
```

### For New Installations

The categories table is already included in `scripts/init-db.sql`. Just run:

```bash
pnpm run db:local  # or db:remote for production
```

## Files Created/Modified

### New Files
- `app/api/groups/[groupId]/categories/route.ts` - List & create categories
- `app/api/groups/[groupId]/categories/[categoryId]/route.ts` - Update & delete
- `components/manage-categories-modal.tsx` - Category management UI
- `scripts/add-categories-migration.sql` - Migration script

### Modified Files
- `scripts/init-db.sql` - Added categories table
- `lib/db.ts` - Added Category interface
- `components/add-expense-modal.tsx` - Added category selector
- `components/dashboard.tsx` - Added "Manage Categories" button

## Default Categories

The system includes these default icon options:
- 🍔 🍕 ☕ (Food & Drinks)
- 🛒 🏠 (Shopping & Home)
- 🚗 ✈️ (Transport & Travel)
- 🎬 🎮 📚 (Entertainment)
- 💊 👕 (Health & Clothing)
- 💰 🎁 🔧 ⚽ (Finance & Others)

And these color options:
- Red, Orange, Amber
- Lime, Green, Teal
- Cyan, Blue, Violet
- Fuchsia, Pink, Slate

## Features Details

### Category Validation

- ✅ Category names must be unique per group
- ✅ Category names are required (trimmed)
- ✅ Icons and colors are optional
- ✅ Duplicate names return 409 Conflict

### Category Deletion

When you delete a category:
- The category is removed from the database
- Existing expenses keep their category name (stored as text)
- No data loss on existing expenses

### Authorization

- ✅ Only group members can view categories
- ✅ Only group members can create/edit/delete categories
- ✅ Categories are isolated per group

## UI Components

### ManageCategoriesModal

A full-featured modal for managing categories:

```tsx
<ManageCategoriesModal
  groupId={groupId}
  open={open}
  onOpenChange={setOpen}
  onCategoriesUpdated={() => {
    // Callback when categories change
  }}
/>
```

### Features:
- List all categories with icons and colors
- Add new categories with form
- Edit existing categories inline
- Delete categories with confirmation
- Real-time updates

### Category Selector (in AddExpenseModal)

Visual category picker integrated into expense form:
- Grid layout showing all categories
- Icons and colors displayed
- Selected state highlighted
- "Manage" link for quick access
- Empty state with CTA

## Future Enhancements

Potential improvements:

1. **Category Analytics**
   - Spending by category
   - Category trends over time
   - Visual charts and graphs

2. **Category Budgets**
   - Set spending limits per category
   - Alerts when approaching limit
   - Monthly budget tracking

3. **Shared Categories**
   - Default categories for all groups
   - Import/export category sets
   - Category templates

4. **Category Rules**
   - Auto-categorize based on description
   - Smart suggestions
   - Learning from past expenses

5. **Category Icons**
   - Upload custom icons
   - More emoji options
   - Icon library integration

## Troubleshooting

### Categories Not Showing

1. Check if categories exist for the group:
   ```bash
   wrangler d1 execute splitter-db --local --command "SELECT * FROM categories"
   ```

2. Verify group membership:
   - Only group members can see categories
   - Check if you're logged in correctly

### Migration Issues

If the migration fails:

1. Check if table already exists:
   ```bash
   wrangler d1 execute splitter-db --local --command "SELECT name FROM sqlite_master WHERE type='table'"
   ```

2. Drop and recreate if needed:
   ```sql
   DROP TABLE IF EXISTS categories;
   -- Then run migration again
   ```

### API Errors

- **401 Unauthorized**: Not logged in
- **403 Forbidden**: Not a group member
- **404 Not Found**: Category doesn't exist
- **409 Conflict**: Category name already exists

## Testing

To test the categories feature:

1. Start the dev server: `pnpm dev`
2. Log in and select a group
3. Click "Manage Categories"
4. Create a few test categories
5. Add an expense and select a category
6. View the expense with its category

## Summary

The categories system provides:
- ✅ Complete CRUD operations
- ✅ Beautiful, intuitive UI
- ✅ Per-group isolation
- ✅ Optional usage (backwards compatible)
- ✅ Visual customization (icons & colors)
- ✅ Database persistence
- ✅ Type-safe implementation

Your expense tracker now has a professional category management system! 🎉
