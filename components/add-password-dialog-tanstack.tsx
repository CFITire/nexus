"use client"

import { useState } from "react"
import { IconEye, IconEyeOff, IconRefresh, IconAlertCircle } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { usePasswordForm } from "@/hooks/use-form-helpers"
import { useCreateVaultPassword } from "@/hooks/use-vault"
import { PasswordEntry, VaultFolder } from "@/lib/types/vault"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd?: (password: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
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

// Enhanced validation schema
const passwordSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  username: z.string().optional(),
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  notes: z.string().max(500, 'Notes too long').optional(),
  category: z.string().min(1, 'Category is required'),
  folderId: z.string().optional(),
  tags: z.string().optional(),
  isFavorite: z.boolean().optional(),
})

type PasswordFormData = z.infer<typeof passwordSchema>

export function AddPasswordDialogTanStack({ 
  open, 
  onOpenChange, 
  onAdd, 
  folders = [], 
  selectedFolderId 
}: AddPasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [customCategories, setCustomCategories] = useState<string[]>([])
  
  const createPasswordMutation = useCreateVaultPassword()

  const form = useForm({
    defaultValues: {
      title: '',
      username: '',
      password: '',
      url: '',
      notes: '',
      category: 'Other',
      folderId: selectedFolderId === 'unorganized' ? "unorganized" : selectedFolderId || "unorganized",
      tags: '',
      isFavorite: false,
    } as PasswordFormData,
    validatorAdapter: zodValidator,
    validators: {
      onChange: passwordSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const passwordEntry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'> = {
          title: value.title,
          username: value.username || undefined,
          password: value.password,
          url: value.url || undefined,
          notes: value.notes || undefined,
          category: value.category,
          folderId: value.folderId === "unorganized" ? undefined : value.folderId || undefined,
          createdBy: "current.user@cfi.com", // This would come from auth context
          isShared: false,
          sharedWith: [],
          tags: value.tags ? value.tags.split(',').map(tag => tag.trim()) : [],
          isFavorite: value.isFavorite || false
        }

        // Use TanStack Query mutation
        await createPasswordMutation.mutateAsync(passwordEntry)
        
        // Call onAdd callback if provided (for compatibility)
        onAdd?.(passwordEntry)
        
        // Reset form and close dialog
        form.reset()
        onOpenChange(false)
      } catch (error) {
        console.error('Failed to create password:', error)
        // Error is handled by the mutation
      }
    },
  })

  const generatePassword = () => {
    const length = 16
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    form.setFieldValue('password', password)
  }

  const addCustomCategory = () => {
    if (newCategory && !customCategories.includes(newCategory)) {
      setCustomCategories(prev => [...prev, newCategory])
      form.setFieldValue('category', newCategory)
      setNewCategory("")
      setShowNewCategory(false)
    }
  }

  const allCategories = [...categories, ...customCategories]

  const getFieldError = (fieldName: keyof PasswordFormData) => {
    const fieldInfo = form.getFieldInfo(fieldName)
    return fieldInfo?.meta?.errors?.[0]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Password</DialogTitle>
          <DialogDescription>
            Create a new password entry. All fields except title and password are optional.
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
          {/* Title Field */}
          <form.Field
            name="title"
            children={(field) => {
              const error = getFieldError('title')
              const hasError = error && field.state.meta.isTouched
              
              return (
                <div className="space-y-2">
                  <Label htmlFor="title" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter password title"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={cn(hasError && "border-destructive")}
                  />
                  {hasError && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )
            }}
          />

          {/* Username Field */}
          <form.Field
            name="username"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor="username">Username / Email</Label>
                <Input
                  id="username"
                  placeholder="Enter username or email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          />

          {/* Password Field */}
          <form.Field
            name="password"
            children={(field) => {
              const error = getFieldError('password')
              const hasError = error && field.state.meta.isTouched
              
              return (
                <div className="space-y-2">
                  <Label htmlFor="password" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                    Password
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className={cn(hasError && "border-destructive", "pr-10")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button type="button" variant="outline" onClick={generatePassword}>
                      <IconRefresh className="h-4 w-4" />
                    </Button>
                  </div>
                  {hasError && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )
            }}
          />

          {/* URL Field */}
          <form.Field
            name="url"
            children={(field) => {
              const error = getFieldError('url')
              const hasError = error && field.state.meta.isTouched
              
              return (
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={cn(hasError && "border-destructive")}
                  />
                  {hasError && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )
            }}
          />

          {/* Category Field */}
          <form.Field
            name="category"
            children={(field) => (
              <div className="space-y-2">
                <Label>Category</Label>
                <div className="flex gap-2">
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewCategory(!showNewCategory)}
                  >
                    Add New
                  </Button>
                </div>
                
                {showNewCategory && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="New category name"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <Button type="button" onClick={addCustomCategory}>
                      Add
                    </Button>
                  </div>
                )}
              </div>
            )}
          />

          {/* Folder Field */}
          <form.Field
            name="folderId"
            children={(field) => (
              <div className="space-y-2">
                <Label>Folder</Label>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unorganized">Unorganized</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          {/* Tags Field */}
          <form.Field
            name="tags"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="tag1, tag2, tag3"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <p className="text-xs text-muted-foreground">Separate tags with commas</p>
              </div>
            )}
          />

          {/* Notes Field */}
          <form.Field
            name="notes"
            children={(field) => {
              const error = getFieldError('notes')
              const hasError = error && field.state.meta.isTouched
              
              return (
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={cn(hasError && "border-destructive")}
                    rows={3}
                  />
                  {hasError && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )
            }}
          />

          {/* Favorite Checkbox */}
          <form.Field
            name="isFavorite"
            children={(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="favorite"
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
                <Label htmlFor="favorite">Mark as favorite</Label>
              </div>
            )}
          />

          {/* Global Form Error */}
          {createPasswordMutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to create password: {createPasswordMutation.error.message}
              </AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={createPasswordMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={() => form.handleSubmit()}
            disabled={createPasswordMutation.isPending || !form.state.isValid}
            className="min-w-[100px]"
          >
            {createPasswordMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Password'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}