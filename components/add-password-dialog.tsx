"use client"

import { useState } from "react"
import { IconEye, IconEyeOff, IconRefresh } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PasswordEntry, VaultFolder } from "@/lib/types/vault"

interface AddPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (password: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  folders?: VaultFolder[]
  selectedFolderId?: string | null
}

const categories = [
  "Business Apps",
  "Development",
  "Office",
  "Personal",
  "Social Media",
  "Finance",
  "Other"
]

export function AddPasswordDialog({ open, onOpenChange, onAdd, folders = [], selectedFolderId }: AddPasswordDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    username: "",
    password: "",
    url: "",
    notes: "",
    category: "Other",
    folderId: selectedFolderId === 'unorganized' ? "" : selectedFolderId || "",
    tags: "",
    isFavorite: false
  })
  const [showPassword, setShowPassword] = useState(false)

  const generatePassword = () => {
    const length = 16
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setFormData(prev => ({ ...prev, password }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const passwordEntry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title,
      username: formData.username,
      password: formData.password,
      url: formData.url || undefined,
      notes: formData.notes || undefined,
      category: formData.category,
      folderId: formData.folderId || undefined,
      createdBy: "current.user@cfi.com", // This would come from auth context
      isShared: false,
      sharedWith: [],
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      isFavorite: formData.isFavorite
    }

    onAdd(passwordEntry)
    
    // Reset form
    setFormData({
      title: "",
      username: "",
      password: "",
      url: "",
      notes: "",
      category: "Other",
      folderId: selectedFolderId === 'unorganized' ? "" : selectedFolderId || "",
      tags: "",
      isFavorite: false
    })
    
    onOpenChange(false)
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Password</DialogTitle>
          <DialogDescription>
            Create a new password entry in your vault.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Company Email"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="Username or email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder">Folder</Label>
            <Select value={formData.folderId} onValueChange={(value) => handleChange('folderId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Folder (Unorganized)</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: folder.color }}
                      />
                      {folder.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Enter password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <IconEyeOff className="h-3 w-3" /> : <IconEye className="h-3 w-3" />}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generatePassword}
              >
                <IconRefresh className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="work, important, shared (comma separated)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes or instructions"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="favorite"
              checked={formData.isFavorite}
              onCheckedChange={(checked) => handleChange('isFavorite', checked as boolean)}
            />
            <Label htmlFor="favorite">Add to favorites</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Password</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}