"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/supabase/database.types"
import CommentList from "./comments/comment-list"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface DiscussionSectionProps {
  articleId: string
}

export default function DiscussionSection({ articleId }: DiscussionSectionProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          return
        }

        if (session?.user) {
          // Get user profile from database
          const { data: userProfile } = await supabase.from("users").select("*").eq("id", session.user.id).single()

          if (userProfile) {
            setUser(userProfile)
          } else {
            // Create user profile if it doesn't exist
            const newUser = {
              id: session.user.id,
              username: session.user.email?.split("@")[0] || `user_${Date.now().toString().slice(-6)}`,
              email: session.user.email,
              avatar_url: session.user.user_metadata.avatar_url || null,
            }

            await supabase.from("users").insert(newUser)
            setUser(newUser as User)
          }
        }
      } catch (error) {
        console.error("Error checking user:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Get user profile from database
        const { data: userProfile } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (userProfile) {
          setUser(userProfile)
        } else {
          // Create user profile if it doesn't exist
          const newUser = {
            id: session.user.id,
            username: session.user.email?.split("@")[0] || `user_${Date.now().toString().slice(-6)}`,
            email: session.user.email,
            avatar_url: session.user.user_metadata.avatar_url || null,
          }

          await supabase.from("users").insert(newUser)
          setUser(newUser as User)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Handle sign in
  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error("Error signing in:", error)
      toast({
        title: "Sign in failed",
        description: "There was a problem signing in. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Sign out failed",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="mt-12 border-t pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Discussion</h2>

        {loading ? (
          <Button disabled>Loading...</Button>
        ) : user ? (
          <div className="flex items-center space-x-4">
            <span>
              Signed in as <strong>{user.username}</strong>
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        ) : (
          <Button onClick={handleSignIn}>Sign In to Comment</Button>
        )}
      </div>

      <CommentList articleId={articleId} currentUser={user} />
    </div>
  )
}
