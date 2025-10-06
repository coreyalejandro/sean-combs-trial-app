'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Download, Filter, HelpCircle, BarChart3, Globe, Calendar } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

// Dynamic import for Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface PlotlyGeospatialMapProps {
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
    duration?: number
    season?: string
    year: number
  }>
  eventCount: number
  totalSeverityScore: number
  averageDuration: number
  seasonalPattern?: string
}

export default function PlotlyGeospatialMap({ trialDay }: PlotlyGeospatialMapProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [mounted, setMounted] = useState(false)
  const [selectedYearRange, setSelectedYearRange] = useState<[number, number]>([2012, 2018])
  const [showMethodology, setShowMethodology] = useState(false)

  // Enhanced location data optimized for Plotly
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
        { date: '2012-03-15', description: 'Manhattan Hotel Incident', severity: 'high', details: 'Alleged coercive encounter at luxury Manhattan hotel', duration: 3, season: 'Spring', year: 2012 },
        { date: '2013-06-20', description: 'NYC Residence Recording', severity: 'high', details: 'Non-consensual recording of intimate encounter', duration: 1, season: 'Summer', year: 2013 },
        { date: '2014-09-10', description: 'Business Meeting Coercion', severity: 'medium', details: 'Professional meeting that escalated to alleged sexual coercion', duration: 1, season: 'Fall', year: 2014 },
        { date: '2015-02-14', description: 'Valentine\'s Day Incident', severity: 'high', details: 'Alleged forced participation in degrading activities', duration: 2, season: 'Winter', year: 2015 },
        { date: '2016-08-22', description: 'Penthouse Gathering', severity: 'high', details: 'Multi-participant incident at defendant\'s NYC penthouse', duration: 2, season: 'Summer', year: 2016 }
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
        { date: '2013-12-05', description: 'Art Basel Weekend', severity: 'high', details: 'Alleged coercive activities during high-profile Art Basel events', duration: 4, season: 'Winter', year: 2013 },
        { date: '2015-01-22', description: 'Star Island Residence', severity: 'medium', details: 'Incident at defendant\'s Star Island mansion', duration: 1, season: 'Winter', year: 2015 },
        { date: '2016-03-18', description: 'Yacht Incident', severity: 'high', details: 'Alleged assault aboard private yacht in Biscayne Bay', duration: 2, season: 'Spring', year: 2016 },
        { date: '2017-07-04', description: 'July 4th Party', severity: 'high', details: 'Independence Day celebration that allegedly turned coercive', duration: 3, season: 'Summer', year: 2017 }
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
        { date: '2014-07-12', description: 'Beverly Hills Hotel', severity: 'high', details: 'Incident at famous Beverly Hills hotel', duration: 2, season: 'Summer', year: 2014 },
        { date: '2015-11-03', description: 'Recording Studio', severity: 'medium', details: 'Alleged coercion during late-night recording session', duration: 1, season: 'Fall', year: 2015 },
        { date: '2017-05-14', description: 'Private Party Escalation', severity: 'high', details: 'Hollywood Hills party that escalated to alleged sexual assault', duration: 1, season: 'Spring', year: 2017 }
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
        { date: '2014-08-25', description: 'Villa San Antonio', severity: 'high', details: 'Luxury villa rental where alleged multi-day coercive activities occurred', duration: 7, season: 'Summer', year: 2014 },
        { date: '2015-07-10', description: 'Yacht Off Coast', severity: 'high', details: 'Incident aboard luxury yacht anchored off Ibiza coast', duration: 3, season: 'Summer', year: 2015 },
        { date: '2016-09-15', description: 'Closing Party Weekend', severity: 'high', details: 'End-of-season party where multiple alleged incidents occurred', duration: 4, season: 'Fall', year: 2016 }
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
        { date: '2016-01-08', description: 'Private Resort Complex', severity: 'high', details: 'Exclusive resort where alleged week-long pattern occurred', duration: 7, season: 'Winter', year: 2016 },
        { date: '2017-12-31', description: 'New Year Celebration', severity: 'high', details: 'New Year\'s Eve party that allegedly involved forced participation', duration: 4, season: 'Winter', year: 2017 }
      ]
    }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#dc2626'
      case 'medium': return '#ea580c'
      case 'low': return '#16a34a'
      default: return '#6b7280'
    }
  }

  const getSeverityColorClass = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/50'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/50'
      default: return 'text-muted-foreground bg-muted/20 border-border'
    }
  }

  const exportData = () => {
    const filteredLocations = getFilteredLocations()
    const csvContent = [
      ['Location', 'Country', 'Event Count', 'Severity Score', 'Avg Duration', 'Seasonal Pattern'],
      ...filteredLocations.map(location => [
        location.name,
        location.country,
        location.eventCount.toString(),
        location.totalSeverityScore.toString(),
        location.averageDuration.toString(),
        location.seasonalPattern || 'N/A'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-plotly-geographic-analysis.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Prepare Plotly data - NYTimes style
  const prepareMapData = () => {
    const filteredLocations = getFilteredLocations()
    
    return [{
      type: 'scattergeo' as const,
      locationmode: 'country names' as const,
      lon: filteredLocations.map(loc => loc.coordinates[0]),
      lat: filteredLocations.map(loc => loc.coordinates[1]),
      text: filteredLocations.map(loc => `${loc.name}<br>Events: ${loc.eventCount}<br>Severity: ${loc.totalSeverityScore}`),
      mode: 'markers' as const,
      marker: {
        size: filteredLocations.map(loc => Math.max(8, loc.eventCount * 6)),
        color: filteredLocations.map(loc => loc.totalSeverityScore >= 80 ? '#dc2626' : loc.totalSeverityScore >= 60 ? '#ea580c' : '#16a34a'),
        line: { color: 'white', width: 2 },
        opacity: 0.8
      },
      hovertemplate: '<b>%{text}</b><extra></extra>',
      customdata: filteredLocations.map(loc => loc.id)
    }]
  }

  // Prepare timeline data
  const prepareTimelineData = () => {
    const allEvents = locations.flatMap(location => 
      location.events.filter(event => 
        event.year >= selectedYearRange[0] && event.year <= selectedYearRange[1]
      ).map(event => ({
        ...event,
        locationName: location.name
      }))
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return [{
      x: allEvents.map(event => event.date),
      y: allEvents.map(event => event.severity === 'high' ? 3 : event.severity === 'medium' ? 2 : 1),
      mode: 'markers' as const,
      type: 'scatter' as const,
      marker: {
        size: allEvents.map(event => Math.sqrt((event.duration || 1) * 8) + 8),
        color: allEvents.map(event => getSeverityColor(event.severity)),
        line: { color: 'white', width: 2 },
        opacity: 0.8
      },
      text: allEvents.map(event => `${event.description}<br>${event.locationName}<br>Duration: ${event.duration || 1}d`),
      hovertemplate: '<b>%{text}</b><extra></extra>',
      name: 'Incidents'
    }]
  }

  const filteredLocations = getFilteredLocations()

  if (!mounted) {
    return <div className="h-96 bg-muted rounded-lg animate-pulse" />
  }

  return (
    <div className="w-full space-y-6">
      {/* NYTimes-style Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Geographic Intelligence Analysis
            </h3>
            <p className="text-sm text-muted-foreground">
              Plotly.js Professional Visualization - Trial Day {trialDay.trialDayNumber}
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
              <span className="text-sm">Export</span>
            </button>
          </div>
        </div>

        {/* Methodology Panel */}
        {showMethodology && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
          >
            <h4 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Plotly.js Visualization Methodology</span>
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Technology:</strong> Plotly.js - Same engine used by New York Times</p>
              <p><strong>Projection:</strong> Geographic scatter plot with professional cartography</p>
              <p><strong>Scaling:</strong> Marker size based on incident frequency, color on severity</p>
              <p><strong>Interactivity:</strong> Professional hover states and selection capabilities</p>
            </div>
          </motion.div>
        )}

        {/* Year Range Filter */}
        <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Year Range:</span>
          </div>
          <select
            value={selectedYearRange[0]}
            onChange={(e) => setSelectedYearRange([parseInt(e.target.value), selectedYearRange[1]])}
            className="px-2 py-1 text-sm bg-background border border-border rounded"
            aria-label="Start year for filtering"
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
            aria-label="End year for filtering"
          >
            {Array.from({ length: 7 }, (_, i) => 2012 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Plotly Geographic Map - NYTimes Quality */}
      <div className="glass-card p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-accent" />
              <span>Interactive World Map</span>
            </h4>
            
            <div className="h-96 rounded-lg overflow-hidden border border-slate-700">
              <Plot
                data={prepareMapData() as any}
                layout={{
                  geo: {
                    showframe: false,
                    showcoastlines: true,
                    coastlinecolor: '#475569',
                    showland: true,
                    landcolor: '#1e293b',
                    showocean: true,
                    oceancolor: '#0f172a',
                    showlakes: true,
                    lakecolor: '#0f172a',
                    showcountries: true,
                    countrycolor: '#475569',
                    projection: { type: 'natural earth' }
                  },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: { color: '#e2e8f0', family: 'system-ui' },
                  margin: { l: 0, r: 0, t: 0, b: 0 },
                  showlegend: false
                }}
                config={{
                  displayModeBar: false,
                  responsive: true
                }}
                style={{ width: '100%', height: '100%' }}
                onClick={(data) => {
                  if (data.points && data.points[0] && data.points[0].customdata) {
                    const locationId = data.points[0].customdata
                    const location = filteredLocations.find(loc => loc.id === locationId)
                    if (location) setSelectedLocation(location)
                  }
                }}
              />
            </div>
          </div>

          {/* Location Details Panel */}
          <div>
            {selectedLocation ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 border border-accent/30 rounded-lg bg-accent/5">
                  <h4 className="font-semibold text-foreground mb-2">{selectedLocation.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{selectedLocation.country}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-2 bg-background/50 rounded">
                      <div className="text-lg font-bold text-accent">{selectedLocation.eventCount}</div>
                      <div className="text-xs text-muted-foreground">Events</div>
                    </div>
                    <div className="text-center p-2 bg-background/50 rounded">
                      <div className="text-lg font-bold text-orange-400">{selectedLocation.totalSeverityScore}</div>
                      <div className="text-xs text-muted-foreground">Severity</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {selectedLocation.events.map((event, index) => (
                      <div key={index} className={`p-2 rounded border ${getSeverityColorClass(event.severity)}`}>
                        <div className="text-sm font-medium">{event.description}</div>
                        <div className="text-xs text-muted-foreground">{event.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center p-8 border border-dashed border-border rounded-lg">
                <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium text-foreground mb-2">Select a Location</h4>
                <p className="text-sm text-muted-foreground">Click any marker for details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plotly Timeline - NYTimes Style */}
      <div className="glass-card p-6">
        <h4 className="font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-accent" />
          <span>Incident Timeline</span>
        </h4>
        
        <div className="h-64 rounded-lg overflow-hidden border border-slate-700">
          <Plot
            data={prepareTimelineData() as any}
            layout={{
              paper_bgcolor: 'transparent',
              plot_bgcolor: '#0f172a',
              font: { color: '#e2e8f0', family: 'system-ui' },
              margin: { l: 60, r: 20, t: 20, b: 60 },
              showlegend: false,
              xaxis: {
                title: { text: 'Date' },
                gridcolor: '#374151',
                color: '#9ca3af'
              },
              yaxis: {
                title: { text: 'Severity Level' },
                tickvals: [1, 2, 3],
                ticktext: ['Low', 'Medium', 'High'],
                gridcolor: '#374151',
                color: '#9ca3af'
              }
            }}
            config={{
              displayModeBar: false,
              responsive: true
            }}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{filteredLocations.length}</div>
          <div className="text-sm text-muted-foreground">Locations</div>
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
          <div className="text-2xl font-bold text-green-400">
            {filteredLocations.filter(loc => loc.totalSeverityScore >= 80).length}
          </div>
          <div className="text-sm text-muted-foreground">High Severity</div>
        </div>
      </div>
    </div>
  )
}