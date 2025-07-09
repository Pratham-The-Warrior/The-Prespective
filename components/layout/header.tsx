"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import Logo from "@/components/logo"
import NotificationBell from "@/components/notifications/notification-bell"
import RefreshNewsButton from "@/components/admin/refresh-news-button"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const supabase = getSupabaseBrowserClient()

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data?.session?.user) {
          setUser(data.session.user)

          // Check if user is admin
          const { data: userData } = await supabase
            .from("users")
            .select("is_admin")
            .eq("id", data.session.user.id)
            .single()

          if (userData?.is_admin) {
            setIsAdmin(true)
          }
        }
      } catch (error) {
        console.error("Error checking user:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setIsAdmin(false)
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-blue-600 ${
              pathname === "/" ? "text-blue-600" : "text-gray-600"
            }`}
          >
            Home
          </Link>
          <Link
            href="/category/technology"
            className={`text-sm font-medium transition-colors hover:text-blue-600 ${
              pathname === "/category/technology" ? "text-blue-600" : "text-gray-600"
            }`}
          >
            Tech
          </Link>
          <Link
            href="/category/business"
            className={`text-sm font-medium transition-colors hover:text-blue-600 ${
              pathname === "/category/business" ? "text-blue-600" : "text-gray-600"
            }`}
          >
            Business
          </Link>
          <Link
            href="/category/politics"
            className={`text-sm font-medium transition-colors hover:text-blue-600 ${
              pathname === "/category/politics" ? "text-blue-600" : "text-gray-600"
            }`}
          >
            Geopolitics
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:flex md:w-64">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search articles..."
                className="w-full rounded-full bg-gray-100 pl-8 pr-4 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          {/* Admin Refresh Button */}
          {isAdmin && <RefreshNewsButton />}

          {/* Notification Bell */}
          {user && <NotificationBell user={user} />}

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.email} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || user.email}</p>
                    <p className="text-xs leading-none text-gray-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.id}`}>Profile</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/moderation">Moderation</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="container mx-auto px-4 py-4 md:hidden">
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="w-full rounded-full bg-gray-100 pl-8 pr-4"
            />
          </div>
          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname === "/" ? "text-blue-600" : "text-gray-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/category/technology"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname === "/category/technology" ? "text-blue-600" : "text-gray-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Tech
            </Link>
            <Link
              href="/category/business"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname === "/category/business" ? "text-blue-600" : "text-gray-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Business
            </Link>
            <Link
              href="/category/politics"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname === "/category/politics" ? "text-blue-600" : "text-gray-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Geopolitics
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
