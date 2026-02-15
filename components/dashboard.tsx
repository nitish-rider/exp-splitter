'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Settings, UserPlus } from 'lucide-react'
import { ExpensesList } from './expenses-list'
import { BalancesSummary } from './balances-summary'
import { SettlementsList } from './settlements-list'
import { SettlementsHistory } from './settlements-history'
import { ManageCategoriesModal } from './manage-categories-modal'
import { AddMemberModal } from './add-member-modal'

interface DashboardProps {
  groupId: string
}

export function Dashboard({ groupId }: DashboardProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [showManageCategories, setShowManageCategories] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)

  const handleExpenseAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleMemberAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Tabs defaultValue="expenses" className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-muted">
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="balances">Balances</TabsTrigger>
              <TabsTrigger value="settlements">Settle Up</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <div className="flex gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddMember(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowManageCategories(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>
            </div>
          </div>

          <TabsContent value="expenses" className="space-y-4">
            <ExpensesList groupId={groupId} />
          </TabsContent>

          <TabsContent value="balances" className="space-y-4">
            <BalancesSummary groupId={groupId} />
          </TabsContent>

          <TabsContent value="settlements" className="space-y-4">
            <SettlementsList groupId={groupId} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <SettlementsHistory groupId={groupId} />
          </TabsContent>
        </Tabs>
      </div>

      <AddMemberModal
        groupId={groupId}
        open={showAddMember}
        onOpenChange={setShowAddMember}
        onMemberAdded={handleMemberAdded}
      />

      <ManageCategoriesModal
        groupId={groupId}
        open={showManageCategories}
        onOpenChange={setShowManageCategories}
        onCategoriesUpdated={() => setRefreshKey((prev) => prev + 1)}
      />
    </div>
  )
}
