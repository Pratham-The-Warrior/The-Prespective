import Link from "next/link"
import Image from "next/image"
import { fetchTopNews } from "@/lib/news-service"
import { formatRelativeTime } from "@/lib/utils"
import { Eye, MessageSquare, ArrowUp, Cpu, Briefcase, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Define category metadata
const categoryMeta = {
  technology: {
    title: "Technology News",
    description: "Stay updated with the latest in tech innovation, gadgets, and digital trends",
    icon: Cpu,
    color: "text-blue-600",
  },
  business: {
    title: "Business News",
    description: "Follow market trends, company updates, and economic developments",
    icon: Briefcase,
    color: "text-green-600",
  },
  politics: {
    title: "Geopolitics News",
    description: "Understand global politics, international relations, and policy changes",
    icon: Globe,
    color: "text-purple-600",
  },
}

export default async function CategoryPage({ params }) {
  const { slug } = params
  const normalizedSlug = slug.toLowerCase()

  // Get category metadata or default
  const meta = categoryMeta[normalizedSlug] || {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} News`,
    description: "Latest news and updates",
    icon: null,
    color: "text-gray-600",
  }

  // Fetch articles and filter by category
  const allArticles = await fetchTopNews(30)
  const articles = allArticles.filter((article) => article.category?.toLowerCase() === normalizedSlug)

  const IconComponent = meta.icon

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-2">
            {IconComponent && <IconComponent className={`h-6 w-6 ${meta.color} mr-2`} />}
            <h1 className="text-3xl font-bold">{meta.title}</h1>
          </div>
          <p className="text-gray-600">{meta.description}</p>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link key={article.id} href={`/article/${article.id}`} className="group block">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={article.image_url || "/placeholder.svg?height=200&width=400"}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge
                        className={cn(
                          "text-xs font-medium",
                          normalizedSlug === "technology"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                            : normalizedSlug === "business"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : normalizedSlug === "politics"
                                ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200",
                        )}
                      >
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">{article.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{article.view_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{article.comment_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ArrowUp className="h-3.5 w-3.5" />
                          <span>{article.upvote_count}</span>
                        </div>
                      </div>
                      <span className="text-xs">{formatRelativeTime(article.published_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-gray-500">No articles found in this category.</p>
            <Link href="/" className="mt-4 text-blue-600 hover:underline">
              Return to homepage
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
