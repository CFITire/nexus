"use client"

import React, { useEffect } from "react"
import { IconFolder, IconLock, IconUsers, IconBriefcase, IconCode, IconHome, IconAlertCircle } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { useCreateVaultFolder, useUpdateVaultFolder } from "@/hooks/use-vault"
import { VaultFolder, FolderPermissions } from "@/lib/types/vault"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (folder: Omit<VaultFolder, 'id' | 'createdAt' | 'updatedAt'>) => void
  folder?: VaultFolder | null
  mode: 'create' | 'edit'
}

const colorOptions = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Gray', value: '#6b7280' },
]

const iconOptions = [
  { name: 'Folder', value: 'folder', icon: IconFolder },
  { name: 'Lock', value: 'lock', icon: IconLock },
  { name: 'Users', value: 'users', icon: IconUsers },
  { name: 'Business', value: 'briefcase', icon: IconBriefcase },
  { name: 'Code', value: 'code', icon: IconCode },
  { name: 'Home', value: 'home', icon: IconHome },
]

// Folder validation schema
const folderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(50, 'Folder name too long'),
  description: z.string().max(200, 'Description too long').optional(),
  color: z.string().min(1, 'Color is required'),
  icon: z.string().min(1, 'Icon is required'),
})

type FolderFormData = z.infer<typeof folderSchema>

export function FolderDialogTanStack({ open, onOpenChange, onSave, folder, mode }: FolderDialogProps) {
  const createFolderMutation = useCreateVaultFolder()
  const updateFolderMutation = useUpdateVaultFolder()
  
  const isEdit = mode === 'edit'
  const mutation = isEdit ? updateFolderMutation : createFolderMutation

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      color: '#3b82f6',
      icon: 'folder',
    } as FolderFormData,
    validatorAdapter: zodValidator,
    validators: {
      onChange: folderSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const folderData: Omit<VaultFolder, 'id' | 'createdAt' | 'updatedAt'> = {
          name: value.name,
          description: value.description || undefined,
          color: value.color,
          icon: value.icon,
          createdBy: "current.user@cfi.com", // This would come from auth context
          permissions: {
            canRead: [],
            canWrite: [],
            canShare: []
          },
          isShared: false,
          passwordCount: 0
        }

        if (isEdit && folder) {
          // Update existing folder
          const updatedFolder: VaultFolder = {
            ...folder,
            ...folderData,
            updatedAt: new Date()
          }
          
          await updateFolderMutation.mutateAsync({
            folderId: folder.id,
            folderData: updatedFolder
          })
        } else {
          // Create new folder
          await createFolderMutation.mutateAsync(folderData)
        }
        
        // Call onSave callback if provided (for compatibility)
        onSave?.(folderData)
        
        // Reset form and close dialog
        form.reset()
        onOpenChange(false)
      } catch (error) {
        console.error('Failed to save folder:', error)
        // Error is handled by the mutation
      }
    },
  })

  // Update form values when folder changes in edit mode
  useEffect(() => {
    if (folder && mode === 'edit' && open) {
      form.setFieldValue('name', folder.name)
      form.setFieldValue('description', folder.description || '')
      form.setFieldValue('color', folder.color)
      form.setFieldValue('icon', folder.icon)
    } else if (mode === 'create' && open) {
      // Reset form for create mode
      form.reset()
    }
  }, [folder, mode, open, form])

  const getFieldError = (fieldName: keyof FolderFormData) => {
    const fieldInfo = form.getFieldInfo(fieldName)
    return fieldInfo?.meta?.errors?.[0]
  }

  const selectedIcon = iconOptions.find(option => option.value === form.getFieldValue('icon'))
  const SelectedIconComponent = selectedIcon?.icon || IconFolder

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Folder' : 'Create New Folder'}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Update the folder settings and appearance.'
              : 'Create a new folder to organize your passwords.'
            }
          </DialogDescription>
        </DialogHeader>

        <form 
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          {/* Folder Name */}
          <form.Field
            name="name"
            children={(field) => {
              const error = getFieldError('name')
              const hasError = error && field.state.meta.isTouched
              
              return (
                <div className="space-y-2">
                  <Label htmlFor="name" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                    Folder Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter folder name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={cn(hasError && "border-destructive")}
                  />
                  {hasError && (
                    <Alert variant="destructive" className="py-2">
                      <IconAlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )
            }}
          />

          {/* Description */}
          <form.Field
            name="description"
            children={(field) => {
              const error = getFieldError('description')
              const hasError = error && field.state.meta.isTouched
              
              return (
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional folder description..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={cn(hasError && "border-destructive")}
                    rows={3}
                  />
                  {hasError && (
                    <Alert variant="destructive" className="py-2">
                      <IconAlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )
            }}
          />

          {/* Icon Selection */}
          <form.Field
            name="icon"
            children={(field) => (
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-6 gap-2">
                  {iconOptions.map((option) => {
                    const IconComponent = option.icon
                    const isSelected = field.state.value === option.value
                    
                    return (
                      <Button
                        key={option.value}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="icon"
                        onClick={() => field.handleChange(option.value)}
                        className={cn(
                          "h-12 w-12",
                          isSelected && "ring-2 ring-ring ring-offset-2"
                        )}
                      >
                        <IconComponent className="h-5 w-5" />
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}
          />

          {/* Color Selection */}
          <form.Field
            name="color"
            children={(field) => (
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="grid grid-cols-8 gap-2">
                  {colorOptions.map((option) => {
                    const isSelected = field.state.value === option.value
                    
                    return (
                      <Button
                        key={option.value}
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => field.handleChange(option.value)}
                        className={cn(
                          "h-8 w-8 p-0 border-2",
                          isSelected && "ring-2 ring-ring ring-offset-2"
                        )}
                        style={{ backgroundColor: option.value }}
                        title={option.name}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          />

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div 
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: form.getFieldValue('color') + '20', color: form.getFieldValue('color') }}
              >
                <SelectedIconComponent className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">
                  {form.getFieldValue('name') || 'Folder Name'}
                </div>
                {form.getFieldValue('description') && (
                  <div className="text-sm text-muted-foreground">
                    {form.getFieldValue('description')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Global Form Error */}
          {mutation.error && (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to {isEdit ? 'update' : 'create'} folder: {mutation.error.message}
              </AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={() => form.handleSubmit()}
            disabled={mutation.isPending || !form.state.isValid}
            className="min-w-[100px]"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEdit ? 'Update Folder' : 'Create Folder'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}