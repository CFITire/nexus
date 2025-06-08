"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Search } from "lucide-react"

interface Location {
  code: string
  name: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
}

interface LocationSelectorProps {
  value?: string
  onSelect: (locationCode: string, location: Location) => void
  required?: boolean
}

export function LocationSelector({ value, onSelect, required = false }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  // Find the selected location details when value changes
  useEffect(() => {
    if (value && locations.length > 0) {
      const location = locations.find(loc => loc.code === value)
      setSelectedLocation(location || null)
    } else {
      setSelectedLocation(null)
    }
  }, [value, locations])

  const searchLocations = async (search: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/business-central/locations?search=${encodeURIComponent(search)}`)
      const data = await response.json()
      setLocations(data.locations || [])
    } catch (error) {
      console.error('Error fetching locations:', error)
      setLocations([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      searchLocations(searchTerm)
    }
  }, [searchTerm, isOpen])

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setIsOpen(false)
    setSearchTerm("")
    onSelect(location.code, location)
  }

  const handleClear = () => {
    setSelectedLocation(null)
    onSelect("", {} as Location)
  }

  return (
    <div className="relative">
      <Label htmlFor="location">
        Location {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="flex gap-2 mt-1">
        <Input
          id="location"
          value={selectedLocation ? `${selectedLocation.code} - ${selectedLocation.name}` : value || ""}
          placeholder="Click to select location"
          readOnly
          onClick={() => setIsOpen(true)}
          className="cursor-pointer"
          required={required}
        />
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => setIsOpen(true)}
        >
          <MapPin className="h-4 w-4" />
        </Button>
        {selectedLocation && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleClear}
          >
            Clear
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1">
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">
                  Searching locations...
                </div>
              ) : locations.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  {searchTerm ? `No locations found for "${searchTerm}"` : "No locations available"}
                </div>
              ) : (
                locations.map((location) => (
                  <div
                    key={location.code}
                    className="p-2 hover:bg-gray-100 cursor-pointer rounded border-b last:border-b-0"
                    onClick={() => handleLocationSelect(location)}
                  >
                    <div className="font-medium text-sm">
                      {location.code} - {location.name}
                    </div>
                    {location.address && (
                      <div className="text-xs text-gray-500 mt-1">
                        {location.address}
                        {location.city && `, ${location.city}`}
                        {location.state && `, ${location.state}`}
                        {location.zipCode && ` ${location.zipCode}`}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}