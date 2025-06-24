"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconClipboardCheck,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconListDetails,
  IconLock,
  IconSearch,
  IconSettings,
  IconUsers,
  IconTruck,
  IconUsersGroup,
  IconBuilding,
  IconUserHeart,
  IconTarget,
  IconPhone,
  IconPhoneCall,
  IconHistory,
} from "@tabler/icons-react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { useRBAC } from "@/hooks/use-rbac"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Lifecycle",
      url: "/lifecycle",
      icon: IconListDetails,
    },
    {
      title: "Team",
      url: "/team",
      icon: IconUsers,
    },
    {
      title: "Shipments",
      url: "/shipments",
      icon: IconTruck,
    },
  ],
  navClouds: [
    {
      title: "Inspections",
      icon: IconClipboardCheck,
      isActive: true,
      url: "#",
      items: [
        {
          title: "2\" Spacer",
          url: "/inspections/2-inch-spacer",
        },
        {
          title: "Assembly",
          url: "/inspections/assembly-form",
        },
        {
          title: "Dixon Work Order",
          url: "/inspections/dixon-work-order",
        },
        {
          title: "Forklift Tire",
          url: "/inspections/forklift-tire",
        },
        {
          title: "Frame Extension",
          url: "/inspections/frame-extension",
        },
        {
          title: "Hub Extension & FWD Extension",
          url: "/inspections/hub-extension-fwd-extension",
        },
        {
          title: "Midroller",
          url: "/inspections/midroller",
        },
        {
          title: "Service Truck Checklist",
          url: "/inspections/service-truck-checklist",
        },
        {
          title: "Used Centers",
          url: "/inspections/used-centers-form",
        },
        {
          title: "Used Hardware",
          url: "/inspections/used-hardware-form",
        },
        {
          title: "Used Tire",
          url: "/inspections/used-tire-form",
        },
        {
          title: "Used Track",
          url: "/inspections/used-track-form",
        },
        {
          title: "Used Wheel",
          url: "/inspections/used-wheel-form",
        },
        {
          title: "Weight Bracket / Wheel Weights",
          url: "/inspections/weight-bracket-wheel-weights",
        },
      ],
    },
    {
      title: "Capture",
      icon: IconCamera,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navApps: [
    {
      title: "Analytics",
      icon: IconChartBar,
      items: [
        {
          title: "Dashboard",
          url: "/analytics",
          icon: IconDashboard,
        },
        {
          title: "Sales Reports",
          url: "/sales",
          icon: IconChartBar,
        },
      ],
    },
    {
      title: "COMs",
      icon: IconPhone,
      items: [
        {
          title: "Dashboard",
          url: "/communications",
          icon: IconDashboard,
        },
        {
          title: "Phone",
          url: "/communications/phone",
          icon: IconPhoneCall,
        },
        {
          title: "Call History",
          url: "/communications/history",
          icon: IconHistory,
        },
      ],
    },
    {
      title: "CRM",
      icon: IconUsersGroup,
      items: [
        {
          title: "Dashboard",
          url: "/crm",
          icon: IconDashboard,
        },
        {
          title: "Accounts",
          url: "/crm/accounts",
          icon: IconBuilding,
        },
        {
          title: "Contacts",
          url: "/crm/contacts", 
          icon: IconUserHeart,
        },
        {
          title: "Leads",
          url: "/crm/leads",
          icon: IconTarget,
        },
      ],
    },
    {
      title: "Vault",
      url: "/vault",
      icon: IconLock,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { hasModuleAccess } = useRBAC()

  // Filter main navigation based on permissions
  const filteredNavMain = data.navMain.filter(item => {
    if (item.title === "Shipments") {
      return hasModuleAccess('shipments') || hasModuleAccess('analytics') || hasModuleAccess('admin')
    }
    return true // Other nav items are shown by default
  })

  // Filter apps based on permissions
  const filteredApps = data.navApps.filter(app => {
    if (app.title === "Vault") {
      return hasModuleAccess('vault')
    }
    if (app.title === "Analytics") {
      return hasModuleAccess('analytics') || hasModuleAccess('admin')
    }
    if (app.title === "CRM") {
      return hasModuleAccess('crm')
    }
    if (app.title === "COMs") {
      return hasModuleAccess('communications')
    }
    return true // Other apps are shown by default
  })

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-3"
            >
              <a href="/dashboard" className="flex items-center justify-start w-full">
                <span className="text-xl font-black italic -skew-x-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  CFI Nexus
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        {filteredApps.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Apps</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredApps.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.items ? (
                      <Collapsible defaultOpen={false} className="group/collapsible">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            <item.icon />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <a href={subItem.url}>
                                    <subItem.icon />
                                    <span>{subItem.title}</span>
                                  </a>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton tooltip={item.title} asChild>
                        <a href={item.url}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        <SidebarGroup>
          <SidebarGroupLabel>Inspections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={false} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Inspections">
                      <IconClipboardCheck />
                      <span>Inspections</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {data.navClouds[0].items.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={item.url}>
                              <span>{item.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {/* User info removed - handled by header account button */}
      </SidebarFooter>
    </Sidebar>
  )
}
