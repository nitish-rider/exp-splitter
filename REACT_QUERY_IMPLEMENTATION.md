# React Query Implementation

## ✅ Implemented!

I've integrated **React Query (TanStack Query)** for automatic data synchronization and smart caching!

## 🎯 What This Fixes

### Before (Manual API Calls)
- ❌ Manual fetch in each component
- ❌ Manual refresh after mutations
- ❌ No automatic refetching
- ❌ Cache management issues
- ❌ Stale data problems
- ❌ Duplicate requests

### After (React Query)
- ✅ Automatic data fetching
- ✅ **Automatic refetching after mutations**
- ✅ Smart caching
- ✅ Deduplication of requests
- ✅ Background refetching
- ✅ Optimistic updates ready

## 🚀 What Was Changed

### 1. Installed React Query
```bash
pnpm add @tanstack/react-query
```

### 2. Created Query Provider
**File**: `lib/query-client.tsx`
- Sets up QueryClient with optimal settings
- Wraps app in QueryClientProvider

### 3. Created Custom Hooks
**File**: `hooks/use-group-data.ts`

**Query Hooks:**
- `useBalances(groupId)` - Fetches balances
- `useSettlements(groupId)` - Fetches settlements
- `useMembers(groupId)` - Fetches members
- `useExpenses(groupId)` - Fetches expenses
- `useCategories(groupId)` - Fetches categories

**Mutation Hooks:**
- `useAddExpense(groupId)` - Add new expense
- `useDeleteExpense(groupId)` - Delete expense
- `useSettlePayment(groupId)` - Mark payment as settled
- `useRecordPayment(groupId)` - Record new payment
- `useAddMember(groupId)` - Add member to group

### 4. Updated Components

**Updated Files:**
- `app/layout.tsx` - Added QueryProvider
- `components/balances-summary.tsx` - Uses `useBalances()`
- `components/expenses-list.tsx` - Uses `useExpenses()`, `useDeleteExpense()`
- `components/add-expense-modal.tsx` - Uses `useMembers()`, `useCategories()`, `useAddExpense()`
- `components/settlements-list.tsx` - Uses `useSettlements()`, `useBalances()`, `useSettlePayment()`
- `components/record-payment-modal.tsx` - Uses `useMembers()`, `useRecordPayment()`
- `components/dashboard.tsx` - Simplified (no manual refresh needed)

## 🎨 How It Works

### Automatic Cache Invalidation

When you mark a settlement as "settled":

```typescript
// In use-group-data.ts
export function useSettlePayment(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settlementId: string) => {
      // Mark as settled
      const response = await fetch(...)
      return response.json()
    },
    onSuccess: () => {
      // Automatically refetch related data!
      queryClient.invalidateQueries({ 
        queryKey: groupKeys.balances(groupId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: groupKeys.settlements(groupId) 
      })
    },
  })
}
```

### In Components

**Before:**
```typescript
const [balances, setBalances] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetch('/api/balances').then(...)
}, [groupId, refreshKey])  // Manual refresh needed!
```

**After:**
```typescript
const { data: balances = [], isLoading } = useBalances(groupId)
// That's it! Automatic refetching handled!
```

## 🔄 Automatic Refetching

React Query automatically refetches data when:

1. **After mutations** - When you settle a payment, balances refetch
2. **Window focus** - When you return to the tab
3. **Network reconnect** - When internet comes back
4. **Stale data** - Based on staleTime setting

## 📊 Query Keys Structure

```typescript
groupKeys = {
  all: ['groups'],
  balances: (groupId) => ['groups', groupId, 'balances'],
  expenses: (groupId) => ['groups', groupId, 'expenses'],
  settlements: (groupId) => ['groups', groupId, 'settlements'],
  members: (groupId) => ['groups', groupId, 'members'],
  categories: (groupId) => ['groups', groupId, 'categories'],
}
```

This hierarchical structure allows:
- Invalidate all group data: `['groups']`
- Invalidate specific group: `['groups', groupId]`
- Invalidate specific data: `['groups', groupId, 'balances']`

## 🎯 Real-World Example

**Scenario**: User marks a settlement as "settled"

```
1. User clicks "Mark Settled"
   ↓
2. useSettlePayment mutation fires
   ↓
3. API call: PATCH /settlements/{id}
   ↓
4. onSuccess callback runs
   ↓
5. React Query invalidates:
   - balances query
   - settlements query
   ↓
6. React Query automatically refetches:
   - Fresh balances (updated)
   - Fresh settlements (removed settled one)
   ↓
7. UI updates automatically!
   ✅ Balances show new amounts
   ✅ Settled settlement removed from list
   ✅ Suggested payments recalculate
```

All automatic! No manual `refreshKey` needed!

## 🛠️ Configuration

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,              // Always refetch (most accurate)
      refetchOnWindowFocus: true, // Refetch when tab becomes active
      refetchOnMount: true,       // Refetch when component mounts
      retry: 1,                   // Retry failed requests once
    },
  },
})
```

## 💡 Benefits

### Developer Experience
- ✅ Less boilerplate code
- ✅ Automatic loading states
- ✅ Automatic error handling
- ✅ TypeScript support
- ✅ DevTools available

### User Experience
- ✅ Always fresh data
- ✅ No stale information
- ✅ Instant UI updates
- ✅ Background refetching
- ✅ Optimistic updates possible

### Performance
- ✅ Request deduplication
- ✅ Smart caching
- ✅ Background refetching
- ✅ Pagination support (future)
- ✅ Infinite scroll support (future)

## 🚀 Usage Examples

### In Any Component

```typescript
import { useBalances, useSettlePayment } from '@/hooks/use-group-data'

function MyComponent({ groupId }) {
  // Fetch data
  const { data: balances, isLoading, error } = useBalances(groupId)
  
  // Mutation
  const settlePayment = useSettlePayment(groupId)
  
  const handleSettle = async (id) => {
    await settlePayment.mutateAsync(id)
    // Balances automatically refetch!
  }
  
  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {balances?.map(...)}
    </div>
  )
}
```

## 🔮 Future Enhancements

With React Query, we can easily add:
- **Optimistic updates** - Update UI before API responds
- **Pagination** - Efficient data loading
- **Infinite scroll** - For long expense lists
- **Prefetching** - Load data before needed
- **Retry logic** - Smart error recovery
- **Background sync** - Sync when app reopens

## 📚 Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [Query Keys Guide](https://tanstack.com/query/latest/docs/react/guides/query-keys)
- [Mutations Guide](https://tanstack.com/query/latest/docs/react/guides/mutations)

---

## ✅ Testing

**Reset your database and test:**

```bash
# Reset database
rm -rf .db

# Start dev server
pnpm run dev:network

# Test sequence:
1. Add expense
2. Check Balances tab - Should show +/- amounts
3. Go to Settle Up tab
4. Record payment
5. Mark as settled
6. Check Balances tab - Should update automatically!
```

**Expected Behavior:**
- ✅ No manual refresh needed
- ✅ Balances update immediately
- ✅ Settlements list updates
- ✅ Suggested payments recalculate
- ✅ All tabs stay in sync

---

**Everything is now connected with React Query!** 🎉
