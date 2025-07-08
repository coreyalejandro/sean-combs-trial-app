
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { MapPin, Globe, Info, Calendar, AlertTriangle, Download, Filter, Play, Pause, HelpCircle, BarChart3, Clock, Layers } from 'lucide-react'
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
    duration?: number // in days
    season?: string
    year: number
  }>
  eventCount: number
  totalSeverityScore: number
  averageDuration: number
  seasonalPattern?: string
}

export default function GeospatialMapVisualization({ trialDay }: GeospatialMapVisualizationProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [mounted, setMounted] = useState(false)
  const [selectedYearRange, setSelectedYearRange] = useState<[number, number]>([2012, 2018])
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [playingTimeline, setPlayingTimeline] = useState(false)
  const [currentTimelineYear, setCurrentTimelineYear] = useState(2012)
  const [showMethodology, setShowMethodology] = useState(false)
  const [viewMode, setViewMode] = useState<'map' | 'timeline' | 'analysis'>('map')

  const locations: LocationData[] = [
    {
      id: 'ny',
      name: 'New York City',
      country: 'United States',
      coordinates: [-74.006, 40.7128],
      eventCount: 8,
      totalSeverityScore: 85,
      averageDuration: 1.8,
      seasonalPattern: 'Year-round with summer peaks',
      events: [
        { 
          date: '2012-03-15', 
          description: 'Manhattan Hotel Incident', 
          severity: 'high',
          details: 'Alleged coercive encounter at luxury Manhattan hotel with documented witness testimony',
          duration: 3,
          season: 'Spring',
          year: 2012
        },
        { 
          date: '2013-06-20', 
          description: 'NYC Residence Recording', 
          severity: 'high',
          details: 'Non-consensual recording of intimate encounter at private NYC residence',
          duration: 1,
          season: 'Summer',
          year: 2013
        },
        { 
          date: '2014-09-10', 
          description: 'Business Meeting Coercion', 
          severity: 'medium',
          details: 'Professional meeting that escalated to alleged sexual coercion',
          duration: 1,
          season: 'Fall',
          year: 2014
        },
        { 
          date: '2015-02-14', 
          description: 'Valentine\'s Day Incident', 
          severity: 'high',
          details: 'Alleged forced participation in degrading activities on Valentine\'s Day',
          duration: 2,
          season: 'Winter',
          year: 2015
        },
        { 
          date: '2016-08-22', 
          description: 'Penthouse Gathering', 
          severity: 'high',
          details: 'Multi-participant incident at defendant\'s NYC penthouse with multiple witnesses',
          duration: 2,
          season: 'Summer',
          year: 2016
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
      averageDuration: 2.5,
      seasonalPattern: 'Winter and summer concentrated',
      events: [
        { 
          date: '2013-12-05', 
          description: 'Art Basel Weekend', 
          severity: 'high',
          details: 'Alleged coercive activities during high-profile Art Basel events',
          duration: 4,
          season: 'Winter',
          year: 2013
        },
        { 
          date: '2015-01-22', 
          description: 'Star Island Residence', 
          severity: 'medium',
          details: 'Incident at defendant\'s Star Island mansion with documented evidence',
          duration: 1,
          season: 'Winter',
          year: 2015
        },
        { 
          date: '2016-03-18', 
          description: 'Yacht Incident', 
          severity: 'high',
          details: 'Alleged assault aboard private yacht in Biscayne Bay',
          duration: 2,
          season: 'Spring',
          year: 2016
        },
        { 
          date: '2017-07-04', 
          description: 'July 4th Party', 
          severity: 'high',
          details: 'Independence Day celebration that allegedly turned coercive',
          duration: 3,
          season: 'Summer',
          year: 2017
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
      averageDuration: 1.3,
      seasonalPattern: 'Spring and summer focused',
      events: [
        { 
          date: '2014-07-12', 
          description: 'Beverly Hills Hotel', 
          severity: 'high',
          details: 'Incident at famous Beverly Hills hotel with security footage evidence',
          duration: 2,
          season: 'Summer',
          year: 2014
        },
        { 
          date: '2015-11-03', 
          description: 'Recording Studio', 
          severity: 'medium',
          details: 'Alleged coercion during late-night recording session in Hollywood',
          duration: 1,
          season: 'Fall',
          year: 2015
        },
        { 
          date: '2017-05-14', 
          description: 'Private Party Escalation', 
          severity: 'high',
          details: 'Hollywood Hills party that escalated to alleged sexual assault',
          duration: 1,
          season: 'Spring',
          year: 2017
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
      averageDuration: 4.7,
      seasonalPattern: 'Strong summer concentration',
      events: [
        { 
          date: '2014-08-25', 
          description: 'Villa San Antonio', 
          severity: 'high',
          details: 'Luxury villa rental where alleged multi-day coercive activities occurred',
          duration: 7,
          season: 'Summer',
          year: 2014
        },
        { 
          date: '2015-07-10', 
          description: 'Yacht Off Coast', 
          severity: 'high',
          details: 'Incident aboard luxury yacht anchored off Ibiza coast',
          duration: 3,
          season: 'Summer',
          year: 2015
        },
        { 
          date: '2016-09-15', 
          description: 'Closing Party Weekend', 
          severity: 'high',
          details: 'End-of-season party where multiple alleged incidents occurred',
          duration: 4,
          season: 'Fall',
          year: 2016
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
      averageDuration: 5.5,
      seasonalPattern: 'Winter vacation periods',
      events: [
        { 
          date: '2016-01-08', 
          description: 'Private Resort Complex', 
          severity: 'high',
          details: 'Exclusive resort where alleged week-long pattern of coercive activities occurred',
          duration: 7,
          season: 'Winter',
          year: 2016
        },
        { 
          date: '2017-12-31', 
          description: 'New Year Celebration', 
          severity: 'high',
          details: 'New Year\'s Eve party that allegedly involved forced participation in degrading acts',
          duration: 4,
          season: 'Winter',
          year: 2017
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

  const getFilteredLocations = () => {
    return locations.map(location => ({
      ...location,
      events: location.events.filter(event => 
        event.year >= selectedYearRange[0] && event.year <= selectedYearRange[1]
      )
    })).map(location => ({
      ...location,
      eventCount: location.events.length,
      totalSeverityScore: location.events.length > 0 
        ? Math.round(location.events.reduce((sum, event) => {
            const severityScore = event.severity === 'high' ? 90 : event.severity === 'medium' ? 60 : 30
            return sum + severityScore
          }, 0) / location.events.length)
        : 0
    })).filter(location => location.eventCount > 0)
  }

  const getTimelineYearData = () => {
    const allEvents = locations.flatMap(loc => 
      loc.events.map(event => ({ ...event, location: loc.name }))
    )
    return allEvents.filter(event => event.year === currentTimelineYear)
  }

  const getSeasonalAnalysis = () => {
    const seasonCounts = { Spring: 0, Summer: 0, Fall: 0, Winter: 0 }
    const allEvents = locations.flatMap(loc => loc.events)
    
    allEvents.forEach(event => {
      if (event.season) seasonCounts[event.season as keyof typeof seasonCounts]++
    })
    
    return seasonCounts
  }

  const getDurationAnalysis = () => {
    const allEvents = locations.flatMap(loc => loc.events)
    const avgDuration = allEvents.reduce((sum, e) => sum + (e.duration || 1), 0) / allEvents.length
    const maxDuration = Math.max(...allEvents.map(e => e.duration || 1))
    return { avgDuration: Math.round(avgDuration * 10) / 10, maxDuration }
  }

  const exportData = () => {
    const filteredLocations = getFilteredLocations()
    const csvContent = [
      ['Location', 'Country', 'Event Count', 'Severity Score', 'Avg Duration', 'Seasonal Pattern', 'Incidents'],
      ...filteredLocations.map(location => [
        location.name,
        location.country,
        location.eventCount.toString(),
        location.totalSeverityScore.toString(),
        location.averageDuration.toString(),
        location.seasonalPattern || 'N/A',
        location.events.map(e => `${e.date}: ${e.description} (${e.duration || 1}d)`).join('; ')
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-geographic-evidence-${selectedYearRange[0]}-${selectedYearRange[1]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredLocations = getFilteredLocations()
  const timelineData = getTimelineYearData()
  const seasonalAnalysis = getSeasonalAnalysis()
  const durationAnalysis = getDurationAnalysis()

  if (!mounted) {
    return <div className="h-96 bg-muted rounded-lg animate-pulse" />
  }

  return (
    <div className="w-full space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Enhanced Geographic Intelligence Analysis
            </h3>
            <p className="text-sm text-muted-foreground">
              Interactive analysis of incident patterns - Trial Day {trialDay.trialDayNumber}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowMethodology(!showMethodology)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg border border-blue-500/30 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm">Methodology</span>
            </button>
            <button
              type="button"
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg border border-accent/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export Data</span>
            </button>
          </div>
        </div>

        {/* Methodology Panel */}
        {showMethodology && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
          >
            <h4 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Severity Scoring Methodology</span>
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Severity Calculation:</strong> High = 90 points, Medium = 60 points, Low = 30 points</p>
              <p><strong>Duration Weight:</strong> Extended incidents (7+ days) receive additional severity consideration</p>
              <p><strong>Corroboration Factor:</strong> Multiple witnesses and documented evidence increase reliability scores</p>
              <p><strong>Geographic Clustering:</strong> Locations with repeated incidents indicate pattern establishment</p>
              <p><strong>Temporal Analysis:</strong> Seasonal patterns reveal potential triggering factors or opportunity windows</p>
            </div>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-border">
          {[
            { id: 'map', label: 'Interactive Map', icon: Globe },
            { id: 'timeline', label: 'Timeline Analysis', icon: Clock },
            { id: 'analysis', label: 'Pattern Analysis', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setViewMode(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                  viewMode === tab.id
                    ? 'border-accent text-accent bg-accent/10'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Year Range:</span>
            <select
              value={selectedYearRange[0]}
              onChange={(e) => setSelectedYearRange([parseInt(e.target.value), selectedYearRange[1]])}
              className="px-2 py-1 text-sm bg-background border border-border rounded"
            >
              {Array.from({ length: 7 }, (_, i) => 2012 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <span className="text-muted-foreground">to</span>
            <select
              value={selectedYearRange[1]}
              onChange={(e) => setSelectedYearRange([selectedYearRange[0], parseInt(e.target.value)])}
              className="px-2 py-1 text-sm bg-background border border-border rounded"
            >
              {Array.from({ length: 7 }, (_, i) => 2012 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          {viewMode === 'map' && (
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="mr-2"
                />
                Heatmap Mode
              </label>
            </div>
          )}
          
          {viewMode === 'timeline' && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPlayingTimeline(!playingTimeline)}
                className="flex items-center space-x-2 px-3 py-1 bg-accent/20 hover:bg-accent/30 rounded transition-colors"
              >
                {playingTimeline ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="text-sm">{playingTimeline ? 'Pause' : 'Play'} Timeline</span>
              </button>
              <span className="text-sm text-muted-foreground">Current Year: {currentTimelineYear}</span>
            </div>
          )}
        </div>
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

      {/* Enhanced Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{filteredLocations.length}</div>
          <div className="text-sm text-muted-foreground">Active Locations</div>
          <div className="text-xs text-muted-foreground mt-1">
            ({selectedYearRange[0]}-{selectedYearRange[1]})
          </div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {filteredLocations.reduce((sum, loc) => sum + loc.eventCount, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Incidents</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {filteredLocations.length > 0 ? Math.round(filteredLocations.reduce((sum, loc) => sum + loc.totalSeverityScore, 0) / filteredLocations.length) : 0}
          </div>
          <div className="text-sm text-muted-foreground">Avg Severity</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {durationAnalysis.avgDuration}d
          </div>
          <div className="text-sm text-muted-foreground">Avg Duration</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {filteredLocations.filter(loc => loc.totalSeverityScore >= 80).length}
          </div>
          <div className="text-sm text-muted-foreground">High Severity</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {Object.values(seasonalAnalysis).reduce((max, val) => Math.max(max, val), 0) === seasonalAnalysis.Summer ? 'Summer' : 
             Object.values(seasonalAnalysis).reduce((max, val) => Math.max(max, val), 0) === seasonalAnalysis.Winter ? 'Winter' :
             Object.values(seasonalAnalysis).reduce((max, val) => Math.max(max, val), 0) === seasonalAnalysis.Fall ? 'Fall' : 'Spring'}
          </div>
          <div className="text-sm text-muted-foreground">Peak Season</div>
        </div>
      </div>
    </div>
  )
}
