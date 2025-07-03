
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Eye,
  BarChart3,
  Download,
  Share2
} from 'lucide-react'
import VisualizationContainer from './visualization-container'
import type { TrialDay } from '@/lib/types'

interface TrialDayDetailProps {
  trialDay: TrialDay & {
    testimonies: any[]
    evidence: any[]
  }
  allTrialDays: Array<{
    id: number
    trialDayNumber: number
    headlineTitle: string
    date: Date
  }>
}

export default function TrialDayDetail({ trialDay, allTrialDays }: TrialDayDetailProps) {
  const router = useRouter()
  const { reducedMotion } = useAccessibilityStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const currentIndex = allTrialDays.findIndex(day => day.trialDayNumber === trialDay.trialDayNumber)
  const previousDay = currentIndex > 0 ? allTrialDays[currentIndex - 1] : null
  const nextDay = currentIndex < allTrialDays.length - 1 ? allTrialDays[currentIndex + 1] : null

  const handleNavigation = (dayNumber: number) => {
    router.push(`/day/${dayNumber}`)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Trial Day ${trialDay.trialDayNumber} - The Combs Trial`,
          text: trialDay.headlineTitle,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleDownload = () => {
    const data = {
      trialDay: trialDay.trialDayNumber,
      date: trialDay.date,
      title: trialDay.headlineTitle,
      summary: trialDay.headlineSummary,
      dataStory: trialDay.dataStoryPlan,
      visualizationType: trialDay.visualizationType
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0.01 : 0.6 }}
        className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent rounded-md px-2 py-1 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Timeline</span>
              </Link>
              
              <div className="h-6 w-px bg-border" />
              
              <div className="text-sm text-muted-foreground">
                Trial Day {trialDay.trialDayNumber} of 28
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent rounded-md transition-colors"
                aria-label="Share this trial day"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleDownload}
                className="p-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent rounded-md transition-colors"
                aria-label="Download trial day data"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.8, delay: reducedMotion ? 0 : 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-accent font-bold text-2xl">{trialDay.trialDayNumber}</span>
            </div>
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                {trialDay.headlineTitle}
              </h1>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Calendar className="w-5 h-5" />
                <time dateTime={new Date(trialDay.date).toISOString()}>
                  {formatDate(trialDay.date)}
                </time>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Summary Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.8, delay: reducedMotion ? 0 : 0.3 }}
          className="mb-12"
        >
          <div className="glass-card p-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
              Day Summary
            </h2>
            <p className="text-foreground leading-relaxed text-lg">
              {trialDay.headlineSummary}
            </p>
          </div>
        </motion.section>

        {/* Data Visualization Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.8, delay: reducedMotion ? 0 : 0.4 }}
          className="mb-12"
        >
          <div className="glass-card p-8">
            <div className="flex items-center space-x-3 mb-6">
              <BarChart3 className="w-6 h-6 text-accent" />
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Data Visualization
              </h2>
            </div>
            
            <VisualizationContainer 
              trialDay={trialDay}
            />
          </div>
        </motion.section>

        {/* Data Story Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.8, delay: reducedMotion ? 0 : 0.5 }}
          className="mb-12"
        >
          <div className="glass-card p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Eye className="w-6 h-6 text-accent" />
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Data Story Analysis
              </h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-foreground leading-relaxed">
                {trialDay.dataStoryPlan}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.8, delay: reducedMotion ? 0 : 0.6 }}
          className="flex items-center justify-between"
          aria-label="Trial day navigation"
        >
          {previousDay ? (
            <button
              onClick={() => handleNavigation(previousDay.trialDayNumber)}
              className="group flex items-center space-x-3 glass-card p-4 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-accent" />
              <div className="text-left">
                <div className="text-sm text-muted-foreground">Previous</div>
                <div className="font-medium text-foreground group-hover:text-accent transition-colors">
                  Day {previousDay.trialDayNumber}
                </div>
              </div>
            </button>
          ) : (
            <div />
          )}

          {nextDay ? (
            <button
              onClick={() => handleNavigation(nextDay.trialDayNumber)}
              className="group flex items-center space-x-3 glass-card p-4 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
            >
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Next</div>
                <div className="font-medium text-foreground group-hover:text-accent transition-colors">
                  Day {nextDay.trialDayNumber}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-accent" />
            </button>
          ) : (
            <div />
          )}
        </motion.nav>
      </main>
    </div>
  )
}
