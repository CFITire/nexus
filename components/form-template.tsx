"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PurchaseOrderSelector } from "@/components/purchase-order-selector"
import { SalesOrderSelector } from "@/components/sales-order-selector"
import { SalespersonSelector } from "@/components/salesperson-selector"

type FieldType = 
  | "text" 
  | "number" 
  | "textarea" 
  | "datetime-local" 
  | "tel"
  | "so-lookup"
  | "po-lookup" 
  | "salesperson-lookup"

type AutoFillType = "datetime" | "inspector"

interface FormField {
  id: string
  label: string
  type: FieldType
  placeholder?: string
  required?: boolean
  autoFill?: AutoFillType
  autoFillFrom?: string
}

interface FormTemplateProps {
  title: string
  description: string
  fields: FormField[]
}

export function FormTemplate({ title, description, fields }: FormTemplateProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [inspectorName, setInspectorName] = useState("")

  useEffect(() => {
    const initialData: Record<string, string> = {}
    
    fields.forEach(field => {
      if (field.autoFill === "datetime") {
        initialData[field.id] = new Date().toISOString().slice(0, 16)
      } else if (field.autoFill === "inspector") {
        initialData[field.id] = inspectorName
      }
    })
    
    setFormData(initialData)
  }, [fields, inspectorName])

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    
    if (fieldId === "inspectorName") {
      setInspectorName(value)
    }
    
    // Handle auto-fill from SO number
    const field = fields.find(f => f.id === fieldId)
    if (field?.id === "soNo") {
      // Auto-fill salesperson when SO is selected
      const salespersonField = fields.find(f => f.autoFillFrom === "soNo")
      if (salespersonField) {
        // This would be populated by the SalesOrderSelector component
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Handle form submission
  }

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.id,
      required: field.required,
      value: formData[field.id] || "",
    }

    switch (field.type) {
      case "so-lookup":
        return (
          <SalesOrderSelector
            value={formData[field.id]}
            onSelect={(soNumber, salesOrder) => {
              handleInputChange(field.id, soNumber)
              // Auto-fill salesperson if there's a salesperson field
              const salespersonField = fields.find(f => f.autoFillFrom === "soNo")
              if (salespersonField && salesOrder?.salespersonCode) {
                handleInputChange(salespersonField.id, salesOrder.salespersonCode)
              }
            }}
            required={field.required}
          />
        )
      
      case "po-lookup":
        return (
          <PurchaseOrderSelector
            value={formData[field.id]}
            onSelect={(poNumber) => handleInputChange(field.id, poNumber)}
            required={field.required}
          />
        )
      
      case "salesperson-lookup":
        return (
          <SalespersonSelector
            value={formData[field.id]}
            onSelect={(salesperson) => handleInputChange(field.id, salesperson)}
            required={field.required}
          />
        )
      
      case "textarea":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <textarea
              {...commonProps}
              placeholder={field.placeholder}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        )
      
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              {...commonProps}
              type={field.type}
              placeholder={field.placeholder}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
            />
          </div>
        )
    }
  }

  return (
    <div className="w-full p-4 sm:p-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="w-full">
                  {renderField(field)}
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-6">
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Submit Inspection
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}