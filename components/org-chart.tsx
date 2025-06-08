"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { IconMail, IconPhone, IconBuilding, IconLoader } from "@tabler/icons-react"

interface GraphUser {
  id: string
  displayName: string
  jobTitle?: string
  mail?: string
  userPrincipalName: string
  department?: string
  officeLocation?: string
  businessPhones: string[]
  mobilePhone?: string
}

interface OrgNode {
  user: GraphUser
  manager?: any
  directReports: any[]
  level: number
}

interface OrgStructure {
  [userId: string]: OrgNode
}

interface OrgChartProps {
  orgStructure: OrgStructure
  isLoading: boolean
}

export function OrgChart({ orgStructure, isLoading }: OrgChartProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <IconLoader className="animate-spin size-4" />
          Loading organization chart...
        </div>
      </div>
    )
  }

  if (Object.keys(orgStructure).length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">No organizational data available</p>
          <p className="text-sm text-muted-foreground mt-1">
            Check your permissions to access Azure AD organizational data
          </p>
        </div>
      </div>
    )
  }

  // Group users by level
  const usersByLevel: { [level: number]: OrgNode[] } = {}
  Object.values(orgStructure).forEach(node => {
    if (!usersByLevel[node.level]) {
      usersByLevel[node.level] = []
    }
    usersByLevel[node.level].push(node)
  })

  const maxLevel = Math.max(...Object.keys(usersByLevel).map(Number))

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserCard = (node: OrgNode) => (
    <Card key={node.user.id} className="w-64 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(node.user.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{node.user.displayName}</h3>
            {node.user.jobTitle && (
              <p className="text-sm text-muted-foreground truncate">
                {node.user.jobTitle}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {node.user.department && (
          <div className="flex items-center gap-2 text-sm">
            <IconBuilding className="size-3 text-muted-foreground" />
            <span className="truncate">{node.user.department}</span>
          </div>
        )}
        
        {node.user.mail && (
          <div className="flex items-center gap-2 text-sm">
            <IconMail className="size-3 text-muted-foreground" />
            <a 
              href={`mailto:${node.user.mail}`}
              className="text-blue-600 hover:text-blue-800 truncate"
            >
              {node.user.mail}
            </a>
          </div>
        )}
        
        {(node.user.businessPhones?.length > 0 || node.user.mobilePhone) && (
          <div className="flex items-center gap-2 text-sm">
            <IconPhone className="size-3 text-muted-foreground" />
            <span className="truncate">
              {node.user.mobilePhone || node.user.businessPhones?.[0] || ''}
            </span>
          </div>
        )}
        
        {node.user.officeLocation && (
          <div className="text-xs text-muted-foreground">
            📍 {node.user.officeLocation}
          </div>
        )}
        
        {node.directReports.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {node.directReports.length} direct report{node.directReports.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-8">
        {Array.from({ length: maxLevel + 1 }, (_, level) => {
          const levelUsers = usersByLevel[level] || []
          if (levelUsers.length === 0) return null

          return (
            <div key={level} className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  Level {level}
                </Badge>
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">
                  {levelUsers.length} member{levelUsers.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {levelUsers.map(node => getUserCard(node))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}