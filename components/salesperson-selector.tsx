"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown } from "lucide-react"

interface Salesperson {
  code: string
  name: string
}

interface SalespersonSelectorProps {
  value?: string
  onSelect: (salespersonCode: string) => void
  required?: boolean
}

export function SalespersonSelector({ value, onSelect, required }: SalespersonSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [displayValue, setDisplayValue] = useState(value || "")
  const [salespersons, setSalespersons] = useState<Salesperson[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSelected, setIsSelected] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchSalespersons = async (searchTerm: string = "") => {
    setLoading(true)
    setError(null)
    
    try {
      const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""
      const response = await fetch(`/api/business-central/salespersons${params}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch salespersons")
      }
      
      const data = await response.json()
      setSalespersons(data.salespersons || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setSalespersons([])
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
        fetchSalespersons(search)
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setSalespersons([])
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

  const handleSelect = (salespersonCode: string) => {
    setDisplayValue(salespersonCode)
    setSearch("")
    setIsSelected(true)
    onSelect(salespersonCode)
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

  return (
    <div className="space-y-2">
      <Label htmlFor="salesperson-selector">
        Salesperson
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative" ref={dropdownRef}>
        <Input
          ref={inputRef}
          id="salesperson-selector"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Type to search salespersons..."
          className="w-full"
        />
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        
        {open && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {loading && (
              <div className="p-3 text-center text-muted-foreground text-sm">
                Loading salespersons...
              </div>
            )}
            
            {error && (
              <div className="p-3 text-center text-destructive text-sm">
                Error: {error}
              </div>
            )}
            
            {!loading && !error && salespersons.length === 0 && search.trim().length >= 2 && (
              <div className="p-3 text-center text-muted-foreground text-sm">
                No salespersons found
              </div>
            )}
            
            {!loading && !error && salespersons.length > 0 && (
              <div className="py-1">
                {salespersons.map((salesperson, index) => (
                  <button
                    key={`${salesperson.code}-${index}`}
                    className="w-full text-left px-3 py-2 hover:bg-accent focus:bg-accent focus:outline-none"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSelect(salesperson.code)
                    }}
                  >
                    <div className="font-medium">{salesperson.code}</div>
                    {salesperson.name !== salesperson.code && (
                      <div className="text-sm text-muted-foreground">
                        {salesperson.name}
                      </div>
                    )}
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