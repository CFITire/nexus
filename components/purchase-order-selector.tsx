"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown } from "lucide-react"

interface PurchaseOrder {
  number: string
  vendorName: string
  documentDate: string
  status: string
}

interface PurchaseOrderSelectorProps {
  value?: string
  onSelect: (poNumber: string) => void
  required?: boolean
}

export function PurchaseOrderSelector({ value, onSelect, required }: PurchaseOrderSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [displayValue, setDisplayValue] = useState(value || "")
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSelected, setIsSelected] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchPurchaseOrders = async (searchTerm: string = "") => {
    setLoading(true)
    setError(null)
    
    try {
      const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""
      const response = await fetch(`/api/business-central/purchase-orders${params}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch purchase orders")
      }
      
      const data = await response.json()
      setPurchaseOrders(data.purchaseOrders || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setPurchaseOrders([])
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
        fetchPurchaseOrders(search)
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setPurchaseOrders([])
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

  const handleSelect = (poNumber: string, vendorName: string) => {
    const newDisplayValue = `${poNumber} - ${vendorName}`
    setDisplayValue(newDisplayValue)
    setSearch("")
    setIsSelected(true)
    onSelect(poNumber)
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
      <Label htmlFor="po-selector">
        PO No.
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative" ref={dropdownRef}>
        <Input
          ref={inputRef}
          id="po-selector"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Type to search purchase orders..."
          className="w-full"
        />
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        
        {open && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {loading && (
              <div className="p-3 text-center text-muted-foreground text-sm">
                Loading purchase orders...
              </div>
            )}
            
            {error && (
              <div className="p-3 text-center text-destructive text-sm">
                Error: {error}
              </div>
            )}
            
            {!loading && !error && purchaseOrders.length === 0 && search.trim().length >= 2 && (
              <div className="p-3 text-center text-muted-foreground text-sm">
                No purchase orders found
              </div>
            )}
            
            {!loading && !error && purchaseOrders.length > 0 && (
              <div className="py-1">
                {purchaseOrders.map((order, index) => (
                  <button
                    key={`${order.number}-${order.vendorName}-${index}`}
                    className="w-full text-left px-3 py-2 hover:bg-accent focus:bg-accent focus:outline-none"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSelect(order.number, order.vendorName)
                    }}
                  >
                    <div className="font-medium">{order.number}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.vendorName} • {formatDate(order.documentDate)} • {order.status}
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