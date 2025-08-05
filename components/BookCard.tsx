"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Star } from "lucide-react"

interface Book {
  goodreads_book_id: number
  book_id: number
  title: string
  authors: string
  average_rating: number
  ratings_count: number
  image_url: string
  reason?: string
}

interface BookCardProps {
  book: Book
  onAddToFavorites: (bookId: number) => void
  isFavorite: boolean
  clickable?: boolean
  onCardClick?: (bookId: number) => void
  showReason?: boolean
}

export const BookCard = ({
  book,
  onAddToFavorites,
  isFavorite,
  clickable = false,
  onCardClick,
  showReason = false,
}: BookCardProps) => {
  const handleCardClick = () => {
    if (clickable && onCardClick) {
      onCardClick(book.goodreads_book_id)
    }
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddToFavorites(book.goodreads_book_id)
  }

  return (
    <Card
      className={`group transition-all duration-200 hover:shadow-lg ${
        clickable ? "cursor-pointer" : ""
      } ${isFavorite ? "ring-2 ring-primary" : ""}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <img
              src={book.image_url || `/placeholder.svg?height=120&width=80&text=${encodeURIComponent(book.title)}`}
              alt={book.title}
              className="w-20 h-30 object-cover rounded-md"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm line-clamp-2 text-foreground">{book.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteClick}
                className={`ml-2 ${isFavorite ? "text-red-500" : "text-muted-foreground"}`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">by {book.authors}</p>

            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{book.average_rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-muted-foreground">({book.ratings_count.toLocaleString()} ratings)</span>
            </div>

            {showReason && book.reason && (
              <Badge variant="secondary" className="text-xs">
                {book.reason}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
