"use client"

import * as React from "react"
import {
  IconCamera,
  IconClipboardCheck,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconListDetails,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
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
          title: "Assembly Form",
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
          title: "Used Centers Form",
          url: "/inspections/used-centers-form",
        },
        {
          title: "Used Hardware Form",
          url: "/inspections/used-hardware-form",
        },
        {
          title: "Used Tire Form",
          url: "/inspections/used-tire-form",
        },
        {
          title: "Used Track Form",
          url: "/inspections/used-track-form",
        },
        {
          title: "Used Wheel Form",
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
  navSecondary: [
    {
      title: "Settings",
      url: "#",
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
        <NavMain items={data.navMain} />
        <SidebarGroup>
          <SidebarGroupLabel>Inspections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
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
