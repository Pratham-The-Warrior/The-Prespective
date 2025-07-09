import { fetchArticleById, fetchRelatedArticles } from "@/lib/news-service"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Eye, MessageSquare, Heart, ArrowLeft, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import PerspectivesSection from "@/components/perspectives-section"
import ArticleVoteButton from "@/components/article-vote-button"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

interface ArticlePageProps {
  params: {
    id: string
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await fetchArticleById(params.id)

  if (!article) {
    notFound()
  }

  const relatedArticles = await fetchRelatedArticles(article.category || "World", article.id)

  // Get current user for the vote button
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  let currentUser = null

  if (session?.user) {
    const { data: user } = await supabase.from("users").select("*").eq("id", session.user.id).single()

    if (user) {
      currentUser = user
    }
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>

            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="mb-4">
                <Badge
                  className={cn(
                    "mb-4",
                    article.category?.toLowerCase() === "technology"
                      ? "bg-blue-100 text-blue-800"
                      : article.category?.toLowerCase() === "business"
                        ? "bg-green-100 text-green-800"
                        : article.category?.toLowerCase() === "politics"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800",
                  )}
                >
                  {article.category}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{article.title}</h1>

                <div className="flex items-center justify-between text-gray-500 text-sm mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">Source: {article.source}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {article.image_url && (
                  <div className="relative w-full h-[500px] mb-8 rounded-xl overflow-hidden">
                    <Image
                      src={article.image_url || "/placeholder.svg"}
                      alt={article.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                )}

                <div className="prose prose-lg max-w-none mb-8">
                  <p className="text-xl text-gray-700 mb-6 leading-relaxed">{article.description}</p>
                  <div
                    className="text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </div>

                <div className="flex items-center justify-between border-t border-b py-4 mb-8">
                  <div className="flex items-center space-x-6 text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5" />
                      <span>{article.view_count} views</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="h-5 w-5" />
                      <span>{article.like_count} likes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>{article.comment_count} perspectives</span>
                    </div>
                  </div>

                  <ArticleVoteButton
                    articleId={article.id}
                    currentUser={currentUser}
                    initialCount={article.upvote_count}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <PerspectivesSection articleId={article.id} />
          </div>

          {relatedArticles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <Link key={related.id} href={`/article/${related.id}`} className="block group">
                    <div className="relative h-48 mb-3 overflow-hidden rounded-lg">
                      <Image
                        src={related.image_url || "/placeholder.svg?height=400&width=600"}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold group-hover:text-blue-600 transition-colors line-clamp-2">
                      {related.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </main>
  )
}
