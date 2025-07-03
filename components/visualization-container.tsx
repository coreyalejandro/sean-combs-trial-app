
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { AlertTriangle, BarChart3 } from 'lucide-react'
import WordCloudVisualization from './visualizations/word-cloud'
import GeospatialMapVisualization from './visualizations/geospatial-map'
import TimelineVisualization from './visualizations/timeline'
import SentimentAnalysisVisualization from './visualizations/sentiment-analysis'
import NetworkVisualization from './visualizations/network'
import type { TrialDay } from '@/lib/types'

interface VisualizationContainerProps {
  trialDay: TrialDay
}

export default function VisualizationContainer({ trialDay }: VisualizationContainerProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading visualization...</p>
        </div>
      </div>
    )
  }

  const renderVisualization = () => {
    try {
      switch (trialDay.visualizationType) {
        case 'word-cloud-comparison':
          return <WordCloudVisualization trialDay={trialDay} />
        
        case 'geospatial-map':
          return <GeospatialMapVisualization trialDay={trialDay} />
        
        case 'interactive-timeline':
        case 'multi-modal-timeline':
        case 'narrative-arc':
          return <TimelineVisualization trialDay={trialDay} />
        
        case 'sentiment-analysis':
        case 'courtroom-dynamics':
        case 'health-impact':
          return <SentimentAnalysisVisualization trialDay={trialDay} />
        
        case 'financial-network':
        case 'network-flow':
        case 'dynamic-network':
        case 'stakeholder-map':
          return <NetworkVisualization trialDay={trialDay} />
        
        default:
          return (
            <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center max-w-md">
                <BarChart3 className="w-16 h-16 text-accent mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Visualization: {trialDay.visualizationType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h3>
                <p className="text-muted-foreground">
                  This visualization type is being developed. The data story provides detailed analysis of the day's proceedings.
                </p>
              </div>
            </div>
          )
      }
    } catch (err) {
      setError('Failed to render visualization')
      return null
    }
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
        className="h-96 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-center"
      >
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Visualization Error
          </h3>
          <p className="text-muted-foreground">
            {error}. Please refer to the data story analysis below for insights into this trial day.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0.01 : 0.6 }}
      className="w-full"
    >
      {renderVisualization()}
    </motion.div>
  )
}
