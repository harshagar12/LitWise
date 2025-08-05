import { NextResponse } from "next/server"

// Mock book data
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
  // Add more mock books as needed
]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const bookId = Number.parseInt(params.id)

  const book = mockBooks.find((b) => b.goodreads_book_id === bookId)

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  return NextResponse.json(book)
}
