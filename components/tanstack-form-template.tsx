'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { PurchaseOrderSelector } from "@/components/purchase-order-selector"
import { SalesOrderSelector } from "@/components/sales-order-selector"
import { SalespersonSelector } from "@/components/salesperson-selector"
import { LocationSelector } from "@/components/location-selector"
import { useInspectionForm, type FormField, getFieldError, isFieldTouched } from "@/hooks/use-form-helpers"
import { Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TanStackFormTemplateProps {
  title: string
  description: string
  fields: FormField[]
  inspectionType: string
  enableAutoSave?: boolean
  autoSaveInterval?: number
}

export function TanStackFormTemplate({ 
  title, 
  description, 
  fields, 
  inspectionType,
  enableAutoSave = true,
  autoSaveInterval = 30000
}: TanStackFormTemplateProps) {
  const { 
    form, 
    isSubmitting, 
    submitError, 
    isAutoSaving, 
    autoSaveError 
  } = useInspectionForm(fields, inspectionType, {
    enableAutoSave,
    autoSaveInterval,
    onSubmitSuccess: (data) => {
      console.log(`${inspectionType} inspection submitted successfully:`, data)
    },
    onSubmitError: (error) => {
      console.error(`${inspectionType} inspection submission failed:`, error)
    }
  })

  const renderField = (field: FormField) => {
    return (
      <form.Field
        key={field.id}
        name={field.id}
        children={(fieldApi) => {
          const error = getFieldError(form, field.id)
          const isTouched = isFieldTouched(form, field.id)
          const hasError = error && isTouched

          return (
            <div className="space-y-2">
              <Label 
                htmlFor={field.id}
                className={cn(
                  field.required && "after:content-['*'] after:ml-0.5 after:text-destructive",
                  hasError && "text-destructive"
                )}
              >
                {field.label}
              </Label>
              
              {renderFieldInput(field, fieldApi, hasError)}
              
              {hasError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )
        }}
      />
    )
  }

  const renderFieldInput = (field: FormField, fieldApi: any, hasError?: boolean) => {
    const baseProps = {
      id: field.id,
      placeholder: field.placeholder,
      value: fieldApi.state.value || '',
      onChange: (e: any) => fieldApi.handleChange(e.target?.value || e),
      onBlur: fieldApi.handleBlur,
      className: cn(hasError && "border-destructive focus-visible:ring-destructive"),
    }

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...baseProps}
            rows={3}
          />
        )

      case 'select':
        return (
          <Select 
            value={fieldApi.state.value || ''} 
            onValueChange={fieldApi.handleChange}
          >
            <SelectTrigger className={cn(hasError && "border-destructive")}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'so-lookup':
        return (
          <SalesOrderSelector
            value={fieldApi.state.value || ''}
            onSelect={fieldApi.handleChange}
            onSalespersonSelect={(salesperson) => {
              // Auto-fill salesperson field if it exists
              const salespersonField = fields.find(f => f.autoFillFrom === 'soNo')
              if (salespersonField) {
                form.setFieldValue(salespersonField.id, salesperson)
              }
            }}
            className={cn(hasError && "border-destructive")}
          />
        )

      case 'po-lookup':
        return (
          <PurchaseOrderSelector
            value={fieldApi.state.value || ''}
            onSelect={fieldApi.handleChange}
            className={cn(hasError && "border-destructive")}
          />
        )

      case 'salesperson-lookup':
        return (
          <SalespersonSelector
            value={fieldApi.state.value || ''}
            onSelect={fieldApi.handleChange}
            className={cn(hasError && "border-destructive")}
          />
        )

      case 'location-lookup':
        return (
          <LocationSelector
            value={fieldApi.state.value || ''}
            onSelect={fieldApi.handleChange}
            className={cn(hasError && "border-destructive")}
          />
        )

      default:
        return (
          <Input
            {...baseProps}
            type={field.type}
          />
        )
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          {/* Auto-save status indicator */}
          {enableAutoSave && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isAutoSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving draft...
                </>
              ) : form.state.isTouched ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Draft saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Auto-save enabled
                </>
              )}
            </div>
          )}
        </div>

        {/* Auto-save error */}
        {autoSaveError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to auto-save draft: {autoSaveError.message}
            </AlertDescription>
          </Alert>
        )}
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
          {/* Render form fields in a grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map(renderField)}
          </div>

          {/* Global form error */}
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to submit form: {submitError.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Form actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <div className="flex-1">
              {form.state.isValidating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating form...
                </div>
              )}
            </div>

            <Button 
              type="button" 
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting || !form.state.isTouched}
            >
              Reset
            </Button>

            <Button 
              type="submit" 
              disabled={isSubmitting || !form.state.isValid || !form.state.isTouched}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </div>

          {/* Form state debug info (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 p-4 bg-muted rounded-lg">
              <summary className="cursor-pointer text-sm font-medium">
                Form State Debug
              </summary>
              <pre className="mt-2 text-xs overflow-auto">
                {JSON.stringify(
                  {
                    values: form.state.values,
                    errors: form.state.errors,
                    isValid: form.state.isValid,
                    isTouched: form.state.isTouched,
                    isValidating: form.state.isValidating,
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

// Loading state component for when form is being initialized
export function FormTemplateLoading() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-4 pt-6 border-t mt-6">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}