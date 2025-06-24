import { Suspense } from 'react';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SalesDetailContent } from '@/components/sales-detail-content';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

interface Props {
  params: {
    customerNo: string;
  };
}

export default function CustomerSalesPage({ params }: Props) {
  const customerNo = decodeURIComponent(params.customerNo);

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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/sales">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Summary
                </Link>
              </Button>
            </div>
            
            <h1 className="text-3xl font-bold">Sales Details</h1>
            <p className="text-muted-foreground mt-2">
              Invoice line details for customer: <span className="font-medium">{customerNo}</span>
            </p>
          </div>
          
          <Suspense fallback={<div className="flex items-center justify-center h-96">Loading...</div>}>
            <SalesDetailContent customerNo={customerNo} />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}