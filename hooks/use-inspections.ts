'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Inspection API functions
async function fetchInspections() {
  const response = await fetch('/api/inspections')
  if (!response.ok) {
    throw new Error('Failed to fetch inspections')
  }
  return response.json()
}

async function fetchInspection(inspectionId: string) {
  const response = await fetch(`/api/inspections/${inspectionId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch inspection')
  }
  return response.json()
}

async function createInspection(inspectionData: any) {
  const response = await fetch('/api/inspections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inspectionData),
  })
  if (!response.ok) {
    throw new Error('Failed to create inspection')
  }
  return response.json()
}

async function updateInspection(inspectionId: string, inspectionData: any) {
  const response = await fetch(`/api/inspections/${inspectionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inspectionData),
  })
  if (!response.ok) {
    throw new Error('Failed to update inspection')
  }
  return response.json()
}

async function deleteInspection(inspectionId: string) {
  const response = await fetch(`/api/inspections/${inspectionId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete inspection')
  }
  return response.json()
}

// Draft functionality for auto-saving
async function saveInspectionDraft(inspectionType: string, draftData: any, draftId?: string) {
  const response = await fetch(`/api/inspections/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: inspectionType,
      data: draftData,
      draftId,
    }),
  })
  if (!response.ok) {
    throw new Error('Failed to save inspection draft')
  }
  return response.json()
}

async function fetchInspectionDraft(inspectionType: string, draftId?: string) {
  let url = `/api/inspections/drafts?type=${inspectionType}`
  if (draftId) {
    url += `&draftId=${draftId}`
  }
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch inspection draft')
  }
  return response.json()
}

async function fetchInspectionTemplate(inspectionType: string) {
  const response = await fetch(`/api/inspections/templates/${inspectionType}`)
  if (!response.ok) {
    throw new Error('Failed to fetch inspection template')
  }
  return response.json()
}

// Analytics for inspections
async function fetchInspectionAnalytics(filters?: {
  startDate?: string
  endDate?: string
  type?: string
  status?: string
}) {
  let url = '/api/inspections/analytics'
  
  if (filters) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }
  }
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch inspection analytics')
  }
  return response.json()
}

// Query Hooks
export const useInspections = (filters?: {
  type?: string
  status?: string
  startDate?: string
  endDate?: string
}) => {
  return useQuery({
    queryKey: ['inspections', filters],
    queryFn: fetchInspections,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export const useInspection = (inspectionId: string) => {
  return useQuery({
    queryKey: ['inspection', inspectionId],
    queryFn: () => fetchInspection(inspectionId),
    enabled: !!inspectionId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

export const useInspectionTemplate = (inspectionType: string) => {
  return useQuery({
    queryKey: ['inspectionTemplate', inspectionType],
    queryFn: () => fetchInspectionTemplate(inspectionType),
    enabled: !!inspectionType,
    staleTime: 60 * 60 * 1000, // 1 hour (templates don't change often)
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

export const useInspectionDraft = (inspectionType: string, draftId?: string) => {
  return useQuery({
    queryKey: ['inspectionDraft', inspectionType, draftId],
    queryFn: () => fetchInspectionDraft(inspectionType, draftId),
    enabled: !!inspectionType,
    staleTime: 0, // Always fresh for drafts
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useInspectionAnalytics = (filters?: {
  startDate?: string
  endDate?: string
  type?: string
  status?: string
}) => {
  return useQuery({
    queryKey: ['inspectionAnalytics', filters],
    queryFn: () => fetchInspectionAnalytics(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

// Mutation Hooks
export const useCreateInspection = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createInspection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] })
      queryClient.invalidateQueries({ queryKey: ['inspectionAnalytics'] })
    },
    onError: (error) => {
      console.error('Failed to create inspection:', error)
    }
  })
}

export const useUpdateInspection = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ inspectionId, inspectionData }: { inspectionId: string, inspectionData: any }) =>
      updateInspection(inspectionId, inspectionData),
    onMutate: async ({ inspectionId, inspectionData }) => {
      await queryClient.cancelQueries({ queryKey: ['inspection', inspectionId] })
      
      const previousInspection = queryClient.getQueryData(['inspection', inspectionId])
      
      queryClient.setQueryData(['inspection', inspectionId], (old: any) => ({
        ...old,
        ...inspectionData
      }))
      
      return { previousInspection }
    },
    onError: (err, variables, context) => {
      if (context?.previousInspection) {
        queryClient.setQueryData(['inspection', variables.inspectionId], context.previousInspection)
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspection', variables.inspectionId] })
      queryClient.invalidateQueries({ queryKey: ['inspections'] })
    }
  })
}

export const useDeleteInspection = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteInspection,
    onMutate: async (inspectionId) => {
      await queryClient.cancelQueries({ queryKey: ['inspections'] })
      
      const previousInspections = queryClient.getQueryData(['inspections'])
      
      queryClient.setQueryData(['inspections'], (old: any) => {
        if (!old?.inspections) return old
        return {
          ...old,
          inspections: old.inspections.filter((inspection: any) => inspection.id !== inspectionId)
        }
      })
      
      return { previousInspections }
    },
    onError: (err, inspectionId, context) => {
      if (context?.previousInspections) {
        queryClient.setQueryData(['inspections'], context.previousInspections)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] })
      queryClient.invalidateQueries({ queryKey: ['inspectionAnalytics'] })
    }
  })
}

// Auto-save draft mutation with debouncing
export const useSaveInspectionDraft = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ inspectionType, draftData, draftId }: { 
      inspectionType: string, 
      draftData: any, 
      draftId?: string 
    }) => saveInspectionDraft(inspectionType, draftData, draftId),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ['inspectionDraft', variables.inspectionType, variables.draftId], 
        data
      )
    },
    onError: (error) => {
      console.error('Failed to save inspection draft:', error)
    }
  })
}

export const useRefreshInspectionData = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] })
      queryClient.invalidateQueries({ queryKey: ['inspectionAnalytics'] })
    }
  })
}