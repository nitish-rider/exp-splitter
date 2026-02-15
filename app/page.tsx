'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, LogOut } from 'lucide-react'
import { Dashboard } from '@/components/dashboard'
import { GroupList } from '@/components/group-list'
import { AddExpenseModal } from '@/components/add-expense-modal'
import { LoginPage } from '@/components/login-page'
import { useAuth } from '@/hooks/use-auth'

export default function Home() {
  const { user, loading, logout } = useAuth()
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [showAddExpense, setShowAddExpense] = useState(false)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        {/* Header */}
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Splitter</h1>
              <p className="mt-1 text-xs text-muted-foreground">Split expenses easily</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            {user.avatar_url && (
              <img src={user.avatar_url || "/placeholder.svg"} alt={user.name} className="h-10 w-10 rounded-full" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Groups
            </h2>
            <GroupList selectedId={selectedGroup} onSelect={setSelectedGroup} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border px-4 py-4 mt-auto">
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedGroup ? (
          <div className="flex flex-col h-full">
            {/* Top Bar */}
            <div className="border-b border-border bg-card px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Group Expenses</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Manage and track shared expenses</p>
                </div>
                <Button
                  onClick={() => setShowAddExpense(true)}
                  className="gap-2 bg-foreground text-background hover:bg-foreground/90"
                >
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </div>
            </div>

            {/* Dashboard */}
            <div className="flex-1">
              <Dashboard groupId={selectedGroup} />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">No group selected</h3>
              <p className="mt-2 text-sm text-muted-foreground">Select or create a group to get started</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {selectedGroup && (
        <AddExpenseModal
          groupId={selectedGroup}
          open={showAddExpense}
          onOpenChange={setShowAddExpense}
        />
      )}
    </div>
  )
}
