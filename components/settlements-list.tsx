'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check, DollarSign, Plus, Trash2 } from 'lucide-react'
import { RecordPaymentModal } from './record-payment-modal'
import { useBalances, useSettlements, useSettlePayment, useDeleteSettlement } from '@/hooks/use-group-data'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Settlement {
  id: string
  from_user_name: string
  to_user_name: string
  amount: number
  status: 'pending' | 'settled'
}

interface Balance {
  user_id: string
  user_name: string
  balance: number
}

interface SuggestedPayment {
  from_user_id: string
  from_user_name: string
  to_user_id: string
  to_user_name: string
  amount: number
}

interface SettlementsListProps {
  groupId: string
}

export function SettlementsList({ groupId }: SettlementsListProps) {
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<SuggestedPayment | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [settlementToDelete, setSettlementToDelete] = useState<Settlement | null>(null)

  // Use React Query hooks
  const { data: settlements = [], isLoading: settlementsLoading } = useSettlements(groupId)
  const { data: balances = [], isLoading: balancesLoading } = useBalances(groupId)
  const settlePayment = useSettlePayment(groupId)
  const deleteSettlement = useDeleteSettlement(groupId)

  const loading = settlementsLoading || balancesLoading

  const handleSettle = async (settlementId: string) => {
    try {
      await settlePayment.mutateAsync(settlementId)
      // React Query automatically refetches balances and settlements
    } catch (error) {
      console.error('Failed to settle:', error)
    }
  }

  const handleDeleteClick = (settlement: Settlement) => {
    setSettlementToDelete(settlement)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!settlementToDelete) return
    
    try {
      await deleteSettlement.mutateAsync(settlementToDelete.id)
      setDeleteDialogOpen(false)
      setSettlementToDelete(null)
    } catch (error) {
      console.error('Failed to delete settlement:', error)
    }
  }

  const handleOpenRecordModal = (payment?: SuggestedPayment) => {
    setSelectedPayment(payment)
    setShowRecordModal(true)
  }

  const handlePaymentRecorded = () => {
    // React Query automatically refetches data after mutation
    // No manual reload needed!
  }

  // Calculate suggested payments using greedy algorithm
  const calculateSuggestedPayments = (): SuggestedPayment[] => {
    // Filter out users with zero balance and sort
    const debtors = balances.filter((b: Balance) => b.balance < 0).map((b: Balance) => ({ ...b }))
    const creditors = balances.filter((b: Balance) => b.balance > 0).map((b: Balance) => ({ ...b }))
    
    if (debtors.length === 0 || creditors.length === 0) {
      return []
    }

    const payments: SuggestedPayment[] = []
    
    // Sort by absolute balance (largest first)
    debtors.sort((a: Balance, b: Balance) => a.balance - b.balance)
    creditors.sort((a: Balance, b: Balance) => b.balance - a.balance)

    let i = 0, j = 0
    while (i < debtors.length && j < creditors.length) {
      const debt = Math.abs(debtors[i].balance)
      const credit = creditors[j].balance
      const amount = Math.min(debt, credit)

      if (amount > 0.01) { // Ignore tiny amounts
        payments.push({
          from_user_id: debtors[i].user_id,
          from_user_name: debtors[i].user_name,
          to_user_id: creditors[j].user_id,
          to_user_name: creditors[j].user_name,
          amount: Math.round(amount * 100) / 100
        })
      }

      debtors[i].balance += amount
      creditors[j].balance -= amount

      if (Math.abs(debtors[i].balance) < 0.01) i++
      if (Math.abs(creditors[j].balance) < 0.01) j++
    }

    return payments
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>
  }

  const pendingSettlements = settlements.filter((s: Settlement) => s.status === 'pending')
  const suggestedPayments = calculateSuggestedPayments()
  const allSettled = suggestedPayments.length === 0 && pendingSettlements.length === 0

  if (allSettled) {
    return (
      <Card className="p-8 text-center">
        <Check className="h-12 w-12 mx-auto mb-3 text-green-500" />
        <p className="text-lg font-semibold text-foreground">All Settled Up!</p>
        <p className="text-sm text-muted-foreground mt-1">Everyone's balances are even</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Custom Payment Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Settle Up</h3>
          <p className="text-sm text-muted-foreground">Record payments and settle balances</p>
        </div>
        <Button
          onClick={() => handleOpenRecordModal()}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Record Custom Payment
        </Button>
      </div>

      {/* Suggested Payments */}
      {suggestedPayments.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Suggested Payments</h3>
            <span className="text-xs text-muted-foreground">
              {suggestedPayments.length} payment{suggestedPayments.length !== 1 ? 's' : ''} needed
            </span>
          </div>
          <div className="space-y-3">
            {suggestedPayments.map((payment) => {
              const key = `${payment.from_user_id}-${payment.to_user_id}`
              
              return (
                <Card key={key} className="flex items-center justify-between p-4 bg-muted/50">
                  <div className="flex flex-1 items-center gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{payment.from_user_name}</p>
                      <p className="text-xs text-muted-foreground">should pay</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{payment.to_user_name}</p>
                      <p className="text-xs font-semibold text-foreground">${payment.amount.toFixed(2)}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleOpenRecordModal(payment)}
                    size="sm"
                    className="gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    Record Payment
                  </Button>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Pending Settlements */}
      {pendingSettlements.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Pending Settlements</h3>
          <div className="space-y-3">
            {pendingSettlements.map((settlement: Settlement) => (
              <Card key={settlement.id} className="flex items-center justify-between p-4">
                <div className="flex flex-1 items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{settlement.from_user_name}</p>
                    <p className="text-xs text-muted-foreground">owes</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{settlement.to_user_name}</p>
                    <p className="text-xs text-muted-foreground">${settlement.amount.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleSettle(settlement.id)}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-foreground hover:bg-muted"
                  >
                    <Check className="h-4 w-4" />
                    Mark Settled
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(settlement)}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        groupId={groupId}
        open={showRecordModal}
        onOpenChange={setShowRecordModal}
        onPaymentRecorded={handlePaymentRecorded}
        suggestedPayment={selectedPayment ? {
          from_user_id: selectedPayment.from_user_id,
          to_user_id: selectedPayment.to_user_id,
          amount: selectedPayment.amount
        } : undefined}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Settlement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this settlement?
              {settlementToDelete && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{settlementToDelete.from_user_name}</span>
                    {' → '}
                    <span className="font-medium">{settlementToDelete.to_user_name}</span>
                  </p>
                  <p className="text-sm text-foreground font-semibold mt-1">
                    ${settlementToDelete.amount.toFixed(2)}
                  </p>
                </div>
              )}
              <p className="mt-3">
                This action cannot be undone. This will permanently delete the settlement record.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteSettlement.isPending}
            >
              {deleteSettlement.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
