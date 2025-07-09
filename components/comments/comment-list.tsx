"use client"

import { useState, useEffect } from "react"
import type { User, CommentWithUser } from "@/lib/supabase/database.types"
import CommentItem from "./comment-item"
import CommentForm from "./comment-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface CommentListProps {
  articleId: string
  currentUser: User | null
}

export default function CommentList({ articleId, currentUser }: CommentListProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  // Fetch comments for the article
  const fetchComments = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/comments?articleId=${articleId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch comments")
      }

      const data = await response.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error("Error fetching comments:", error)
      setError("Failed to load comments. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Set up real-time subscription for comments
  useEffect(() => {
    fetchComments()

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
          // Refetch comments when there's a change
          fetchComments()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [articleId])

  // Group comments by parent_id
  const commentsByParent: Record<string, CommentWithUser[]> = {}
  const topLevelComments: CommentWithUser[] = []

  comments.forEach((comment) => {
    if (comment.parent_id) {
      if (!commentsByParent[comment.parent_id]) {
        commentsByParent[comment.parent_id] = []
      }
      commentsByParent[comment.parent_id].push(comment)
    } else {
      topLevelComments.push(comment)
    }
  })

  // Render a comment and its replies
  const renderCommentWithReplies = (comment: CommentWithUser) => {
    const replies = commentsByParent[comment.id] || []

    return (
      <div key={comment.id} className="mb-4">
        <CommentItem
          comment={comment}
          currentUser={currentUser}
          onDelete={fetchComments}
          onUpdate={fetchComments}
          onReply={fetchComments}
        />

        {replies.length > 0 && (
          <div className="mt-2">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUser={currentUser}
                onDelete={fetchComments}
                onUpdate={fetchComments}
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
      <h2 className="text-2xl font-bold">Discussion</h2>

      <CommentForm articleId={articleId} user={currentUser} onCommentAdded={fetchComments} />

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
            <Button onClick={fetchComments}>Try Again</Button>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No comments yet. Be the first to start the discussion!</p>
          </div>
        ) : (
          <div>{topLevelComments.map((comment) => renderCommentWithReplies(comment))}</div>
        )}
      </div>
    </div>
  )
}
