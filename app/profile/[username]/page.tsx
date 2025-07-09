import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import UserPerspectives from "@/components/profile/user-perspectives"

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = params
  const supabase = createServerSupabaseClient()

  // Fetch user profile
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", decodeURIComponent(username))
    .single()

  if (error || !user) {
    notFound()
  }

  // Fetch user stats
  const { data: perspectivesCount } = await supabase
    .from("comments")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)

  const { data: upvotesReceived } = await supabase
    .from("comment_votes")
    .select("value")
    .in("comment_id", supabase.from("comments").select("id").eq("user_id", user.id))
    .eq("value", 1)

  const { data: downvotesReceived } = await supabase
    .from("comment_votes")
    .select("value")
    .in("comment_id", supabase.from("comments").select("id").eq("user_id", user.id))
    .eq("value", -1)

  const stats = {
    perspectives: perspectivesCount?.length || 0,
    upvotes: upvotesReceived?.length || 0,
    downvotes: downvotesReceived?.length || 0,
    karma: (upvotesReceived?.length || 0) - (downvotesReceived?.length || 0),
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar_url || ""} alt={user.username} />
              <AvatarFallback className="text-2xl">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-gray-500 mt-1">
                Member since {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
              </p>

              {user.bio && <p className="mt-4">{user.bio}</p>}

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <div className="text-center">
                  <p className="text-lg font-semibold">{stats.perspectives}</p>
                  <p className="text-sm text-gray-500">Perspectives</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">{stats.karma}</p>
                  <p className="text-sm text-gray-500">Karma</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-500">{stats.upvotes}</p>
                  <p className="text-sm text-gray-500">Upvotes</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-red-500">{stats.downvotes}</p>
                  <p className="text-sm text-gray-500">Downvotes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="perspectives">
          <TabsList className="mb-6">
            <TabsTrigger value="perspectives">Perspectives</TabsTrigger>
            <TabsTrigger value="upvoted">Upvoted</TabsTrigger>
            <TabsTrigger value="downvoted">Downvoted</TabsTrigger>
          </TabsList>

          <TabsContent value="perspectives">
            <UserPerspectives userId={user.id} type="authored" />
          </TabsContent>

          <TabsContent value="upvoted">
            <UserPerspectives userId={user.id} type="upvoted" />
          </TabsContent>

          <TabsContent value="downvoted">
            <UserPerspectives userId={user.id} type="downvoted" />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
