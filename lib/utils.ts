// Utility functions for the news platform

// Determine the category of an article based on its title and description
export function determineCategory(title: string, description: string) {
  const content = (title + " " + description).toLowerCase()

  if (
    content.includes("tech") ||
    content.includes("ai") ||
    content.includes("digital") ||
    content.includes("software") ||
    content.includes("computer")
  ) {
    return "Technology"
  } else if (
    content.includes("business") ||
    content.includes("company") ||
    content.includes("market") ||
    content.includes("stock") ||
    content.includes("economy")
  ) {
    return "Business"
  } else if (
    content.includes("health") ||
    content.includes("medical") ||
    content.includes("disease") ||
    content.includes("treatment") ||
    content.includes("doctor")
  ) {
    return "Health"
  } else if (
    content.includes("sport") ||
    content.includes("game") ||
    content.includes("player") ||
    content.includes("team") ||
    content.includes("match")
  ) {
    return "Sports"
  } else if (
    content.includes("science") ||
    content.includes("research") ||
    content.includes("study") ||
    content.includes("discovery")
  ) {
    return "Science"
  } else if (
    content.includes("entertainment") ||
    content.includes("movie") ||
    content.includes("music") ||
    content.includes("celebrity") ||
    content.includes("film")
  ) {
    return "Entertainment"
  } else if (
    content.includes("politics") ||
    content.includes("government") ||
    content.includes("election") ||
    content.includes("president") ||
    content.includes("minister")
  ) {
    return "Politics"
  } else {
    return "World"
  }
}

// Helper function to format relative time
export function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) {
    return "just now"
  } else if (diffMins === 1) {
    return "1 minute ago"
  } else if (diffMins < 60) {
    return `${diffMins} minutes ago`
  } else if (diffMins < 120) {
    return "1 hour ago"
  } else if (diffMins < 1440) {
    return `${Math.floor(diffMins / 60)} hours ago`
  } else if (diffMins < 2880) {
    return "1 day ago"
  } else {
    return `${Math.floor(diffMins / 1440)} days ago`
  }
}

// Utility function for className merging
export function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
