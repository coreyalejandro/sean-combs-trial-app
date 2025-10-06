'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Clock, AlertTriangle, Scale, Heart, Download, Filter, BarChart3 } from 'lucide-react'
import { 
  getPlotlyConfig, 
  getPlotlyLayout, 
  createScatterData, 
  getSeverityColor, 
  getHoverTemplate, 
  exportPlotlyData 
} from '@/lib/plotly-utils'
import type { TrialDay } from '@/lib/types'

// Dynamic import for Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

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
  const [viewMode, setViewMode] = useState<'timeline' | 'scatter' | 'dual'>('dual')
  const [filterType, setFilterType] = useState<string>('all')

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

  const getPlotlyTypeColor = (type: string): string => {
    switch (type) {
      case 'incident': return '#dc2626'     // red-600
      case 'legal': return '#2563eb'        // blue-600  
      case 'relationship': return '#7c3aed' // violet-600
      case 'evidence': return '#16a34a'     // green-600
      default: return '#6b7280'             // gray-500
    }
  }

  const getFilteredEvents = () => {
    return filterType === 'all' ? events : events.filter(event => event.type === filterType)
  }

  // Prepare timeline data for Plotly
  const prepareTimelineData = () => {
    const filteredEvents = getFilteredEvents()
    
    return [
      {
        x: filteredEvents.map(event => event.date),
        y: filteredEvents.map((_, index) => index + 1),
        mode: 'markers+lines' as const,
        type: 'scatter' as const,
        name: 'Timeline',
        line: { 
          color: '#f59e0b', // amber-500
          width: 3,
          shape: 'linear' as const
        },
        marker: {
          size: filteredEvents.map(event => {
            const severitySize = event.severity === 'high' ? 15 : event.severity === 'medium' ? 12 : 9
            return severitySize
          }),
          color: filteredEvents.map(event => getPlotlyTypeColor(event.type)),
          line: { color: '#ffffff', width: 2 },
          opacity: 0.8
        },
        text: filteredEvents.map(event => `${event.title}<br>${event.date}<br>Type: ${event.type}<br>Severity: ${event.severity}`),
        hovertemplate: '<b>%{text}</b><extra></extra>',
        customdata: filteredEvents.map(event => event.id)
      }
    ]
  }

  // Prepare scatter plot data (alternative view)
  const prepareScatterData = () => {
    const filteredEvents = getFilteredEvents()
    const eventTypes = ['incident', 'legal', 'relationship', 'evidence']
    
    return eventTypes.map(type => {
      const typeEvents = filteredEvents.filter(event => event.type === type)
      return {
        x: typeEvents.map(event => event.date),
        y: typeEvents.map(event => {
          return event.severity === 'high' ? 3 : event.severity === 'medium' ? 2 : 1
        }),
        mode: 'markers' as const,
        type: 'scatter' as const,
        name: type.charAt(0).toUpperCase() + type.slice(1),
        marker: {
          size: typeEvents.map(event => {
            const severitySize = event.severity === 'high' ? 18 : event.severity === 'medium' ? 14 : 10
            return severitySize
          }),
          color: getPlotlyTypeColor(type),
          line: { color: '#ffffff', width: 2 },
          opacity: 0.8
        },
        text: typeEvents.map(event => `${event.title}<br>${event.date}<br>Severity: ${event.severity}`),
        hovertemplate: '<b>%{text}</b><extra></extra>',
        customdata: typeEvents.map(event => event.id)
      }
    }).filter(trace => trace.x.length > 0)
  }

  const exportData = () => {
    const filteredEvents = getFilteredEvents()
    exportPlotlyData(
      filteredEvents.map(event => ({
        date: event.date,
        title: event.title,
        type: event.type,
        severity: event.severity,
        year: event.year,
        description: event.description
      })),
      `trial-day-${trialDay.trialDayNumber}-timeline-plotly.csv`,
      ['Date', 'Title', 'Type', 'Severity', 'Year', 'Description']
    )
  }

  if (!mounted) {
    return <div className="h-96 bg-muted rounded-lg animate-pulse" />
  }

  const plotData = viewMode === 'scatter' ? prepareScatterData() : prepareTimelineData()
  
  const plotLayout = {
    ...getPlotlyLayout({ margin: { l: 80, r: 60, t: 60, b: 80 } }),
    xaxis: {
      title: { text: 'Date', font: { color: '#e2e8f0', size: 14 } },
      tickfont: { color: '#94a3b8', size: 10 },
      gridcolor: '#374151',
      zeroline: false,
      type: 'date'
    },
    yaxis: viewMode === 'scatter' ? {
      title: { text: 'Severity Level', font: { color: '#e2e8f0', size: 14 } },
      tickfont: { color: '#94a3b8', size: 10 },
      gridcolor: '#374151',
      zeroline: false,
      tickmode: 'array',
      tickvals: [1, 2, 3],
      ticktext: ['Low', 'Medium', 'High']
    } : {
      title: { text: 'Event Sequence', font: { color: '#e2e8f0', size: 14 } },
      tickfont: { color: '#94a3b8', size: 10 },
      gridcolor: '#374151',
      zeroline: false,
      showticklabels: false
    },
    height: 400
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              A Decade of Alleged Abuse and Control
            </h3>
            <p className="text-sm text-muted-foreground">
              Professional Plotly.js Timeline - Interactive events from Cassie Ventura's testimony spanning 2007-2018
            </p>
          </div>
          <div className="flex items-center space-x-2">
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

        {/* Controls */}
        <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">View:</span>
          </div>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'timeline' | 'scatter' | 'dual')}
            className="px-2 py-1 text-sm bg-background border border-border rounded"
            aria-label="Select visualization view mode"
          >
            <option value="timeline">Timeline View</option>
            <option value="scatter">Scatter Plot</option>
            <option value="dual">Dual View</option>
          </select>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Type:</span>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2 py-1 text-sm bg-background border border-border rounded"
            aria-label="Filter events by type"
          >
            <option value="all">All Events</option>
            <option value="incident">Incidents</option>
            <option value="relationship">Relationship</option>
            <option value="legal">Legal</option>
            <option value="evidence">Evidence</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Plotly Visualization */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6">
            <h4 className="font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-accent" />
              <span>Interactive Timeline</span>
            </h4>
            
            <div className="h-96 rounded-lg overflow-hidden border border-slate-700">
              <Plot
                data={plotData as any}
                layout={plotLayout as any}
                config={getPlotlyConfig(`trial-day-${trialDay.trialDayNumber}-timeline`)}
                style={{ width: '100%', height: '100%' }}
                onClick={(data) => {
                  if (data.points && data.points[0] && data.points[0].customdata) {
                    const eventId = data.points[0].customdata
                    const event = events.find(e => e.id === eventId)
                    if (event) setSelectedEvent(event)
                  }
                }}
              />
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
                { type: 'incident', label: 'Violence/Abuse', count: events.filter(e => e.type === 'incident').length },
                { type: 'relationship', label: 'Relationship', count: events.filter(e => e.type === 'relationship').length },
                { type: 'legal', label: 'Legal Action', count: events.filter(e => e.type === 'legal').length },
                { type: 'evidence', label: 'Evidence', count: events.filter(e => e.type === 'evidence').length }
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
                <span className="text-foreground">{getFilteredEvents().length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">High Severity:</span>
                <span className="text-red-400">{getFilteredEvents().filter(e => e.severity === 'high').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Most Active Year:</span>
                <span className="text-foreground">2013</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
