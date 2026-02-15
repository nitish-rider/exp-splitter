'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  provider: string
}

// Query Keys
export const authKeys = {
  session: ['auth', 'session'] as const,
}

// Fetch Functions
async function fetchSession(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/session')
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch (error) {
    console.error('Auth check failed:', error)
    return null
  }
}

async function logoutUser() {
  const response = await fetch('/api/auth/logout', { method: 'POST' })
  if (!response.ok) throw new Error('Logout failed')
  return response.json()
}

// Hooks
export function useAuth() {
  const queryClient = useQueryClient()
  
  const { data: user = null, isLoading: loading } = useQuery({
    queryKey: authKeys.session,
    queryFn: fetchSession,
    retry: false,
  })

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session, null)
      window.location.href = '/'
    },
    onError: (error) => {
      console.error('Logout failed:', error)
    },
  })

  const logout = () => {
    logoutMutation.mutate()
  }

  return { user, loading, logout }
}
