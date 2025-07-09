"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RefreshNewsButtonProps {
  revalidationToken: string
}

export default function RefreshNewsButton({ revalidationToken }: RefreshNewsButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const handleRefresh = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)

    try {
      const response = await fetch(`/api/revalidate-news?token=${revalidationToken}&force=true`)
      const data = await response.json()

      if (data.revalidated) {
        toast({
          title: "News refreshed",
          description: "The latest news has been fetched and the site has been updated.",
          variant: "default",
        })
      } else {
        toast({
          title: "Refresh failed",
          description: data.message || "Could not refresh news content.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while trying to refresh the news.",
        variant: "destructive",
      })
      console.error("Error refreshing news:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-2">
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Refreshing..." : "Refresh News"}
    </Button>
  )
}
