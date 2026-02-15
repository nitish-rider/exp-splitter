# Reset Database - Fix Duplicate Settlements

## Issue
If you've recorded the same settlement multiple times, your balances will be incorrect.

## Quick Fix: Reset Your Database

### Option 1: Delete and Restart (Easiest)

```bash
# Stop the dev server (Ctrl+C)

# Remove the database
rm -rf .db

# Start fresh
pnpm dev
# or
pnpm run dev:network
```

The database will be automatically recreated with the correct schema.

### Option 2: Just Delete Settlements (Keep Expenses)

```bash
# Delete all settlements but keep expenses and groups
sqlite3 .db/splitter.db "DELETE FROM settlements"
```

Then refresh your browser.

### Option 3: Delete Everything Except Users

```bash
sqlite3 .db/splitter.db "
DELETE FROM expense_splits;
DELETE FROM expenses;
DELETE FROM settlements;
DELETE FROM group_members;
DELETE FROM groups;
"
```

This keeps your users but clears all data.

## Why This Happened

The settlements were being recorded multiple times, likely due to:
1. Clicking "Record Payment" or "Mark Settled" multiple times
2. Browser caching old data
3. Not seeing immediate feedback

## Fixed Now

I've added:
- ✅ Cache-busting to force fresh data
- ✅ Better refresh logic after settling
- ✅ Immediate UI updates
- ✅ No-cache headers on API calls

## How to Use Going Forward

### Recording Payments:
1. Click "Record Payment" **once**
2. Wait for modal to close
3. Check "Pending Settlements" - it should appear there

### Marking as Settled:
1. Click "Mark Settled" **once**
2. Wait for it to disappear from the list
3. Go to Balances tab - it will update automatically

### Checking Balances:
1. After marking as settled, go to Balances tab
2. If not updated, refresh the page (Cmd+R or F5)
3. Balances should reflect settled payments

## Verification

After resetting, verify it's working:

1. **Create test expense:**
   - Add expense: $20
   - Paid by: Person A
   - Split with: Person A and Person B

2. **Check balances:**
   - Person A: +$10
   - Person B: -$10

3. **Record payment:**
   - Record: Person B → Person A $10
   - Check Pending Settlements: Should show 1 settlement

4. **Mark as settled:**
   - Click "Mark Settled" ONCE
   - Settlement disappears
   - Go to Balances tab

5. **Verify:**
   - Person A: $0
   - Person B: $0
   - ✅ Working!

## Future Prevention

To avoid duplicates:
- ❌ Don't click buttons multiple times
- ❌ Don't record the same payment twice
- ✅ Wait for UI feedback
- ✅ Check Pending Settlements before recording
- ✅ Refresh browser if things look stuck

## Debug Commands

Check your current state:

```bash
# See all settlements
sqlite3 .db/splitter.db "SELECT * FROM settlements"

# See current balances calculation
sqlite3 .db/splitter.db "
SELECT 
  u.name,
  (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE paid_by = u.id) as paid,
  (SELECT COALESCE(SUM(es.amount), 0) FROM expense_splits es JOIN expenses e ON es.expense_id = e.id WHERE es.user_id = u.id) as owed,
  (SELECT COALESCE(SUM(amount), 0) FROM settlements WHERE to_user = u.id AND status = 'settled') as received,
  (SELECT COALESCE(SUM(amount), 0) FROM settlements WHERE from_user = u.id AND status = 'settled') as paid_settlements
FROM users u
WHERE u.id IN (SELECT user_id FROM group_members)
"

# Count settlements
sqlite3 .db/splitter.db "SELECT COUNT(*) as total_settlements FROM settlements"
```

---

**Recommended**: Start fresh with `rm -rf .db && pnpm dev` to test the fixed version!
