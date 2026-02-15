'use client'

import React from "react"

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Settings, Tag } from 'lucide-react'
import { ManageCategoriesModal } from './manage-categories-modal'
import { useMembers, useCategories, useAddExpense } from '@/hooks/use-group-data'

interface GroupMember {
  id: string
  name: string
}

interface Category {
  id: string
  group_id: string
  name: string
  icon: string | null
  color: string | null
  created_at: string
}

interface AddExpenseModalProps {
  groupId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddExpenseModal({ groupId, open, onOpenChange }: AddExpenseModalProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [showManageCategories, setShowManageCategories] = useState(false)

  // Use React Query hooks
  const { data: members = [], isLoading: membersLoading } = useMembers(groupId)
  const { data: categories = [] } = useCategories(groupId)
  const addExpense = useAddExpense(groupId)

  useEffect(() => {
    if (open && members.length > 0) {
      setPaidBy(members[0].id)
      setSelectedMembers(members.map((m: GroupMember) => m.id))
    }
  }, [open, members])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const expenseAmount = parseFloat(amount)
      const splitAmount = expenseAmount / selectedMembers.length

      await addExpense.mutateAsync({
        description,
        amount: expenseAmount,
        category,
        paid_by: paidBy,
        split_members: selectedMembers,
        split_amount: splitAmount,
      })

      // React Query automatically refetches expenses, balances, and settlements
      setDescription('')
      setAmount('')
      setCategory('')
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to add expense:', error)
    }
  }

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>Record a new shared expense</DialogDescription>
        </DialogHeader>

        {membersLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Input
                placeholder="e.g., Dinner, Groceries, Gas"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Category (optional)</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManageCategories(true)}
                  className="h-auto p-1 text-xs"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Manage
                </Button>
              </div>
              {categories.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat: Category) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`p-3 rounded-lg border-2 text-left transition-all hover:scale-105 ${
                        category === cat.name
                          ? 'border-foreground'
                          : 'border-border'
                      }`}
                      style={{ backgroundColor: category === cat.name ? cat.color + '20' : 'transparent' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cat.icon || <Tag className="h-4 w-4" />}</span>
                        <span className="text-xs font-medium truncate">{cat.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                  No categories yet.{' '}
                  <button
                    type="button"
                    onClick={() => setShowManageCategories(true)}
                    className="text-foreground underline hover:no-underline"
                  >
                    Create one
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Paid By</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                {members.map((member: GroupMember) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Split Between</label>
              <div className="space-y-2">
                {members.map((member: GroupMember) => (
                  <Card
                    key={member.id}
                    className={`cursor-pointer p-3 transition-colors ${
                      selectedMembers.includes(member.id)
                        ? 'bg-foreground text-background'
                        : 'bg-card hover:bg-muted'
                    }`}
                    onClick={() => toggleMember(member.id)}
                  >
                    <p className="text-sm font-medium">{member.name}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={addExpense.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-foreground text-background hover:bg-foreground/90"
                disabled={addExpense.isPending || !description || !amount || !paidBy || selectedMembers.length === 0}
              >
                {addExpense.isPending ? 'Adding...' : 'Add Expense'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>

      <ManageCategoriesModal
        groupId={groupId}
        open={showManageCategories}
        onOpenChange={setShowManageCategories}
        onCategoriesUpdated={() => {}}
      />
    </Dialog>
  )
}
