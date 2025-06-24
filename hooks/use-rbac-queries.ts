'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// RBAC API functions
async function fetchUserPermissions() {
  const response = await fetch('/api/rbac/permissions')
  if (!response.ok) {
    throw new Error('Failed to fetch user permissions')
  }
  return response.json()
}

async function fetchRBACGroups() {
  const response = await fetch('/api/rbac/groups')
  if (!response.ok) {
    throw new Error('Failed to fetch RBAC groups')
  }
  return response.json()
}

async function fetchRBACUsers() {
  const response = await fetch('/api/rbac/users')
  if (!response.ok) {
    throw new Error('Failed to fetch RBAC users')
  }
  return response.json()
}

async function fetchGroupMembers(groupId: string) {
  const response = await fetch(`/api/rbac/groups/${groupId}/members`)
  if (!response.ok) {
    throw new Error('Failed to fetch group members')
  }
  return response.json()
}

async function fetchGroupRoles(groupId: string) {
  const response = await fetch(`/api/rbac/groups/${groupId}/roles`)
  if (!response.ok) {
    throw new Error('Failed to fetch group roles')
  }
  return response.json()
}

async function addGroupMember(groupId: string, memberData: any) {
  const response = await fetch(`/api/rbac/groups/${groupId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(memberData),
  })
  if (!response.ok) {
    throw new Error('Failed to add group member')
  }
  return response.json()
}

async function removeGroupMember(groupId: string, memberId: string) {
  const response = await fetch(`/api/rbac/groups/${groupId}/members/${memberId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to remove group member')
  }
  return response.json()
}

async function updateGroupRoles(groupId: string, rolesData: any) {
  const response = await fetch(`/api/rbac/groups/${groupId}/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rolesData),
  })
  if (!response.ok) {
    throw new Error('Failed to update group roles')
  }
  return response.json()
}

// Team API functions
async function fetchTeamMembers() {
  const response = await fetch('/api/team')
  if (!response.ok) {
    throw new Error('Failed to fetch team members')
  }
  return response.json()
}

async function fetchCurrentUser() {
  const response = await fetch('/api/team/me')
  if (!response.ok) {
    throw new Error('Failed to fetch current user')
  }
  return response.json()
}

// Query Hooks for RBAC
export const useUserPermissions = (options?: any) => {
  return useQuery({
    queryKey: ['userPermissions'],
    queryFn: fetchUserPermissions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 60 * 1000, // Check every 10 minutes
    ...options,
  })
}

export const useRBACGroups = () => {
  return useQuery({
    queryKey: ['rbacGroups'],
    queryFn: fetchRBACGroups,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

export const useRBACUsers = () => {
  return useQuery({
    queryKey: ['rbacUsers'],
    queryFn: fetchRBACUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export const useGroupMembers = (groupId: string) => {
  return useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: () => fetchGroupMembers(groupId),
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export const useGroupRoles = (groupId: string) => {
  return useQuery({
    queryKey: ['groupRoles', groupId],
    queryFn: () => fetchGroupRoles(groupId),
    enabled: !!groupId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

// Query Hooks for Team
export const useTeamMembers = () => {
  return useQuery({
    queryKey: ['teamMembers'],
    queryFn: fetchTeamMembers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false, // Don't refetch on focus for user data
  })
}

// Mutation Hooks for RBAC
export const useAddGroupMember = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ groupId, memberData }: { groupId: string, memberData: any }) =>
      addGroupMember(groupId, memberData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', variables.groupId] })
      queryClient.invalidateQueries({ queryKey: ['rbacUsers'] })
    },
    onError: (error) => {
      console.error('Failed to add group member:', error)
    }
  })
}

export const useRemoveGroupMember = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string, memberId: string }) =>
      removeGroupMember(groupId, memberId),
    onMutate: async ({ groupId, memberId }) => {
      await queryClient.cancelQueries({ queryKey: ['groupMembers', groupId] })
      
      const previousMembers = queryClient.getQueryData(['groupMembers', groupId])
      
      queryClient.setQueryData(['groupMembers', groupId], (old: any) => {
        if (!old?.members) return old
        return {
          ...old,
          members: old.members.filter((member: any) => member.id !== memberId)
        }
      })
      
      return { previousMembers }
    },
    onError: (err, variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(['groupMembers', variables.groupId], context.previousMembers)
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', variables.groupId] })
      queryClient.invalidateQueries({ queryKey: ['rbacUsers'] })
    }
  })
}

export const useUpdateGroupRoles = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ groupId, rolesData }: { groupId: string, rolesData: any }) =>
      updateGroupRoles(groupId, rolesData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupRoles', variables.groupId] })
      queryClient.invalidateQueries({ queryKey: ['userPermissions'] })
    },
    onError: (error) => {
      console.error('Failed to update group roles:', error)
    }
  })
}

export const useRefreshPermissions = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPermissions'] })
      queryClient.invalidateQueries({ queryKey: ['rbacGroups'] })
      queryClient.invalidateQueries({ queryKey: ['rbacUsers'] })
    }
  })
}