"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/supabase/database.types"

interface CommentFormProps {
  articleId: string
  user: User | null
  parentId?: string
  onCommentAdded?: () => void
  placeholder?: string
}

export default function CommentForm({
  articleId,
  user,
  parentId,
  onCommentAdded,
  placeholder = "Join the discussion...",
}: CommentFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to post a comment.",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter some content for your comment.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleId,
          userId: user.id,
          content: content.trim(),
          parentId: parentId || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to post comment")
      }

      setContent("")

      if (onCommentAdded) {
        onCommentAdded()
      }

      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      })
    } catch (error) {
      console.error("Error posting comment:", error)
      toast({
        title: "Error",
        description: "Failed to post your comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder={user ? placeholder : "Sign in to join the discussion"}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={!user || isSubmitting}
        className="min-h-[100px] resize-none"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={!user || isSubmitting || !content.trim()}>
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </form>
  )
}
