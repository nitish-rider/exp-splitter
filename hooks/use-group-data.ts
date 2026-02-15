import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Query Keys
export const groupKeys = {
  all: ['groups'] as const,
  list: () => ['groups', 'list'] as const,
  balances: (groupId: string) => ['groups', groupId, 'balances'] as const,
  expenses: (groupId: string) => ['groups', groupId, 'expenses'] as const,
  settlements: (groupId: string) => ['groups', groupId, 'settlements'] as const,
  members: (groupId: string) => ['groups', groupId, 'members'] as const,
  categories: (groupId: string) => ['groups', groupId, 'categories'] as const,
}

// Fetch Functions
async function fetchGroups() {
  const response = await fetch('/api/groups')
  if (!response.ok) throw new Error('Failed to fetch groups')
  return response.json()
}

async function fetchBalances(groupId: string) {
  const response = await fetch(`/api/groups/${groupId}/balances`)
  if (!response.ok) throw new Error('Failed to fetch balances')
  return response.json()
}

async function fetchSettlements(groupId: string) {
  const response = await fetch(`/api/groups/${groupId}/settlements`)
  if (!response.ok) throw new Error('Failed to fetch settlements')
  return response.json()
}

async function fetchMembers(groupId: string) {
  const response = await fetch(`/api/groups/${groupId}/members`)
  if (!response.ok) throw new Error('Failed to fetch members')
  return response.json()
}

async function fetchExpenses(groupId: string) {
  const response = await fetch(`/api/groups/${groupId}/expenses`)
  if (!response.ok) throw new Error('Failed to fetch expenses')
  return response.json()
}

async function fetchCategories(groupId: string) {
  const response = await fetch(`/api/groups/${groupId}/categories`)
  if (!response.ok) throw new Error('Failed to fetch categories')
  return response.json()
}

// Hooks
export function useGroups() {
  return useQuery({
    queryKey: groupKeys.list(),
    queryFn: fetchGroups,
  })
}

export function useBalances(groupId: string) {
  return useQuery({
    queryKey: groupKeys.balances(groupId),
    queryFn: () => fetchBalances(groupId),
    enabled: !!groupId,
  })
}

export function useSettlements(groupId: string) {
  return useQuery({
    queryKey: groupKeys.settlements(groupId),
    queryFn: () => fetchSettlements(groupId),
    enabled: !!groupId,
  })
}

export function useMembers(groupId: string) {
  return useQuery({
    queryKey: groupKeys.members(groupId),
    queryFn: () => fetchMembers(groupId),
    enabled: !!groupId,
  })
}

export function useExpenses(groupId: string) {
  return useQuery({
    queryKey: groupKeys.expenses(groupId),
    queryFn: () => fetchExpenses(groupId),
    enabled: !!groupId,
  })
}

export function useCategories(groupId: string) {
  return useQuery({
    queryKey: groupKeys.categories(groupId),
    queryFn: () => fetchCategories(groupId),
    enabled: !!groupId,
  })
}

// Mutations
export function useSettlePayment(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settlementId: string) => {
      const response = await fetch(`/api/groups/${groupId}/settlements/${settlementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'settled' }),
      })
      if (!response.ok) throw new Error('Failed to settle payment')
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: groupKeys.balances(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.settlements(groupId) })
    },
  })
}

export function useDeleteSettlement(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settlementId: string) => {
      const response = await fetch(`/api/groups/${groupId}/settlements/${settlementId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete settlement')
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: groupKeys.balances(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.settlements(groupId) })
    },
  })
}

export function useRecordPayment(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { from_user: string; to_user: string; amount: number }) => {
      const response = await fetch(`/api/groups/${groupId}/settlements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to record payment')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: groupKeys.balances(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.settlements(groupId) })
    },
  })
}

export function useAddMember(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add member')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate members query
      queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) })
    },
  })
}

export function useAddExpense(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      description: string
      amount: number
      category: string
      paid_by: string
      split_members: string[]
      split_amount: number
    }) => {
      const response = await fetch(`/api/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add expense')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: groupKeys.expenses(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.balances(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.settlements(groupId) })
    },
  })
}

export function useDeleteExpense(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (expenseId: string) => {
      const response = await fetch(`/api/groups/${groupId}/expenses/${expenseId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete expense')
      return response.json()
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: groupKeys.expenses(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.balances(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.settlements(groupId) })
    },
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create group')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate groups list
      queryClient.invalidateQueries({ queryKey: groupKeys.list() })
    },
  })
}

export function useAddCategory(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; icon?: string | null; color?: string }) => {
      const response = await fetch(`/api/groups/${groupId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add category')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate categories query
      queryClient.invalidateQueries({ queryKey: groupKeys.categories(groupId) })
    },
  })
}

export function useUpdateCategory(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      categoryId: string
      name: string
      icon?: string | null
      color?: string
    }) => {
      const { categoryId, ...updateData } = data
      const response = await fetch(`/api/groups/${groupId}/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update category')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate categories query
      queryClient.invalidateQueries({ queryKey: groupKeys.categories(groupId) })
    },
  })
}

export function useDeleteCategory(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await fetch(`/api/groups/${groupId}/categories/${categoryId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete category')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate categories query
      queryClient.invalidateQueries({ queryKey: groupKeys.categories(groupId) })
    },
  })
}
