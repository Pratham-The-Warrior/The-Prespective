"use client"

import { useState, useEffect } from "react"
import type { User, CommentWithUser } from "@/lib/supabase/database.types"
import PerspectiveItem from "./perspective-item"
import PerspectiveForm from "./perspective-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface PerspectiveListProps {
  articleId: string
  currentUser: User | null
}

export default function PerspectiveList({ articleId, currentUser }: PerspectiveListProps) {
  const [perspectives, setPerspectives] = useState<CommentWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "top">("top")
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  // Fetch perspectives for the article
  const fetchPerspectives = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/comments?articleId=${articleId}&sort=${sortBy}`)

      if (!response.ok) {
        throw new Error("Failed to fetch perspectives")
      }

      const data = await response.json()
      setPerspectives(data.comments || [])
    } catch (error) {
      console.error("Error fetching perspectives:", error)
      setError("Failed to load perspectives. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Set up real-time subscription for perspectives
  useEffect(() => {
    fetchPerspectives()

    // Subscribe to changes in the comments table for this article
    const subscription = supabase
      .channel(`comments-${articleId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `article_id=eq.${articleId}`,
        },
        () => {
          // Refetch perspectives when there's a change
          fetchPerspectives()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [articleId, sortBy])

  // Group perspectives by parent_id
  const perspectivesByParent: Record<string, CommentWithUser[]> = {}
  const topLevelPerspectives: CommentWithUser[] = []

  perspectives.forEach((perspective) => {
    if (perspective.parent_id) {
      if (!perspectivesByParent[perspective.parent_id]) {
        perspectivesByParent[perspective.parent_id] = []
      }
      perspectivesByParent[perspective.parent_id].push(perspective)
    } else {
      topLevelPerspectives.push(perspective)
    }
  })

  // Render a perspective and its replies
  const renderPerspectiveWithReplies = (perspective: CommentWithUser) => {
    const replies = perspectivesByParent[perspective.id] || []

    return (
      <div key={perspective.id} className="mb-4">
        <PerspectiveItem
          perspective={perspective}
          currentUser={currentUser}
          onDelete={fetchPerspectives}
          onUpdate={fetchPerspectives}
          onReply={fetchPerspectives}
        />

        {replies.length > 0 && (
          <div className="mt-2">
            {replies.map((reply) => (
              <PerspectiveItem
                key={reply.id}
                perspective={reply}
                currentUser={currentUser}
                onDelete={fetchPerspectives}
                onUpdate={fetchPerspectives}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Perspectives</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <div className="flex rounded-md border overflow-hidden">
            <Button
              variant={sortBy === "top" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setSortBy("top")}
            >
              Top
            </Button>
            <Button
              variant={sortBy === "newest" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setSortBy("newest")}
            >
              Newest
            </Button>
            <Button
              variant={sortBy === "oldest" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setSortBy("oldest")}
            >
              Oldest
            </Button>
          </div>
        </div>
      </div>

      <PerspectiveForm articleId={articleId} user={currentUser} onPerspectiveAdded={fetchPerspectives} />

      <div className="mt-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchPerspectives}>Try Again</Button>
          </div>
        ) : perspectives.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No perspectives yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div>{topLevelPerspectives.map((perspective) => renderPerspectiveWithReplies(perspective))}</div>
        )}
      </div>
    </div>
  )
}
