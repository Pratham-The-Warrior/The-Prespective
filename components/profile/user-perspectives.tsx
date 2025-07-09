"use client"

import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { MessageSquare, ArrowUp, ArrowDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

interface UserPerspectivesProps {
  userId: string
  type: "authored" | "upvoted" | "downvoted"
}

export default function UserPerspectives({ userId, type }: UserPerspectivesProps) {
  const [perspectives, setPerspectives] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const fetchPerspectives = async () => {
      setLoading(true)
      setError(null)

      try {
        let query

        if (type === "authored") {
          // Get perspectives authored by the user
          const { data, error } = await supabase
            .from("comments")
            .select(
              `
              *,
              articles!inner (id, title),
              users!inner (id, username, avatar_url)
            `,
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(20)

          if (error) throw error
          setPerspectives(data || [])
        } else if (type === "upvoted") {
          // Get perspectives upvoted by the user
          const { data, error } = await supabase
            .from("comment_votes")
            .select(
              `
              value,
              comments!inner (
                *,
                articles!inner (id, title),
                users!inner (id, username, avatar_url)
              )
            `,
            )
            .eq("user_id", userId)
            .eq("value", 1)
            .order("created_at", { ascending: false })
            .limit(20)

          if (error) throw error
          setPerspectives((data || []).map((item) => item.comments))
        } else if (type === "downvoted") {
          // Get perspectives downvoted by the user
          const { data, error } = await supabase
            .from("comment_votes")
            .select(
              `
              value,
              comments!inner (
                *,
                articles!inner (id, title),
                users!inner (id, username, avatar_url)
              )
            `,
            )
            .eq("user_id", userId)
            .eq("value", -1)
            .order("created_at", { ascending: false })
            .limit(20)

          if (error) throw error
          setPerspectives((data || []).map((item) => item.comments))
        }
      } catch (error) {
        console.error("Error fetching perspectives:", error)
        setError("Failed to load perspectives")
      } finally {
        setLoading(false)
      }
    }

    fetchPerspectives()
  }, [userId, type])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  if (perspectives.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">
          {type === "authored"
            ? "No perspectives shared yet."
            : type === "upvoted"
              ? "No upvoted perspectives yet."
              : "No downvoted perspectives yet."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {perspectives.map((perspective) => (
        <div key={perspective.id} className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start space-x-3">
            <Link href={`/profile/${perspective.users.username}`}>
              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                {perspective.users.avatar_url ? (
                  <img
                    src={perspective.users.avatar_url || "/placeholder.svg"}
                    alt={perspective.users.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-lg font-semibold">
                    {perspective.users.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </Link>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <Link href={`/profile/${perspective.users.username}`} className="font-medium hover:underline">
                    {perspective.users.username}
                  </Link>
                  <span className="text-gray-500 text-sm ml-2">
                    {formatDistanceToNow(new Date(perspective.created_at), { addSuffix: true })}
                  </span>
                </div>
                <Link href={`/article/${perspective.article_id}`} className="text-sm text-blue-500 hover:underline">
                  on:{" "}
                  {perspective.articles.title.length > 50
                    ? perspective.articles.title.substring(0, 50) + "..."
                    : perspective.articles.title}
                </Link>
              </div>

              <p className="mt-2">{perspective.content}</p>

              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>Reply</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ArrowUp className="h-4 w-4" />
                  <span>Upvote</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ArrowDown className="h-4 w-4" />
                  <span>Downvote</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
