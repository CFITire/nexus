"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone, PhoneCall } from 'lucide-react'
import { useRBAC } from '@/hooks/use-rbac'
import { formatPhoneNumber } from '@/lib/freepbx'
import { toast } from 'sonner'

interface ClickToCallProps {
  phoneNumber: string
  contactName?: string
  contactId?: string
  extension?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  onCallInitiated?: (phoneNumber: string, contactId?: string) => void
}

export function ClickToCall({ 
  phoneNumber, 
  contactName, 
  contactId,
  extension = '1001', // Default extension - would come from user profile
  size = 'default',
  variant = 'default',
  onCallInitiated 
}: ClickToCallProps) {
  const { hasPermission } = useRBAC()
  const [isCallInProgress, setIsCallInProgress] = useState(false)
  
  const canMakeCalls = hasPermission('communications', 'create')

  const initiateCall = async () => {
    if (!canMakeCalls || !phoneNumber || isCallInProgress) return

    try {
      setIsCallInProgress(true)
      
      // Clean phone number (remove formatting)
      const cleanNumber = phoneNumber.replace(/\D/g, '')
      
      // Make API call to initiate the call
      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'originate-call',
          from: extension,
          to: cleanNumber,
          context: 'from-internal'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to initiate call')
      }

      const result = await response.json()
      
      // Log call to Dataverse if contactId is provided
      if (contactId) {
        await logCallToDataverse(cleanNumber, contactId, result.result?.callId)
      }

      // Notify parent component
      onCallInitiated?.(phoneNumber, contactId)

      toast.success(`Call initiated to ${contactName || formatPhoneNumber(phoneNumber)}`, {
        description: 'Your phone should ring shortly'
      })

    } catch (error) {
      console.error('Failed to initiate call:', error)
      toast.error('Failed to initiate call', {
        description: 'Please check your phone system connection'
      })
    } finally {
      setIsCallInProgress(false)
    }
  }

  const logCallToDataverse = async (phoneNumber: string, contactId: string, callId?: string) => {
    try {
      // This would integrate with your Dataverse API to log the call activity
      const response = await fetch('/api/dataverse/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activitytype: 'phonecall',
          subject: `Outbound call to ${contactName || phoneNumber}`,
          description: `Call initiated from CFI Nexus to ${formatPhoneNumber(phoneNumber)}`,
          regardingobjectid: contactId,
          regardingobjecttype: 'contact',
          directioncode: false, // Outbound
          phonenumber: phoneNumber,
          actualstart: new Date().toISOString(),
          statecode: 0, // Open
          statuscode: 1, // Open
          nexus_callid: callId
        }),
      })

      if (!response.ok) {
        console.warn('Failed to log call to Dataverse')
      }
    } catch (error) {
      console.warn('Failed to log call to Dataverse:', error)
    }
  }

  if (!canMakeCalls) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <Phone className="h-3 w-3 mr-1" />
        {formatPhoneNumber(phoneNumber)}
      </Badge>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={initiateCall}
      disabled={isCallInProgress || !phoneNumber}
      className="gap-2"
    >
      {isCallInProgress ? (
        <PhoneCall className="h-4 w-4 animate-pulse" />
      ) : (
        <Phone className="h-4 w-4" />
      )}
      {size !== 'sm' && (
        <span>
          {isCallInProgress ? 'Calling...' : 'Call'} {formatPhoneNumber(phoneNumber)}
        </span>
      )}
    </Button>
  )
}

// Compact version for use in tables and lists
export function ClickToCallCompact({ phoneNumber, contactName, contactId, ...props }: ClickToCallProps) {
  return (
    <ClickToCall
      phoneNumber={phoneNumber}
      contactName={contactName}
      contactId={contactId}
      size="sm"
      variant="ghost"
      {...props}
    />
  )
}

// Link version that looks like a phone number link
export function ClickToCallLink({ phoneNumber, contactName, contactId, ...props }: ClickToCallProps) {
  const { hasPermission } = useRBAC()
  const canMakeCalls = hasPermission('communications', 'create')

  if (!canMakeCalls) {
    return (
      <span className="text-muted-foreground">
        {formatPhoneNumber(phoneNumber)}
      </span>
    )
  }

  return (
    <ClickToCall
      phoneNumber={phoneNumber}
      contactName={contactName}
      contactId={contactId}
      variant="ghost"
      size="sm"
      {...props}
    />
  )
}