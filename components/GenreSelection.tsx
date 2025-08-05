"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface Genre {
  tag_id: number
  tag_name: string
}

interface GenreCardProps {
  genre: Genre
  isSelected: boolean
  onToggle: (genreId: number) => void
}

const GenreCard = ({ genre, isSelected, onToggle }: GenreCardProps) => (
  <button
    onClick={() => onToggle(genre.tag_id)}
    className={`w-full p-4 rounded-lg border-2 transition-all cursor-pointer ${
      isSelected
        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
        : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
    }`}
  >
    <div className="text-center">
      <h3 className="font-medium capitalize">{genre.tag_name.replace(/-/g, " ")}</h3>
      {isSelected && (
        <div className="mt-2">
          <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white rounded-full text-xs">
            ✓
          </span>
        </div>
      )}
    </div>
  </button>
)

export default function GenreSelection() {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch("/api/genres")
        const data = await response.json()
        setGenres(data)
      } catch (error) {
        console.error("Failed to fetch genres:", error)
        // Fallback genres
        setGenres([
          { tag_id: 1, tag_name: "fiction" },
          { tag_id: 2, tag_name: "fantasy" },
          { tag_id: 3, tag_name: "romance" },
          { tag_id: 4, tag_name: "mystery" },
          { tag_id: 5, tag_name: "thriller" },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchGenres()
  }, [])

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    )
  }

  const handleNext = () => {
    console.log("Selected Genres:", selectedGenres);
    if (selectedGenres.length > 0) {
      const params = new URLSearchParams();
      selectedGenres.forEach((id) => params.append("genres", id.toString()));
      const url = `/clusters?${params.toString()}`;
      console.log("Navigating to:", url);
      router.push(url);
    } else {
      console.log("No genres selected");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading genres...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What genres excite you?
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Select the genres that spark your interest (choose at least one)
          </p>
          <div className="mt-4">
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {selectedGenres.length} genre{selectedGenres.length !== 1 ? "s" : ""} selected
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {genres.map((genre) => (
            <GenreCard
              key={genre.tag_id}
              genre={genre}
              isSelected={selectedGenres.includes(genre.tag_id)}
              onToggle={handleGenreToggle}
            />
          ))}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            disabled={selectedGenres.length === 0}
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Continue
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Select genres that match your reading preferences
          </p>
        </div>
      </div>
    </div>
  )
}