'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Vault API functions
async function fetchVaultFolders() {
  const response = await fetch('/api/vault/folders')
  if (!response.ok) {
    throw new Error('Failed to fetch vault folders')
  }
  return response.json()
}

async function fetchVaultPasswords(folderId?: string) {
  let url = '/api/vault/passwords'
  if (folderId) {
    url += `?folderId=${folderId}`
  }
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch vault passwords')
  }
  return response.json()
}

async function fetchVaultPassword(passwordId: string) {
  const response = await fetch(`/api/vault/passwords/${passwordId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch vault password')
  }
  return response.json()
}

async function createVaultFolder(folderData: any) {
  const response = await fetch('/api/vault/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(folderData),
  })
  if (!response.ok) {
    throw new Error('Failed to create vault folder')
  }
  return response.json()
}

async function createVaultPassword(passwordData: any) {
  const response = await fetch('/api/vault/passwords', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(passwordData),
  })
  if (!response.ok) {
    throw new Error('Failed to create vault password')
  }
  return response.json()
}

async function updateVaultPassword(passwordId: string, passwordData: any) {
  const response = await fetch(`/api/vault/passwords/${passwordId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(passwordData),
  })
  if (!response.ok) {
    throw new Error('Failed to update vault password')
  }
  return response.json()
}

async function deleteVaultPassword(passwordId: string) {
  const response = await fetch(`/api/vault/passwords/${passwordId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete vault password')
  }
  return response.json()
}

async function shareVaultFolder(folderId: string, shareData: any) {
  const response = await fetch(`/api/vault/folders/${folderId}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shareData),
  })
  if (!response.ok) {
    throw new Error('Failed to share vault folder')
  }
  return response.json()
}

// Query Hooks
export const useVaultFolders = () => {
  return useQuery({
    queryKey: ['vaultFolders'],
    queryFn: fetchVaultFolders,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export const useVaultPasswords = (folderId?: string) => {
  return useQuery({
    queryKey: ['vaultPasswords', folderId],
    queryFn: () => fetchVaultPasswords(folderId),
    staleTime: 0, // Always fresh for security
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  })
}

export const useVaultPassword = (passwordId: string) => {
  return useQuery({
    queryKey: ['vaultPassword', passwordId],
    queryFn: () => fetchVaultPassword(passwordId),
    enabled: !!passwordId,
    staleTime: 0, // Always fresh for security
    gcTime: 1 * 60 * 1000, // 1 minute cache
  })
}

// Mutation Hooks
export const useCreateVaultFolder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createVaultFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultFolders'] })
    },
    onError: (error) => {
      console.error('Failed to create vault folder:', error)
    }
  })
}

export const useCreateVaultPassword = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createVaultPassword,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vaultPasswords'] })
      queryClient.invalidateQueries({ queryKey: ['vaultPasswords', variables.folderId] })
    },
    onError: (error) => {
      console.error('Failed to create vault password:', error)
    }
  })
}

export const useUpdateVaultPassword = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ passwordId, passwordData }: { passwordId: string, passwordData: any }) =>
      updateVaultPassword(passwordId, passwordData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vaultPasswords'] })
      queryClient.invalidateQueries({ queryKey: ['vaultPassword', variables.passwordId] })
    },
    onError: (error) => {
      console.error('Failed to update vault password:', error)
    }
  })
}

export const useDeleteVaultPassword = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteVaultPassword,
    onMutate: async (passwordId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['vaultPasswords'] })
      
      // Snapshot previous value
      const previousPasswords = queryClient.getQueryData(['vaultPasswords'])
      
      // Optimistically remove the password
      queryClient.setQueryData(['vaultPasswords'], (old: any) => {
        if (!old?.passwords) return old
        return {
          ...old,
          passwords: old.passwords.filter((p: any) => p.id !== passwordId)
        }
      })
      
      return { previousPasswords }
    },
    onError: (err, passwordId, context) => {
      // Rollback on error
      if (context?.previousPasswords) {
        queryClient.setQueryData(['vaultPasswords'], context.previousPasswords)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultPasswords'] })
    }
  })
}

export const useShareVaultFolder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ folderId, shareData }: { folderId: string, shareData: any }) =>
      shareVaultFolder(folderId, shareData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultFolders'] })
    },
    onError: (error) => {
      console.error('Failed to share vault folder:', error)
    }
  })
}