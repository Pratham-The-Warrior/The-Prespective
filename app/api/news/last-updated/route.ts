import { NextResponse } from "next/server"
import { getLastUpdated } from "@/lib/news-service"

export async function GET() {
  const { lastUpdated, status } = getLastUpdated()

  return NextResponse.json({
    lastUpdated,
    status,
  })
}
