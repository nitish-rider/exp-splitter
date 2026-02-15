'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check, Clock, DollarSign, Filter, Plus, Calendar, Trash2 } from 'lucide-react'
import { RecordPaymentModal } from './record-payment-modal'
import { useSettlements, useSettlePayment, useDeleteSettlement } from '@/hooks/use-group-data'
import { Badge } from '@/components/ui/badge'
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
  from_user: string
  to_user: string
  from_user_name: string
  to_user_name: string
  amount: number
  status: 'pending' | 'settled'
  created_at: string
}

interface SettlementsHistoryProps {
  groupId: string
}

type FilterType = 'all' | 'pending' | 'settled'

export function SettlementsHistory({ groupId }: SettlementsHistoryProps) {
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [settlementToDelete, setSettlementToDelete] = useState<Settlement | null>(null)

  // Use React Query hooks
  const { data: settlements = [], isLoading } = useSettlements(groupId)
  const settlePayment = useSettlePayment(groupId)
  const deleteSettlement = useDeleteSettlement(groupId)

  const handleSettle = async (settlementId: string) => {
    try {
      await settlePayment.mutateAsync(settlementId)
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

  // Filter settlements based on selected filter
  const filteredSettlements = settlements.filter((s: Settlement) => {
    if (filter === 'all') return true
    return s.status === filter
  })

  // Sort by created_at (newest first)
  const sortedSettlements = [...filteredSettlements].sort(
    (a: Settlement, b: Settlement) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const pendingCount = settlements.filter((s: Settlement) => s.status === 'pending').length
  const settledCount = settlements.filter((s: Settlement) => s.status === 'settled').length
  const totalAmount = settlements.reduce((sum: number, s: Settlement) => sum + s.amount, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Loading settlements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Settlement History</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all payment settlements
          </p>
        </div>
        <Button
          onClick={() => setShowRecordModal(true)}
          className="gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          <Plus className="h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-yellow-500/10 p-3">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending Settlements</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-500/10 p-3">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{settledCount}</p>
              <p className="text-xs text-muted-foreground">Settled Payments</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-500/10 p-3">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${totalAmount.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Total Volume</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filter:</span>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({settlements.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending ({pendingCount})
          </Button>
          <Button
            variant={filter === 'settled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('settled')}
          >
            Settled ({settledCount})
          </Button>
        </div>
      </div>

      {/* Settlements List */}
      {sortedSettlements.length === 0 ? (
        <Card className="p-12 text-center">
          <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {filter === 'all' 
              ? 'No Settlements Yet' 
              : filter === 'pending'
              ? 'No Pending Settlements'
              : 'No Settled Payments'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {filter === 'all'
              ? 'Record your first payment to track settlements'
              : filter === 'pending'
              ? 'All payments have been settled'
              : 'No completed settlements yet'}
          </p>
          {filter === 'all' && (
            <Button onClick={() => setShowRecordModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedSettlements.map((settlement: Settlement) => (
            <Card 
              key={settlement.id} 
              className={`p-4 transition-all ${
                settlement.status === 'settled' 
                  ? 'bg-muted/30 opacity-75' 
                  : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center gap-4">
                  {/* From User */}
                  <div className="min-w-[120px]">
                    <p className="text-sm font-medium text-foreground">
                      {settlement.from_user_name}
                    </p>
                    <p className="text-xs text-muted-foreground">Payer</p>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

                  {/* To User */}
                  <div className="min-w-[120px]">
                    <p className="text-sm font-medium text-foreground">
                      {settlement.to_user_name}
                    </p>
                    <p className="text-xs text-muted-foreground">Recipient</p>
                  </div>

                  {/* Amount */}
                  <div className="min-w-[100px] text-right">
                    <p className="text-lg font-bold text-foreground">
                      ${settlement.amount.toFixed(2)}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="min-w-[140px] flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(settlement.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>

                  {/* Status Badge */}
                  <div className="min-w-[80px]">
                    {settlement.status === 'settled' ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                        <Check className="h-3 w-3 mr-1" />
                        Settled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {settlement.status === 'pending' && (
                    <Button
                      onClick={() => handleSettle(settlement.id)}
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-foreground hover:bg-muted"
                      disabled={settlePayment.isPending}
                    >
                      <Check className="h-4 w-4" />
                      Mark Settled
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteClick(settlement)}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-destructive hover:bg-destructive/10"
                    disabled={deleteSettlement.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        groupId={groupId}
        open={showRecordModal}
        onOpenChange={setShowRecordModal}
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
