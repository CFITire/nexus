'use client'

import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, User, Shield, Mail } from "lucide-react"
import { TextField, SelectField, CheckboxField, FormSection, FormActions } from "./form-field"
import { useAddGroupMember, useUpdateGroupRoles } from "@/hooks/use-rbac-queries"

interface UserFormProps {
  initialData?: any
  mode?: 'create' | 'edit'
  onSuccess?: (user: any) => void
  onCancel?: () => void
}

// User validation schema
const userSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100, 'Name too long'),
  email: z.string().email('Must be a valid email address'),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  groups: z.array(z.string()).min(1, 'User must belong to at least one group'),
  isActive: z.boolean().default(true),
  notes: z.string().max(500, 'Notes too long').optional(),
})

type UserFormData = z.infer<typeof userSchema>

const mockGroups = [
  { value: 'nexus-users', label: 'Nexus Users' },
  { value: 'nexus-administrators', label: 'Nexus Administrators' },
  { value: 'nexus-vault-managers', label: 'Vault Managers' },
  { value: 'nexus-inspection-managers', label: 'Inspection Managers' },
  { value: 'nexus-analytics-users', label: 'Analytics Users' },
]

const mockDepartments = [
  { value: 'operations', label: 'Operations' },
  { value: 'sales', label: 'Sales' },
  { value: 'management', label: 'Management' },
  { value: 'it', label: 'Information Technology' },
  { value: 'finance', label: 'Finance' },
]

export function UserFormTanStack({ 
  initialData, 
  mode = 'create', 
  onSuccess, 
  onCancel 
}: UserFormProps) {
  const addMemberMutation = useAddGroupMember()
  const updateRolesMutation = useUpdateGroupRoles()
  
  const isEdit = mode === 'edit'

  const form = useForm({
    defaultValues: {
      displayName: initialData?.displayName || '',
      email: initialData?.email || '',
      department: initialData?.department || '',
      jobTitle: initialData?.jobTitle || '',
      groups: initialData?.groups || [],
      isActive: initialData?.isActive ?? true,
      notes: initialData?.notes || '',
    } as UserFormData,
    validatorAdapter: zodValidator,
    validators: {
      onChange: userSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        // In a real implementation, this would call user management APIs
        console.log('Submitting user data:', value)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        onSuccess?.(value)
        
        if (!isEdit) {
          form.reset()
        }
      } catch (error) {
        console.error('Failed to save user:', error)
        throw error
      }
    },
  })

  const getFieldError = (fieldName: keyof UserFormData) => {
    const fieldInfo = form.getFieldInfo(fieldName)
    return fieldInfo?.meta?.errors?.[0]
  }

  const isFieldTouched = (fieldName: keyof UserFormData) => {
    const fieldInfo = form.getFieldInfo(fieldName)
    return fieldInfo?.meta?.isTouched || false
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {isEdit ? 'Edit User' : 'Add New User'}
        </CardTitle>
        <CardDescription>
          {isEdit 
            ? 'Update user information and permissions.'
            : 'Create a new user account with appropriate permissions.'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          {/* Basic Information */}
          <FormSection 
            title="Basic Information" 
            icon={<User className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field
                name="displayName"
                children={(field) => (
                  <TextField
                    label="Display Name"
                    required
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="Enter full name"
                    error={getFieldError('displayName')}
                    isTouched={isFieldTouched('displayName')}
                  />
                )}
              />

              <form.Field
                name="email"
                children={(field) => (
                  <TextField
                    label="Email Address"
                    type="email"
                    required
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="Enter email address"
                    error={getFieldError('email')}
                    isTouched={isFieldTouched('email')}
                    icon={<Mail className="h-4 w-4" />}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field
                name="department"
                children={(field) => (
                  <SelectField
                    label="Department"
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    options={mockDepartments}
                    placeholder="Select department"
                    error={getFieldError('department')}
                    isTouched={isFieldTouched('department')}
                  />
                )}
              />

              <form.Field
                name="jobTitle"
                children={(field) => (
                  <TextField
                    label="Job Title"
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="Enter job title"
                    error={getFieldError('jobTitle')}
                    isTouched={isFieldTouched('jobTitle')}
                  />
                )}
              />
            </div>
          </FormSection>

          {/* Permission Groups */}
          <FormSection 
            title="Access Groups" 
            description="Select which groups this user should belong to"
            icon={<Shield className="h-4 w-4" />}
          >
            <form.Field
              name="groups"
              children={(field) => {
                const error = getFieldError('groups')
                const isTouched = isFieldTouched('groups')
                
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      {mockGroups.map((group) => (
                        <div key={group.value} className="flex items-center space-x-2 p-3 border rounded-lg">
                          <input
                            type="checkbox"
                            id={group.value}
                            checked={field.state.value.includes(group.value)}
                            onChange={(e) => {
                              const currentGroups = field.state.value
                              if (e.target.checked) {
                                field.handleChange([...currentGroups, group.value])
                              } else {
                                field.handleChange(currentGroups.filter(g => g !== group.value))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={group.value} className="flex-1 cursor-pointer">
                            <div className="font-medium">{group.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {group.value === 'nexus-administrators' && 'Full system access'}
                              {group.value === 'nexus-users' && 'Basic user access'}
                              {group.value === 'nexus-vault-managers' && 'Manage password vault'}
                              {group.value === 'nexus-inspection-managers' && 'Manage inspections'}
                              {group.value === 'nexus-analytics-users' && 'View analytics dashboards'}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    {error && isTouched && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )
              }}
            />
          </FormSection>

          {/* Status and Notes */}
          <FormSection title="Status and Notes">
            <form.Field
              name="isActive"
              children={(field) => (
                <CheckboxField
                  label="Active User"
                  description="Inactive users cannot log in to the system"
                  checked={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  error={getFieldError('isActive')}
                  isTouched={isFieldTouched('isActive')}
                />
              )}
            />

            <form.Field
              name="notes"
              children={(field) => (
                <TextField
                  label="Notes"
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  placeholder="Additional notes about this user..."
                  error={getFieldError('notes')}
                  isTouched={isFieldTouched('notes')}
                />
              )}
            />
          </FormSection>

          {/* Global Form Error */}
          {form.state.submissionAttempts > 0 && !form.state.isValid && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors above before submitting.
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <FormActions>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline"
                onClick={onCancel}
                disabled={form.state.isSubmitting}
              >
                Cancel
              </Button>
            )}

            <Button 
              type="button" 
              variant="outline"
              onClick={() => form.reset()}
              disabled={form.state.isSubmitting || !form.state.isTouched}
            >
              Reset
            </Button>

            <Button 
              type="submit" 
              disabled={form.state.isSubmitting || !form.state.isValid}
              className="min-w-[120px]"
            >
              {form.state.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEdit ? 'Update User' : 'Create User'
              )}
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  )
}