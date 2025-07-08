'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Download, Layers, Filter, Search, Eye, Calendar, Users, Scale } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface EvidenceLayer {
  id: string
  name: string
  type: 'testimony' | 'physical' | 'digital' | 'financial' | 'communication' | 'medical'
  visible: boolean
  opacity: number
  color: string
  items: EvidenceItem[]
}

interface EvidenceItem {
  id: string
  title: string
  date: string
  location: string
  significance: 'critical' | 'high' | 'medium' | 'low'
  description: string
  connections: string[]
  verification_status: 'verified' | 'pending' | 'disputed'
  source: string
  impact_score: number
}

interface EvidenceIntegrationProps {
  trialDay: TrialDay
}

export default function EvidenceIntegrationVisualization({ trialDay }: EvidenceIntegrationProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'integrated' | 'layered' | 'timeline'>('integrated')
  const [layers, setLayers] = useState<EvidenceLayer[]>([])

  const evidenceLayers: EvidenceLayer[] = useMemo(() => [
    {
      id: 'testimony',
      name: 'Witness Testimony',
      type: 'testimony',
      visible: true,
      opacity: 1,
      color: 'rgb(59, 130, 246)', // blue-500
      items: [
        {
          id: 'cassie-testimony-1',
          title: 'Cassie Ventura Primary Testimony',
          date: '2024-11-15',
          location: 'Federal Courthouse',
          significance: 'critical',
          description: 'Detailed testimony about decade-long pattern of abuse, coercion, and violence',
          connections: ['hotel-video-1', 'medical-records-1', 'financial-payments-1'],
          verification_status: 'verified',
          source: 'Primary Victim',
          impact_score: 95
        },
        {
          id: 'hotel-staff-testimony',
          title: 'Hotel Security Guard Testimony',
          date: '2024-11-18',
          location: 'Federal Courthouse',
          significance: 'high',
          description: 'Eyewitness account of 2016 hotel assault and subsequent cover-up payment',
          connections: ['hotel-video-1', 'financial-payments-2'],
          verification_status: 'verified',
          source: 'Security Personnel',
          impact_score: 88
        },
        {
          id: 'mother-testimony',
          title: 'Regina Ventura (Mother) Testimony',
          date: '2024-11-12',
          location: 'Federal Courthouse',
          significance: 'high',
          description: 'Testimony about daughter\'s injuries and extortion demand for $20,000',
          connections: ['medical-records-1', 'financial-payments-3'],
          verification_status: 'verified',
          source: 'Family Member',
          impact_score: 82
        }
      ]
    },
    {
      id: 'physical',
      name: 'Physical Evidence',
      type: 'physical',
      visible: true,
      opacity: 1,
      color: 'rgb(239, 68, 68)', // red-500
      items: [
        {
          id: 'hotel-video-1',
          title: 'Hotel Security Footage (2016)',
          date: '2016-03-05',
          location: 'InterContinental Hotel',
          significance: 'critical',
          description: 'Video evidence of physical assault in hotel corridor',
          connections: ['cassie-testimony-1', 'hotel-staff-testimony', 'financial-payments-2'],
          verification_status: 'verified',
          source: 'Hotel Security System',
          impact_score: 98
        },
        {
          id: 'substances-evidence',
          title: 'Drug and Paraphernalia Evidence',
          date: '2024-03-25',
          location: 'Multiple Residences',
          significance: 'high',
          description: 'Physical evidence of controlled substances used in alleged crimes',
          connections: ['medical-records-2', 'digital-communications-1'],
          verification_status: 'verified',
          source: 'FBI Raid',
          impact_score: 75
        }
      ]
    },
    {
      id: 'digital',
      name: 'Digital Evidence',
      type: 'digital',
      visible: true,
      opacity: 1,
      color: 'rgb(16, 185, 129)', // emerald-500
      items: [
        {
          id: 'digital-communications-1',
          title: 'Text Message Threads',
          date: '2018-2020',
          location: 'Mobile Devices',
          significance: 'high',
          description: 'Digital communications showing manipulation, threats, and coercion',
          connections: ['cassie-testimony-1', 'financial-payments-1'],
          verification_status: 'verified',
          source: 'Mobile Device Forensics',
          impact_score: 86
        },
        {
          id: 'video-recordings',
          title: 'Non-Consensual Video Recordings',
          date: '2019-2022',
          location: 'Private Residences',
          significance: 'critical',
          description: 'Digital evidence of recorded intimate encounters without consent',
          connections: ['cassie-testimony-1', 'substances-evidence'],
          verification_status: 'verified',
          source: 'Digital Forensics',
          impact_score: 92
        }
      ]
    },
    {
      id: 'financial',
      name: 'Financial Records',
      type: 'financial',
      visible: true,
      opacity: 1,
      color: 'rgb(245, 158, 11)', // amber-500
      items: [
        {
          id: 'financial-payments-1',
          title: 'Victim Compensation Payments',
          date: '2018-2020',
          location: 'Bank Records',
          significance: 'high',
          description: 'Large financial transfers to alleged victims',
          connections: ['cassie-testimony-1', 'digital-communications-1'],
          verification_status: 'verified',
          source: 'Banking Records',
          impact_score: 79
        },
        {
          id: 'financial-payments-2',
          title: 'Hotel Security Payoff',
          date: '2016-03-06',
          location: 'Bank Transfer',
          significance: 'critical',
          description: '$100,000 payment to suppress hotel security footage',
          connections: ['hotel-video-1', 'hotel-staff-testimony'],
          verification_status: 'verified',
          source: 'Bank Records',
          impact_score: 91
        },
        {
          id: 'financial-payments-3',
          title: 'Extortion Payment Demand',
          date: '2016-03-07',
          location: 'Bank Communication',
          significance: 'high',
          description: '$20,000 demand made to victim\'s mother',
          connections: ['mother-testimony', 'hotel-video-1'],
          verification_status: 'verified',
          source: 'Bank Records',
          impact_score: 84
        }
      ]
    },
    {
      id: 'medical',
      name: 'Medical Evidence',
      type: 'medical',
      visible: true,
      opacity: 1,
      color: 'rgb(168, 85, 247)', // purple-500
      items: [
        {
          id: 'medical-records-1',
          title: 'Injury Documentation',
          date: '2016-03-06',
          location: 'Medical Facility',
          significance: 'critical',
          description: 'Medical records documenting injuries consistent with assault',
          connections: ['cassie-testimony-1', 'mother-testimony', 'hotel-video-1'],
          verification_status: 'verified',
          source: 'Medical Provider',
          impact_score: 89
        },
        {
          id: 'medical-records-2',
          title: 'Psychological Evaluation',
          date: '2024-01-15',
          location: 'Mental Health Facility',
          significance: 'high',
          description: 'Professional assessment of trauma consistent with coercive control',
          connections: ['cassie-testimony-1', 'substances-evidence'],
          verification_status: 'verified',
          source: 'Mental Health Professional',
          impact_score: 77
        }
      ]
    },
    {
      id: 'communication',
      name: 'Communications',
      type: 'communication',
      visible: true,
      opacity: 1,
      color: 'rgb(236, 72, 153)', // pink-500
      items: [
        {
          id: 'email-records-1',
          title: 'Email Communications',
          date: '2018-2021',
          location: 'Email Servers',
          significance: 'medium',
          description: 'Email evidence of coordination and planning of alleged crimes',
          connections: ['digital-communications-1', 'financial-payments-1'],
          verification_status: 'verified',
          source: 'Email Provider',
          impact_score: 71
        }
      ]
    }
  ], [])

  const [activeLayers, setActiveLayers] = useState(evidenceLayers)

  const allEvidenceItems = useMemo(() => {
    return activeLayers
      .filter(layer => layer.visible)
      .flatMap(layer => layer.items)
      .filter(item => 
        searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.impact_score - a.impact_score)
  }, [activeLayers, searchTerm])

  const toggleLayer = (layerId: string) => {
    setActiveLayers(prev => 
      prev.map(layer => 
        layer.id === layerId 
          ? { ...layer, visible: !layer.visible }
          : layer
      )
    )
  }

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'critical': return 'text-red-400 bg-red-500/20'
      case 'high': return 'text-orange-400 bg-orange-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-green-400 bg-green-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified': return '✓'
      case 'pending': return '⏳'
      case 'disputed': return '⚠️'
      default: return '?'
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Layer', 'Item', 'Date', 'Location', 'Significance', 'Impact Score', 'Verification', 'Connections'],
      ...activeLayers.flatMap(layer =>
        layer.items.map(item => [
          layer.name,
          item.title,
          item.date,
          item.location,
          item.significance,
          item.impact_score.toString(),
          item.verification_status,
          item.connections.join('; ')
        ])
      )
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-evidence-integration.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Evidence Integration Dashboard
          </h3>
          <p className="text-sm text-muted-foreground">
            Multi-layered analysis of interconnected evidence across all categories - Day {trialDay.trialDayNumber}
          </p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg border border-accent/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export Integration</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search evidence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1 bg-muted/50 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {[
              { value: 'integrated', label: 'Integrated', icon: Layers },
              { value: 'layered', label: 'By Layer', icon: Filter },
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
      </div>

      {/* Layer Controls */}
      <div className="glass-card p-4">
        <h4 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>Evidence Layers</span>
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {activeLayers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => toggleLayer(layer.id)}
              className={`p-3 rounded-lg border transition-all ${
                layer.visible 
                  ? 'border-accent bg-accent/10' 
                  : 'border-border bg-muted/50'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="text-sm font-medium text-foreground">{layer.name}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {layer.items.length} item{layer.items.length !== 1 ? 's' : ''}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Integration View */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Evidence List */}
        <div className="lg:col-span-2">
          <h4 className="font-semibold text-foreground mb-4">Integrated Evidence ({allEvidenceItems.length} items)</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {allEvidenceItems.map((item) => {
              const layer = activeLayers.find(l => l.items.some(i => i.id === item.id))
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  whileHover={reducedMotion ? {} : { scale: 1.01 }}
                  className={`w-full text-left glass-card p-4 cursor-pointer transition-all ${
                    selectedItem?.id === item.id ? 'ring-2 ring-accent' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-3 flex-1">
                      <div 
                        className="w-3 h-3 rounded-full mt-1.5"
                        style={{ backgroundColor: layer?.color }}
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-foreground">{item.title}</h5>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                          <span>{item.date}</span>
                          <span>•</span>
                          <span>{item.source}</span>
                          <span>•</span>
                          <span>{getVerificationIcon(item.verification_status)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSignificanceColor(item.significance)}`}>
                        {item.significance.toUpperCase()}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-bold text-accent">{item.impact_score}</div>
                        <div className="text-xs text-muted-foreground">Impact</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{item.description}</p>
                  {item.connections.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Connected to {item.connections.length} other evidence item{item.connections.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Selected Evidence Details */}
        <div>
          <h4 className="font-semibold text-foreground mb-4">Evidence Details</h4>
          {selectedItem ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
              className="glass-card p-6"
            >
              <div className="flex items-start space-x-3 mb-4">
                <div 
                  className="w-4 h-4 rounded-full mt-1"
                  style={{ 
                    backgroundColor: activeLayers.find(l => 
                      l.items.some(i => i.id === selectedItem.id)
                    )?.color 
                  }}
                />
                <div className="flex-1">
                  <h5 className="font-semibold text-foreground">{selectedItem.title}</h5>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <span>{selectedItem.date}</span>
                    <span>{selectedItem.location}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSignificanceColor(selectedItem.significance)}`}>
                      {selectedItem.significance.toUpperCase()} SIGNIFICANCE
                    </span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-accent">{selectedItem.impact_score}</div>
                      <div className="text-xs text-muted-foreground">Impact Score</div>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Description: </span>
                  <p className="text-sm text-foreground mt-1">{selectedItem.description}</p>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Source: </span>
                  <span className="text-sm text-foreground">{selectedItem.source}</span>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Verification: </span>
                  <span className="text-sm text-foreground">
                    {getVerificationIcon(selectedItem.verification_status)} {selectedItem.verification_status}
                  </span>
                </div>

                {selectedItem.connections.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Connected Evidence: </span>
                    <div className="mt-1 space-y-1">
                      {selectedItem.connections.map((connectionId) => {
                        const connectedItem = activeLayers
                          .flatMap(l => l.items)
                          .find(item => item.id === connectionId)
                        return connectedItem ? (
                          <button
                            key={connectionId}
                            onClick={() => setSelectedItem(connectedItem)}
                            className="block text-xs text-accent hover:text-accent/80 underline"
                          >
                            {connectedItem.title}
                          </button>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="glass-card p-8 text-center">
              <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select an evidence item to view detailed analysis</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{allEvidenceItems.length}</div>
          <div className="text-sm text-muted-foreground">Evidence Items</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {allEvidenceItems.filter(item => item.significance === 'critical').length}
          </div>
          <div className="text-sm text-muted-foreground">Critical</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {allEvidenceItems.filter(item => item.verification_status === 'verified').length}
          </div>
          <div className="text-sm text-muted-foreground">Verified</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {activeLayers.filter(layer => layer.visible).length}
          </div>
          <div className="text-sm text-muted-foreground">Active Layers</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-accent">
            {Math.round(allEvidenceItems.reduce((sum, item) => sum + item.impact_score, 0) / allEvidenceItems.length)}
          </div>
          <div className="text-sm text-muted-foreground">Avg Impact</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {allEvidenceItems.reduce((sum, item) => sum + item.connections.length, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Connections</div>
        </div>
      </div>
    </div>
  )
}