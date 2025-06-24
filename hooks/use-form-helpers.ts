'use client'

import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useCreateInspection, useSaveInspectionDraft } from './use-inspections'

// Base schema for common inspection fields
export const baseInspectionSchema = z.object({
  inspectionDate: z.string().min(1, 'Inspection date is required'),
  inspector: z.string().min(1, 'Inspector name is required'),
  location: z.string().optional(),
  soNo: z.string().optional(),
  poNo: z.string().optional(),
  salesperson: z.string().optional(),
})

// Field type definitions
export type FieldType = 
  | "text" 
  | "number" 
  | "textarea" 
  | "datetime-local" 
  | "tel"
  | "select"
  | "so-lookup"
  | "po-lookup" 
  | "salesperson-lookup"
  | "location-lookup"

export type AutoFillType = "datetime" | "inspector"

export interface FormField {
  id: string
  label: string
  type: FieldType
  placeholder?: string
  required?: boolean
  autoFill?: AutoFillType
  autoFillFrom?: string
  options?: string[]
  customValidation?: string // Type of custom validation to apply
}

// Helper to create dynamic Zod schema from field definitions
export function createFormSchema(fields: FormField[]) {
  const schemaFields: Record<string, z.ZodTypeAny> = {}
  
  fields.forEach(field => {
    let fieldSchema: z.ZodTypeAny
    
    // Handle custom validation types
    if (field.customValidation) {
      switch (field.customValidation) {
        case 'positive-number':
          if (field.required) {
            fieldSchema = z.string()
              .min(1, `${field.label} is required`)
              .refine(val => {
                const num = parseInt(val)
                return !isNaN(num) && num > 0
              }, `${field.label} must be a positive number`)
          } else {
            fieldSchema = z.string()
              .refine(val => val === '' || (!isNaN(parseInt(val)) && parseInt(val) > 0), {
                message: `${field.label} must be a positive number`
              })
              .optional()
          }
          break
        default:
          // Fall back to type-based validation
          fieldSchema = createTypeBasedSchema(field)
      }
    } else {
      // Create schema based on field type and requirements
      fieldSchema = createTypeBasedSchema(field)
    }
    
    schemaFields[field.id] = fieldSchema
  })
  
  return z.object(schemaFields)
}

// Helper function to create schema based on field type
function createTypeBasedSchema(field: FormField): z.ZodTypeAny {
  switch (field.type) {
    case 'number':
      if (field.required) {
        return z.string()
          .min(1, `${field.label} is required`)
          .refine(val => !isNaN(Number(val)), {
            message: `${field.label} must be a valid number`
          })
      } else {
        return z.string()
          .refine(val => val === '' || !isNaN(Number(val)), {
            message: `${field.label} must be a valid number`
          })
          .optional()
      }
    case 'tel':
      if (field.required) {
        return z.string()
          .min(1, `${field.label} is required`)
          .regex(/^[\d\s\-\+\(\)]+$/, {
            message: `${field.label} must be a valid phone number`
          })
      } else {
        return z.string()
          .regex(/^$|^[\d\s\-\+\(\)]+$/, {
            message: `${field.label} must be a valid phone number`
          })
          .optional()
      }
    case 'datetime-local':
      if (field.required) {
        return z.string().min(1, `${field.label} is required`)
      } else {
        return z.string().optional()
      }
    default:
      if (field.required) {
        return z.string().min(1, `${field.label} is required`)
      } else {
        return z.string().optional()
      }
  }
}

// Auto-fill helper
export function getAutoFillValue(autoFillType: AutoFillType, session: any): string {
  switch (autoFillType) {
    case 'datetime':
      return new Date().toISOString().slice(0, 16)
    case 'inspector':
      return session?.user?.name || ''
    default:
      return ''
  }
}

// Hook for inspection forms
export function useInspectionForm<T extends Record<string, any>>(
  fields: FormField[],
  inspectionType: string,
  options: {
    enableAutoSave?: boolean
    autoSaveInterval?: number
    onSubmitSuccess?: (data: T) => void
    onSubmitError?: (error: Error) => void
  } = {}
) {
  const { data: session } = useSession()
  const createInspectionMutation = useCreateInspection()
  const saveDraftMutation = useSaveInspectionDraft()
  
  // Create dynamic schema
  const schema = createFormSchema(fields)
  
  // Initialize form with auto-fill values
  const initialValues = fields.reduce((acc, field) => {
    if (field.autoFill) {
      acc[field.id] = getAutoFillValue(field.autoFill, session)
    } else {
      acc[field.id] = ''
    }
    return acc
  }, {} as T)

  const form = useForm({
    defaultValues: initialValues,
    validatorAdapter: zodValidator,
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await createInspectionMutation.mutateAsync({
          formData: value,
          inspectionType
        })
        options.onSubmitSuccess?.(result)
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Submission failed')
        options.onSubmitError?.(err)
        throw err
      }
    },
  })

  // Auto-save functionality
  useEffect(() => {
    if (!options.enableAutoSave) return

    const interval = setInterval(() => {
      const values = form.state.values
      // Only save if form has been touched and has content
      if (form.state.isTouched && Object.values(values).some(v => v !== '')) {
        saveDraftMutation.mutate({
          inspectionType,
          draftData: values
        })
      }
    }, options.autoSaveInterval || 30000) // Default 30 seconds

    return () => clearInterval(interval)
  }, [form.state.values, form.state.isTouched, options.enableAutoSave, options.autoSaveInterval, inspectionType, saveDraftMutation])

  return {
    form,
    isSubmitting: createInspectionMutation.isPending,
    submitError: createInspectionMutation.error,
    isAutoSaving: saveDraftMutation.isPending,
    autoSaveError: saveDraftMutation.error,
  }
}

// Hook for vault password forms
export function usePasswordForm<T extends Record<string, any>>(
  initialValues?: Partial<T>,
  onSubmit?: (values: T) => Promise<void>
) {
  const passwordSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    username: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
    url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    notes: z.string().optional(),
    category: z.string().optional(),
    folderId: z.string().optional(),
    tags: z.string().optional(),
    expiryDate: z.string().optional(),
  })

  const form = useForm({
    defaultValues: {
      title: '',
      username: '',
      password: '',
      url: '',
      notes: '',
      category: '',
      folderId: '',
      tags: '',
      expiryDate: '',
      ...initialValues,
    } as T,
    validatorAdapter: zodValidator,
    validators: {
      onChange: passwordSchema,
    },
    onSubmit: async ({ value }) => {
      if (onSubmit) {
        await onSubmit(value)
      }
    },
  })

  return form
}

// Hook for folder forms
export function useFolderForm<T extends Record<string, any>>(
  initialValues?: Partial<T>,
  onSubmit?: (values: T) => Promise<void>
) {
  const folderSchema = z.object({
    name: z.string().min(1, 'Folder name is required'),
    description: z.string().optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
  })

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      color: 'blue',
      icon: 'folder',
      ...initialValues,
    } as T,
    validatorAdapter: zodValidator,
    validators: {
      onChange: folderSchema,
    },
    onSubmit: async ({ value }) => {
      if (onSubmit) {
        await onSubmit(value)
      }
    },
  })

  return form
}

// Hook for CRM contact forms
export function useContactForm<T extends Record<string, any>>(
  initialValues?: Partial<T>,
  onSubmit?: (values: T) => Promise<void>
) {
  const contactSchema = z.object({
    firstname: z.string().min(1, 'First name is required'),
    lastname: z.string().min(1, 'Last name is required'),
    emailaddress1: z.string().email('Must be a valid email address').optional().or(z.literal('')),
    telephone1: z.string().optional(),
    jobtitle: z.string().optional(),
    parentcustomerid: z.string().optional(),
    address1_line1: z.string().optional(),
    address1_city: z.string().optional(),
    address1_stateorprovince: z.string().optional(),
    address1_postalcode: z.string().optional(),
  })

  const form = useForm({
    defaultValues: {
      firstname: '',
      lastname: '',
      emailaddress1: '',
      telephone1: '',
      jobtitle: '',
      parentcustomerid: '',
      address1_line1: '',
      address1_city: '',
      address1_stateorprovince: '',
      address1_postalcode: '',
      ...initialValues,
    } as T,
    validatorAdapter: zodValidator,
    validators: {
      onChange: contactSchema,
    },
    onSubmit: async ({ value }) => {
      if (onSubmit) {
        await onSubmit(value)
      }
    },
  })

  return form
}

// Utility functions for form field rendering
export function getFieldError(form: any, fieldName: string): string | undefined {
  const fieldApi = form.getFieldInfo(fieldName)
  return fieldApi?.meta?.errors?.[0]
}

export function isFieldTouched(form: any, fieldName: string): boolean {
  const fieldApi = form.getFieldInfo(fieldName)
  return fieldApi?.meta?.isTouched || false
}

export function isFieldValid(form: any, fieldName: string): boolean {
  const fieldApi = form.getFieldInfo(fieldName)
  return fieldApi?.meta?.errors?.length === 0
}