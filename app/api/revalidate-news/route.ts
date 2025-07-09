import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    // Get the token from the request
    const { token } = await request.json()

    // Check if the token is valid (server-side only)
    const validToken = process.env.REVALIDATION_TOKEN

    if (token !== validToken) {
      return NextResponse.json({ revalidated: false, message: "Invalid token" }, { status: 401 })
    }

    // Revalidate the paths
    revalidatePath("/")
    revalidatePath("/article/[id]")
    revalidatePath("/category/[slug]")

    // Update the last updated timestamp
    const timestamp = new Date().toISOString()

    // Here you would typically update a database with the timestamp

    return NextResponse.json({
      revalidated: true,
      timestamp,
      message: "Revalidation successful",
    })
  } catch (error) {
    console.error("Error during revalidation:", error)
    return NextResponse.json({ revalidated: false, message: "Error during revalidation" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // For backward compatibility, but we'll use POST for actual revalidation
  return NextResponse.json({ message: "Use POST for revalidation" })
}
