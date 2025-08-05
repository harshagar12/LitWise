"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BookCard } from "@/components/BookCard"
import { ArrowLeft, RefreshCw, Grid3X3, List, Filter } from "lucide-react"

interface Book {
  goodreads_book_id: number
  book_id: number
  title: string
  authors: string
  average_rating: number
  ratings_count: number
  image_url: string
}

interface RecommendationsDashboardProps {
  selectedGenres: number[]
  selectedBooks: number[]
  onBack: () => void
}

export const RecommendationsDashboard = ({ selectedGenres, selectedBooks, onBack }: RecommendationsDashboardProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [favorites, setFavorites] = useState<number[]>([])
  const [recommendations, setRecommendations] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            favorite_goodreads_book_ids: selectedBooks,
            top_n: 21,
          }),
        })

        const data = await response.json()
        setRecommendations(data.recommendations || [])
      } catch (error) {
        console.error("Failed to fetch recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    if (selectedBooks.length > 0) {
      fetchRecommendations()
    } else {
      setLoading(false)
    }
  }, [selectedBooks])

  const handleAddToFavorites = (bookId: number) => {
    setFavorites((prev) => (prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]))
  }

  const handleRefresh = () => {
    setLoading(true)
    // Re-fetch recommendations
    const fetchRecommendations = async () => {
      try {
        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            favorite_goodreads_book_ids: selectedBooks,
            top_n: 21,
          }),
        })

        const data = await response.json()
        setRecommendations(data.recommendations || [])
      } catch (error) {
        console.error("Failed to fetch recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating your recommendations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Fixed Header */}
      <header className="h-16 border-b bg-card shadow-sm flex-shrink-0 z-10">
        <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Recommended For You</h1>
              <p className="text-sm text-muted-foreground">Based on your selected preferences</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <div className="border rounded-md p-1 flex">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Sidebar */}
        <aside className="w-80 flex-shrink-0 bg-background border-r overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* User Preferences */}
            <div className="bg-card rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold mb-4">Your Preferences</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Selected Books</h4>
                  <p className="text-sm text-foreground">
                    {selectedBooks.length} book{selectedBooks.length !== 1 ? "s" : ""} selected
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Reading List</h4>
                  <p className="text-sm text-foreground">
                    {favorites.length} book{favorites.length !== 1 ? "s" : ""} saved
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-card rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Recommendations</span>
                  <span className="text-sm font-medium">{recommendations.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Books Saved</span>
                  <span className="text-sm font-medium">{favorites.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Genres Selected</span>
                  <span className="text-sm font-medium">{selectedGenres.length}</span>
                </div>
              </div>
            </div>

            {/* Reading Insights */}
            <div className="bg-blue-600 rounded-lg p-6 text-white">
              <h3 className="font-semibold mb-2">💡 Reading Insight</h3>
              <p className="text-sm opacity-90">
                Based on your preferences, you have great taste in books! Keep exploring to discover more gems.
              </p>
            </div>
          </div>
        </aside>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Your Personalized Recommendations</h2>
              <p className="text-muted-foreground">Curated based on your preferences and reading history</p>
            </div>

            {recommendations.length > 0 ? (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                }`}
              >
                {recommendations.map((book) => (
                  <BookCard
                    key={book.goodreads_book_id}
                    book={book}
                    onAddToFavorites={handleAddToFavorites}
                    isFavorite={favorites.includes(book.goodreads_book_id)}
                    showReason={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No recommendations found. Try selecting more books or adjusting your preferences.
                </p>
                <Button variant="outline" onClick={onBack}>
                  Update Preferences
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
