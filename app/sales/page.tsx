import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { LightdashDashboardTabs } from '@/components/lightdash-dashboard';
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function SalesPage() {
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
          <LightdashDashboardTabs />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}