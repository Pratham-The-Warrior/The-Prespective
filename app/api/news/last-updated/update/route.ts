import { NextResponse } from "next/server"

// This would normally update a database entry
// For simplicity, we're just returning a success response
export async function POST(request: Request) {
  try {
    const data = await request.json()

    return NextResponse.json({
      success: true,
      status: data.status || "success",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    )
  }
}
