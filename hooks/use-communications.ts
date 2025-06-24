'use client'

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'

// Communications API functions
async function fetchCallHistory(page = 0, limit = 50) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })
  
  const response = await fetch(`/api/communications?${params}`)
  if (!response.ok) {
    throw new Error('Failed to fetch call history')
  }
  return response.json()
}

async function fetchCallHistoryFiltered(filters: {
  startDate?: string
  endDate?: string
  direction?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  const params = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, value.toString())
    }
  })
  
  const response = await fetch(`/api/communications?${params}`)
  if (!response.ok) {
    throw new Error('Failed to fetch call history')
  }
  return response.json()
}

async function makeCall(phoneNumber: string) {
  const response = await fetch('/api/communications/originate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
  })
  if (!response.ok) {
    throw new Error('Failed to make call')
  }
  return response.json()
}

async function hangupCall(callId?: string) {
  const response = await fetch('/api/communications/hangup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callId }),
  })
  if (!response.ok) {
    throw new Error('Failed to hangup call')
  }
  return response.json()
}

async function transferCall(callId: string, destination: string) {
  const response = await fetch('/api/communications/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callId, destination }),
  })
  if (!response.ok) {
    throw new Error('Failed to transfer call')
  }
  return response.json()
}

async function muteCall(callId: string, mute: boolean) {
  const response = await fetch('/api/communications/mute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callId, mute }),
  })
  if (!response.ok) {
    throw new Error('Failed to mute/unmute call')
  }
  return response.json()
}

async function getCallStats() {
  const response = await fetch('/api/communications/stats')
  if (!response.ok) {
    throw new Error('Failed to fetch call stats')
  }
  return response.json()
}

// Query Hooks
export const useCallHistory = (filters?: {
  startDate?: string
  endDate?: string
  direction?: string
  status?: string
  search?: string
}) => {
  return useQuery({
    queryKey: ['callHistory', filters],
    queryFn: () => fetchCallHistoryFiltered({ ...filters, page: 0, limit: 100 }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useInfiniteCallHistory = (filters?: {
  startDate?: string
  endDate?: string
  direction?: string
  status?: string
  search?: string
}) => {
  return useInfiniteQuery({
    queryKey: ['infiniteCallHistory', filters],
    queryFn: ({ pageParam = 0 }) => 
      fetchCallHistoryFiltered({ ...filters, page: pageParam, limit: 50 }),
    getNextPageParam: (lastPage, pages) => 
      lastPage.hasMore ? pages.length : undefined,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useCallStats = () => {
  return useQuery({
    queryKey: ['callStats'],
    queryFn: getCallStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  })
}

// Real-time call status (could be enhanced with WebSocket)
export const useCallStatus = () => {
  return useQuery({
    queryKey: ['callStatus'],
    queryFn: async () => {
      const response = await fetch('/api/communications/status')
      if (!response.ok) {
        throw new Error('Failed to fetch call status')
      }
      return response.json()
    },
    staleTime: 0, // Always fresh
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2000, // Check every 2 seconds
    refetchIntervalInBackground: true,
  })
}

// Mutation Hooks
export const useMakeCall = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: makeCall,
    onSuccess: () => {
      // Invalidate call history and status
      queryClient.invalidateQueries({ queryKey: ['callHistory'] })
      queryClient.invalidateQueries({ queryKey: ['callStatus'] })
      queryClient.invalidateQueries({ queryKey: ['callStats'] })
    },
    onError: (error) => {
      console.error('Failed to make call:', error)
    }
  })
}

export const useHangupCall = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: hangupCall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callStatus'] })
      queryClient.invalidateQueries({ queryKey: ['callHistory'] })
      queryClient.invalidateQueries({ queryKey: ['callStats'] })
    },
    onError: (error) => {
      console.error('Failed to hangup call:', error)
    }
  })
}

export const useTransferCall = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ callId, destination }: { callId: string, destination: string }) =>
      transferCall(callId, destination),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callStatus'] })
      queryClient.invalidateQueries({ queryKey: ['callHistory'] })
    },
    onError: (error) => {
      console.error('Failed to transfer call:', error)
    }
  })
}

export const useMuteCall = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ callId, mute }: { callId: string, mute: boolean }) =>
      muteCall(callId, mute),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callStatus'] })
    },
    onError: (error) => {
      console.error('Failed to mute/unmute call:', error)
    }
  })
}

export const useRefreshCallData = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callHistory'] })
      queryClient.invalidateQueries({ queryKey: ['callStatus'] })
      queryClient.invalidateQueries({ queryKey: ['callStats'] })
    }
  })
}