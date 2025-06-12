"use client"

import { useImpersonation } from "@/hooks/use-impersonation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconAlertTriangle, IconUserX, IconExternalLink } from "@tabler/icons-react"

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedUser, endImpersonation } = useImpersonation()

  if (!isImpersonating || !impersonatedUser) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white p-3 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconAlertTriangle className="h-5 w-5" />
          <div>
            <span className="font-medium">
              Impersonating: {impersonatedUser.name}
            </span>
            <div className="text-xs opacity-90">
              {impersonatedUser.email} • Opened from admin window
            </div>
          </div>
          <Badge className="bg-orange-600 text-white flex items-center gap-1">
            <IconExternalLink className="h-3 w-3" />
            Impersonation Window
          </Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={endImpersonation}
          className="border-white text-white hover:bg-white hover:text-orange-500"
        >
          <IconUserX className="h-4 w-4 mr-1" />
          Close Window
        </Button>
      </div>
    </div>
  )
}