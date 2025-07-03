
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Clock, AlertTriangle, Scale, Heart } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface TimelineVisualizationProps {
  trialDay: TrialDay
}

interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  type: 'incident' | 'legal' | 'relationship' | 'evidence'
  severity: 'low' | 'medium' | 'high'
  year: number
}

export default function TimelineVisualization({ trialDay }: TimelineVisualizationProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [mounted, setMounted] = useState(false)

  const events: TimelineEvent[] = [
    {
      id: 'first-abuse',
      date: '2007-08-15',
      title: 'First Physical Abuse',
      description: 'Cassie testifies to the first instance of physical violence in their relationship',
      type: 'incident',
      severity: 'high',
      year: 2007
    },
    {
      id: 'car-beating',
      date: '2009-03-10',
      title: 'Car Beating Incident',
      description: 'Violent assault in a vehicle, witnessed by multiple parties',
      type: 'incident',
      severity: 'high',
      year: 2009
    },
    {
      id: 'kid-cudi-threats',
      date: '2011-11-20',
      title: 'Kid Cudi Threats Begin',
      description: 'Combs discovers relationship with Kid Cudi, makes threats of violence',
      type: 'relationship',
      severity: 'high',
      year: 2011
    },
    {
      id: 'cudi-car-arson',
      date: '2012-01-15',
      title: 'Kid Cudi Car Arson',
      description: 'Porsche firebombed with Molotov cocktail in apparent retaliation',
      type: 'incident',
      severity: 'high',
      year: 2012
    },
    {
      id: 'bed-frame-assault',
      date: '2013-06-08',
      title: 'Bed Frame Assault',
      description: 'Cassie thrown into bed frame, requiring stitches for head wound',
      type: 'incident',
      severity: 'high',
      year: 2013
    },
    {
      id: 'hotel-incident',
      date: '2016-03-05',
      title: '2016 Hotel Beating',
      description: 'Surveillance footage captures brutal assault at InterContinental Hotel',
      type: 'incident',
      severity: 'high',
      year: 2016
    },
    {
      id: 'final-rape',
      date: '2018-09-12',
      title: '2018 Rape Allegation',
      description: 'Final alleged sexual assault before relationship ends',
      type: 'incident',
      severity: 'high',
      year: 2018
    }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'incident': return <AlertTriangle className="w-4 h-4" />
      case 'legal': return <Scale className="w-4 h-4" />
      case 'relationship': return <Heart className="w-4 h-4" />
      case 'evidence': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'incident': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'legal': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'relationship': return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      case 'evidence': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-muted-foreground bg-muted border-border'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500'
      case 'medium': return 'border-yellow-500'
      case 'low': return 'border-green-500'
      default: return 'border-muted'
    }
  }

  if (!mounted) {
    return <div className="h-96 bg-muted rounded-lg animate-pulse" />
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          A Decade of Alleged Abuse and Control
        </h3>
        <p className="text-sm text-muted-foreground">
          Interactive timeline of key events from Cassie Ventura's testimony spanning 2007-2018
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Timeline Visualization */}
        <div className="lg:col-span-3">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-accent/30" />
            
            <div className="space-y-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: reducedMotion ? 0.01 : 0.5, 
                    delay: reducedMotion ? 0 : index * 0.1 
                  }}
                  className="relative flex items-start space-x-4"
                >
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-4 h-4 rounded-full border-4 ${getSeverityColor(event.severity)} bg-background`} />
                  
                  {/* Event card */}
                  <motion.button
                    onClick={() => setSelectedEvent(event)}
                    whileHover={reducedMotion ? {} : { scale: 1.02 }}
                    className={`flex-1 text-left glass-card p-4 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-accent ${
                      selectedEvent?.id === event.id ? 'ring-2 ring-accent' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded ${getTypeColor(event.type)}`}>
                          {getTypeIcon(event.type)}
                        </div>
                        <span className="text-sm text-muted-foreground">{event.date}</span>
                      </div>
                      <span className="text-lg font-bold text-accent">{event.year}</span>
                    </div>
                    
                    <h4 className="font-semibold text-foreground mb-2">{event.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Event Details Panel */}
        <div className="space-y-4">
          {/* Event Types Legend */}
          <div className="glass-card p-4">
            <h4 className="font-semibold text-foreground mb-3">Event Types</h4>
            <div className="space-y-2">
              {[
                { type: 'incident', label: 'Violence/Abuse', count: 5 },
                { type: 'relationship', label: 'Relationship', count: 1 },
                { type: 'legal', label: 'Legal Action', count: 1 },
                { type: 'evidence', label: 'Evidence', count: 0 }
              ].map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                    </div>
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Event Details */}
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
              className="glass-card p-4"
            >
              <div className="flex items-center space-x-2 mb-3">
                <div className={`p-1 rounded ${getTypeColor(selectedEvent.type)}`}>
                  {getTypeIcon(selectedEvent.type)}
                </div>
                <h4 className="font-semibold text-foreground">{selectedEvent.title}</h4>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Date: </span>
                  <span className="text-sm text-foreground">{selectedEvent.date}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Severity: </span>
                  <span className={`text-sm font-medium ${
                    selectedEvent.severity === 'high' ? 'text-red-400' :
                    selectedEvent.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {selectedEvent.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-foreground">{selectedEvent.description}</p>
              </div>
            </motion.div>
          )}

          {/* Timeline Statistics */}
          <div className="glass-card p-4">
            <h4 className="font-semibold text-foreground mb-3">Timeline Statistics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Span:</span>
                <span className="text-foreground">11 years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Events:</span>
                <span className="text-foreground">{events.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">High Severity:</span>
                <span className="text-red-400">{events.filter(e => e.severity === 'high').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Peak Year:</span>
                <span className="text-foreground">2013</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
