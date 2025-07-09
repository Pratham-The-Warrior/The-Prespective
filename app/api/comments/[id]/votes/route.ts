import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// GET endpoint to get the vote score for a comment
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const commentId = params.id

  if (!commentId) {
    return NextResponse.json({ error: "Comment ID is required" }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  try {
    // Get all votes for this comment
    const { data, error } = await supabase.from("comment_votes").select("value").eq("comment_id", commentId)

    if (error) {
      console.error("Error fetching comment votes:", error)
      return NextResponse.json({ error: "Failed to fetch vote score" }, { status: 500 })
    }

    // Calculate the score
    const score = data ? data.reduce((sum, vote) => sum + vote.value, 0) : 0

    return NextResponse.json({ score })
  } catch (error) {
    console.error("Error in comment votes API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
