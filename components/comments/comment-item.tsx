"use client"

import { Textarea } from "@/components/ui/textarea"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Heart, MessageSquare, MoreHorizontal, Trash2, Edit } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import type { User, CommentWithUser } from "@/lib/supabase/database.types"
import CommentForm from "./comment-form"

interface CommentItemProps {
  comment: CommentWithUser
  currentUser: User | null
  onDelete?: () => void
  onUpdate?: () => void
  onReply?: () => void
  isReply?: boolean
}

export default function CommentItem({
  comment,
  currentUser,
  onDelete,
  onUpdate,
  onReply,
  isReply = false,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.content)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Check if the current user has liked this comment
  const checkLikeStatus = async () => {
    if (!currentUser) return

    try {
      const response = await fetch(`/api/comments/like?commentId=${comment.id}&userId=${currentUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
      }
    } catch (error) {
      console.error("Error checking like status:", error)
    }
  }

  // Get like count for this comment
  const getLikeCount = async () => {
    try {
      const response = await fetch(`/api/comments/${comment.id}/likes`)
      if (response.ok) {
        const data = await response.json()
        setLikeCount(data.count)
      }
    } catch (error) {
      console.error("Error getting like count:", error)
    }
  }

  // Toggle like status
  const toggleLike = async () => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to like comments.",
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
          commentId: comment.id,
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
        description: "Failed to like/unlike the comment.",
        variant: "destructive",
      })
    }
  }

  // Handle comment deletion
  const handleDelete = async () => {
    if (!currentUser || currentUser.id !== comment.user_id) return

    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const response = await fetch(`/api/comments/${comment.id}?userId=${currentUser.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete comment")
      }

      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      })

      if (onDelete) {
        onDelete()
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        title: "Error",
        description: "Failed to delete your comment.",
        variant: "destructive",
      })
    }
  }

  // Handle comment update
  const handleUpdate = async () => {
    if (!currentUser || currentUser.id !== comment.user_id) return

    if (!editedContent.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter some content for your comment.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editedContent.trim(),
          userId: currentUser.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update comment")
      }

      setIsEditing(false)

      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
      })

      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error("Error updating comment:", error)
      toast({
        title: "Error",
        description: "Failed to update your comment.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Initialize like status and count
  useState(() => {
    checkLikeStatus()
    getLikeCount()
  })

  const isAuthor = currentUser && currentUser.id === comment.user_id
  const user = comment.users
  const formattedDate = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })

  return (
    <div className={`p-4 ${isReply ? "ml-12 border-l-2 border-gray-100" : "border-b border-gray-100"}`}>
      <div className="flex items-start space-x-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.avatar_url || ""} alt={user?.username || "User"} />
          <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium">{user?.username || "Anonymous"}</h4>
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
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[100px]"
                disabled={isSubmitting}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false)
                    setEditedContent(comment.content)
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
            <p className="text-gray-700">{comment.content}</p>
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
          </div>

          {isReplying && (
            <div className="mt-4">
              <CommentForm
                articleId={comment.article_id}
                user={currentUser}
                parentId={comment.id}
                onCommentAdded={() => {
                  setIsReplying(false)
                  if (onReply) onReply()
                }}
                placeholder="Write a reply..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
