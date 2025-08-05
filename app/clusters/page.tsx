"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ClusterDiscovery } from "@/components/ClusterDiscovery"

export default function ClustersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get all 'genres' params from the URL and convert to numbers
  const genreParams = searchParams.getAll("genres")
  const selectedGenres = genreParams.map((g) => Number(g)).filter((g) => !isNaN(g))

  const handleBack = () => {
    router.push("/")
  }

  const handleNext = (selectedBooks: number[]) => {
    // For now, just log the selected books
    // You can implement navigation to recommendations here
    console.log("Selected books:", selectedBooks)
    // router.push("/recommendations?books=" + selectedBooks.join(","))
  }

  return (
    <ClusterDiscovery
      selectedGenres={selectedGenres}
      onBack={handleBack}
      onNext={handleNext}
    />
  )
} 