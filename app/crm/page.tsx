"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useRBAC } from "@/hooks/use-rbac"
import { CrmDashboardContent } from "@/components/crm-dashboard-content"
import { CrmChannelsContent } from "@/components/crm-channels-content"
import { CrmMappingContent } from "@/components/crm-mapping-content"
import { CrmSegmentationContent } from "@/components/crm-segmentation-content"
import { CrmTerritoryContent } from "@/components/crm-territory-content"
import { CrmReportsContent } from "@/components/crm-reports-content"

export default function CrmPage() {
  const { hasModuleAccess, loading } = useRBAC()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !hasModuleAccess('crm')) {
      router.push('/dashboard')
    }
  }, [hasModuleAccess, loading, router])

  if (loading) {
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
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!hasModuleAccess('crm')) {
    return null // Will redirect to dashboard
  }

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
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Customer Relationship Management</h2>
          </div>
          
          <Tabs defaultValue="dashboard" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="territories">Territories</TabsTrigger>
              <TabsTrigger value="segments">Segments</TabsTrigger>
              <TabsTrigger value="mapping">Mapping & Routing</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <CrmDashboardContent />
            </TabsContent>
            
            <TabsContent value="channels">
              <CrmChannelsContent />
            </TabsContent>
            
            <TabsContent value="territories">
              <CrmTerritoryContent />
            </TabsContent>
            
            <TabsContent value="segments">
              <CrmSegmentationContent />
            </TabsContent>
            
            <TabsContent value="mapping">
              <CrmMappingContent />
            </TabsContent>
            
            <TabsContent value="reports">
              <CrmReportsContent />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}