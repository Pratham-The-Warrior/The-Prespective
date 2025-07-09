import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ModerationQueue from "@/components/admin/moderation-queue"

export default async function ModerationPage() {
  const supabase = createServerSupabaseClient()

  // Check if user is admin or moderator
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  const { data: user } = await supabase
    .from("users")
    .select("is_admin, is_moderator")
    .eq("id", session.user.id)
    .single()

  if (!user || (!user.is_admin && !user.is_moderator)) {
    redirect("/")
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Content Moderation</h1>

        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending Reports</TabsTrigger>
            <TabsTrigger value="resolved">Resolved Reports</TabsTrigger>
            <TabsTrigger value="rejected">Rejected Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <ModerationQueue status="pending" />
          </TabsContent>

          <TabsContent value="resolved">
            <ModerationQueue status="resolved" />
          </TabsContent>

          <TabsContent value="rejected">
            <ModerationQueue status="rejected" />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
