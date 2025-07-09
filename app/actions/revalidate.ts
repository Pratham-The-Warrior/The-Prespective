"use server"

import { revalidatePath } from "next/cache"

export async function revalidateNews() {
  try {
    // Revalidate the home page and news pages
    revalidatePath("/")
    revalidatePath("/article/[id]")
    revalidatePath("/category/[slug]")

    // Update the last updated timestamp
    const timestamp = new Date().toISOString()

    // Store the timestamp in the database or another persistent storage
    // This is a simplified example - you would typically update a database

    return { success: true, timestamp }
  } catch (error) {
    console.error("Error revalidating news:", error)
    return { success: false, error: "Failed to revalidate news" }
  }
}
