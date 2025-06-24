"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { WebRTCPhone } from '@/components/webrtc-phone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PhonePage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">WebRTC Phone</h1>
              <p className="text-muted-foreground">
                Make and receive calls directly from your browser
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <WebRTCPhone 
                extension="1001" // This would come from user profile/settings
                onCallStateChange={(state) => {
                  console.log('Call state changed:', state)
                }}
                onIncomingCall={(callerInfo) => {
                  console.log('Incoming call from:', callerInfo)
                  // Could show a notification here
                }}
              />
            </div>
            
            <div className="md:col-span-1 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Dial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Internal Extensions</h4>
                      <div className="space-y-1">
                        <button className="w-full text-left p-2 hover:bg-accent rounded">
                          1001 - John Smith
                        </button>
                        <button className="w-full text-left p-2 hover:bg-accent rounded">
                          1002 - Sarah Johnson
                        </button>
                        <button className="w-full text-left p-2 hover:bg-accent rounded">
                          1003 - Mike Wilson
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Frequently Called</h4>
                      <div className="space-y-1">
                        <button className="w-full text-left p-2 hover:bg-accent rounded">
                          (555) 123-4567 - Main Office
                        </button>
                        <button className="w-full text-left p-2 hover:bg-accent rounded">
                          (555) 987-6543 - Support
                        </button>
                        <button className="w-full text-left p-2 hover:bg-accent rounded">
                          (555) 456-7890 - Emergency
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}