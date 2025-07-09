"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User, Notification } from "@/lib/supabase/database.types"
import NotificationItem from "./notification-item"

interface NotificationBellProps {
  user: User | null
}

export default function NotificationBell({ user }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "Error",
        description: "Failed to load notifications.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false)

      if (error) throw error

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)

      toast({
        title: "Success",
        description: "All notifications marked as read.",
      })
    } catch (error) {
      console.error("Error marking notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notifications as read.",
        variant: "destructive",
      })
    }
  }

  // Mark a single notification as read
  const markAsRead = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id)

      if (error) throw error

      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!user) return

    fetchNotifications()

    // Subscribe to changes in the notifications table for this user
    const subscription = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch notifications when there's a change
          fetchNotifications()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-xs text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={isLoading}>
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No notifications yet</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="cursor-default p-0">
                <NotificationItem notification={notification} onRead={markAsRead} />
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
