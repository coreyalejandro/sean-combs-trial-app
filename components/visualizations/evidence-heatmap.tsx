'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Download, Map, Thermometer, Eye, Calendar, MapPin, Activity } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface HeatmapPoint {
  id: string
  location: string
  coordinates: { x: number; y: number }
  incident_count: number
  severity_score: number
  time_period: string
  evidence_types: string[]
  details: string[]
  witnesses: number
  date_range: string
}

interface EvidenceHeatmapProps {
  trialDay: TrialDay
}

export default function EvidenceHeatmapVisualization({ trialDay }: EvidenceHeatmapProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedPoint, setSelectedPoint] = useState<HeatmapPoint | null>(null)
  const [viewMode, setViewMode] = useState<'intensity' | 'frequency' | 'timeline'>('intensity')
  const [filterType, setFilterType] = useState<string>('all')

  const heatmapData: HeatmapPoint[] = useMemo(() => [
    {
      id: 'intercontinental-hotel',
      location: 'InterContinental Hotel Century City',
      coordinates: { x: 200, y: 150 },
      incident_count: 15,
      severity_score: 95,
      time_period: '2016-2018',
      evidence_types: ['video', 'witness_testimony', 'physical_evidence', 'digital_records'],
      details: [
        'Security footage of March 2016 assault',
        'Multiple witness testimonies of violence',
        'Hotel staff corroboration of incidents',
        'Room service records during extended stays'
      ],
      witnesses: 8,
      date_range: '2016-03-05 to 2018-09-12'
    },
    {
      id: 'miami-residence',
      location: 'Miami Star Island Residence',
      coordinates: { x: 450, y: 200 },
      incident_count: 22,
      severity_score: 88,
      time_period: '2018-2020',
      evidence_types: ['witness_testimony', 'financial_records', 'communication_logs'],
      details: [
        'Victim testimonies of coercive encounters',
        'Financial records of victim payments',
        'Communication monitoring evidence',
        'Security system access logs'
      ],
      witnesses: 12,
      date_range: '2018-01-15 to 2020-12-30'
    },
    {
      id: 'bad-boy-studios',
      location: 'Bad Boy Entertainment Studios',
      coordinates: { x: 320, y: 100 },
      incident_count: 8,
      severity_score: 75,
      time_period: '2008-2012',
      evidence_types: ['witness_testimony', 'employment_records', 'audio_recordings'],
      details: [
        'Employee testimonies of inappropriate behavior',
        'Records of late-night studio sessions',
        'Audio equipment used for recording incidents',
        'Payroll records showing unusual payments'
      ],
      witnesses: 6,
      date_range: '2008-06-20 to 2012-11-18'
    },
    {
      id: 'ny-penthouse',
      location: 'New York Penthouse',
      coordinates: { x: 180, y: 250 },
      incident_count: 18,
      severity_score: 92,
      time_period: '2019-2022',
      evidence_types: ['video', 'witness_testimony', 'digital_evidence', 'medical_records'],
      details: [
        'Hidden camera footage of coercive acts',
        'Victim medical records post-incidents',
        'Digital communications showing threats',
        'Multiple witness accounts of violence'
      ],
      witnesses: 10,
      date_range: '2019-02-14 to 2022-08-07'
    },
    {
      id: 'atlanta-studio',
      location: 'Atlanta Recording Studio',
      coordinates: { x: 380, y: 280 },
      incident_count: 6,
      severity_score: 68,
      time_period: '2015-2017',
      evidence_types: ['witness_testimony', 'audio_recordings', 'employment_records'],
      details: [
        'Studio staff testimonies of incidents',
        'Recording equipment misuse evidence',
        'After-hours access logs showing patterns',
        'Employment contracts with unusual clauses'
      ],
      witnesses: 4,
      date_range: '2015-07-22 to 2017-04-11'
    },
    {
      id: 'hamptons-estate',
      location: 'East Hamptons Estate',
      coordinates: { x: 250, y: 80 },
      incident_count: 12,
      severity_score: 85,
      time_period: '2020-2023',
      evidence_types: ['witness_testimony', 'financial_records', 'video', 'communication_logs'],
      details: [
        'Party guest testimonies of coercive behavior',
        'Financial records of victim compensation',
        'Security camera footage from events',
        'Text message evidence of victim recruitment'
      ],
      witnesses: 9,
      date_range: '2020-05-30 to 2023-09-15'
    },
    {
      id: 'beverly-hills-hotel',
      location: 'Beverly Hills Hotel Bungalow',
      coordinates: { x: 150, y: 180 },
      incident_count: 7,
      severity_score: 78,
      time_period: '2017-2019',
      evidence_types: ['witness_testimony', 'hotel_records', 'financial_evidence'],
      details: [
        'Hotel staff witness testimonies',
        'Room service and occupancy records',
        'Credit card and payment records',
        'Guest registry and visitor logs'
      ],
      witnesses: 5,
      date_range: '2017-01-08 to 2019-06-25'
    },
    {
      id: 'private-jet',
      location: 'Private Aircraft Incidents',
      coordinates: { x: 400, y: 120 },
      incident_count: 4,
      severity_score: 82,
      time_period: '2018-2021',
      evidence_types: ['witness_testimony', 'flight_records', 'communication_logs'],
      details: [
        'Flight crew testimonies of incidents',
        'Flight manifest and passenger records',
        'In-flight communication monitoring',
        'Aircraft maintenance and equipment logs'
      ],
      witnesses: 3,
      date_range: '2018-09-12 to 2021-03-28'
    }
  ], [])

  const filteredData = useMemo(() => {
    if (filterType === 'all') return heatmapData
    return heatmapData.filter(point => 
      point.evidence_types.includes(filterType)
    )
  }, [heatmapData, filterType])

  const getIntensityColor = (severityScore: number) => {
    if (severityScore >= 90) return 'rgb(239, 68, 68)' // red-500
    if (severityScore >= 80) return 'rgb(249, 115, 22)' // orange-500
    if (severityScore >= 70) return 'rgb(245, 158, 11)' // amber-500
    if (severityScore >= 60) return 'rgb(234, 179, 8)' // yellow-500
    return 'rgb(34, 197, 94)' // green-500
  }

  const getFrequencySize = (incidentCount: number) => {
    const maxCount = Math.max(...heatmapData.map(p => p.incident_count))
    const minSize = 8
    const maxSize = 24
    return minSize + ((incidentCount / maxCount) * (maxSize - minSize))
  }

  const getPointOpacity = (point: HeatmapPoint) => {
    switch (viewMode) {
      case 'intensity': return point.severity_score / 100
      case 'frequency': return Math.min(point.incident_count / 20, 1)
      case 'timeline': {
        const startYear = new Date(point.date_range.split(' to ')[0]).getFullYear()
        const currentYear = new Date().getFullYear()
        return Math.max(0.3, 1 - ((currentYear - startYear) / 16))
      }
      default: return 0.8
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Location', 'Incident Count', 'Severity Score', 'Time Period', 'Evidence Types', 'Witnesses', 'Date Range'],
      ...heatmapData.map(point => [
        point.location,
        point.incident_count.toString(),
        point.severity_score.toString(),
        point.time_period,
        point.evidence_types.join('; '),
        point.witnesses.toString(),
        point.date_range
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-evidence-heatmap.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Evidence Location Heatmap
          </h3>
          <p className="text-sm text-muted-foreground">
            Geographic and temporal analysis of incident locations and evidence density - Day {trialDay.trialDayNumber}
          </p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg border border-accent/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export Heatmap</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">View Mode:</span>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {[
              { value: 'intensity', label: 'Severity', icon: Thermometer },
              { value: 'frequency', label: 'Frequency', icon: Activity },
              { value: 'timeline', label: 'Timeline', icon: Calendar }
            ].map((mode) => (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value as any)}
                className={`px-3 py-1 text-sm flex items-center space-x-1 transition-colors ${
                  viewMode === mode.value
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-background hover:bg-muted text-muted-foreground'
                }`}
              >
                <mode.icon className="w-3 h-3" />
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Evidence Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1 bg-muted/50 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Evidence</option>
            <option value="video">Video Evidence</option>
            <option value="witness_testimony">Witness Testimony</option>
            <option value="physical_evidence">Physical Evidence</option>
            <option value="digital_records">Digital Records</option>
            <option value="financial_records">Financial Records</option>
            <option value="communication_logs">Communications</option>
          </select>
        </div>
      </div>

      {/* Heatmap Visualization */}
      <div className="glass-card p-6">
        <div className="relative w-full h-96 bg-slate-900/20 rounded-lg overflow-hidden">
          <svg viewBox="0 0 600 400" className="w-full h-full">
            {/* Background grid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted/20" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Heatmap points */}
            {filteredData.map((point) => (
              <g key={point.id}>
                {/* Heat circle (background) */}
                <circle
                  cx={point.coordinates.x}
                  cy={point.coordinates.y}
                  r={getFrequencySize(point.incident_count) + 10}
                  fill={getIntensityColor(point.severity_score)}
                  opacity={getPointOpacity(point) * 0.3}
                  className="blur-sm"
                />
                
                {/* Main point */}
                <motion.circle
                  cx={point.coordinates.x}
                  cy={point.coordinates.y}
                  r={getFrequencySize(point.incident_count)}
                  fill={getIntensityColor(point.severity_score)}
                  opacity={getPointOpacity(point)}
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`cursor-pointer transition-all ${
                    selectedPoint?.id === point.id ? 'text-accent' : 'text-background'
                  }`}
                  onClick={() => setSelectedPoint(point)}
                  whileHover={reducedMotion ? {} : { scale: 1.2 }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: filteredData.indexOf(point) * 0.1 }}
                />
                
                {/* Location label */}
                <text
                  x={point.coordinates.x}
                  y={point.coordinates.y - getFrequencySize(point.incident_count) - 5}
                  textAnchor="middle"
                  className="text-xs fill-current text-foreground font-medium pointer-events-none"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
                >
                  {point.location.split(' ')[0]}
                </text>
                
                {/* Incident count label */}
                <text
                  x={point.coordinates.x}
                  y={point.coordinates.y + 4}
                  textAnchor="middle"
                  className="text-xs fill-current text-background font-bold pointer-events-none"
                >
                  {point.incident_count}
                </text>
              </g>
            ))}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Severity:</span>
              <div className="flex space-x-1">
                {[
                  { color: 'rgb(34, 197, 94)', label: 'Low' },
                  { color: 'rgb(234, 179, 8)', label: 'Medium' },
                  { color: 'rgb(245, 158, 11)', label: 'High' },
                  { color: 'rgb(249, 115, 22)', label: 'Very High' },
                  { color: 'rgb(239, 68, 68)', label: 'Critical' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center space-x-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Size = Incident Frequency • Color = Severity Score
          </div>
        </div>
      </div>

      {/* Selected Location Details */}
      {selectedPoint && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-start space-x-4 mb-4">
            <div className="p-3 rounded-lg bg-accent/20 border border-accent/30">
              <MapPin className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-foreground mb-1">{selectedPoint.location}</h4>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Period: {selectedPoint.time_period}</span>
                <span>Incidents: {selectedPoint.incident_count}</span>
                <span>Severity: {selectedPoint.severity_score}/100</span>
                <span>Witnesses: {selectedPoint.witnesses}</span>
              </div>
            </div>
            <div 
              className="w-8 h-8 rounded-full border-2"
              style={{ 
                backgroundColor: getIntensityColor(selectedPoint.severity_score),
                borderColor: getIntensityColor(selectedPoint.severity_score)
              }}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-foreground mb-2">Evidence Details</h5>
              <ul className="space-y-1">
                {selectedPoint.details.map((detail, index) => (
                  <li key={index} className="text-sm text-foreground flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-foreground mb-2">Evidence Types</h5>
              <div className="flex flex-wrap gap-2">
                {selectedPoint.evidence_types.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-1 bg-accent/20 text-accent rounded text-xs font-medium"
                  >
                    {type.replace('_', ' ').toUpperCase()}
                  </span>
                ))}
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold text-foreground mb-2">Timeline</h5>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{selectedPoint.date_range}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{heatmapData.length}</div>
          <div className="text-sm text-muted-foreground">Locations</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {heatmapData.reduce((sum, point) => sum + point.incident_count, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Incidents</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {Math.round(heatmapData.reduce((sum, point) => sum + point.severity_score, 0) / heatmapData.length)}
          </div>
          <div className="text-sm text-muted-foreground">Avg Severity</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {heatmapData.reduce((sum, point) => sum + point.witnesses, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Witnesses</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {new Set(heatmapData.flatMap(point => point.evidence_types)).size}
          </div>
          <div className="text-sm text-muted-foreground">Evidence Types</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">16</div>
          <div className="text-sm text-muted-foreground">Years Covered</div>
        </div>
      </div>
    </div>
  )
}