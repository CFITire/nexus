"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { useCreateContact, useUpdateContact } from "@/hooks/use-crm"
import { AlertCircle, Loader2, User, Mail, Phone, MapPin, Building } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContactFormProps {
  initialData?: any
  mode?: 'create' | 'edit'
  onSuccess?: (contact: any) => void
  onCancel?: () => void
}

// Contact validation schema
const contactSchema = z.object({
  firstname: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastname: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  emailaddress1: z.string()
    .email('Must be a valid email address')
    .optional()
    .or(z.literal('')),
  telephone1: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Must be a valid phone number')
    .optional()
    .or(z.literal('')),
  jobtitle: z.string().max(100, 'Job title too long').optional(),
  parentcustomerid: z.string().optional(),
  address1_line1: z.string().max(200, 'Address too long').optional(),
  address1_city: z.string().max(100, 'City name too long').optional(),
  address1_stateorprovince: z.string().max(50, 'State/Province too long').optional(),
  address1_postalcode: z.string()
    .regex(/^[A-Za-z0-9\s\-]+$/, 'Invalid postal code format')
    .optional()
    .or(z.literal('')),
  description: z.string().max(1000, 'Description too long').optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactFormTanStack({ 
  initialData, 
  mode = 'create', 
  onSuccess, 
  onCancel 
}: ContactFormProps) {
  const createContactMutation = useCreateContact()
  const updateContactMutation = useUpdateContact()
  
  const isEdit = mode === 'edit'
  const mutation = isEdit ? updateContactMutation : createContactMutation

  const form = useForm({
    defaultValues: {
      firstname: initialData?.firstname || '',
      lastname: initialData?.lastname || '',
      emailaddress1: initialData?.emailaddress1 || '',
      telephone1: initialData?.telephone1 || '',
      jobtitle: initialData?.jobtitle || '',
      parentcustomerid: initialData?.parentcustomerid || '',
      address1_line1: initialData?.address1_line1 || '',
      address1_city: initialData?.address1_city || '',
      address1_stateorprovince: initialData?.address1_stateorprovince || '',
      address1_postalcode: initialData?.address1_postalcode || '',
      description: initialData?.description || '',
    } as ContactFormData,
    validatorAdapter: zodValidator,
    validators: {
      onChange: contactSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        let result
        if (isEdit) {
          result = await updateContactMutation.mutateAsync({
            contactId: initialData.contactid,
            contactData: value
          })
        } else {
          result = await createContactMutation.mutateAsync(value)
        }
        
        onSuccess?.(result)
        
        // Reset form if creating new contact
        if (!isEdit) {
          form.reset()
        }
      } catch (error) {
        console.error('Failed to save contact:', error)
        // Error is handled by the mutation
      }
    },
  })

  const getFieldError = (fieldName: keyof ContactFormData) => {
    const fieldInfo = form.getFieldInfo(fieldName)
    return fieldInfo?.meta?.errors?.[0]
  }

  const isFieldTouched = (fieldName: keyof ContactFormData) => {
    const fieldInfo = form.getFieldInfo(fieldName)
    return fieldInfo?.meta?.isTouched || false
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {isEdit ? 'Edit Contact' : 'Add New Contact'}
        </CardTitle>
        <CardDescription>
          {isEdit 
            ? 'Update contact information in your CRM.'
            : 'Create a new contact entry in your CRM system.'
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
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <form.Field
                name="firstname"
                children={(field) => {
                  const error = getFieldError('firstname')
                  const isTouched = isFieldTouched('firstname')
                  const hasError = error && isTouched
                  
                  return (
                    <div className="space-y-2">
                      <Label htmlFor="firstname" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                        First Name
                      </Label>
                      <Input
                        id="firstname"
                        placeholder="Enter first name"
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

              {/* Last Name */}
              <form.Field
                name="lastname"
                children={(field) => {
                  const error = getFieldError('lastname')
                  const isTouched = isFieldTouched('lastname')
                  const hasError = error && isTouched
                  
                  return (
                    <div className="space-y-2">
                      <Label htmlFor="lastname" className="after:content-['*'] after:ml-0.5 after:text-destructive">
                        Last Name
                      </Label>
                      <Input
                        id="lastname"
                        placeholder="Enter last name"
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
            </div>

            {/* Job Title */}
            <form.Field
              name="jobtitle"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor="jobtitle">Job Title</Label>
                  <Input
                    id="jobtitle"
                    placeholder="Enter job title"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            />
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <form.Field
                name="emailaddress1"
                children={(field) => {
                  const error = getFieldError('emailaddress1')
                  const isTouched = isFieldTouched('emailaddress1')
                  const hasError = error && isTouched
                  
                  return (
                    <div className="space-y-2">
                      <Label htmlFor="emailaddress1" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </Label>
                      <Input
                        id="emailaddress1"
                        type="email"
                        placeholder="Enter email address"
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

              {/* Phone */}
              <form.Field
                name="telephone1"
                children={(field) => {
                  const error = getFieldError('telephone1')
                  const isTouched = isFieldTouched('telephone1')
                  const hasError = error && isTouched
                  
                  return (
                    <div className="space-y-2">
                      <Label htmlFor="telephone1" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      <Input
                        id="telephone1"
                        type="tel"
                        placeholder="Enter phone number"
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
            </div>
          </div>

          {/* Address Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address Information
            </h3>
            
            {/* Address Line 1 */}
            <form.Field
              name="address1_line1"
              children={(field) => {
                const error = getFieldError('address1_line1')
                const isTouched = isFieldTouched('address1_line1')
                const hasError = error && isTouched
                
                return (
                  <div className="space-y-2">
                    <Label htmlFor="address1_line1">Street Address</Label>
                    <Input
                      id="address1_line1"
                      placeholder="Enter street address"
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City */}
              <form.Field
                name="address1_city"
                children={(field) => {
                  const error = getFieldError('address1_city')
                  const isTouched = isFieldTouched('address1_city')
                  const hasError = error && isTouched
                  
                  return (
                    <div className="space-y-2">
                      <Label htmlFor="address1_city">City</Label>
                      <Input
                        id="address1_city"
                        placeholder="Enter city"
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

              {/* State/Province */}
              <form.Field
                name="address1_stateorprovince"
                children={(field) => {
                  const error = getFieldError('address1_stateorprovince')
                  const isTouched = isFieldTouched('address1_stateorprovince')
                  const hasError = error && isTouched
                  
                  return (
                    <div className="space-y-2">
                      <Label htmlFor="address1_stateorprovince">State/Province</Label>
                      <Input
                        id="address1_stateorprovince"
                        placeholder="Enter state/province"
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

              {/* Postal Code */}
              <form.Field
                name="address1_postalcode"
                children={(field) => {
                  const error = getFieldError('address1_postalcode')
                  const isTouched = isFieldTouched('address1_postalcode')
                  const hasError = error && isTouched
                  
                  return (
                    <div className="space-y-2">
                      <Label htmlFor="address1_postalcode">Postal Code</Label>
                      <Input
                        id="address1_postalcode"
                        placeholder="Enter postal code"
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
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Information</h3>
            
            <form.Field
              name="description"
              children={(field) => {
                const error = getFieldError('description')
                const isTouched = isFieldTouched('description')
                const hasError = error && isTouched
                
                return (
                  <div className="space-y-2">
                    <Label htmlFor="description">Description / Notes</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter additional notes about this contact..."
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
          </div>

          {/* Global Form Error */}
          {mutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to {isEdit ? 'update' : 'create'} contact: {mutation.error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline"
                onClick={onCancel}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
            )}

            <Button 
              type="button" 
              variant="outline"
              onClick={() => form.reset()}
              disabled={mutation.isPending || !form.state.isTouched}
            >
              Reset
            </Button>

            <Button 
              type="submit" 
              disabled={mutation.isPending || !form.state.isValid}
              className="min-w-[120px]"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEdit ? 'Update Contact' : 'Create Contact'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}