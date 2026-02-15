'use client'

import { Card } from '@/components/ui/card'
import { useBalances } from '@/hooks/use-group-data'

interface Balance {
  user_id: string
  user_name: string
  total_paid: number
  total_owed: number
  balance: number
}

interface BalancesSummaryProps {
  groupId: string
}

export function BalancesSummary({ groupId }: BalancesSummaryProps) {
  const { data: balances = [], isLoading: loading } = useBalances(groupId)

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading balances...</div>
  }

  if (balances.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No balances to display yet</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {balances.map((balance: Balance) => (
        <Card key={balance.user_id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{balance.user_name}</p>
              <p className="text-xs text-muted-foreground">
                Paid: ${balance.total_paid.toFixed(2)} • Owes: ${balance.total_owed.toFixed(2)}
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-lg font-semibold ${
                balance.balance > 0
                  ? 'bg-muted text-foreground'
                  : balance.balance < 0
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {balance.balance > 0 ? '+' : ''} ${Math.abs(balance.balance).toFixed(2)}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
