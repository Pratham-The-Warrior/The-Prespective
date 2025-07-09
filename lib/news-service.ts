// This service handles fetching news from the GNnews API and storing in Supabase

import { createServerSupabaseClient } from "./supabase/server"
import { mockArticles } from "./mock-articles"
import { determineCategory } from "./utils"

// Cache for storing last API call info
const apiCallInfo = {
  lastApiCall: 0,
  rateLimitReset: null as number | null,
  consecutiveErrors: 0,
}

// Function to fetch news from the GNnews API and store in the database
export async function fetchNewsFromAPI(forceRefresh = false) {
  const supabase = createServerSupabaseClient()

  try {
    const apiKey = process.env.GNNEWS_API_KEY

    if (!apiKey) {
      console.error("GNnews API key not configured")
      return await getArticlesFromDB()
    }

    const now = Date.now()

    // Check if we're in a rate limit cooldown period
    if (apiCallInfo.rateLimitReset && now < apiCallInfo.rateLimitReset) {
      const waitTime = Math.ceil((apiCallInfo.rateLimitReset - now) / 1000)
      console.log(`Rate limit cooldown active. Waiting ${waitTime} seconds before next API call.`)
      return await getArticlesFromDB()
    }

    // Enforce a minimum interval between API calls to avoid rate limiting
    const baseInterval = 60 * 60 * 1000 // 60 minutes in milliseconds (hourly updates)
    const backoffFactor = Math.min(Math.pow(2, apiCallInfo.consecutiveErrors), 8) // Max 8x backoff
    const minInterval = baseInterval * backoffFactor

    if (!forceRefresh && now - apiCallInfo.lastApiCall < minInterval) {
      console.log(`Skipping API call - last call was ${Math.floor((now - apiCallInfo.lastApiCall) / 1000)} seconds ago`)
      console.log(`Current backoff: ${backoffFactor}x (${minInterval / 60000} minutes)`)
      return await getArticlesFromDB()
    }

    // Update the last API call timestamp before making the request
    apiCallInfo.lastApiCall = now

    // Add a random delay between 1-3 seconds to prevent exact timing patterns
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    const url = `https://gnews.io/api/v4/top-headlines?token=${apiKey}&lang=en&max=10`

    console.log(`Fetching news from GNnews API at ${new Date().toISOString()}`)

    const response = await fetch(url, {
      next: { revalidate: 0 },
      headers: {
        "User-Agent": "The Perspective News Platform - Contact: admin@theperspective.news",
      },
    })

    // Handle rate limiting specifically
    if (response.status === 429) {
      // Get the reset time from headers if available
      const resetHeader = response.headers.get("X-RateLimit-Reset") || response.headers.get("RateLimit-Reset")

      let resetTime = null
      if (resetHeader) {
        // Parse the reset time - could be in seconds or a full timestamp
        resetTime =
          resetHeader.length > 10
            ? Number.parseInt(resetHeader) // Full timestamp
            : now + Number.parseInt(resetHeader) * 1000 // Seconds from now
      } else {
        // If no header, use a default cooldown of 1 hour
        resetTime = now + 60 * 60 * 1000
      }

      apiCallInfo.rateLimitReset = resetTime
      apiCallInfo.consecutiveErrors += 1

      console.error(`Rate limit exceeded. Reset at ${new Date(resetTime).toISOString()}`)
      return await getArticlesFromDB()
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`GNnews API responded with status ${response.status}: ${errorText}`)
      apiCallInfo.consecutiveErrors += 1
      return await getArticlesFromDB()
    }

    const data = await response.json()

    if (data.errors || !data.articles || data.articles.length === 0) {
      console.error("Error fetching from GNnews API:", data.errors || "No articles returned")
      apiCallInfo.consecutiveErrors += 1
      return await getArticlesFromDB()
    }

    // Transform the API response to match our database schema
    const articles = data.articles.map((article: any, index: number) => ({
      id: `gn-${Date.now()}-${index}`,
      title: article.title,
      description: article.description,
      content: article.content,
      source: article.source.name,
      published_at: article.publishedAt,
      url: article.url,
      image_url: article.image,
      category: determineCategory(article.title, article.description),
      like_count: 0,
      comment_count: 0,
      view_count: 0,
      upvote_count: 0,
    }))

    // Store articles in the database
    for (const article of articles) {
      // Check if article with similar title already exists to avoid duplicates
      const { data: existingArticles } = await supabase
        .from("articles")
        .select("id")
        .ilike("title", `%${article.title.substring(0, 30)}%`)
        .limit(1)

      if (existingArticles && existingArticles.length === 0) {
        await supabase.from("articles").insert(article)
      }
    }

    // Reset error counter on success
    apiCallInfo.consecutiveErrors = 0
    apiCallInfo.rateLimitReset = null

    // Update the last updated time in the API
    try {
      await fetch("/api/news/last-updated/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "success" }),
      })
    } catch (e) {
      console.error("Failed to update last updated time:", e)
    }

    console.log(`Stored ${articles.length} articles in the database at ${new Date().toISOString()}`)

    // Return the latest articles from the database
    return await getArticlesFromDB()
  } catch (error) {
    console.error("Error fetching news from API:", error)
    apiCallInfo.consecutiveErrors += 1
    return await getArticlesFromDB()
  }
}

// Function to get articles from the database
export async function getArticlesFromDB(limit = 20, category?: string) {
  const supabase = createServerSupabaseClient()

  try {
    let query = supabase.from("articles").select("*").order("published_at", { ascending: false })

    // Apply category filter if provided and not "all"
    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    // Apply limit
    query = query.limit(limit)

    const { data: articles, error } = await query

    if (error) {
      console.error("Error fetching articles from database:", error)
      return mockArticles
    }

    if (!articles || articles.length === 0) {
      console.log("No articles found in database, using mock data")

      // If no articles in DB, insert mock articles
      for (const article of mockArticles) {
        await supabase.from("articles").insert({
          id: `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title: article.title,
          description: article.description,
          content: article.content,
          source: article.source,
          published_at: article.publishedAt,
          url: article.url,
          image_url: article.image,
          category: article.category,
          like_count: article.likeCount || 0,
          comment_count: article.commentCount || 0,
          view_count: article.viewCount || 0,
          upvote_count: article.upvoteCount || 0,
        })
      }

      // Retry query with mock data inserted
      let retryQuery = supabase.from("articles").select("*").order("published_at", { ascending: false })

      // Apply category filter if provided and not "all"
      if (category && category !== "all") {
        retryQuery = retryQuery.eq("category", category)
      }

      // Apply limit
      retryQuery = retryQuery.limit(limit)

      const { data: insertedArticles } = await retryQuery

      return insertedArticles || mockArticles
    }

    return articles
  } catch (error) {
    console.error("Error in getArticlesFromDB:", error)
    return mockArticles
  }
}

// Function to fetch top news - use database
export async function fetchTopNews(limit = 10) {
  return await getArticlesFromDB(limit)
}

// Function to fetch news by category
export async function fetchNewsByCategory(category: string, limit = 10) {
  return await getArticlesFromDB(limit, category)
}

// Function to fetch article by ID
export async function fetchArticleById(id: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data: article, error } = await supabase.from("articles").select("*").eq("id", id).single()

    if (error || !article) {
      console.error("Error fetching article from database:", error)
      return null
    }

    // Increment view count
    await supabase
      .from("articles")
      .update({ view_count: article.view_count + 1 })
      .eq("id", id)

    return article
  } catch (error) {
    console.error("Error in fetchArticleById:", error)
    return null
  }
}

// Function to fetch related articles
export async function fetchRelatedArticles(category: string, currentId: string, limit = 3) {
  const supabase = createServerSupabaseClient()

  try {
    const { data: articles, error } = await supabase
      .from("articles")
      .select("*")
      .eq("category", category)
      .neq("id", currentId)
      .order("published_at", { ascending: false })
      .limit(limit)

    if (error || !articles) {
      console.error("Error fetching related articles from database:", error)
      return []
    }

    return articles
  } catch (error) {
    console.error("Error in fetchRelatedArticles:", error)
    return []
  }
}

// Function to get the last updated time
export async function getLastUpdated() {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("articles")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)

    if (error || !data || data.length === 0) {
      return {
        lastUpdated: new Date().toISOString(),
        status: "warning",
      }
    }

    return {
      lastUpdated: data[0].created_at,
      status: apiCallInfo.consecutiveErrors > 0 ? "warning" : "success",
    }
  } catch (error) {
    console.error("Error getting last updated time:", error)
    return {
      lastUpdated: new Date().toISOString(),
      status: "error",
    }
  }
}
