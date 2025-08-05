"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookCard } from "@/components/BookCard";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface Book {
  goodreads_book_id: number;
  book_id: number;
  title: string;
  authors: string;
  average_rating: number;
  ratings_count: number;
  image_url: string;
}

interface Cluster {
  cluster_name: string;
  books: Book[];
}

export const ClusterDiscovery = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
  const [activeCluster, setActiveCluster] = useState(0);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllBooks, setShowAllBooks] = useState(false);

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const selectedGenres = searchParams.getAll("genres");
        const params = new URLSearchParams();
        selectedGenres.forEach((id) => params.append("selected_tag_ids", id));
        params.append("num_clusters", "5");

        const response = await fetch(`/api/clusters?${params}`);
        const data = await response.json();
        setClusters(data);
      } catch (error) {
        console.error("Failed to fetch clusters:", error);
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.getAll("genres").length > 0) {
      fetchClusters();
    }
  }, [searchParams]);

  const handleBookToggle = (bookId: number) => {
    setSelectedBooks((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const nextCluster = () => {
    setActiveCluster((prev) => (prev + 1) % clusters.length);
  };

  const prevCluster = () => {
    setActiveCluster((prev) => (prev - 1 + clusters.length) % clusters.length);
  };

  const handleNext = () => {
    if (selectedBooks.length > 0) {
      const params = new URLSearchParams();
      selectedBooks.forEach((id) => params.append("books", id.toString()));
      // Also include the selected genres for the back button
      const selectedGenres = searchParams.getAll("genres");
      selectedGenres.forEach((id) => params.append("genres", id));
      router.push(`/recommendations?${params.toString()}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Discovering book clusters...</p>
        </div>
      </div>
    );
  }

  if (clusters.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No book clusters found for your selected genres.</p>
          <Button onClick={() => router.back()}>Back to Genres</Button>
        </div>
      </div>
    );
  }

  const currentCluster = clusters[activeCluster];
  const BOOKS_TO_SHOW = 21;
  const booksToDisplay = showAllBooks ? currentCluster.books : currentCluster.books.slice(0, BOOKS_TO_SHOW);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Books Curated for Your Taste</h1>
          <p className="text-muted-foreground text-lg">Browse clusters and select books that interest you</p>
          <div className="mt-4">
            <span className="text-accent font-medium">
              {selectedBooks.length} book{selectedBooks.length !== 1 ? "s" : ""} selected
            </span>
          </div>
        </div>
        {/* Top Recommendations Button */}
        <div className="flex items-center justify-end mb-4">
          <Button size="lg" disabled={selectedBooks.length === 0} onClick={handleNext}>
            See Recommendations
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={prevCluster} disabled={clusters.length <= 1}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-primary">{currentCluster.cluster_name}</h2>
              <p className="text-sm text-muted-foreground">
                Cluster {activeCluster + 1} of {clusters.length}
              </p>
            </div>
            <Button variant="ghost" onClick={nextCluster} disabled={clusters.length <= 1}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {booksToDisplay.map((book) => (
              <BookCard
                key={book.goodreads_book_id}
                book={book}
                onAddToFavorites={() => handleBookToggle(book.goodreads_book_id)}
                isFavorite={selectedBooks.includes(book.goodreads_book_id)}
                clickable={true}
                onCardClick={() => handleBookToggle(book.goodreads_book_id)}
              />
            ))}
          </div>
          {/* Show More / Show Less Button */}
          {currentCluster.books.length > BOOKS_TO_SHOW && (
            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={() => setShowAllBooks((prev) => !prev)}>
                {showAllBooks ? "Show Less" : `Show More (${currentCluster.books.length - BOOKS_TO_SHOW} more)`}
              </Button>
            </div>
          )}
        </div>
        {/* Bottom Recommendations Button */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Genres
          </Button>
          <Button size="lg" disabled={selectedBooks.length === 0} onClick={handleNext}>
            See Recommendations
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};