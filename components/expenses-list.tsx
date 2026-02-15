'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useExpenses, useDeleteExpense } from '@/hooks/use-group-data'

interface Expense {
  id: string
  description: string
  amount: number
  category?: string
  paid_by_name: string
  created_at: string
}

interface ExpensesListProps {
  groupId: string
}

export function ExpensesList({ groupId }: ExpensesListProps) {
  const { data: expenses = [], isLoading: loading } = useExpenses(groupId)
  const deleteExpense = useDeleteExpense(groupId)

  const handleDelete = async (expenseId: string) => {
    try {
      await deleteExpense.mutateAsync(expenseId)
      // React Query automatically refetches expenses, balances, and settlements
    } catch (error) {
      console.error('Failed to delete expense:', error)
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading expenses...</div>
  }

  if (expenses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No expenses yet. Add one to get started!</p>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense: Expense) => (
        <Card key={expense.id} className="flex items-center justify-between p-4">
          <div className="flex-1">
            <p className="font-medium text-foreground">{expense.description}</p>
            <p className="text-xs text-muted-foreground">
              Paid by {expense.paid_by_name} • {new Date(expense.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-semibold text-foreground">${expense.amount.toFixed(2)}</p>
              {expense.category && (
                <p className="text-xs text-muted-foreground">{expense.category}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(expense.id)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
