
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { TrendingUp, TrendingDown, BarChart3, MessageSquare } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface SentimentAnalysisVisualizationProps {
  trialDay: TrialDay
}

interface SentimentData {
  date: string
  positive: number
  negative: number
  neutral: number
  context: string
}

interface MessageData {
  id: string
  content: string
  sentiment: 'positive' | 'negative' | 'neutral'
  timestamp: string
  speaker: 'cassie' | 'combs'
}

export default function SentimentAnalysisVisualization({ trialDay }: SentimentAnalysisVisualizationProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedPeriod, setSelectedPeriod] = useState<SentimentData | null>(null)
  const [mounted, setMounted] = useState(false)

  const sentimentData: SentimentData[] = [
    {
      date: '2012-01',
      positive: 75,
      negative: 15,
      neutral: 10,
      context: 'Early relationship period - affectionate exchanges'
    },
    {
      date: '2012-06',
      positive: 60,
      negative: 30,
      neutral: 10,
      context: 'First signs of controlling behavior in messages'
    },
    {
      date: '2013-01',
      positive: 45,
      negative: 45,
      neutral: 10,
      context: 'Mixed messages during volatile period'
    },
    {
      date: '2013-06',
      positive: 30,
      negative: 60,
      neutral: 10,
      context: 'Post-assault period - fear and compliance'
    },
    {
      date: '2014-01',
      positive: 40,
      negative: 50,
      neutral: 10,
      context: 'Attempts at reconciliation and normalcy'
    },
    {
      date: '2015-01',
      positive: 25,
      negative: 65,
      neutral: 10,
      context: 'Increasing coercion and explicit demands'
    },
    {
      date: '2016-01',
      positive: 20,
      negative: 70,
      neutral: 10,
      context: 'Peak period of alleged abuse and control'
    },
    {
      date: '2017-01',
      positive: 15,
      negative: 75,
      neutral: 10,
      context: 'Final phase - fear-driven compliance'
    }
  ]

  const sampleMessages: MessageData[] = [
    {
      id: '1',
      content: 'I\'m always ready to freak off',
      sentiment: 'positive',
      timestamp: '2012-03-15 14:30',
      speaker: 'cassie'
    },
    {
      id: '2',
      content: 'You know what I need from you',
      sentiment: 'neutral',
      timestamp: '2013-06-20 21:15',
      speaker: 'combs'
    },
    {
      id: '3',
      content: 'I don\'t want to do this anymore',
      sentiment: 'negative',
      timestamp: '2015-11-08 16:45',
      speaker: 'cassie'
    },
    {
      id: '4',
      content: 'You will do what I say',
      sentiment: 'negative',
      timestamp: '2016-02-14 23:20',
      speaker: 'combs'
    },
    {
      id: '5',
      content: 'I love you but this is wrong',
      sentiment: 'negative',
      timestamp: '2017-08-12 12:10',
      speaker: 'cassie'
    }
  ]

  useEffect(() => {
    setMounted(true)
    setSelectedPeriod(sentimentData[0])
  }, [])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-500/20'
      case 'negative': return 'text-red-400 bg-red-500/20'
      case 'neutral': return 'text-blue-400 bg-blue-500/20'
      default: return 'text-muted-foreground bg-muted'
    }
  }

  if (!mounted) {
    return <div className="h-96 bg-muted rounded-lg animate-pulse" />
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          The Duality of Communication
        </h3>
        <p className="text-sm text-muted-foreground">
          Sentiment analysis of text messages between Combs and Ventura over time
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sentiment Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6">
            <h4 className="font-semibold text-foreground mb-4">Sentiment Evolution Over Time</h4>
            
            <div className="space-y-3">
              {sentimentData.map((period, index) => (
                <motion.button
                  key={period.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: reducedMotion ? 0.01 : 0.4, 
                    delay: reducedMotion ? 0 : index * 0.1 
                  }}
                  onClick={() => setSelectedPeriod(period)}
                  className={`w-full text-left p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
                    selectedPeriod?.date === period.date 
                      ? 'bg-accent/20 border border-accent/50' 
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{period.date}</span>
                    <div className="flex items-center space-x-1">
                      {period.positive > period.negative ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Sentiment bar */}
                  <div className="flex rounded-full overflow-hidden h-2 mb-2">
                    <div 
                      className="bg-green-500" 
                      style={{ width: `${period.positive}%` }}
                    />
                    <div 
                      className="bg-red-500" 
                      style={{ width: `${period.negative}%` }}
                    />
                    <div 
                      className="bg-blue-500" 
                      style={{ width: `${period.neutral}%` }}
                    />
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Positive: {period.positive}% | Negative: {period.negative}% | Neutral: {period.neutral}%
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sample Messages */}
          <div className="glass-card p-6">
            <h4 className="font-semibold text-foreground mb-4">Message Examples</h4>
            
            <div className="space-y-3">
              {sampleMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: reducedMotion ? 0.01 : 0.3, 
                    delay: reducedMotion ? 0 : index * 0.1 
                  }}
                  className={`p-3 rounded-lg border ${
                    message.speaker === 'cassie' ? 'ml-4 bg-blue-500/10 border-blue-500/30' : 'mr-4 bg-purple-500/10 border-purple-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-foreground capitalize">
                      {message.speaker}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getSentimentColor(message.sentiment)}`}>
                        {message.sentiment}
                      </span>
                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground italic">"{message.content}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="space-y-4">
          {/* Selected Period Details */}
          {selectedPeriod && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
              className="glass-card p-4"
            >
              <div className="flex items-center space-x-2 mb-3">
                <BarChart3 className="w-5 h-5 text-accent" />
                <h4 className="font-semibold text-foreground">{selectedPeriod.date}</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-400">Positive</span>
                  <span className="text-sm font-medium text-foreground">{selectedPeriod.positive}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-400">Negative</span>
                  <span className="text-sm font-medium text-foreground">{selectedPeriod.negative}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-400">Neutral</span>
                  <span className="text-sm font-medium text-foreground">{selectedPeriod.neutral}%</span>
                </div>
                
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">{selectedPeriod.context}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Analysis Summary */}
          <div className="glass-card p-4">
            <div className="flex items-center space-x-2 mb-3">
              <MessageSquare className="w-5 h-5 text-accent" />
              <h4 className="font-semibold text-foreground">Key Insights</h4>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded">
                <h5 className="font-medium text-green-400 mb-1">Early Period (2012)</h5>
                <p className="text-muted-foreground">
                  High positive sentiment indicating genuine affection and consensual participation.
                </p>
              </div>
              
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                <h5 className="font-medium text-yellow-400 mb-1">Transition (2013-2014)</h5>
                <p className="text-muted-foreground">
                  Shifting dynamics as controlling behavior becomes apparent in communication.
                </p>
              </div>
              
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
                <h5 className="font-medium text-red-400 mb-1">Late Period (2015-2017)</h5>
                <p className="text-muted-foreground">
                  Predominantly negative sentiment suggesting fear-driven compliance.
                </p>
              </div>
            </div>
          </div>

          {/* Methodology */}
          <div className="glass-card p-4">
            <h4 className="font-semibold text-foreground mb-3">Analysis Method</h4>
            <div className="text-xs text-muted-foreground space-y-2">
              <p>• Natural language processing of text messages</p>
              <p>• Contextual sentiment scoring</p>
              <p>• Temporal pattern analysis</p>
              <p>• Cross-referenced with testimony events</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
