import Link from "next/link"
import Image from "next/image"
import { fetchTopNews } from "@/lib/news-service"
import { formatRelativeTime } from "@/lib/utils"
import { Eye, MessageSquare, ArrowUp, TrendingUp, Cpu, Briefcase, Globe, Newspaper } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import NewsAutoUpdater from "@/components/news-auto-updater"
import NewsUpdateIndicator from "@/components/news-update-indicator"
import CategoryNav from "@/components/category-nav"
import { cn } from "@/lib/utils"

export default async function Home() {
  const articles = await fetchTopNews(20)

  // Organize articles by category
  const techArticles = articles.filter((article) => article.category?.toLowerCase() === "technology")
  const businessArticles = articles.filter((article) => article.category?.toLowerCase() === "business")
  const geopoliticsArticles = articles.filter((article) => article.category?.toLowerCase() === "politics")

  // Get remaining articles for other sections
  const featuredArticle = articles[0]
  const trendingArticles = articles.slice(1, 5)
  const latestArticles = articles.slice(5, 11)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Today's Top Stories
          </h1>
          <div className="flex items-center space-x-2">
            <NewsUpdateIndicator />
          </div>
        </div>

        <CategoryNav />

        {/* Hero Section */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 mb-12">
          {/* Featured Article */}
          <div className="md:col-span-8">
            {featuredArticle && (
              <Link href={`/article/${featuredArticle.id}`} className="group block">
                <div className="relative mb-4 h-[450px] w-full overflow-hidden rounded-xl shadow-lg">
                  <Image
                    src={featuredArticle.image_url || "/placeholder.svg?height=450&width=800"}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8">
                    <Badge className="mb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                      {featuredArticle.category}
                    </Badge>
                    <h2 className="mb-3 text-3xl font-bold text-white leading-tight">{featuredArticle.title}</h2>
                    <p className="mb-4 text-gray-200 line-clamp-2">{featuredArticle.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <span className="font-medium">{featuredArticle.source}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(featuredArticle.published_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Trending Stories */}
          <div className="space-y-4 md:col-span-4">
            <div className="flex items-center mb-5">
              <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
              <h2 className="text-xl font-bold">Trending Now</h2>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 space-y-5">
              {trendingArticles.map((article, index) => (
                <Link key={article.id} href={`/article/${article.id}`} className="group block">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0 font-bold text-2xl text-gray-300">{index + 1}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                          {article.category}
                        </Badge>
                        <span>•</span>
                        <span>{formatRelativeTime(article.published_at)}</span>
                      </div>
                    </div>
                  </div>
                  {index < trendingArticles.length - 1 && <div className="border-b border-gray-100 mt-5"></div>}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Category Sections */}
        <div className="space-y-12">
          {/* Tech Section */}
          {techArticles.length > 0 && (
            <section>
              <div className="flex items-center mb-6">
                <Cpu className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold">Tech</h2>
                <div className="ml-auto">
                  <Link href="/category/technology" className="text-blue-600 hover:underline text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {techArticles.slice(0, 3).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* Business Section */}
          {businessArticles.length > 0 && (
            <section>
              <div className="flex items-center mb-6">
                <Briefcase className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-2xl font-bold">Business</h2>
                <div className="ml-auto">
                  <Link href="/category/business" className="text-blue-600 hover:underline text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {businessArticles.slice(0, 3).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* Geopolitics Section */}
          {geopoliticsArticles.length > 0 && (
            <section>
              <div className="flex items-center mb-6">
                <Globe className="h-6 w-6 text-purple-600 mr-2" />
                <h2 className="text-2xl font-bold">Geopolitics</h2>
                <div className="ml-auto">
                  <Link href="/category/politics" className="text-blue-600 hover:underline text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {geopoliticsArticles.slice(0, 3).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* Latest News */}
          <section>
            <div className="flex items-center mb-6">
              <Newspaper className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold">Latest News</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        </div>
      </div>

      <NewsAutoUpdater />
    </main>
  )
}

function ArticleCard({ article }) {
  return (
    <Link href={`/article/${article.id}`} className="group block">
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
                article.category?.toLowerCase() === "technology"
                  ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                  : article.category?.toLowerCase() === "business"
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : article.category?.toLowerCase() === "politics"
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
  )
}
