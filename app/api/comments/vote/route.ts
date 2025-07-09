import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// POST endpoint to vote on a comment
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { commentId, userId, value } = body

    if (!commentId || !userId || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Ensure value is -1, 0, or 1
    const voteValue = Math.max(-1, Math.min(1, value))

    const supabase = createServerSupabaseClient()

    // Check if the user has already voted on this comment
    const { data: existingVote } = await supabase
      .from("comment_votes")
      .select("id, value")
      .eq("comment_id", commentId)
      .eq("user_id", userId)
      .single()

    if (existingVote) {
      if (existingVote.value === voteValue) {
        // If voting with the same value, remove the vote (toggle off)
        await supabase.from("comment_votes").delete().eq("id", existingVote.id)

        // Get the new score
        const { data: scoreData } = await supabase.from("comment_votes").select("value").eq("comment_id", commentId)

        const newScore = scoreData ? scoreData.reduce((sum, vote) => sum + vote.value, 0) : 0

        return NextResponse.json({ vote: 0, newScore })
      } else {
        // Update the vote
        await supabase.from("comment_votes").update({ value: voteValue }).eq("id", existingVote.id)

        // Get the new score
        const { data: scoreData } = await supabase.from("comment_votes").select("value").eq("comment_id", commentId)

        const newScore = scoreData ? scoreData.reduce((sum, vote) => sum + vote.value, 0) : 0

        return NextResponse.json({ vote: voteValue, newScore })
      }
    } else {
      // Create a new vote
      await supabase.from("comment_votes").insert({
        comment_id: commentId,
        user_id: userId,
        value: voteValue,
      })

      // Get the new score
      const { data: scoreData } = await supabase.from("comment_votes").select("value").eq("comment_id", commentId)

      const newScore = scoreData ? scoreData.reduce((sum, vote) => sum + vote.value, 0) : 0

      return NextResponse.json({ vote: voteValue, newScore })
    }
  } catch (error) {
    console.error("Error in comment vote API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET endpoint to check if a user has voted on a comment
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const commentId = searchParams.get("commentId")
  const userId = searchParams.get("userId")

  if (!commentId || !userId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  try {
    // Check if the user has voted on this comment
    const { data, error } = await supabase
      .from("comment_votes")
      .select("value")
      .eq("comment_id", commentId)
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      console.error("Error checking comment vote:", error)
      return NextResponse.json({ error: "Failed to check vote status" }, { status: 500 })
    }

    return NextResponse.json({ vote: data ? data.value : 0 })
  } catch (error) {
    console.error("Error in comment vote API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
