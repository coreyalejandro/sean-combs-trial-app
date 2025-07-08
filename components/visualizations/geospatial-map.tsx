
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { MapPin, Globe, Info, Calendar, AlertTriangle, Download } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface GeospatialMapVisualizationProps {
  trialDay: TrialDay
}

interface LocationData {
  id: string
  name: string
  country: string
  coordinates: [number, number] // [lng, lat]
  events: Array<{
    date: string
    description: string
    severity: 'low' | 'medium' | 'high'
    details: string
  }>
  eventCount: number
  totalSeverityScore: number
}

export default function GeospatialMapVisualization({ trialDay }: GeospatialMapVisualizationProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [mounted, setMounted] = useState(false)

  const locations: LocationData[] = [
    {
      id: 'ny',
      name: 'New York City',
      country: 'United States',
      coordinates: [-74.006, 40.7128],
      eventCount: 8,
      totalSeverityScore: 85,
      events: [
        { 
          date: '2012-03-15', 
          description: 'Manhattan Hotel Incident', 
          severity: 'high',
          details: 'Alleged coercive encounter at luxury Manhattan hotel with documented witness testimony'
        },
        { 
          date: '2013-06-20', 
          description: 'NYC Residence Recording', 
          severity: 'high',
          details: 'Non-consensual recording of intimate encounter at private NYC residence'
        },
        { 
          date: '2014-09-10', 
          description: 'Business Meeting Coercion', 
          severity: 'medium',
          details: 'Professional meeting that escalated to alleged sexual coercion'
        },
        { 
          date: '2015-02-14', 
          description: 'Valentine\'s Day Incident', 
          severity: 'high',
          details: 'Alleged forced participation in degrading activities on Valentine\'s Day'
        },
        { 
          date: '2016-08-22', 
          description: 'Penthouse Gathering', 
          severity: 'high',
          details: 'Multi-participant incident at defendant\'s NYC penthouse with multiple witnesses'
        }
      ]
    },
    {
      id: 'miami',
      name: 'Miami',
      country: 'United States',
      coordinates: [-80.1918, 25.7617],
      eventCount: 6,
      totalSeverityScore: 78,
      events: [
        { 
          date: '2013-12-05', 
          description: 'Art Basel Weekend', 
          severity: 'high',
          details: 'Alleged coercive activities during high-profile Art Basel events'
        },
        { 
          date: '2015-01-22', 
          description: 'Star Island Residence', 
          severity: 'medium',
          details: 'Incident at defendant\'s Star Island mansion with documented evidence'
        },
        { 
          date: '2016-03-18', 
          description: 'Yacht Incident', 
          severity: 'high',
          details: 'Alleged assault aboard private yacht in Biscayne Bay'
        },
        { 
          date: '2017-07-04', 
          description: 'July 4th Party', 
          severity: 'high',
          details: 'Independence Day celebration that allegedly turned coercive'
        }
      ]
    },
    {
      id: 'la',
      name: 'Los Angeles',
      country: 'United States',
      coordinates: [-118.2437, 34.0522],
      eventCount: 5,
      totalSeverityScore: 72,
      events: [
        { 
          date: '2014-07-12', 
          description: 'Beverly Hills Hotel', 
          severity: 'high',
          details: 'Incident at famous Beverly Hills hotel with security footage evidence'
        },
        { 
          date: '2015-11-03', 
          description: 'Recording Studio', 
          severity: 'medium',
          details: 'Alleged coercion during late-night recording session in Hollywood'
        },
        { 
          date: '2017-05-14', 
          description: 'Private Party Escalation', 
          severity: 'high',
          details: 'Hollywood Hills party that escalated to alleged sexual assault'
        }
      ]
    },
    {
      id: 'ibiza',
      name: 'Ibiza',
      country: 'Spain',
      coordinates: [1.4821, 38.9067],
      eventCount: 4,
      totalSeverityScore: 88,
      events: [
        { 
          date: '2014-08-25', 
          description: 'Villa San Antonio', 
          severity: 'high',
          details: 'Luxury villa rental where alleged multi-day coercive activities occurred'
        },
        { 
          date: '2015-07-10', 
          description: 'Yacht Off Coast', 
          severity: 'high',
          details: 'Incident aboard luxury yacht anchored off Ibiza coast'
        },
        { 
          date: '2016-09-15', 
          description: 'Closing Party Weekend', 
          severity: 'high',
          details: 'End-of-season party where multiple alleged incidents occurred'
        }
      ]
    },
    {
      id: 'turks',
      name: 'Turks & Caicos',
      country: 'Turks & Caicos Islands',
      coordinates: [-71.797, 21.694],
      eventCount: 3,
      totalSeverityScore: 82,
      events: [
        { 
          date: '2016-01-08', 
          description: 'Private Resort Complex', 
          severity: 'high',
          details: 'Exclusive resort where alleged week-long pattern of coercive activities occurred'
        },
        { 
          date: '2017-12-31', 
          description: 'New Year Celebration', 
          severity: 'high',
          details: 'New Year\'s Eve party that allegedly involved forced participation in degrading acts'
        }
      ]
    }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/50'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/50'
      default: return 'text-muted-foreground bg-muted/20 border-border'
    }
  }

  const getSeverityIntensity = (totalScore: number) => {
    if (totalScore >= 85) return 'bg-red-500'
    if (totalScore >= 75) return 'bg-orange-500'
    if (totalScore >= 65) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const getLocationSize = (eventCount: number) => {
    const baseSize = 16
    const maxSize = 32
    return Math.min(baseSize + (eventCount * 2), maxSize)
  }

  const exportData = () => {
    const csvContent = [
      ['Location', 'Country', 'Event Count', 'Severity Score', 'Incidents'],
      ...locations.map(location => [
        location.name,
        location.country,
        location.eventCount.toString(),
        location.totalSeverityScore.toString(),
        location.events.map(e => `${e.date}: ${e.description}`).join('; ')
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-geographic-evidence.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!mounted) {
    return <div className="h-96 bg-muted rounded-lg animate-pulse" />
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Global Pattern of Alleged Incidents
          </h3>
          <p className="text-sm text-muted-foreground">
            Geographic analysis of locations referenced in testimony - Trial Day {trialDay.trialDayNumber}
          </p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg border border-accent/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export Data</span>
        </button>
      </div>

      {/* Clean Grid-Based Map */}
      <div className="glass-card p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Location Cards */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-accent" />
              <span>Incident Locations</span>
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              {locations.map((location, index) => (
                <motion.button
                  key={location.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: reducedMotion ? 0.01 : 0.3, 
                    delay: reducedMotion ? 0 : index * 0.1 
                  }}
                  onClick={() => setSelectedLocation(location)}
                  className={`text-left p-4 rounded-lg border transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent ${
                    selectedLocation?.id === location.id 
                      ? 'border-accent bg-accent/10 shadow-lg' 
                      : 'border-border bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className={`w-4 h-4 rounded-full ${getSeverityIntensity(location.totalSeverityScore)}`}
                      />
                      <div>
                        <h5 className="font-semibold text-foreground">{location.name}</h5>
                        <p className="text-xs text-muted-foreground">{location.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-accent">{location.eventCount}</div>
                      <div className="text-xs text-muted-foreground">incidents</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-3 h-3 text-orange-400" />
                      <span className="text-xs text-muted-foreground">Severity Score:</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{location.totalSeverityScore}/100</span>
                  </div>

                  <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all ${getSeverityIntensity(location.totalSeverityScore)}`}
                      style={{ width: `${location.totalSeverityScore}%` }}
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Selected Location Details */}
          <div>
            {selectedLocation ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
                className="space-y-4"
              >
                <div className="p-4 border border-accent/30 rounded-lg bg-accent/5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div 
                      className={`w-6 h-6 rounded-full ${getSeverityIntensity(selectedLocation.totalSeverityScore)}`}
                    />
                    <div>
                      <h4 className="font-semibold text-foreground">{selectedLocation.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedLocation.country}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-2 bg-background/50 rounded">
                      <div className="text-lg font-bold text-accent">{selectedLocation.eventCount}</div>
                      <div className="text-xs text-muted-foreground">Total Incidents</div>
                    </div>
                    <div className="text-center p-2 bg-background/50 rounded">
                      <div className="text-lg font-bold text-orange-400">{selectedLocation.totalSeverityScore}</div>
                      <div className="text-xs text-muted-foreground">Severity Score</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-foreground mb-3 flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Incident Timeline</span>
                  </h5>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedLocation.events.map((event, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: reducedMotion ? 0.01 : 0.2, 
                          delay: reducedMotion ? 0 : index * 0.05 
                        }}
                        className={`p-3 rounded-lg border ${getSeverityColor(event.severity)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">{event.date}</span>
                          <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(event.severity)}`}>
                            {event.severity.toUpperCase()}
                          </span>
                        </div>
                        <h6 className="font-medium text-foreground mb-1">{event.description}</h6>
                        <p className="text-xs text-muted-foreground">{event.details}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center p-8 border border-dashed border-border rounded-lg">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium text-foreground mb-2">Select a Location</h4>
                <p className="text-sm text-muted-foreground">
                  Click on any location card to view detailed incident information
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{locations.length}</div>
          <div className="text-sm text-muted-foreground">Locations</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {locations.reduce((sum, loc) => sum + loc.eventCount, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Incidents</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {Math.round(locations.reduce((sum, loc) => sum + loc.totalSeverityScore, 0) / locations.length)}
          </div>
          <div className="text-sm text-muted-foreground">Avg Severity</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">3</div>
          <div className="text-sm text-muted-foreground">Countries</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {locations.filter(loc => loc.totalSeverityScore >= 80).length}
          </div>
          <div className="text-sm text-muted-foreground">High Severity</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">6</div>
          <div className="text-sm text-muted-foreground">Year Span</div>
        </div>
      </div>
    </div>
  )
}
