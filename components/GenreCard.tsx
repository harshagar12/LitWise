"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

interface Genre {
  tag_id: number
  tag_name: string
}

interface GenreCardProps {
  genre: Genre
  isSelected: boolean
  onToggle: (genreId: number) => void
}

export const GenreCard = ({ genre, isSelected, onToggle }: GenreCardProps) => {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-accent/5"
      }`}
      onClick={() => onToggle(genre.tag_id)}
    >
      <CardContent className="p-4 text-center relative">
        {isSelected && (
          <div className="absolute top-2 right-2">
            <Badge variant="default" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
              <Check className="h-3 w-3" />
            </Badge>
          </div>
        )}
        <h3 className="font-medium text-sm capitalize">{genre.tag_name.replace(/-/g, " ")}</h3>
      </CardContent>
    </Card>
  )
}
