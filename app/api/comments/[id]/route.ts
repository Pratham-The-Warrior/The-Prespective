import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// GET endpoint to fetch a specific comment
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const commentId = params.id

  if (!commentId) {
    return NextResponse.json({ error: "Comment ID is required" }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  try {
    const { data: comment, error } = await supabase
      .from("comments")
      .select(`
        *,
        users (id, username, avatar_url)
      `)
      .eq("id", commentId)
      .single()

    if (error) {
      console.error("Error fetching comment:", error)
      return NextResponse.json({ error: "Failed to fetch comment" }, { status: 500 })
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("Error in comment API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH endpoint to update a comment
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const commentId = params.id

  try {
    const body = await request.json()
    const { content, userId } = body

    if (!content || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Verify the user owns this comment
    const { data: existingComment } = await supabase.from("comments").select("user_id").eq("id", commentId).single()

    if (!existingComment || existingComment.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update the comment
    const { data: comment, error } = await supabase
      .from("comments")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", commentId)
      .select()
      .single()

    if (error) {
      console.error("Error updating comment:", error)
      return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("Error in comment API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE endpoint to delete a comment
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const commentId = params.id
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  try {
    // Verify the user owns this comment
    const { data: existingComment } = await supabase.from("comments").select("user_id").eq("id", commentId).single()

    if (!existingComment || existingComment.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete the comment
    const { error } = await supabase.from("comments").delete().eq("id", commentId)

    if (error) {
      console.error("Error deleting comment:", error)
      return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in comment API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
