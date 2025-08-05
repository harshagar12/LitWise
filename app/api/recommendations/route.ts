import { NextResponse } from "next/server"

// Get Python backend URL from environment variable
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "https://litwise-backend.onrender.com"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { favorite_goodreads_book_ids, top_n = 10 } = body

    if (!favorite_goodreads_book_ids || favorite_goodreads_book_ids.length === 0) {
      return NextResponse.json({ error: "No favorite books provided" }, { status: 400 })
    }

    // Call Python recommendation engine
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/python/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        favorite_goodreads_book_ids,
        top_n,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch recommendations from Python engine")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching recommendations:", error)

    // Fallback to mock recommendations
    const mockRecommendations = [
      {
        goodreads_book_id: 11,
        book_id: 11,
        title: "The Alchemist",
        authors: "Paulo Coelho",
        average_rating: 4.2,
        ratings_count: 1100000,
        image_url: "/placeholder.svg?height=200&width=150&text=The+Alchemist",
      },
      {
        goodreads_book_id: 12,
        book_id: 12,
        title: "Brave New World",
        authors: "Aldous Huxley",
        average_rating: 4.0,
        ratings_count: 950000,
        image_url: "/placeholder.svg?height=200&width=150&text=Brave+New+World",
      },
      {
        goodreads_book_id: 13,
        book_id: 13,
        title: "The Book Thief",
        authors: "Markus Zusak",
        average_rating: 4.5,
        ratings_count: 1300000,
        image_url: "/placeholder.svg?height=200&width=150&text=The+Book+Thief",
      },
    ]

    const body = await request.json()
    const { top_n = 10 } = body
    const recommendations = mockRecommendations.slice(0, top_n)

    return NextResponse.json({ recommendations })
  }
}
