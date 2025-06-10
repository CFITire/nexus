"use client"

import { IconLock, IconShare, IconStar, IconShield } from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PasswordEntry } from "@/lib/types/vault"

interface VaultStatsProps {
  passwords: PasswordEntry[]
}

export function VaultStats({ passwords }: VaultStatsProps) {
  const totalPasswords = passwords.length
  const sharedPasswords = passwords.filter(p => p.isShared).length
  const favoritePasswords = passwords.filter(p => p.isFavorite).length
  const recentlyAccessed = passwords.filter(p => p.lastAccessedAt).length

  const stats = [
    {
      title: "Total Passwords",
      value: totalPasswords,
      icon: IconLock,
      description: "Stored in vault"
    },
    {
      title: "Shared",
      value: sharedPasswords,
      icon: IconShare,
      description: "With team members"
    },
    {
      title: "Favorites",
      value: favoritePasswords,
      icon: IconStar,
      description: "Frequently used"
    },
    {
      title: "Recently Used",
      value: recentlyAccessed,
      icon: IconShield,
      description: "Last 30 days"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}