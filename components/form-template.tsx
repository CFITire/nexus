"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SalesOrderSelector } from "@/components/sales-order-selector"
import { PurchaseOrderSelector } from "@/components/purchase-order-selector"
import { SalespersonSelector } from "@/components/salesperson-selector"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface FormTemplateProps {
  title: string
  description?: string
  fields: Array<{
    id: string
    label: string
    type?: "text" | "number" | "email" | "tel" | "textarea" | "select" | "date" | "datetime-local" | "so-lookup" | "po-lookup" | "salesperson-lookup"
    placeholder?: string
    required?: boolean
    options?: string[]
    autoFill?: "inspector" | "datetime"
    autoFillFrom?: string
  }>
}

export function FormTemplate({ title, description, fields }: FormTemplateProps) {
  const { data: session } = useSession()
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const autoFillValues: Record<string, string> = {}
    
    fields.forEach((field) => {
      if (field.autoFill === "inspector" && session?.user?.name) {
        autoFillValues[field.id] = session.user.name
      } else if (field.autoFill === "datetime") {
        const now = new Date()
        const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
        autoFillValues[field.id] = localDateTime.toISOString().slice(0, 16)
      }
    })
    
    setFormValues(autoFillValues)
  }, [fields, session])

  const getFieldValue = (fieldId: string) => {
    return formValues[fieldId] || ""
  }

  const updateFieldValue = (fieldId: string, value: string, relatedData?: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }))
    
    // Handle auto-fill from related data
    if (relatedData) {
      fields.forEach(field => {
        if (field.autoFillFrom === fieldId) {
          // Auto-fill salesperson from sales order
          if (fieldId === 'soNo' && field.id === 'salesperson' && relatedData.salespersonCode) {
            setFormValues(prev => ({
              ...prev,
              [field.id]: relatedData.salespersonCode
            }))
          }
        }
      })
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <form className="space-y-4">
            {fields.map((field) => (
              <div key={field.id} className="space-y-2">
                {field.type === "so-lookup" ? (
                  <SalesOrderSelector
                    value={getFieldValue(field.id)}
                    onSelect={(value, salesOrder) => updateFieldValue(field.id, value, salesOrder)}
                    required={field.required}
                  />
                ) : field.type === "po-lookup" ? (
                  <PurchaseOrderSelector
                    value={getFieldValue(field.id)}
                    onSelect={(value) => updateFieldValue(field.id, value)}
                    required={field.required}
                  />
                ) : field.type === "salesperson-lookup" ? (
                  <SalespersonSelector
                    value={getFieldValue(field.id)}
                    onSelect={(value) => updateFieldValue(field.id, value)}
                    required={field.required}
                  />
                ) : (
                  <>
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {field.type === "textarea" ? (
                      <textarea
                        id={field.id}
                        name={field.id}
                        placeholder={field.placeholder}
                        required={field.required}
                        value={getFieldValue(field.id)}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    ) : field.type === "select" && field.options ? (
                      <Select 
                        name={field.id} 
                        required={field.required} 
                        value={getFieldValue(field.id)}
                        onValueChange={(value) => updateFieldValue(field.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={field.id}
                        name={field.id}
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        required={field.required}
                        value={getFieldValue(field.id)}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
            <Separator className="my-6" />
            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                Submit Inspection
              </Button>
              <Button type="button" variant="outline" className="flex-1">
                Save Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}