"use client"

import { useState, useRef, useEffect } from "react"
import { Share2, Twitter, Facebook, Linkedin, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShareDropdownProps {
  url: string
  title: string
}

export function ShareDropdown({ url, title }: ShareDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url

  const shareOptions = [
    {
      name: "Twitter",
      icon: <Twitter className="h-4 w-4" />,
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank",
        ),
    },
    {
      name: "Facebook",
      icon: <Facebook className="h-4 w-4" />,
      action: () =>
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank"),
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-4 w-4" />,
      action: () =>
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank"),
    },
    {
      name: "Copy Link",
      icon: <LinkIcon className="h-4 w-4" />,
      action: () => {
        navigator.clipboard.writeText(shareUrl)
        alert("Link copied to clipboard!")
      },
    },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setIsOpen(!isOpen)}>
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border bg-white shadow-lg z-10">
          <div className="py-1">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  option.action()
                  setIsOpen(false)
                }}
              >
                {option.icon}
                <span className="ml-2">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
