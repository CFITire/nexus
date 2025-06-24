import { AppSidebar } from "@/components/app-sidebar"
import { CommunicationsContent } from '@/components/communications-content'
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function CommunicationsPage() {
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
        <CommunicationsContent />
      </SidebarInset>
    </SidebarProvider>
  )
}