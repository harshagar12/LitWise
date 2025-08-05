import { NextResponse } from "next/server"
import { URL } from "url"

// Get Python backend URL from environment variable
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "https://litwise-backend.onrender.com"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const selectedTagIds = searchParams.getAll("selected_tag_ids").map((id) => Number.parseInt(id))
    const numClusters = Number.parseInt(searchParams.get("num_clusters") || "3")

    if (selectedTagIds.length === 0) {
      return NextResponse.json({ error: "No tags selected" }, { status: 400 })
    }

    // Call Python recommendation engine
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/python/clusters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        selected_tag_ids: selectedTagIds,
        num_clusters: numClusters,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch clusters from Python engine")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching clusters:", error)

    // Fallback to mock data
    const mockBooks = [
      {
        goodreads_book_id: 1,
        book_id: 1,
        title: "The Great Gatsby",
        authors: "F. Scott Fitzgerald",
        average_rating: 4.2,
        ratings_count: 1500000,
        image_url: "/placeholder.svg?height=200&width=150&text=The+Great+Gatsby",
      },
      {
        goodreads_book_id: 2,
        book_id: 2,
        title: "To Kill a Mockingbird",
        authors: "Harper Lee",
        average_rating: 4.5,
        ratings_count: 2000000,
        image_url: "/placeholder.svg?height=200&width=150&text=To+Kill+a+Mockingbird",
      },
      {
        goodreads_book_id: 3,
        book_id: 3,
        title: "1984",
        authors: "George Orwell",
        average_rating: 4.3,
        ratings_count: 1800000,
        image_url: "/placeholder.svg?height=200&width=150&text=1984",
      },
    ]

    const numClusters = Number.parseInt(request.url.split("num_clusters=")[1] || "3")
    const clusters = []
    const booksPerCluster = Math.ceil(mockBooks.length / numClusters)

    for (let i = 0; i < numClusters; i++) {
      const startIndex = i * booksPerCluster
      const endIndex = Math.min(startIndex + booksPerCluster, mockBooks.length)
      const clusterBooks = mockBooks.slice(startIndex, endIndex)

      clusters.push({
        cluster_name: `Cluster ${i + 1}`,
        books: clusterBooks,
      })
    }

    return NextResponse.json(clusters)
  }
}
