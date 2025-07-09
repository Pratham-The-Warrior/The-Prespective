"use client"

import { useState } from "react"
import { Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User } from "@/lib/supabase/database.types"

interface ReportButtonProps {
  contentType: "comment" | "article"
  contentId: string
  currentUser: User | null
}

export default function ReportButton({ contentType, contentId, currentUser }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState<string>("")
  const [reasonType, setReasonType] = useState<string>("")
  const [customReason, setCustomReason] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const handleSubmit = async () => {
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to report content.",
        variant: "destructive",
      })
      return
    }

    if (!reasonType) {
      toast({
        title: "Reason required",
        description: "Please select a reason for reporting this content.",
        variant: "destructive",
      })
      return
    }

    if (reasonType === "other" && !customReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for reporting this content.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const finalReason = reasonType === "other" ? customReason : reason

      const { error } = await supabase.from("reported_content").insert({
        content_type: contentType,
        content_id: contentId,
        reporter_id: currentUser.id,
        reason: finalReason,
      })

      if (error) throw error

      toast({
        title: "Report submitted",
        description: "Thank you for helping to keep our community safe.",
      })

      setIsOpen(false)
      setReason("")
      setReasonType("")
      setCustomReason("")
    } catch (error) {
      console.error("Error submitting report:", error)
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
          <Flag className="h-4 w-4 mr-1" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Please let us know why you're reporting this {contentType}. Our moderators will review your report.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={reasonType}
            onValueChange={(value) => {
              setReasonType(value)
              if (value === "harassment") setReason("Harassment or bullying")
              if (value === "hate") setReason("Hate speech or symbols")
              if (value === "violence") setReason("Violence or threats")
              if (value === "misinformation") setReason("Misinformation")
              if (value === "spam") setReason("Spam or misleading")
            }}
          >
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="harassment" id="harassment" />
              <Label htmlFor="harassment">Harassment or bullying</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="hate" id="hate" />
              <Label htmlFor="hate">Hate speech or symbols</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="violence" id="violence" />
              <Label htmlFor="violence">Violence or threats</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="misinformation" id="misinformation" />
              <Label htmlFor="misinformation">Misinformation</Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="spam" id="spam" />
              <Label htmlFor="spam">Spam or misleading</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
          </RadioGroup>

          {reasonType === "other" && (
            <div className="mt-4">
              <Label htmlFor="custom-reason">Please specify:</Label>
              <Textarea
                id="custom-reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please provide details about why you're reporting this content..."
                className="mt-1"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
