# Expense Auto-Update Fix

## ✅ Fixed: Expenses Now Appear Immediately!

### The Problem
When you added a new expense, it wouldn't show up in the list until you manually refreshed the page or switched tabs.

### The Root Cause
Components were using manual `fetch()` calls without automatic refetching:
- `expenses-list.tsx` only fetched once on mount
- `add-expense-modal.tsx` didn't trigger a refetch after adding
- No cache invalidation system in place

### The Solution
Integrated React Query throughout the expense system to handle automatic data synchronization.

## 🔄 What Was Changed

### 1. Updated Hooks (`hooks/use-group-data.ts`)

Added mutation hook for adding expenses:

```typescript
export function useAddExpense(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      // POST to /api/groups/{groupId}/expenses
      const response = await fetch(...)
      return response.json()
    },
    onSuccess: () => {
      // Automatically refetch related data!
      queryClient.invalidateQueries({ queryKey: groupKeys.expenses(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.balances(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.settlements(groupId) })
    },
  })
}
```

**Why this matters:**
- When expense is added, React Query invalidates (marks as stale) all related queries
- Invalidated queries automatically refetch
- All connected components get fresh data instantly

### 2. Updated `expenses-list.tsx`

**Before:**
```typescript
const [expenses, setExpenses] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetch('/api/expenses').then(...)
}, [groupId])  // Only fetches once!
```

**After:**
```typescript
const { data: expenses = [], isLoading } = useExpenses(groupId)
const deleteExpense = useDeleteExpense(groupId)

// Automatically refetches when:
// - Component mounts
// - groupId changes
// - Query is invalidated (after adding/deleting)
// - Window regains focus
```

### 3. Updated `add-expense-modal.tsx`

**Before:**
```typescript
const handleSubmit = async () => {
  await fetch('/api/expenses', { method: 'POST', ... })
  onOpenChange(false)
  // ❌ No refetch - expenses list stays stale!
}
```

**After:**
```typescript
const addExpense = useAddExpense(groupId)

const handleSubmit = async () => {
  await addExpense.mutateAsync({ ... })
  // ✅ React Query automatically:
  //    1. Adds the expense
  //    2. Invalidates expenses query
  //    3. Refetches expenses list
  //    4. Updates balances
  //    5. Recalculates settlements
  onOpenChange(false)
}
```

### 4. Simplified `dashboard.tsx`

**Before:**
```typescript
const [refreshKey, setRefreshKey] = useState(0)

const handleExpenseAdded = () => {
  setRefreshKey(prev => prev + 1)  // Manual refresh trigger
}

<ExpensesList key={refreshKey} onExpenseAdded={handleExpenseAdded} />
```

**After:**
```typescript
<ExpensesList groupId={groupId} />
// No refresh logic needed! React Query handles it automatically
```

## 🎯 How It Works Now

### Adding an Expense

```
1. User fills form and clicks "Add Expense"
   ↓
2. addExpense.mutateAsync() fires
   ↓
3. POST /api/groups/{groupId}/expenses
   ↓
4. Response received
   ↓
5. onSuccess callback runs
   ↓
6. React Query invalidates:
   - expenses query
   - balances query  
   - settlements query
   ↓
7. All invalidated queries automatically refetch
   ↓
8. UI updates instantly across all tabs:
   ✅ Expenses tab shows new expense
   ✅ Balances tab updates amounts
   ✅ Settle Up tab recalculates suggestions
```

All automatic! No manual refresh needed!

### Deleting an Expense

```
1. User clicks delete button
   ↓
2. deleteExpense.mutateAsync(id) fires
   ↓
3. DELETE /api/groups/{groupId}/expenses/{id}
   ↓
4. React Query invalidates same queries
   ↓
5. Everything updates automatically
   ✅ Expense removed from list
   ✅ Balances recalculated
   ✅ Settlements updated
```

## 🎨 Cascading Updates

When you add an expense, **everything updates automatically**:

### Expenses Tab
- ✅ New expense appears in list
- ✅ Sorted by date
- ✅ Correct payer shown
- ✅ Category displayed

### Balances Tab
- ✅ Payer's balance increases
- ✅ Split members' balances decrease
- ✅ All amounts recalculated

### Settle Up Tab
- ✅ Suggested payments update
- ✅ Payment amounts adjust
- ✅ New debts calculated

## 💡 Benefits

### For Users
- ✅ **Instant feedback** - See changes immediately
- ✅ **No manual refresh** - Everything stays in sync
- ✅ **Real-time data** - Always accurate
- ✅ **Better UX** - Feels responsive and fast

### For Developers
- ✅ **Less code** - No manual refresh logic
- ✅ **Automatic sync** - Data consistency guaranteed
- ✅ **Smart caching** - Fewer API calls
- ✅ **Type safety** - Full TypeScript support

## 🧪 Testing

**Test the fix:**

```bash
# Reset database for clean test
rm -rf .db

# Start server
pnpm run dev:network

# Test sequence:
1. Create a group
2. Add a member
3. Add an expense
   ✅ Should appear immediately in list!
4. Check Balances tab
   ✅ Should show updated balances!
5. Check Settle Up tab
   ✅ Should show payment suggestions!
6. Delete the expense
   ✅ Should disappear immediately!
7. Check Balances tab again
   ✅ Should revert to zero!
```

All updates should be **instant** with no page refresh needed!

## 🔧 Technical Details

### Query Keys
```typescript
groupKeys = {
  expenses: (groupId) => ['groups', groupId, 'expenses'],
  balances: (groupId) => ['groups', groupId, 'balances'],
  settlements: (groupId) => ['groups', groupId, 'settlements'],
}
```

### Cache Invalidation Strategy
```typescript
// After adding expense, invalidate related data
queryClient.invalidateQueries({ queryKey: groupKeys.expenses(groupId) })
queryClient.invalidateQueries({ queryKey: groupKeys.balances(groupId) })
queryClient.invalidateQueries({ queryKey: groupKeys.settlements(groupId) })
```

### Automatic Refetch Triggers
React Query automatically refetches when:
1. **Mount** - Component first loads
2. **Focus** - Window/tab becomes active
3. **Reconnect** - Network comes back
4. **Interval** - Based on staleTime (set to 0 = always fresh)
5. **Invalidation** - After mutations

## 📊 Before & After Comparison

### Before (Manual)
```
Add Expense → Close Modal → ❌ No update
                         → User confused
                         → User refreshes page
                         → ✅ Expense appears
                         → Bad UX
```

### After (Automatic)
```
Add Expense → Close Modal → ✅ Expense appears
                         → ✅ Balances update
                         → ✅ Settlements adjust
                         → Great UX!
```

## 🚀 Related Updates

This fix completes the React Query integration:

- ✅ Balances (already integrated)
- ✅ Settlements (already integrated)
- ✅ **Expenses (newly integrated)**
- ✅ Members (already integrated)
- ✅ Categories (already integrated)

**All features now have automatic data synchronization!**

---

## Summary

With React Query fully integrated:
- ✅ No more manual refresh needed anywhere
- ✅ All data stays perfectly synchronized
- ✅ Changes appear instantly across all tabs
- ✅ Better performance through smart caching
- ✅ Cleaner code with less boilerplate

**Everything just works!** 🎉
