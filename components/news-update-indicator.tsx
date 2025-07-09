"use client"

import { useState, useEffect } from "react"
import { RefreshCw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatRelativeTime } from "@/lib/utils"
import { revalidateNews } from "@/app/actions/revalidate"
import { useRouter } from "next/navigation"

export default function NewsUpdateIndicator() {
  const router = useRouter()
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [status, setStatus] = useState<"success" | "warning" | "error" | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchLastUpdated = async () => {
      try {
        const response = await fetch("/api/news/last-updated")
        const data = await response.json()
        setLastUpdated(data.lastUpdated)
        setStatus(data.status)
      } catch (error) {
        console.error("Error fetching last updated time:", error)
        setStatus("error")
      }
    }

    fetchLastUpdated()
    const intervalId = setInterval(fetchLastUpdated, 60000) // Check every minute

    return () => clearInterval(intervalId)
  }, [])

  const handleRefresh = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const result = await revalidateNews()

      if (result.success) {
        router.refresh()
      } else {
        console.error("Failed to refresh news")
      }
    } catch (error) {
      console.error("Error refreshing news:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!lastUpdated) {
    return null
  }

  const statusColors = {
    success: "text-green-500",
    warning: "text-amber-500",
    error: "text-red-500",
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : statusColors[status] || "text-gray-500"}`}
            />
            <span>Updated {formatRelativeTime(lastUpdated)}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Last updated: {new Date(lastUpdated).toLocaleString()}</p>
          <p>Click to refresh news</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
