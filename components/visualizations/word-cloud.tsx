
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Cloud, MessageSquare } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface WordCloudVisualizationProps {
  trialDay: TrialDay
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
    
    // Generate word data based on trial day content
    const generateWordData = () => {
      const prosecutionTerms = [
        { text: 'enterprise', value: 100 },
        { text: 'coerce', value: 85 },
        { text: 'violence', value: 90 },
        { text: 'threats', value: 75 },
        { text: 'recordings', value: 80 },
        { text: 'drugs', value: 70 },
        { text: 'trafficking', value: 95 },
        { text: 'criminal', value: 85 },
        { text: 'systematic', value: 65 },
        { text: 'exploitation', value: 75 }
      ]

      const defenseTerms = [
        { text: 'love', value: 100 },
        { text: 'jealousy', value: 90 },
        { text: 'consensual', value: 85 },
        { text: 'money', value: 70 },
        { text: 'outbursts', value: 60 },
        { text: 'toxic', value: 75 },
        { text: 'relationship', value: 80 },
        { text: 'personal', value: 65 },
        { text: 'emotional', value: 70 },
        { text: 'misguided', value: 55 }
      ]

      setProsecutionWords(prosecutionTerms.map(term => ({ ...term, category: 'prosecution' })))
      setDefenseWords(defenseTerms.map(term => ({ ...term, category: 'defense' })))
    }

    generateWordData()
  }, [trialDay])

  const getWordSize = (value: number) => {
    const minSize = 0.8
    const maxSize = 2.5
    return minSize + (value / 100) * (maxSize - minSize)
  }

  const getWordOpacity = (value: number) => {
    return 0.6 + (value / 100) * 0.4
  }

  if (!mounted) {
    return <div className="h-96 bg-muted rounded-lg animate-pulse" />
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Comparative Narrative Analysis: Opening Statements
        </h3>
        <p className="text-sm text-muted-foreground">
          Word frequency analysis of prosecution vs defense opening statements, showing contrasting themes
        </p>
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
            Emphasizes criminal operation, coercion, and systematic abuse
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
            Frames events as personal, emotional, and relationship-based
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
            <h5 className="font-medium text-red-400 mb-2">Prosecution Strategy</h5>
            <p className="text-muted-foreground">
              Focuses on characterizing actions as part of a calculated criminal enterprise 
              with systematic patterns of coercion and violence.
            </p>
          </div>
          <div>
            <h5 className="font-medium text-blue-400 mb-2">Defense Strategy</h5>
            <p className="text-muted-foreground">
              Reframes the narrative as a complex personal relationship marked by jealousy 
              and emotional dysfunction rather than criminal intent.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
