
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Cloud, MessageSquare, Download } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface WordCloudVisualizationProps {
  trialDay: TrialDay
}

interface ProcessedWordData {
  prosecution: WordData[]
  defense: WordData[]
}

interface WordData {
  text: string
  value: number
  category: 'prosecution' | 'defense'
}

export default function WordCloudVisualization({ trialDay }: WordCloudVisualizationProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [prosecutionWords, setProsecutionWords] = useState<WordData[]>([])
  const [defenseWords, setDefenseWords] = useState<WordData[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Process actual trial data for word frequency analysis
    const processTrialData = () => {
      const headlineSummary = trialDay.headlineSummary?.toLowerCase() || ''
      const dataStoryPlan = trialDay.dataStoryPlan?.toLowerCase() || ''
      
      // Define prosecution-oriented keywords and their weights
      const prosecutionKeywords = {
        'enterprise': 0, 'criminal': 0, 'trafficking': 0, 'coerce': 0, 'violence': 0,
        'threats': 0, 'recordings': 0, 'drugs': 0, 'systematic': 0, 'exploitation': 0,
        'assault': 0, 'abuse': 0, 'control': 0, 'intimidation': 0, 'evidence': 0,
        'racketeering': 0, 'conspiracy': 0, 'obstruction': 0, 'bribery': 0, 'blackmail': 0
      }
      
      // Define defense-oriented keywords and their weights
      const defenseKeywords = {
        'love': 0, 'jealousy': 0, 'consensual': 0, 'relationship': 0, 'personal': 0,
        'emotional': 0, 'toxic': 0, 'outbursts': 0, 'money': 0, 'financial': 0,
        'voluntary': 0, 'willing': 0, 'affectionate': 0, 'complex': 0, 'misguided': 0,
        'domestic': 0, 'unconventional': 0, 'enthusiastic': 0, 'consent': 0, 'agency': 0
      }
      
      // Count occurrences in trial content
      const fullText = `${headlineSummary} ${dataStoryPlan}`
      
      Object.keys(prosecutionKeywords).forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\w*`, 'gi')
        const matches = fullText.match(regex) || []
        ;(prosecutionKeywords as any)[keyword] = matches.length
      })
      
      Object.keys(defenseKeywords).forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\w*`, 'gi')
        const matches = fullText.match(regex) || []
        ;(defenseKeywords as any)[keyword] = matches.length
      })
      
      // Convert to weighted arrays (normalize to 0-100 scale)
      const maxProsecution = Math.max(...Object.values(prosecutionKeywords), 1)
      const maxDefense = Math.max(...Object.values(defenseKeywords), 1)
      
      const prosecutionTerms = Object.entries(prosecutionKeywords)
        .filter(([_, count]) => count > 0)
        .map(([word, count]) => ({
          text: word,
          value: Math.max(20, (count / maxProsecution) * 100),
          category: 'prosecution' as const
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 12) // Top 12 terms
      
      const defenseTerms = Object.entries(defenseKeywords)
        .filter(([_, count]) => count > 0)
        .map(([word, count]) => ({
          text: word,
          value: Math.max(20, (count / maxDefense) * 100),
          category: 'defense' as const
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 12) // Top 12 terms
      
      // Fallback to default terms if no keywords found
      if (prosecutionTerms.length === 0) {
        prosecutionTerms.push(
          { text: 'allegations', value: 80, category: 'prosecution' },
          { text: 'testimony', value: 70, category: 'prosecution' },
          { text: 'evidence', value: 60, category: 'prosecution' }
        )
      }
      
      if (defenseTerms.length === 0) {
        defenseTerms.push(
          { text: 'relationship', value: 80, category: 'defense' },
          { text: 'complex', value: 70, category: 'defense' },
          { text: 'personal', value: 60, category: 'defense' }
        )
      }
      
      setProsecutionWords(prosecutionTerms)
      setDefenseWords(defenseTerms)
    }

    processTrialData()
  }, [trialDay])

  const getWordSize = (value: number) => {
    const minSize = 0.8
    const maxSize = 2.5
    return minSize + (value / 100) * (maxSize - minSize)
  }

  const getWordOpacity = (value: number) => {
    return 0.6 + (value / 100) * 0.4
  }

  const exportData = () => {
    const csvContent = [
      ['Word', 'Category', 'Frequency', 'Value'],
      ...prosecutionWords.map(word => [word.text, 'prosecution', word.value.toString(), word.value.toString()]),
      ...defenseWords.map(word => [word.text, 'defense', word.value.toString(), word.value.toString()])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-word-analysis.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!mounted) {
    return <div className="h-96 bg-muted rounded-lg animate-pulse" />
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Trial Day {trialDay.trialDayNumber}: Narrative Analysis
          </h3>
          <p className="text-sm text-muted-foreground">
            Word frequency analysis from this day's proceedings, highlighting key themes and terminology
          </p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg border border-accent/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export Words</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Prosecution Word Cloud */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.6 }}
          className="glass-card p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare className="w-5 h-5 text-red-400" />
            <h4 className="font-semibold text-foreground">Prosecution Narrative</h4>
          </div>
          
          <div className="relative h-64 flex flex-wrap items-center justify-center p-4 bg-red-500/5 rounded-lg">
            {prosecutionWords.map((word, index) => (
              <motion.span
                key={word.text}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: getWordOpacity(word.value), 
                  scale: 1 
                }}
                transition={{ 
                  duration: reducedMotion ? 0.01 : 0.6, 
                  delay: reducedMotion ? 0 : index * 0.1 
                }}
                className="inline-block m-1 text-red-400 font-bold cursor-pointer hover:text-red-300 transition-colors"
                style={{ 
                  fontSize: `${getWordSize(word.value)}rem`,
                  opacity: getWordOpacity(word.value)
                }}
                title={`Frequency: ${word.value}%`}
              >
                {word.text}
              </motion.span>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground">
            Key prosecution themes from Day {trialDay.trialDayNumber}
          </div>
        </motion.div>

        {/* Defense Word Cloud */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.6, delay: reducedMotion ? 0 : 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <h4 className="font-semibold text-foreground">Defense Narrative</h4>
          </div>
          
          <div className="relative h-64 flex flex-wrap items-center justify-center p-4 bg-blue-500/5 rounded-lg">
            {defenseWords.map((word, index) => (
              <motion.span
                key={word.text}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: getWordOpacity(word.value), 
                  scale: 1 
                }}
                transition={{ 
                  duration: reducedMotion ? 0.01 : 0.6, 
                  delay: reducedMotion ? 0 : index * 0.1 + 0.2 
                }}
                className="inline-block m-1 text-blue-400 font-bold cursor-pointer hover:text-blue-300 transition-colors"
                style={{ 
                  fontSize: `${getWordSize(word.value)}rem`,
                  opacity: getWordOpacity(word.value)
                }}
                title={`Frequency: ${word.value}%`}
              >
                {word.text}
              </motion.span>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground">
            Defense counter-narrative themes from Day {trialDay.trialDayNumber}
          </div>
        </motion.div>
      </div>

      {/* Analysis Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0.01 : 0.6, delay: reducedMotion ? 0 : 0.4 }}
        className="mt-6 glass-card p-6"
      >
        <div className="flex items-center space-x-2 mb-3">
          <Cloud className="w-5 h-5 text-accent" />
          <h4 className="font-semibold text-foreground">Key Insights</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-red-400 mb-2">Day {trialDay.trialDayNumber} Analysis</h5>
            <p className="text-muted-foreground">
              {prosecutionWords.length > 0 
                ? `Primary themes: ${prosecutionWords.slice(0, 3).map(w => w.text).join(', ')}`
                : 'Analysis of prosecution narrative themes from this day\'s proceedings.'}
            </p>
          </div>
          <div>
            <h5 className="font-medium text-blue-400 mb-2">Counter-Narrative</h5>
            <p className="text-muted-foreground">
              {defenseWords.length > 0
                ? `Key concepts: ${defenseWords.slice(0, 3).map(w => w.text).join(', ')}`
                : 'Defense themes and alternative interpretations from the day\'s testimony.'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
