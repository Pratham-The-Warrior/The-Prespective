"use client"

import { useState, useEffect } from "react"
import { ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/supabase/database.types"

interface ArticleVoteButtonProps {
  articleId: string
  currentUser: User | null
  initialCount?: number
}

export default function ArticleVoteButton({ articleId, currentUser, initialCount = 0 }: ArticleVoteButtonProps) {
  const [upvoted, setUpvoted] = useState(false)
  const [downvoted, setDownvoted] = useState(false)
  const [voteCount, setVoteCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Check if the user has already voted on this article
  useEffect(() => {
    if (!currentUser) return

    const checkVoteStatus = async () => {
      try {
        const response = await fetch(`/api/articles/vote?articleId=${articleId}&userId=${currentUser.id}`)
        if (response.ok) {
          const data = await response.json()
          setUpvoted(data.vote === 1)
          setDownvoted(data.vote === -1)
        }
      } catch (error) {
        console.error("Error checking vote status:", error)
      }
    }

    checkVoteStatus()
  }, [articleId, currentUser])

  // Handle voting
  const handleVote = async (value: number) => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to vote on articles.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/articles/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleId,
          userId: currentUser.id,
          value,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setVoteCount(data.newScore)

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

        toast({
          title: data.vote !== 0 ? "Vote recorded" : "Vote removed",
          description: data.vote !== 0 ? "Your vote has been recorded." : "Your vote has been removed.",
        })
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: "Failed to vote on the article.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        className={`flex items-center space-x-1 rounded-l-full rounded-r-none ${
          upvoted ? "bg-green-50 text-green-600 border-green-200" : ""
        }`}
        onClick={() => handleVote(upvoted ? 0 : 1)}
        disabled={isLoading}
      >
        <ArrowUp className={`h-4 w-4 ${upvoted ? "fill-green-500" : ""}`} />
        <span className="ml-1 font-semibold">{voteCount > 0 ? voteCount : ""}</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={`flex items-center space-x-1 rounded-l-none rounded-r-full ${
          downvoted ? "bg-red-50 text-red-600 border-red-200" : ""
        }`}
        onClick={() => handleVote(downvoted ? 0 : -1)}
        disabled={isLoading}
      >
        <ArrowDown className={`h-4 w-4 ${downvoted ? "fill-red-500" : ""}`} />
      </Button>
    </div>
  )
}
