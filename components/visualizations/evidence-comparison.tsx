'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Download, Scale, Eye, Users, MessageCircle, Calendar, AlertTriangle } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface EvidenceItem {
  id: string
  title: string
  type: 'testimony' | 'physical' | 'digital' | 'financial' | 'communication'
  description: string
  source: string
  date: string
  relevance: 'high' | 'medium' | 'low'
  prosecution_interpretation: string
  defense_interpretation: string
  supporting_details: string[]
  contradicting_details: string[]
}

interface EvidenceComparisonProps {
  trialDay: TrialDay
}

export default function EvidenceComparisonVisualization({ trialDay }: EvidenceComparisonProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'split' | 'prosecution' | 'defense'>('split')
  const [filterType, setFilterType] = useState<string>('all')

  const evidenceItems: EvidenceItem[] = useMemo(() => [
    {
      id: 'lifestyle-testimony',
      title: 'Sexual Activity Testimony',
      type: 'testimony',
      description: 'Jane\'s testimony about sexual encounters with Sean Combs',
      source: 'Jane Doe Witness',
      date: '2025-06-10',
      relevance: 'high',
      prosecution_interpretation: 'Evidence of coercive and non-consensual sexual activities. Jane was forced into degrading situations against her will, demonstrating a pattern of sexual abuse and control.',
      defense_interpretation: 'Evidence of consensual adult sexual activity between willing participants. Jane actively participated in and enjoyed kinky sexual encounters as part of an adult swinger lifestyle.',
      supporting_details: [
        'Detailed testimony of coercive encounters',
        'Evidence of physical and emotional trauma',
        'Pattern of escalating control and abuse',
        'Financial coercion accompanying sexual demands'
      ],
      contradicting_details: [
        'Text messages showing enthusiasm',
        'Voluntary participation in multiple encounters',
        'No immediate complaints or resistance',
        'Continued relationship after alleged incidents'
      ]
    },
    {
      id: 'text-communications',
      title: 'Text Message Evidence',
      type: 'communication',
      description: 'Digital communications between Jane and Sean Combs',
      source: 'Phone Records',
      date: '2018-2020',
      relevance: 'high',
      prosecution_interpretation: 'Messages show psychological manipulation and coercion. Combs used emotional manipulation to control Jane and normalize abusive behavior through gaslighting.',
      defense_interpretation: 'Messages demonstrate enthusiastic consent and affection. Jane expressed genuine interest and excitement about their relationship and sexual activities.',
      supporting_details: [
        'Messages expressing fear or reluctance',
        'Evidence of pressure and manipulation',
        'Requests for Jane to recruit others',
        'Financial promises tied to compliance'
      ],
      contradicting_details: [
        'Affectionate and willing language',
        'Initiation of contact by Jane',
        'Expressions of enjoyment and satisfaction',
        'Planning future encounters together'
      ]
    },
    {
      id: 'financial-records',
      title: 'Financial Transactions',
      type: 'financial',
      description: 'Money transfers and payments to Jane',
      source: 'Bank Records',
      date: '2018-2020',
      relevance: 'medium',
      prosecution_interpretation: 'Payments represent compensation for coerced sexual services. Financial dependency was used as a tool of control to ensure Jane\'s compliance with sexual demands.',
      defense_interpretation: 'Payments were gifts between consenting adults in a relationship. Financial support was provided out of genuine care and affection, not as payment for services.',
      supporting_details: [
        'Large payments following sexual encounters',
        'Pattern of financial dependency',
        'Threats to cut off financial support',
        'Payments to other women for similar activities'
      ],
      contradicting_details: [
        'Irregular payment timing unrelated to encounters',
        'Gifts given during holidays and special occasions',
        'Jane maintained independent income sources',
        'No explicit quid pro quo arrangements documented'
      ]
    },
    {
      id: 'witness-testimony',
      title: 'Third-Party Witness Accounts',
      type: 'testimony',
      description: 'Testimony from other participants and observers',
      source: 'Multiple Witnesses',
      date: '2018-2020',
      relevance: 'medium',
      prosecution_interpretation: 'Witnesses confirm coercive atmosphere and Jane\'s distress. Multiple observers noted Jane appeared uncomfortable and was pressured into participation.',
      defense_interpretation: 'Witnesses confirm consensual adult activities. Observers saw Jane as an enthusiastic and willing participant who enjoyed the lifestyle and encounters.',
      supporting_details: [
        'Witnesses observed Jane appearing distressed',
        'Reports of Jane expressing reluctance privately',
        'Evidence of coercive atmosphere at events',
        'Jane seeking emotional support from others'
      ],
      contradicting_details: [
        'Witnesses saw Jane appearing comfortable and engaged',
        'Reports of Jane expressing excitement about activities',
        'Evidence of voluntary participation in social events',
        'Jane recruiting and encouraging others to participate'
      ]
    },
    {
      id: 'medical-evidence',
      title: 'Medical and Psychological Records',
      type: 'physical',
      description: 'Health records and psychological evaluations',
      source: 'Medical Professionals',
      date: '2020-2024',
      relevance: 'high',
      prosecution_interpretation: 'Medical evidence shows trauma consistent with sexual abuse. Psychological evaluations reveal symptoms of coercive control and sexual trauma.',
      defense_interpretation: 'Medical records show normal health consistent with active adult lifestyle. Any psychological distress stems from media attention and legal proceedings, not past consensual activities.',
      supporting_details: [
        'Evidence of physical trauma and injuries',
        'Psychological symptoms of abuse and control',
        'Medical treatment for sexual health issues',
        'Therapy records documenting trauma recovery'
      ],
      contradicting_details: [
        'No contemporaneous medical complaints',
        'Normal physical and mental health during relationship',
        'Absence of evidence of non-consensual activity',
        'Psychological distress only after legal proceedings began'
      ]
    }
  ], [])

  const filteredEvidence = useMemo(() => {
    return evidenceItems.filter(item => 
      filterType === 'all' || item.type === filterType
    )
  }, [evidenceItems, filterType])

  const selectedItem = useMemo(() => {
    return evidenceItems.find(item => item.id === selectedEvidence)
  }, [evidenceItems, selectedEvidence])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'testimony': return <MessageCircle className="w-4 h-4" />
      case 'physical': return <Eye className="w-4 h-4" />
      case 'digital': return <Calendar className="w-4 h-4" />
      case 'financial': return <Scale className="w-4 h-4" />
      case 'communication': return <MessageCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'testimony': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'physical': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'digital': return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      case 'financial': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'communication': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Evidence', 'Type', 'Source', 'Date', 'Relevance', 'Prosecution Interpretation', 'Defense Interpretation'],
      ...evidenceItems.map(item => [
        item.title,
        item.type,
        item.source,
        item.date,
        item.relevance,
        item.prosecution_interpretation,
        item.defense_interpretation
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-evidence-comparison.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Evidence Comparison Viewer
          </h3>
          <p className="text-sm text-muted-foreground">
            Defense vs Prosecution interpretations of evidence - Day {trialDay.trialDayNumber}
          </p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg border border-accent/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export Analysis</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {[
              { value: 'split', label: 'Split View' },
              { value: 'prosecution', label: 'Prosecution' },
              { value: 'defense', label: 'Defense' }
            ].map((mode) => (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value as any)}
                className={`px-3 py-1 text-sm transition-colors ${
                  viewMode === mode.value
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-background hover:bg-muted text-muted-foreground'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Evidence Type Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1 bg-muted/50 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Types</option>
            <option value="testimony">Testimony</option>
            <option value="physical">Physical</option>
            <option value="digital">Digital</option>
            <option value="financial">Financial</option>
            <option value="communication">Communication</option>
          </select>
        </div>
      </div>

      {/* Evidence List and Comparison */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Evidence List */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Evidence Items</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredEvidence.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setSelectedEvidence(item.id)}
                whileHover={reducedMotion ? {} : { scale: 1.02 }}
                className={`w-full text-left glass-card p-3 cursor-pointer transition-all ${
                  selectedEvidence === item.id ? 'ring-2 ring-accent' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-foreground text-sm truncate">{item.title}</h5>
                      <p className="text-xs text-muted-foreground">{item.source}</p>
                    </div>
                  </div>
                  <div className={`text-xs font-medium ${getRelevanceColor(item.relevance)}`}>
                    {item.relevance.toUpperCase()}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Comparison View */}
        <div className="lg:col-span-3">
          <h4 className="font-semibold text-foreground mb-4">Evidence Analysis</h4>
          
          {selectedItem ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
              className="space-y-6"
            >
              {/* Evidence Header */}
              <div className="glass-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(selectedItem.type)}`}>
                      {getTypeIcon(selectedItem.type)}
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground">{selectedItem.title}</h5>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{selectedItem.source}</span>
                        <span>{selectedItem.date}</span>
                        <span className={`font-medium ${getRelevanceColor(selectedItem.relevance)}`}>
                          {selectedItem.relevance.toUpperCase()} RELEVANCE
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-foreground">{selectedItem.description}</p>
              </div>

              {/* Split View Comparison */}
              {viewMode === 'split' && (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Prosecution View */}
                  <div className="glass-card border-l-4 border-l-red-500">
                    <div className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Scale className="w-5 h-5 text-red-400" />
                        <h6 className="font-semibold text-red-400">Prosecution Narrative</h6>
                      </div>
                      <p className="text-sm text-foreground mb-4">{selectedItem.prosecution_interpretation}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Supporting Evidence</div>
                          <ul className="mt-1 space-y-1">
                            {selectedItem.supporting_details.map((detail, index) => (
                              <li key={index} className="text-xs text-foreground flex items-start">
                                <span className="text-green-400 mr-2">•</span>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Defense View */}
                  <div className="glass-card border-l-4 border-l-blue-500">
                    <div className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Users className="w-5 h-5 text-blue-400" />
                        <h6 className="font-semibold text-blue-400">Defense Counter-Narrative</h6>
                      </div>
                      <p className="text-sm text-foreground mb-4">{selectedItem.defense_interpretation}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Supporting Evidence</div>
                          <ul className="mt-1 space-y-1">
                            {selectedItem.contradicting_details.map((detail, index) => (
                              <li key={index} className="text-xs text-foreground flex items-start">
                                <span className="text-blue-400 mr-2">•</span>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Single View */}
              {viewMode !== 'split' && (
                <div className="glass-card">
                  <div className={`p-4 border-l-4 ${
                    viewMode === 'prosecution' ? 'border-l-red-500' : 'border-l-blue-500'
                  }`}>
                    <div className="flex items-center space-x-2 mb-3">
                      {viewMode === 'prosecution' ? 
                        <Scale className="w-5 h-5 text-red-400" /> : 
                        <Users className="w-5 h-5 text-blue-400" />
                      }
                      <h6 className={`font-semibold ${
                        viewMode === 'prosecution' ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {viewMode === 'prosecution' ? 'Prosecution Narrative' : 'Defense Counter-Narrative'}
                      </h6>
                    </div>
                    <p className="text-sm text-foreground mb-4">
                      {viewMode === 'prosecution' ? selectedItem.prosecution_interpretation : selectedItem.defense_interpretation}
                    </p>
                    
                    <div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Supporting Evidence</div>
                      <ul className="mt-2 space-y-1">
                        {(viewMode === 'prosecution' ? selectedItem.supporting_details : selectedItem.contradicting_details).map((detail, index) => (
                          <li key={index} className="text-xs text-foreground flex items-start">
                            <span className={`mr-2 ${
                              viewMode === 'prosecution' ? 'text-red-400' : 'text-blue-400'
                            }`}>•</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="glass-card p-8 text-center">
              <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select an evidence item to view prosecution vs defense interpretations</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="glass-card p-4">
        <h5 className="font-semibold text-foreground mb-3">Evidence Summary</h5>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{evidenceItems.length}</div>
            <div className="text-muted-foreground">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-400">
              {evidenceItems.filter(item => item.relevance === 'high').length}
            </div>
            <div className="text-muted-foreground">High Relevance</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">
              {new Set(evidenceItems.map(item => item.type)).size}
            </div>
            <div className="text-muted-foreground">Evidence Types</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {new Set(evidenceItems.map(item => item.source)).size}
            </div>
            <div className="text-muted-foreground">Sources</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400">2</div>
            <div className="text-muted-foreground">Interpretations</div>
          </div>
        </div>
      </div>
    </div>
  )
}