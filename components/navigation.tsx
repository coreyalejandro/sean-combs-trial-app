
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useNavigationStore } from '@/lib/stores/navigation'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X, Scale, Calendar } from 'lucide-react'

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { currentDay, isMenuOpen, searchQuery, setCurrentDay, setMenuOpen, setSearchQuery } = useNavigationStore()
  const { reducedMotion } = useAccessibilityStore()
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [isMounted, setIsMounted] = useState(false)

  const trialDays = Array.from({ length: 28 }, (_, i) => i + 1)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (searchQuery.length > 2) {
      // Simulate search functionality
      const results = trialDays.filter(day => 
        day.toString().includes(searchQuery) ||
        `Day ${day}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const handleDaySelect = (day: number) => {
    setCurrentDay(day)
    setMenuOpen(false)
    setSearchQuery('')
    router.push(`/day/${day}`)
  }

  const handleKeyDown = (event: React.KeyboardEvent, day: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleDaySelect(day)
    }
  }

  if (!isMounted) {
    return null
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-card border-b border-border/50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Skip to main content link */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          {/* Logo */}
          <Link 
            href="/"
            className="flex items-center space-x-2 text-xl font-serif font-bold text-foreground hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-md px-2 py-1 transition-colors"
          >
            <Scale className="w-8 h-8" />
            <span className="hidden sm:inline">The Combs Trial</span>
            <span className="sm:hidden">Trial</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search trial days..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                aria-label="Search trial days"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              
              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={reducedMotion ? {} : { opacity: 0, y: -10 }}
                    animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                    exit={reducedMotion ? {} : { opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar z-50"
                  >
                    {searchResults.map((day) => (
                      <button
                        key={day}
                        onClick={() => handleDaySelect(day)}
                        onKeyDown={(e) => handleKeyDown(e, day)}
                        className="w-full px-4 py-3 text-left hover:bg-muted focus:bg-muted focus:outline-none transition-colors border-b border-border last:border-b-0"
                      >
                        <div className="font-medium">Trial Day {day}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(2025, 4, 11 + day).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Menu Toggle */}
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="hidden sm:flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:text-accent hover:bg-muted focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Timeline</span>
            </Link>
            
            <button
              onClick={() => setMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-foreground hover:text-accent hover:bg-muted focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, height: 0 }}
              animate={reducedMotion ? {} : { opacity: 1, height: 'auto' }}
              exit={reducedMotion ? {} : { opacity: 0, height: 0 }}
              className="border-t border-border/50 py-4"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {trialDays.map((day) => (
                  <button
                    key={day}
                    onClick={() => handleDaySelect(day)}
                    onKeyDown={(e) => handleKeyDown(e, day)}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
                      currentDay === day
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                    aria-label={`Go to trial day ${day}`}
                  >
                    Day {day}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
