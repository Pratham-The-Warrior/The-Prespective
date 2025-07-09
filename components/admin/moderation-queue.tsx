"use client"

import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, XCircle, Eye } from "lucide-react"
import Link from "next/link"
import type { ReportedContent, ReportStatus } from "@/lib/supabase/database.types"

interface ModerationQueueProps {
  status: ReportStatus
}

export default function ModerationQueue({ status }: ModerationQueueProps) {
  const [reports, setReports] = useState<ReportedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const fetchReports = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("reported_content")
        .select(
          `
          *,
          reporter:reporter_id(username),
          resolver:resolved_by(username)
        `,
        )
        .eq("status", status)
        .order("created_at", { ascending: false })

      if (error) throw error

      setReports(data || [])
    } catch (error) {
      console.error("Error fetching reports:", error)
      setError("Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [status])

  const handleAction = async (reportId: string, action: "resolve" | "reject") => {
    try {
      const { data: session } = await supabase.auth.getSession()

      if (!session.session) {
        toast({
          title: "Error",
          description: "You must be logged in to perform this action.",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase
        .from("reported_content")
        .update({
          status: action === "resolve" ? "resolved" : "rejected",
          resolved_by: session.session.user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId)

      if (error) throw error

      // If resolving, take action on the reported content
      if (action === "resolve") {
        const report = reports.find((r) => r.id === reportId)
        if (report) {
          if (report.content_type === "comment") {
            // Hide the comment
            await supabase.from("comments").update({ status: "hidden" }).eq("id", report.content_id)
          }
          // Add more content types as needed
        }
      }

      toast({
        title: "Success",
        description: `Report ${action === "resolve" ? "resolved" : "rejected"} successfully.`,
      })

      // Remove the report from the current view
      setReports((prev) => prev.filter((report) => report.id !== reportId))
    } catch (error) {
      console.error(`Error ${action}ing report:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action} report.`,
        variant: "destructive",
      })
    }
  }

  const getContentLink = (report: ReportedContent) => {
    if (report.content_type === "comment") {
      return `/article/${report.content_id.split("-")[0]}#comment-${report.content_id}`
    }
    if (report.content_type === "article") {
      return `/article/${report.content_id}`
    }
    return "#"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchReports}>Try Again</Button>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">No {status} reports found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div key={report.id} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Badge variant={status === "pending" ? "outline" : status === "resolved" ? "default" : "secondary"}>
                {status === "pending" ? (
                  <AlertTriangle className="mr-1 h-3 w-3 text-yellow-500" />
                ) : status === "resolved" ? (
                  <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="mr-1 h-3 w-3 text-red-500" />
                )}
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <Badge variant="outline">{report.content_type}</Badge>
              <span className="text-sm text-gray-500">
                Reported {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
              </span>
            </div>

            {status === "pending" && (
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={getContentLink(report)}>
                    <Eye className="mr-1 h-4 w-4" />
                    View Content
                  </Link>
                </Button>
                <Button size="sm" variant="default" onClick={() => handleAction(report.id, "resolve")}>
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Resolve
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleAction(report.id, "reject")}>
                  <XCircle className="mr-1 h-4 w-4" />
                  Reject
                </Button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <h3 className="font-semibold">Reason:</h3>
            <p className="mt-1">{report.reason}</p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              Reported by: <span className="font-medium">{(report.reporter as any)?.username || "Unknown"}</span>
            </div>
            {report.resolved_by && (
              <div>
                {status === "resolved" ? "Resolved" : "Rejected"} by:{" "}
                <span className="font-medium">{(report.resolver as any)?.username || "Unknown"}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
