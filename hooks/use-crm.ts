'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// CRM API functions
async function fetchAccounts() {
  const response = await fetch('/api/dataverse/accounts')
  if (!response.ok) {
    throw new Error('Failed to fetch accounts')
  }
  return response.json()
}

async function fetchContacts() {
  const response = await fetch('/api/dataverse/contacts')
  if (!response.ok) {
    throw new Error('Failed to fetch contacts')
  }
  return response.json()
}

async function fetchOpportunities() {
  const response = await fetch('/api/dataverse/opportunities')
  if (!response.ok) {
    throw new Error('Failed to fetch opportunities')
  }
  return response.json()
}

async function fetchAccount(accountId: string) {
  const response = await fetch(`/api/dataverse/accounts/${accountId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch account')
  }
  return response.json()
}

async function fetchContact(contactId: string) {
  const response = await fetch(`/api/dataverse/contacts/${contactId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch contact')
  }
  return response.json()
}

async function updateContact(contact: any) {
  const response = await fetch(`/api/dataverse/contacts/${contact.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contact),
  })
  if (!response.ok) {
    throw new Error('Failed to update contact')
  }
  return response.json()
}

async function createContact(contact: any) {
  const response = await fetch('/api/dataverse/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contact),
  })
  if (!response.ok) {
    throw new Error('Failed to create contact')
  }
  return response.json()
}

// Query Hooks
export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export const useContacts = () => {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: fetchContacts,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  })
}

export const useOpportunities = () => {
  return useQuery({
    queryKey: ['opportunities'],
    queryFn: fetchOpportunities,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export const useAccount = (accountId: string) => {
  return useQuery({
    queryKey: ['account', accountId],
    queryFn: () => fetchAccount(accountId),
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export const useContact = (contactId: string) => {
  return useQuery({
    queryKey: ['contact', contactId],
    queryFn: () => fetchContact(contactId),
    enabled: !!contactId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  })
}

// Mutation Hooks
export const useCreateContact = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
    onError: (error) => {
      console.error('Failed to create contact:', error)
    }
  })
}

export const useUpdateContact = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateContact,
    onMutate: async (updatedContact) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['contacts'] })
      await queryClient.cancelQueries({ queryKey: ['contact', updatedContact.id] })
      
      // Snapshot previous values
      const previousContacts = queryClient.getQueryData(['contacts'])
      const previousContact = queryClient.getQueryData(['contact', updatedContact.id])
      
      // Optimistically update
      queryClient.setQueryData(['contacts'], (old: any) => {
        if (!old?.value) return old
        return {
          ...old,
          value: old.value.map((contact: any) => 
            contact.contactid === updatedContact.id ? { ...contact, ...updatedContact } : contact
          )
        }
      })
      
      queryClient.setQueryData(['contact', updatedContact.id], (old: any) => ({
        ...old,
        ...updatedContact
      }))
      
      return { previousContacts, previousContact }
    },
    onError: (err, updatedContact, context) => {
      // Rollback on error
      if (context?.previousContacts) {
        queryClient.setQueryData(['contacts'], context.previousContacts)
      }
      if (context?.previousContact) {
        queryClient.setQueryData(['contact', updatedContact.id], context.previousContact)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    }
  })
}

export const useRefreshCRMData = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
    }
  })
}