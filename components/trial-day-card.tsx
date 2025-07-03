
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Calendar, ArrowRight, Eye } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface TrialDayCardProps {
  trialDay: TrialDay
  index: number
  onClick: () => void
}

export default function TrialDayCard({ trialDay, index, onClick }: TrialDayCardProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [isHovered, setIsHovered] = useState(false)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getVisualizationIcon = (type: string) => {
    switch (type) {
      case 'word-cloud-comparison':
        return '☁️'
      case 'geospatial-map':
        return '🗺️'
      case 'interactive-timeline':
        return '📅'
      case 'sentiment-analysis':
        return '📊'
      case 'financial-network':
        return '💰'
      case 'corroboration-matrix':
        return '✅'
      case 'process-flowchart':
        return '🔄'
      case 'evidence-inventory':
        return '📋'
      case 'multi-modal-timeline':
        return '🎯'
      case '3d-reconstruction':
        return '🏗️'
      case 'network-flow':
        return '🕸️'
      case 'mind-map':
        return '🧠'
      case 'health-impact':
        return '🏥'
      case 'cause-effect':
        return '⚡'
      case 'evidence-heatmap':
        return '🔥'
      default:
        return '📈'
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reducedMotion ? {} : { y: -8, scale: 1.02 }}
      transition={{
        delay: reducedMotion ? 0 : index * 0.1,
        duration: reducedMotion ? 0.01 : 0.6,
      }}
      className="trial-card cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for Trial Day ${trialDay.trialDayNumber}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold text-lg">
            {trialDay.trialDayNumber}
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground">
              Trial Day {trialDay.trialDayNumber}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <time dateTime={new Date(trialDay.date).toISOString()}>
                {formatDate(trialDay.date)}
              </time>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-2xl" title={`Visualization type: ${trialDay.visualizationType}`}>
            {getVisualizationIcon(trialDay.visualizationType)}
          </span>
          <motion.div
            animate={isHovered && !reducedMotion ? { x: 4 } : { x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
          </motion.div>
        </div>
      </div>

      {/* Headline */}
      <h4 className="font-serif text-xl font-bold text-foreground mb-3 line-clamp-2 leading-tight">
        {trialDay.headlineTitle}
      </h4>

      {/* Summary */}
      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
        {trialDay.headlineSummary}
      </p>

      {/* Data Story Preview */}
      <div className="border-t border-border/50 pt-3">
        <div className="flex items-center space-x-2 mb-2">
          <Eye className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">Data Story</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {trialDay.dataStoryPlan.substring(0, 150)}...
        </p>
      </div>

      {/* Hover Overlay */}
      <motion.div
        className="absolute inset-0 bg-accent/5 rounded-lg pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.article>
  )
}
