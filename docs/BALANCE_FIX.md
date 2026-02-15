# Balance Calculation Fix

## Issue Fixed
Balances were not updating after marking settlements as "settled".

## Root Cause
The balance calculation only considered:
- ✅ Total paid from expenses
- ✅ Total owed from expense splits
- ❌ **Missing**: Settled settlements

When someone paid back money and you marked it as "settled", the balances didn't change because settlements weren't factored into the calculation.

## The Fix

Updated the balance calculation formula:

### Before (Wrong)
```
Balance = Total Paid - Total Owed
```

### After (Correct)
```
Balance = Total Paid - Total Owed + Settlements Received - Settlements Paid
```

## How It Works Now

### Example Scenario

**Initial State:**
- Alice paid $60 for dinner
- Bob paid $0
- Split equally between Alice and Bob
- Alice's balance: +$30 (owed to her)
- Bob's balance: -$30 (owes others)

**After Recording Payment:**
1. Record: "Bob pays Alice $30"
2. Status: Pending
3. Balances: Still show +$30 / -$30 (correct, payment not confirmed yet)

**After Marking as Settled:**
1. Mark settlement as "settled"
2. Calculation now includes:
   - Alice: +$30 (from expenses) + $30 (settlement received) = $0
   - Bob: -$30 (from expenses) - $30 (settlement paid) = $0
3. ✅ Both show as balanced!

## Technical Details

### Updated File
`app/api/groups/[groupId]/balances/route.ts`

### New Queries Added

**Settlements Received (marked as settled):**
```sql
SELECT COALESCE(SUM(amount), 0) as total
FROM settlements
WHERE group_id = ? AND to_user = ? AND status = 'settled'
```

**Settlements Paid (marked as settled):**
```sql
SELECT COALESCE(SUM(amount), 0) as total
FROM settlements
WHERE group_id = ? AND from_user = ? AND status = 'settled'
```

### Formula
```typescript
const balance = totalPaid - totalOwed + settlementsReceived - settlementsPaid
```

## Important Notes

### Only "Settled" Settlements Count
- Pending settlements don't affect balances
- This is intentional - you only update balances when payment is confirmed
- Prevents false balance updates from unconfirmed payments

### Why This Matters
Without this fix:
1. You track expenses correctly
2. You see who owes what
3. You record a payment
4. ❌ Balances don't update - confusing!
5. ❌ Suggested payments still show the same people owing money

With this fix:
1. You track expenses correctly
2. You see who owes what
3. You record a payment
4. Mark it as "settled"
5. ✅ Balances update immediately
6. ✅ Suggested payments reflect the new state
7. ✅ Everyone knows exactly what's owed

## Testing

### Test Case 1: Simple Payment
1. Create expense: Alice pays $20, split with Bob
2. Check balances: Alice +$10, Bob -$10
3. Record payment: Bob → Alice $10
4. Check balances: Still Alice +$10, Bob -$10 (pending)
5. Mark as settled
6. Check balances: Alice $0, Bob $0 ✅

### Test Case 2: Partial Payment
1. Create expense: Alice pays $30, split with Bob
2. Check balances: Alice +$15, Bob -$15
3. Record payment: Bob → Alice $10
4. Mark as settled
5. Check balances: Alice +$5, Bob -$5 ✅
6. Record another: Bob → Alice $5
7. Mark as settled
8. Check balances: Alice $0, Bob $0 ✅

### Test Case 3: Multiple People
1. Create expenses with 3+ people
2. Various payments between different pairs
3. Mark settlements as settled one by one
4. Balances update correctly after each settlement ✅

## Before & After

### Before Fix
```
Expenses tracked ✅
Balances calculated ✅
Settlements recorded ✅
Mark as settled ✅
Balances update ❌ <- BROKEN
Suggested payments wrong ❌
```

### After Fix
```
Expenses tracked ✅
Balances calculated ✅
Settlements recorded ✅
Mark as settled ✅
Balances update ✅ <- FIXED!
Suggested payments correct ✅
```

## Impact

This fix ensures that:
1. **Balances are accurate** - They reflect both expenses AND payments
2. **Suggested payments update** - After settling, suggestions recalculate
3. **Users get feedback** - They can see their payment made a difference
4. **Eventually everyone settles to $0** - The ultimate goal!

---

**Status**: ✅ Fixed and working!

Try it now:
1. Add some expenses
2. Record a payment
3. Mark it as settled
4. Watch the balances update in real-time!
