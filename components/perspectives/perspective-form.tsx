"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/supabase/database.types"
import RichTextEditor from "./rich-text-editor"

interface PerspectiveFormProps {
  articleId: string
  user: User | null
  parentId?: string
  onPerspectiveAdded?: () => void
  placeholder?: string
}

export default function PerspectiveForm({
  articleId,
  user,
  parentId,
  onPerspectiveAdded,
  placeholder = "Share your perspective...",
}: PerspectiveFormProps) {
  const [content, setContent] = useState("")
  const [contentHtml, setContentHtml] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to share your perspective.",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "Empty perspective",
        description: "Please enter some content for your perspective.",
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
          contentHtml: contentHtml,
          parentId: parentId || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to post perspective")
      }

      setContent("")
      setContentHtml("")

      if (onPerspectiveAdded) {
        onPerspectiveAdded()
      }

      toast({
        title: "Perspective shared",
        description: "Your perspective has been shared successfully.",
      })
    } catch (error) {
      console.error("Error posting perspective:", error)
      toast({
        title: "Error",
        description: "Failed to share your perspective. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RichTextEditor
        value={content}
        onChange={setContent}
        onHtmlChange={setContentHtml}
        placeholder={user ? placeholder : "Sign in to share your perspective"}
        disabled={!user || isSubmitting}
        minHeight="150px"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={!user || isSubmitting || !content.trim()}>
          {isSubmitting ? "Sharing..." : "Share Perspective"}
        </Button>
      </div>
    </form>
  )
}
