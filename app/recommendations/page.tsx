"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { RecommendationsDashboard } from "@/components/RecommendationsDashboard"

export default function RecommendationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get all 'genres' and 'books' params from the URL and convert to numbers
  const selectedGenres = searchParams.getAll("genres").map((g) => Number(g)).filter((g) => !isNaN(g))
  const selectedBooks = searchParams.getAll("books").map((b) => Number(b)).filter((b) => !isNaN(b))

  const handleBack = () => {
    // Go back to clusters page with selected genres
    const params = new URLSearchParams()
    selectedGenres.forEach((id) => params.append("genres", id.toString()))
    router.push(`/clusters?${params.toString()}`)
  }

  return (
    <RecommendationsDashboard
      selectedGenres={selectedGenres}
      selectedBooks={selectedBooks}
      onBack={handleBack}
    />
  )
} 