"use client"

import { formatDistanceToNow } from "date-fns"
import { Heart, MessageSquare, ArrowUp, AtSign, Bell } from "lucide-react"
import Link from "next/link"
import type { Notification, NotificationType } from "@/lib/supabase/database.types"

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
}

export default function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const { id, type, content, created_at, is_read, related_id } = notification

  // Get the appropriate icon based on notification type
  const getIcon = () => {
    switch (type as NotificationType) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      case "reply":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "upvote":
        return <ArrowUp className="h-4 w-4 text-green-500" />
      case "mention":
        return <AtSign className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  // Get the appropriate link based on notification type
  const getLink = () => {
    switch (type as NotificationType) {
      case "like":
      case "reply":
      case "upvote":
        if (related_id.startsWith("gn-")) {
          return `/article/${related_id}`
        }
        return `/perspective/${related_id}`
      case "mention":
        return `/perspective/${related_id}`
      default:
        return "#"
    }
  }

  const handleClick = () => {
    if (!is_read) {
      onRead(id)
    }
  }

  return (
    <Link
      href={getLink()}
      className={`block w-full p-3 hover:bg-gray-50 ${!is_read ? "bg-blue-50" : ""}`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1">
          <p className="text-sm">{content}</p>
          <p className="mt-1 text-xs text-gray-500">{formatDistanceToNow(new Date(created_at), { addSuffix: true })}</p>
        </div>
      </div>
    </Link>
  )
}
