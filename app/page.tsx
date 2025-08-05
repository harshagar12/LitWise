"use client"

import { useState } from "react"
import { ArrowRight, BookOpen, Sparkles, Moon, Sun } from "lucide-react"
import GenreSelection from "@/components/GenreSelection"

export default function HomePage() {
  const [isDark, setIsDark] = useState(false)
  const [currentView, setCurrentView] = useState("landing")

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  if (currentView === "genres") {
    return <GenreSelection />
  }

  return (
    <div className={`min-h-screen ${isDark ? "dark" : ""}`}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <header className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">LitWise</span>
            </div>
            <button onClick={toggleTheme} className="btn btn-ghost btn-sm">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <Sparkles className="h-8 w-8 text-cyan-500 dark:text-cyan-400" />
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Discover Your Next
                <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Favorite Book
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Tailored recommendations just for you
              </p>
            </div>

            <div className="space-y-4">
              <button onClick={() => setCurrentView("genres")} className="btn btn-primary btn-lg text-lg px-12 py-4">
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>

              <div>
                <button className="text-gray-600 dark:text-gray-400 hover:text-cyan-500 transition-colors">
                  Browse library
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <a href="#" className="hover:text-cyan-500 transition-colors">
              About
            </a>
            <a href="#" className="hover:text-cyan-500 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-cyan-500 transition-colors">
              Contact
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}