"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Heart, MessageSquare, MoreHorizontal, Trash2, Edit, ArrowUp, ArrowDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import type { User, CommentWithUser } from "@/lib/supabase/database.types"
import PerspectiveForm from "./perspective-form"
import RichTextEditor from "./rich-text-editor"
import ReportButton from "../report-button"
import Link from "next/link"

interface PerspectiveItemProps {
  perspective: CommentWithUser
  currentUser: User | null
  onDelete?: () => void
  onUpdate?: () => void
  onReply?: () => void
  isReply?: boolean
}

export default function PerspectiveItem({
  perspective,
  currentUser,
  onDelete,
  onUpdate,
  onReply,
  isReply = false,
}: PerspectiveItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [editedContent, setEditedContent] = useState(perspective.content)
  const [editedContentHtml, setEditedContentHtml] = useState(perspective.content_html || perspective.content)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [upvoted, setUpvoted] = useState(false)
  const [downvoted, setDownvoted] = useState(false)
  const [voteScore, setVoteScore] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Check if the current user has liked this perspective
  const checkLikeStatus = async () => {
    if (!currentUser) return

    try {
      const response = await fetch(`/api/comments/like?commentId=${perspective.id}&userId=${currentUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
      }
    } catch (error) {
      console.error("Error checking like status:", error)
    }
  }

  // Check if the current user has voted on this perspective
  const checkVoteStatus = async () => {
    if (!currentUser) return

    try {
      const response = await fetch(`/api/comments/vote?commentId=${perspective.id}&userId=${currentUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setUpvoted(data.vote === 1)
        setDownvoted(data.vote === -1)
      }
    } catch (error) {
      console.error("Error checking vote status:", error)
    }
  }

  // Get like count for this perspective
  const getLikeCount = async () => {
    try {
      const response = await fetch(`/api/comments/${perspective.id}/likes`)
      if (response.ok) {
        const data = await response.json()
        setLikeCount(data.count)
      }
    } catch (error) {
      console.error("Error getting like count:", error)
    }
  }

  // Get vote score for this perspective
  const getVoteScore = async () => {
    try {
      const response = await fetch(`/api/comments/${perspective.id}/votes`)
      if (response.ok) {
        const data = await response.json()
        setVoteScore(data.score)
      }
    } catch (error) {
      console.error("Error getting vote score:", error)
    }
  }

  // Toggle like status
  const toggleLike = async () => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to like perspectives.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/comments/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: perspective.id,
          userId: currentUser.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
        setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1))
      }
    } catch (error) {
      console.error("Error toggling like:", error)
      toast({
        title: "Error",
        description: "Failed to like/unlike the perspective.",
        variant: "destructive",
      })
    }
  }

  // Handle voting
  const handleVote = async (value: number) => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to vote on perspectives.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/comments/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: perspective.id,
          userId: currentUser.id,
          value,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setVoteScore(data.newScore)

        // Update UI state based on the new vote
        if (data.vote === 1) {
          setUpvoted(true)
          setDownvoted(false)
        } else if (data.vote === -1) {
          setUpvoted(false)
          setDownvoted(true)
        } else {
          setUpvoted(false)
          setDownvoted(false)
        }
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: "Failed to vote on the perspective.",
        variant: "destructive",
      })
    }
  }

  // Handle perspective deletion
  const handleDelete = async () => {
    if (!currentUser || currentUser.id !== perspective.user_id) return

    if (!confirm("Are you sure you want to delete this perspective?")) return

    try {
      const response = await fetch(`/api/comments/${perspective.id}?userId=${currentUser.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete perspective")
      }

      toast({
        title: "Perspective deleted",
        description: "Your perspective has been deleted successfully.",
      })

      if (onDelete) {
        onDelete()
      }
    } catch (error) {
      console.error("Error deleting perspective:", error)
      toast({
        title: "Error",
        description: "Failed to delete your perspective.",
        variant: "destructive",
      })
    }
  }

  // Handle perspective update
  const handleUpdate = async () => {
    if (!currentUser || currentUser.id !== perspective.user_id) return

    if (!editedContent.trim()) {
      toast({
        title: "Empty perspective",
        description: "Please enter some content for your perspective.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/comments/${perspective.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editedContent.trim(),
          contentHtml: editedContentHtml,
          userId: currentUser.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update perspective")
      }

      setIsEditing(false)

      toast({
        title: "Perspective updated",
        description: "Your perspective has been updated successfully.",
      })

      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error("Error updating perspective:", error)
      toast({
        title: "Error",
        description: "Failed to update your perspective.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Initialize like status, vote status, and counts
  useEffect(() => {
    checkLikeStatus()
    checkVoteStatus()
    getLikeCount()
    getVoteScore()
  }, [perspective.id, currentUser])

  const isAuthor = currentUser && currentUser.id === perspective.user_id
  const user = perspective.users
  const formattedDate = formatDistanceToNow(new Date(perspective.created_at), { addSuffix: true })

  return (
    <div className={`p-4 ${isReply ? "ml-12 border-l-2 border-gray-100" : "border-b border-gray-100"}`}>
      <div className="flex items-start space-x-4">
        {/* Vote buttons */}
        <div className="flex flex-col items-center space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${upvoted ? "text-green-500" : ""}`}
            onClick={() => handleVote(upvoted ? 0 : 1)}
          >
            <ArrowUp className={`h-5 w-5 ${upvoted ? "fill-green-500" : ""}`} />
            <span className="sr-only">Upvote</span>
          </Button>
          <span
            className={`text-sm font-medium ${voteScore > 0 ? "text-green-500" : voteScore < 0 ? "text-red-500" : ""}`}
          >
            {voteScore}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${downvoted ? "text-red-500" : ""}`}
            onClick={() => handleVote(downvoted ? 0 : -1)}
          >
            <ArrowDown className={`h-5 w-5 ${downvoted ? "fill-red-500" : ""}`} />
            <span className="sr-only">Downvote</span>
          </Button>
        </div>

        <Link href={`/profile/${user?.username}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar_url || ""} alt={user?.username || "User"} />
            <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href={`/profile/${user?.username}`} className="font-medium hover:underline">
                {user?.username || "Anonymous"}
              </Link>
              <span className="text-xs text-gray-500">{formattedDate}</span>
            </div>

            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <RichTextEditor
                value={editedContent}
                onChange={setEditedContent}
                onHtmlChange={setEditedContentHtml}
                disabled={isSubmitting}
                minHeight="100px"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false)
                    setEditedContent(perspective.content)
                    setEditedContentHtml(perspective.content_html || perspective.content)
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleUpdate} disabled={isSubmitting || !editedContent.trim()}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: perspective.content_html || perspective.content }}
            />
          )}

          <div className="flex items-center space-x-4 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-1 ${liked ? "text-red-500" : ""}`}
              onClick={toggleLike}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </Button>

            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1"
                onClick={() => setIsReplying(!isReplying)}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Reply</span>
              </Button>
            )}

            <ReportButton contentType="comment" contentId={perspective.id} currentUser={currentUser} />
          </div>

          {isReplying && (
            <div className="mt-4">
              <PerspectiveForm
                articleId={perspective.article_id}
                user={currentUser}
                parentId={perspective.id}
                onPerspectiveAdded={() => {
                  setIsReplying(false)
                  if (onReply) onReply()
                }}
                placeholder="Share your perspective on this..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
