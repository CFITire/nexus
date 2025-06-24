'use client'

import { ReactNode, useState } from 'react'
import { Button } from "@/components/ui/button"
import { IconEye, IconEyeOff } from "@tabler/icons-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface BaseFieldProps {
  label: string
  required?: boolean
  error?: string
  isTouched?: boolean
  className?: string
  icon?: ReactNode
  description?: string
}

interface TextFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'tel' | 'url' | 'password' | 'number'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
}

interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  rows?: number
  disabled?: boolean
}

interface SelectFieldProps extends BaseFieldProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  options: { value: string; label: string }[]
  disabled?: boolean
}

interface CheckboxFieldProps extends BaseFieldProps {
  checked: boolean
  onChange: (checked: boolean) => void
  onBlur?: () => void
  disabled?: boolean
}

// Base Field Wrapper
function FieldWrapper({ 
  label, 
  required, 
  error, 
  isTouched, 
  className, 
  icon, 
  description, 
  children 
}: BaseFieldProps & { children: ReactNode }) {
  const hasError = error && isTouched

  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        className={cn(
          "flex items-center gap-2",
          required && "after:content-['*'] after:ml-0.5 after:text-destructive",
          hasError && "text-destructive"
        )}
      >
        {icon}
        {label}
      </Label>
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {children}
      
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
}

// Text Input Field
export function TextField({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  error,
  isTouched,
  ...props
}: TextFieldProps) {
  const hasError = error && isTouched

  return (
    <FieldWrapper error={error} isTouched={isTouched} {...props}>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
      />
    </FieldWrapper>
  )
}

// Textarea Field
export function TextareaField({
  placeholder,
  value,
  onChange,
  onBlur,
  rows = 3,
  disabled = false,
  error,
  isTouched,
  ...props
}: TextareaFieldProps) {
  const hasError = error && isTouched

  return (
    <FieldWrapper error={error} isTouched={isTouched} {...props}>
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        rows={rows}
        className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
      />
    </FieldWrapper>
  )
}

// Select Field
export function SelectField({
  placeholder,
  value,
  onChange,
  onBlur,
  options,
  disabled = false,
  error,
  isTouched,
  ...props
}: SelectFieldProps) {
  const hasError = error && isTouched

  return (
    <FieldWrapper error={error} isTouched={isTouched} {...props}>
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className={cn(hasError && "border-destructive")}>
          <SelectValue placeholder={placeholder || `Select ${props.label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  )
}

// Checkbox Field
export function CheckboxField({
  checked,
  onChange,
  onBlur,
  disabled = false,
  error,
  isTouched,
  ...props
}: CheckboxFieldProps) {
  return (
    <FieldWrapper error={error} isTouched={isTouched} {...props}>
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={checked}
          onCheckedChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
        />
        <span className="text-sm">{props.label}</span>
      </div>
    </FieldWrapper>
  )
}

// Password Field with Show/Hide Toggle
export function PasswordField({
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  error,
  isTouched,
  showToggle = true,
  ...props
}: TextFieldProps & { showToggle?: boolean }) {
  const [showPassword, setShowPassword] = useState(false)
  const hasError = error && isTouched

  return (
    <FieldWrapper error={error} isTouched={isTouched} {...props}>
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(
            hasError && "border-destructive focus-visible:ring-destructive",
            showToggle && "pr-10"
          )}
        />
        {showToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
          >
            {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </FieldWrapper>
  )
}

// Form Section Wrapper
export function FormSection({ 
  title, 
  description, 
  icon, 
  children, 
  className 
}: {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h3 className="text-lg font-medium flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

// Form Actions Bar
export function FormActions({ 
  children, 
  className 
}: { 
  children: ReactNode
  className?: string 
}) {
  return (
    <div className={cn("flex items-center justify-end gap-4 pt-6 border-t", className)}>
      {children}
    </div>
  )
}