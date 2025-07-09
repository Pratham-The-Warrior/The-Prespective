"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { revalidateNews } from "@/app/actions/revalidate"

export default function NewsAutoUpdater() {
  const router = useRouter()

  useEffect(() => {
    // Function to refresh news
    const refreshNews = async () => {
      try {
        const result = await revalidateNews()

        if (result.success) {
          console.log("News refreshed successfully")
          router.refresh()
        } else {
          console.error("Failed to refresh news:", result.error)
        }
      } catch (error) {
        console.error("Error refreshing news:", error)
      }
    }

    // Set up interval to refresh news every hour (3600000 ms)
    const intervalId = setInterval(refreshNews, 3600000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [router])

  return null
}
