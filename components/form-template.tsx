"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PurchaseOrderSelector } from "@/components/purchase-order-selector"
import { SalesOrderSelector } from "@/components/sales-order-selector"
import { SalespersonSelector } from "@/components/salesperson-selector"
import { LocationSelector } from "@/components/location-selector"

type FieldType = 
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

type AutoFillType = "datetime" | "inspector"

interface FormField {
  id: string
  label: string
  type: FieldType
  placeholder?: string
  required?: boolean
  autoFill?: AutoFillType
  autoFillFrom?: string
  options?: string[]
}

interface FormTemplateProps {
  title: string
  description: string
  fields: FormField[]
}

export function FormTemplate({ title, description, fields }: FormTemplateProps) {
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState<Record<string, string>>({})

  useEffect(() => {
    const initialData: Record<string, string> = {}
    
    // Get inspector name from session
    const inspectorName = session?.user?.name || ""
    
    fields.forEach(field => {
      if (field.autoFill === "datetime") {
        initialData[field.id] = new Date().toISOString().slice(0, 16)
      } else if (field.autoFill === "inspector") {
        initialData[field.id] = inspectorName
      }
    })
    
    setFormData(prev => ({ ...prev, ...initialData }))
  }, [fields, session?.user?.name])

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const inspectionType = getInspectionTypeFromTitle()
      console.log('Submitting form with data:', { formData, inspectionType })
      
      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          inspectionType
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API Error:', errorData)
        throw new Error(`Failed to submit inspection: ${response.status} - ${errorData.error || errorData.details || 'Unknown error'}`)
      }

      const result = await response.json()
      console.log('Inspection created:', result)
      
      // Show success message
      alert(`✅ Inspection ${result.inspectionNo} saved to Business Central successfully!`)
      
      // Reset form
      setFormData({})
      
    } catch (error) {
      console.error('Error submitting inspection:', error)
      alert('Failed to submit inspection. Please try again.')
    }
  }

  const getInspectionTypeFromTitle = (): string => {
    const inspectionTypeMap: Record<string, string> = {
      '2" Spacer Inspection': '2-IN-SPACER',
      'Assembly Form Inspection': 'ASSEMBLY-FORM',
      'Dixon Work Order Inspection': 'DIXON-WORK-ORDER',
      'Forklift Tire Inspection': 'FORKLIFT-TIRE',
      'Frame Extension Inspection': 'FRAME-EXTENSION',
      'Hub Extension/Fwd Extension Inspection': 'HUB-EXTENSION-FWD',
      'Midroller Inspection': 'MIDROLLER',
      'Service Truck Checklist': 'SERVICE-TRUCK-CHECKLIST',
      'Used Centers Form': 'USED-CENTERS',
      'Used Hardware Form': 'USED-HARDWARE',
      'Used Tire Form': 'USED-TIRE',
      'Used Track Form': 'USED-TRACK',
      'Used Wheel Form': 'USED-WHEEL',
      'Weight Bracket/Wheel Weights': 'WEIGHT-BRACKET-WHEEL'
    }
    
    return inspectionTypeMap[title] || ''
  }

  const renderField = (field: FormField) => {
    // Disable inspector name field when auto-filled from session
    const isInspectorAutoFilled = field.autoFill === "inspector" && !!session?.user?.name
    
    const commonProps = {
      id: field.id,
      required: field.required,
      value: formData[field.id] || "",
      disabled: isInspectorAutoFilled,
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
      
      case "location-lookup":
        return (
          <LocationSelector
            value={formData[field.id]}
            onSelect={(locationCode) => handleInputChange(field.id, locationCode)}
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
      
      case "select":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select 
              value={formData[field.id] || ""} 
              onValueChange={(value) => handleInputChange(field.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
              {isInspectorAutoFilled && <span className="text-muted-foreground ml-1">(auto-filled)</span>}
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