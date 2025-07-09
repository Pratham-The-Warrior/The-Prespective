import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// GET endpoint to fetch comments for an article
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const articleId = searchParams.get("articleId")
  const sort = searchParams.get("sort") || "newest"

  if (!articleId) {
    return NextResponse.json({ error: "Article ID is required" }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  try {
    // Get all comments for the article
    let query = supabase
      .from("comments")
      .select(`
        *,
        users (id, username, avatar_url)
      `)
      .eq("article_id", articleId)
      .eq("status", "active") // Only show active comments

    // Apply sorting
    if (sort === "newest") {
      query = query.order("created_at", { ascending: false })
    } else if (sort === "oldest") {
      query = query.order("created_at", { ascending: true })
    } else if (sort === "top") {
      // For "top" sorting, we need to get the vote counts
      const { data: comments, error } = await query

      if (error) {
        console.error("Error fetching comments:", error)
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
      }

      // Get vote counts for each comment
      const commentIds = comments.map((comment) => comment.id)

      // If no comments, return empty array
      if (commentIds.length === 0) {
        return NextResponse.json({ comments: [] })
      }

      // Get vote counts for all comments
      const { data: votes } = await supabase
        .from("comment_votes")
        .select("comment_id, value")
        .in("comment_id", commentIds)

      // Calculate score for each comment
      const commentScores = {}
      votes?.forEach((vote) => {
        if (!commentScores[vote.comment_id]) {
          commentScores[vote.comment_id] = 0
        }
        commentScores[vote.comment_id] += vote.value
      })

      // Sort comments by score
      const sortedComments = [...comments].sort((a, b) => {
        const scoreA = commentScores[a.id] || 0
        const scoreB = commentScores[b.id] || 0
        return scoreB - scoreA
      })

      return NextResponse.json({ comments: sortedComments })
    }

    const { data: comments, error } = await query

    if (error) {
      console.error("Error fetching comments:", error)
      return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
    }

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Error in comments API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST endpoint to create a new comment
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { articleId, userId, content, contentHtml, parentId } = body

    if (!articleId || !userId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Insert the new comment
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        article_id: articleId,
        user_id: userId,
        parent_id: parentId || null,
        content,
        content_html: contentHtml || content,
        status: "active",
      })
      .select(`
        *,
        users (id, username, avatar_url)
      `)
      .single()

    if (error) {
      console.error("Error creating comment:", error)
      return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
    }

    // If this is a reply, create a notification for the parent comment author
    if (parentId) {
      // Get the parent comment
      const { data: parentComment } = await supabase
        .from("comments")
        .select("user_id, article_id")
        .eq("id", parentId)
        .single()

      if (parentComment && parentComment.user_id !== userId) {
        // Get the username of the replier
        const { data: user } = await supabase.from("users").select("username").eq("id", userId).single()

        // Create notification
        await supabase.from("notifications").insert({
          user_id: parentComment.user_id,
          type: "reply",
          content: `${user?.username || "Someone"} replied to your perspective`,
          related_id: comment.id,
        })
      }
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("Error in comments API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
