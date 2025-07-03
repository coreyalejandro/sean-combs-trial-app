
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { MapPin, Globe, Info } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface GeospatialMapVisualizationProps {
  trialDay: TrialDay
}

interface LocationData {
  id: string
  name: string
  coordinates: [number, number] // [lng, lat]
  events: Array<{
    date: string
    description: string
    severity: 'low' | 'medium' | 'high'
  }>
  eventCount: number
}

export default function GeospatialMapVisualization({ trialDay }: GeospatialMapVisualizationProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [mounted, setMounted] = useState(false)

  const locations: LocationData[] = [
    {
      id: 'ny',
      name: 'New York City',
      coordinates: [-74.006, 40.7128],
      eventCount: 8,
      events: [
        { date: '2012-03-15', description: 'Alleged freak-off at Manhattan hotel', severity: 'high' },
        { date: '2013-06-20', description: 'Recorded encounter at NYC residence', severity: 'high' },
        { date: '2014-09-10', description: 'Business meeting turned coercive', severity: 'medium' }
      ]
    },
    {
      id: 'miami',
      name: 'Miami, FL',
      coordinates: [-80.1918, 25.7617],
      eventCount: 6,
      events: [
        { date: '2013-12-05', description: 'Hotel incident during Art Basel', severity: 'high' },
        { date: '2015-01-22', description: 'Private residence encounter', severity: 'medium' },
        { date: '2016-03-18', description: 'Yacht-based incident', severity: 'high' }
      ]
    },
    {
      id: 'la',
      name: 'Los Angeles, CA',
      coordinates: [-118.2437, 34.0522],
      eventCount: 5,
      events: [
        { date: '2014-07-12', description: 'Beverly Hills hotel incident', severity: 'high' },
        { date: '2015-11-03', description: 'Recording studio coercion', severity: 'medium' },
        { date: '2017-05-14', description: 'Private party escalation', severity: 'high' }
      ]
    },
    {
      id: 'ibiza',
      name: 'Ibiza, Spain',
      coordinates: [1.4821, 38.9067],
      eventCount: 3,
      events: [
        { date: '2014-08-25', description: 'Vacation villa incident', severity: 'high' },
        { date: '2015-07-10', description: 'Yacht encounter off coast', severity: 'medium' }
      ]
    },
    {
      id: 'turks',
      name: 'Turks & Caicos',
      coordinates: [-71.797, 21.694],
      eventCount: 2,
      events: [
        { date: '2016-01-08', description: 'Private resort incident', severity: 'high' },
        { date: '2017-12-31', description: 'New Year celebration coercion', severity: 'medium' }
      ]
    }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-muted-foreground'
    }
  }

  const getLocationSize = (eventCount: number) => {
    const baseSize = 12
    const maxSize = 24
    return Math.min(baseSize + (eventCount * 2), maxSize)
  }

  if (!mounted) {
    return <div className="h-96 bg-muted rounded-lg animate-pulse" />
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          The Geography of Coercion
        </h3>
        <p className="text-sm text-muted-foreground">
          Interactive map showing locations of alleged incidents mentioned in Cassie Ventura's testimony
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Visualization */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.6 }}
            className="relative h-96 bg-slate-900 rounded-lg overflow-hidden"
          >
            {/* Simplified world map background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 1000 500" className="w-full h-full">
                  {/* Simplified continent shapes */}
                  <path
                    d="M150 200 L300 180 L350 250 L250 280 Z" 
                    fill="currentColor" 
                    className="text-slate-600"
                  />
                  <path
                    d="M400 150 L600 140 L650 200 L580 250 L450 260 Z" 
                    fill="currentColor" 
                    className="text-slate-600"
                  />
                  <path
                    d="M100 300 L200 290 L180 350 L120 360 Z" 
                    fill="currentColor" 
                    className="text-slate-600"
                  />
                </svg>
              </div>
            </div>

            {/* Location markers */}
            {locations.map((location, index) => {
              const x = ((location.coordinates[0] + 180) / 360) * 100
              const y = ((90 - location.coordinates[1]) / 180) * 100
              
              return (
                <motion.button
                  key={location.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: reducedMotion ? 0.01 : 0.5, 
                    delay: reducedMotion ? 0 : index * 0.1 
                  }}
                  whileHover={reducedMotion ? {} : { scale: 1.2 }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-accent rounded-full"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                  onClick={() => setSelectedLocation(location)}
                  aria-label={`View details for ${location.name}`}
                >
                  <div 
                    className="bg-red-500 rounded-full border-4 border-red-500/30 cursor-pointer hover:bg-red-400 transition-colors"
                    style={{ 
                      width: getLocationSize(location.eventCount), 
                      height: getLocationSize(location.eventCount) 
                    }}
                  />
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs text-white bg-black/75 px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {location.name} ({location.eventCount} events)
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        </div>

        {/* Location Details Panel */}
        <div className="space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Globe className="w-5 h-5 text-accent" />
              <h4 className="font-semibold text-foreground">Locations</h4>
            </div>
            
            <div className="space-y-2">
              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className={`w-full text-left p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
                    selectedLocation?.id === location.id 
                      ? 'bg-accent/20 border border-accent/50' 
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-red-400" />
                      <span className="font-medium text-foreground">{location.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {location.eventCount} events
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Location Details */}
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
              className="glass-card p-4"
            >
              <div className="flex items-center space-x-2 mb-3">
                <Info className="w-5 h-5 text-accent" />
                <h4 className="font-semibold text-foreground">{selectedLocation.name}</h4>
              </div>
              
              <div className="space-y-2">
                {selectedLocation.events.map((event, index) => (
                  <div key={index} className="p-2 bg-background/50 rounded border-l-4 border-red-400">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-muted-foreground">{event.date}</span>
                      <span className={`text-xs font-medium ${getSeverityColor(event.severity)}`}>
                        {event.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{event.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0.01 : 0.6, delay: reducedMotion ? 0 : 0.4 }}
        className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-accent mb-1">{locations.length}</div>
          <div className="text-sm text-muted-foreground">Locations</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-accent mb-1">
            {locations.reduce((sum, loc) => sum + loc.eventCount, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Events</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-accent mb-1">3</div>
          <div className="text-sm text-muted-foreground">Countries</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-accent mb-1">5</div>
          <div className="text-sm text-muted-foreground">Years Span</div>
        </div>
      </motion.div>
    </div>
  )
}
