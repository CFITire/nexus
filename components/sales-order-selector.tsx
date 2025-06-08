"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown } from "lucide-react"

interface SalesOrder {
  number: string
  customerName: string
  orderDate: string
  status: string
  salespersonCode?: string
}

interface SalesOrderSelectorProps {
  value?: string
  onSelect: (soNumber: string, salesOrder?: SalesOrder) => void
  required?: boolean
}

export function SalesOrderSelector({ value, onSelect, required }: SalesOrderSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [displayValue, setDisplayValue] = useState(value || "")
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSelected, setIsSelected] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchSalesOrders = async (searchTerm: string = "") => {
    setLoading(true)
    setError(null)
    
    try {
      const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""
      const response = await fetch(`/api/business-central/sales-orders${params}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch sales orders")
      }
      
      const data = await response.json()
      setSalesOrders(data.salesOrders || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setSalesOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Update display when external value changes
  useEffect(() => {
    setDisplayValue(value || "")
    if (value) {
      setIsSelected(true)
    }
  }, [value])

  // Search as user types
  useEffect(() => {
    if (search && search.trim().length >= 2 && !isSelected) {
      setOpen(true)
      const timeoutId = setTimeout(() => {
        fetchSalesOrders(search)
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setSalesOrders([])
      if (search.trim().length < 2) {
        setOpen(false)
      }
    }
  }, [search, isSelected])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (salesOrder: SalesOrder) => {
    const newDisplayValue = `${salesOrder.number} - ${salesOrder.customerName}`
    setDisplayValue(newDisplayValue)
    setSearch("")
    setIsSelected(true)
    onSelect(salesOrder.number, salesOrder)
    setOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setDisplayValue(newValue)
    setSearch(newValue)
    setIsSelected(false)
  }

  const handleInputFocus = () => {
    if (!isSelected && search.trim().length >= 2) {
      setOpen(true)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="so-selector">
        SO No.
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative" ref={dropdownRef}>
        <Input
          ref={inputRef}
          id="so-selector"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Type to search sales orders..."
          className="w-full"
        />
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        
        {open && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {loading && (
              <div className="p-3 text-center text-muted-foreground text-sm">
                Loading sales orders...
              </div>
            )}
            
            {error && (
              <div className="p-3 text-center text-destructive text-sm">
                Error: {error}
              </div>
            )}
            
            {!loading && !error && salesOrders.length === 0 && search.trim().length >= 2 && (
              <div className="p-3 text-center text-muted-foreground text-sm">
                No sales orders found
              </div>
            )}
            
            {!loading && !error && salesOrders.length > 0 && (
              <div className="py-1">
                {salesOrders.map((order, index) => (
                  <button
                    key={`${order.number}-${order.customerName}-${index}`}
                    className="w-full text-left px-3 py-2 hover:bg-accent focus:bg-accent focus:outline-none"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSelect(order)
                    }}
                  >
                    <div className="font-medium">{order.number}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.customerName} • {formatDate(order.orderDate)} • {order.status}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}