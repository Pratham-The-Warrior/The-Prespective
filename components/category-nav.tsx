"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Cpu, Briefcase, Globe, Home } from "lucide-react"

export default function CategoryNav() {
  const pathname = usePathname()
  const [activeCategory, setActiveCategory] = useState("")

  useEffect(() => {
    if (pathname === "/") {
      setActiveCategory("home")
    } else if (pathname.includes("/category/")) {
      const category = pathname.split("/category/")[1]
      setActiveCategory(category)
    } else {
      setActiveCategory("")
    }
  }, [pathname])

  const categories = [
    { name: "home", label: "All", icon: Home, href: "/" },
    { name: "technology", label: "Tech", icon: Cpu, href: "/category/technology" },
    { name: "business", label: "Business", icon: Briefcase, href: "/category/business" },
    { name: "politics", label: "Geopolitics", icon: Globe, href: "/category/politics" },
  ]

  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex space-x-1 border-b">
        {categories.map((category) => {
          const Icon = category.icon
          const isActive = activeCategory === category.name

          return (
            <Link
              key={category.name}
              href={category.href}
              className={`flex items-center space-x-1 px-4 py-2 text-sm font-medium transition-colors ${
                isActive ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
              <span>{category.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
