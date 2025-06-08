"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push("/dashboard")
      }
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            <span className="text-xl font-black italic -skew-x-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              CFI Nexus
            </span>
          </CardTitle>
          <CardDescription>
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => signIn("azure-ad", { callbackUrl: "/dashboard" })}
            className="w-full"
            size="lg"
          >
            Sign in with Microsoft
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}