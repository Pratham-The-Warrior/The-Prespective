import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// POST endpoint to like/unlike a comment
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { commentId, userId } = body

    if (!commentId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Check if the user has already liked this comment
    const { data: existingLike } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", userId)
      .single()

    if (existingLike) {
      // Unlike the comment
      const { error } = await supabase.from("comment_likes").delete().eq("id", existingLike.id)

      if (error) {
        console.error("Error unliking comment:", error)
        return NextResponse.json({ error: "Failed to unlike comment" }, { status: 500 })
      }

      return NextResponse.json({ liked: false })
    } else {
      // Like the comment
      const { error } = await supabase.from("comment_likes").insert({
        comment_id: commentId,
        user_id: userId,
      })

      if (error) {
        console.error("Error liking comment:", error)
        return NextResponse.json({ error: "Failed to like comment" }, { status: 500 })
      }

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Error in comment like API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET endpoint to check if a user has liked a comment
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const commentId = searchParams.get("commentId")
  const userId = searchParams.get("userId")

  if (!commentId || !userId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  try {
    // Check if the user has liked this comment
    const { data, error } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", userId)

    if (error) {
      console.error("Error checking comment like:", error)
      return NextResponse.json({ error: "Failed to check like status" }, { status: 500 })
    }

    return NextResponse.json({ liked: data && data.length > 0 })
  } catch (error) {
    console.error("Error in comment like API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
