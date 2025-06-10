"use client"

import { useState, useEffect } from "react"
import { IconEye, IconEyeOff, IconRefresh } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PasswordEntry, VaultFolder } from "@/lib/types/vault"

interface EditPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (password: PasswordEntry) => void
  password: PasswordEntry | null
  folders?: VaultFolder[]
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

export function EditPasswordDialog({ open, onOpenChange, onUpdate, password, folders = [] }: EditPasswordDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    username: "",
    password: "",
    url: "",
    notes: "",
    category: "Other",
    folderId: "",
    tags: "",
    isFavorite: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [customCategories, setCustomCategories] = useState<string[]>([])

  // Initialize form data when password changes
  useEffect(() => {
    if (password) {
      setFormData({
        title: password.title,
        username: password.username,
        password: password.password,
        url: password.url || "",
        notes: password.notes || "",
        category: password.category,
        folderId: password.folderId || "unorganized",
        tags: password.tags.join(", "),
        isFavorite: password.isFavorite
      })
    }
  }, [password])

  const generatePassword = () => {
    const length = 16
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let newPassword = ""
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setFormData(prev => ({ ...prev, password: newPassword }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password) return

    const updatedPassword: PasswordEntry = {
      ...password,
      title: formData.title,
      username: formData.username,
      password: formData.password,
      url: formData.url || undefined,
      notes: formData.notes || undefined,
      category: formData.category,
      folderId: formData.folderId === "unorganized" ? undefined : formData.folderId || undefined,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      isFavorite: formData.isFavorite,
      updatedAt: new Date()
    }

    onUpdate(updatedPassword)
    onOpenChange(false)
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !allCategories.includes(newCategory.trim())) {
      const trimmedCategory = newCategory.trim()
      setCustomCategories(prev => [...prev, trimmedCategory])
      setFormData(prev => ({ ...prev, category: trimmedCategory }))
      setNewCategory("")
      setShowNewCategory(false)
    }
  }

  const allCategories = [...categories, ...customCategories]

  if (!password) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Password</DialogTitle>
          <DialogDescription>
            Update your password entry.
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
              {showNewCategory ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter new category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <Button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowNewCategory(false)
                      setNewCategory("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select value={formData.category} onValueChange={(value) => {
                    if (value === "CREATE_NEW") {
                      setShowNewCategory(true)
                    } else {
                      handleChange('category', value)
                    }
                  }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectItem value="CREATE_NEW" className="text-primary">
                        + Create New Category
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder">Folder</Label>
            <Select value={formData.folderId} onValueChange={(value) => handleChange('folderId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unorganized">No Folder (Unorganized)</SelectItem>
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
            <Button type="submit">Update Password</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}