'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, Loader2 } from 'lucide-react'
import { useMembers, useRecordPayment } from '@/hooks/use-group-data'

interface User {
  id: string
  name: string
}

interface RecordPaymentModalProps {
  groupId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaymentRecorded?: () => void
  suggestedPayment?: {
    from_user_id: string
    to_user_id: string
    amount: number
  }
}

export function RecordPaymentModal({ 
  groupId, 
  open, 
  onOpenChange, 
  onPaymentRecorded,
  suggestedPayment 
}: RecordPaymentModalProps) {
  const [fromUser, setFromUser] = useState('')
  const [toUser, setToUser] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Use React Query hooks
  const { data: members = [], isLoading: membersLoading } = useMembers(groupId)
  const recordPayment = useRecordPayment(groupId)

  useEffect(() => {
    if (open) {
      // Pre-fill if suggested payment provided
      if (suggestedPayment) {
        setFromUser(suggestedPayment.from_user_id)
        setToUser(suggestedPayment.to_user_id)
        setAmount(suggestedPayment.amount.toFixed(2))
      }
    }
  }, [open, suggestedPayment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const amountNum = parseFloat(amount)
      
      if (isNaN(amountNum) || amountNum <= 0) {
        setError('Please enter a valid amount greater than 0')
        return
      }

      if (!fromUser || !toUser) {
        setError('Please select both payer and recipient')
        return
      }

      if (fromUser === toUser) {
        setError('Payer and recipient cannot be the same person')
        return
      }

      await recordPayment.mutateAsync({
        from_user: fromUser,
        to_user: toUser,
        amount: amountNum,
      })

      onPaymentRecorded?.()
      handleClose()
    } catch (error: any) {
      console.error('Failed to record payment:', error)
      setError(error.message || 'An unexpected error occurred')
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setFromUser('')
      setToUser('')
      setAmount('')
      setError(null)
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Record a payment between group members. This will create a pending settlement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {membersLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading members...
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="from-user">Who is paying?</Label>
                <Select value={fromUser} onValueChange={setFromUser} disabled={recordPayment.isPending}>
                  <SelectTrigger id="from-user">
                    <SelectValue placeholder="Select payer" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member: User) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to-user">Who is receiving?</Label>
                <Select value={toUser} onValueChange={setToUser} disabled={recordPayment.isPending}>
                  <SelectTrigger id="to-user">
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member: User) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={recordPayment.isPending}
                  required
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={recordPayment.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={recordPayment.isPending}>
                  {recordPayment.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Record Payment
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
