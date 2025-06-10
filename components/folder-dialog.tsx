"use client"

import React, { useState, useEffect } from "react"
import { IconFolder, IconLock, IconUsers, IconBriefcase, IconCode, IconHome } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { VaultFolder, FolderPermissions } from "@/lib/types/vault"

interface FolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (folder: Omit<VaultFolder, 'id' | 'createdAt' | 'updatedAt'>) => void
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

export function FolderDialog({ open, onOpenChange, onSave, folder, mode }: FolderDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: 'folder',
  })

  useEffect(() => {
    if (folder && mode === 'edit') {
      setFormData({
        name: folder.name,
        description: folder.description || '',
        color: folder.color,
        icon: folder.icon,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#3b82f6',
        icon: 'folder',
      })
    }
  }, [folder, mode, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const defaultPermissions: FolderPermissions = {
      canView: true,
      canEdit: true,
      canDelete: true,
      canShare: true,
      canAddPasswords: true,
    }

    const folderData: Omit<VaultFolder, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      description: formData.description || undefined,
      color: formData.color,
      icon: formData.icon,
      createdBy: "current.user@cfi.com", // This would come from auth context
      isShared: false,
      sharedWith: [],
      permissions: defaultPermissions,
    }

    onSave(folderData)
    onOpenChange(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Folder' : 'Edit Folder'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new folder to organize your passwords.'
              : 'Update the folder settings and organization.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Folder Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Work Accounts, Personal, Shared Team"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Optional description for this folder"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Folder Icon</Label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map((option) => {
                const IconComponent = option.icon
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`p-3 rounded-lg border-2 transition-colors hover:bg-muted ${
                      formData.icon === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                    onClick={() => handleChange('icon', option.value)}
                  >
                    <IconComponent className="h-5 w-5 mx-auto" />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Folder Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    formData.color === option.value
                      ? 'border-primary scale-110'
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: option.value }}
                  onClick={() => handleChange('color', option.value)}
                  title={option.name}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-md"
                  style={{ backgroundColor: `${formData.color}20` }}
                >
                  <div style={{ color: formData.color }}>
                    {iconOptions.find(i => i.value === formData.icon)?.icon && (
                      React.createElement(iconOptions.find(i => i.value === formData.icon)!.icon, {
                        className: "h-4 w-4"
                      })
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-medium">{formData.name || 'Folder Name'}</p>
                  {formData.description && (
                    <p className="text-sm text-muted-foreground">{formData.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Create Folder' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}