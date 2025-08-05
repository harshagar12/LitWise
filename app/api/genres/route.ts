import { NextResponse } from "next/server"
import { URL } from "url"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  try {
    const topN = Number.parseInt(searchParams.get("top_n") || "20")

    // Call Python recommendation engine
    const response = await fetch("http://localhost:8000/api/python/genres", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ top_n: topN }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch genres from Python engine")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching genres:", error)

    // Fallback to mock data if Python engine is not available
    const mockGenres = [
      { tag_id: 1, tag_name: "fiction" },
      { tag_id: 2, tag_name: "fantasy" },
      { tag_id: 3, tag_name: "romance" },
      { tag_id: 4, tag_name: "mystery" },
      { tag_id: 5, tag_name: "thriller" },
      { tag_id: 6, tag_name: "science-fiction" },
      { tag_id: 7, tag_name: "historical-fiction" },
      { tag_id: 8, tag_name: "young-adult" },
      { tag_id: 9, tag_name: "non-fiction" },
      { tag_id: 10, tag_name: "biography" },
      { tag_id: 11, tag_name: "memoir" },
      { tag_id: 12, tag_name: "self-help" },
      { tag_id: 13, tag_name: "business" },
      { tag_id: 14, tag_name: "history" },
      { tag_id: 15, tag_name: "philosophy" },
      { tag_id: 16, tag_name: "psychology" },
      { tag_id: 17, tag_name: "horror" },
      { tag_id: 18, tag_name: "adventure" },
      { tag_id: 19, tag_name: "comedy" },
      { tag_id: 20, tag_name: "drama" },
    ]

    return NextResponse.json(mockGenres.slice(0, Number.parseInt(searchParams.get("top_n") || "20")))
  }
}
