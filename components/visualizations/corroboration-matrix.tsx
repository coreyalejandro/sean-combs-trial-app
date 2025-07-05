'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Download, Users, CheckCircle, XCircle, AlertCircle, Minus } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface Incident {
  id: string
  name: string
  date: string
  description: string
  severity: 'high' | 'medium' | 'low'
}

interface Witness {
  id: string
  name: string
  role: string
  credibility: 'high' | 'medium' | 'low'
}

interface CorrelationEntry {
  incidentId: string
  witnessId: string
  level: 'strong' | 'moderate' | 'weak' | 'none'
  details: string
  testimony_type: 'direct' | 'circumstantial' | 'hearsay'
}

interface CorroborationMatrixProps {
  trialDay: TrialDay
}

export default function CorroborationMatrixVisualization({ trialDay }: CorroborationMatrixProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedCell, setSelectedCell] = useState<{ incidentId: string; witnessId: string } | null>(null)
  const [filterLevel, setFilterLevel] = useState<string>('all')

  const incidents: Incident[] = [
    {
      id: 'hotel-2016',
      name: '2016 Hotel Beating',
      date: '2016-03-05',
      description: 'Surveillance footage captures assault at InterContinental Hotel',
      severity: 'high'
    },
    {
      id: 'car-beating',
      name: 'Car Beating Incident',
      date: '2009-03-10',
      description: 'Violent assault in vehicle',
      severity: 'high'
    },
    {
      id: 'bed-frame-assault',
      name: 'Bed Frame Assault',
      date: '2013-06-08',
      description: 'Thrown into bed frame requiring stitches',
      severity: 'high'
    },
    {
      id: 'freak-offs',
      name: 'Coercive Sexual Activities',
      date: '2007-2018',
      description: 'Multiple alleged coercive encounters',
      severity: 'high'
    },
    {
      id: 'intimidation',
      name: 'Ongoing Intimidation',
      date: '2007-2018',
      description: 'Pattern of psychological control',
      severity: 'medium'
    }
  ]

  const witnesses: Witness[] = [
    {
      id: 'cassie',
      name: 'Cassie Ventura',
      role: 'Primary Victim',
      credibility: 'high'
    },
    {
      id: 'dawn-richard',
      name: 'Dawn Richard',
      role: 'Danity Kane Member',
      credibility: 'high'
    },
    {
      id: 'cassie-mother',
      name: 'Regina Ventura',
      role: 'Cassie\'s Mother',
      credibility: 'high'
    },
    {
      id: 'mia',
      name: 'Former Assistant "Mia"',
      role: 'Employee/Witness',
      credibility: 'medium'
    },
    {
      id: 'security',
      name: 'Security Personnel',
      role: 'Hotel Security',
      credibility: 'medium'
    }
  ]

  const correlations: CorrelationEntry[] = [
    // Cassie's testimony
    { incidentId: 'hotel-2016', witnessId: 'cassie', level: 'strong', details: 'Primary victim, detailed firsthand account', testimony_type: 'direct' },
    { incidentId: 'car-beating', witnessId: 'cassie', level: 'strong', details: 'Primary victim, physical evidence of injuries', testimony_type: 'direct' },
    { incidentId: 'bed-frame-assault', witnessId: 'cassie', level: 'strong', details: 'Primary victim, hospital records available', testimony_type: 'direct' },
    { incidentId: 'freak-offs', witnessId: 'cassie', level: 'strong', details: 'Primary victim, extensive testimony', testimony_type: 'direct' },
    { incidentId: 'intimidation', witnessId: 'cassie', level: 'strong', details: 'Ongoing pattern documented', testimony_type: 'direct' },

    // Dawn Richard's corroboration
    { incidentId: 'hotel-2016', witnessId: 'dawn-richard', level: 'moderate', details: 'Witnessed aftermath, saw injuries', testimony_type: 'circumstantial' },
    { incidentId: 'car-beating', witnessId: 'dawn-richard', level: 'weak', details: 'Heard about incident later', testimony_type: 'hearsay' },
    { incidentId: 'bed-frame-assault', witnessId: 'dawn-richard', level: 'strong', details: 'Witnessed the assault directly', testimony_type: 'direct' },
    { incidentId: 'freak-offs', witnessId: 'dawn-richard', level: 'moderate', details: 'Aware of activities, saw evidence', testimony_type: 'circumstantial' },
    { incidentId: 'intimidation', witnessId: 'dawn-richard', level: 'strong', details: 'Witnessed controlling behavior', testimony_type: 'direct' },

    // Regina Ventura (Cassie's mother)
    { incidentId: 'hotel-2016', witnessId: 'cassie-mother', level: 'moderate', details: 'Saw injuries after incident', testimony_type: 'circumstantial' },
    { incidentId: 'car-beating', witnessId: 'cassie-mother', level: 'none', details: 'No direct knowledge', testimony_type: 'hearsay' },
    { incidentId: 'bed-frame-assault', witnessId: 'cassie-mother', level: 'moderate', details: 'Witnessed bruises and injuries', testimony_type: 'circumstantial' },
    { incidentId: 'freak-offs', witnessId: 'cassie-mother', level: 'weak', details: 'Suspected but no direct evidence', testimony_type: 'hearsay' },
    { incidentId: 'intimidation', witnessId: 'cassie-mother', level: 'strong', details: 'Received threats directly', testimony_type: 'direct' },

    // Mia (former assistant)
    { incidentId: 'hotel-2016', witnessId: 'mia', level: 'weak', details: 'Not present, heard rumors', testimony_type: 'hearsay' },
    { incidentId: 'car-beating', witnessId: 'mia', level: 'none', details: 'No knowledge of incident', testimony_type: 'hearsay' },
    { incidentId: 'bed-frame-assault', witnessId: 'mia', level: 'none', details: 'Not employed at time', testimony_type: 'hearsay' },
    { incidentId: 'freak-offs', witnessId: 'mia', level: 'moderate', details: 'Organized logistics, witnessed preparation', testimony_type: 'circumstantial' },
    { incidentId: 'intimidation', witnessId: 'mia', level: 'strong', details: 'Direct victim of intimidation', testimony_type: 'direct' },

    // Security personnel
    { incidentId: 'hotel-2016', witnessId: 'security', level: 'strong', details: 'Video footage and direct witness', testimony_type: 'direct' },
    { incidentId: 'car-beating', witnessId: 'security', level: 'none', details: 'No involvement or knowledge', testimony_type: 'hearsay' },
    { incidentId: 'bed-frame-assault', witnessId: 'security', level: 'none', details: 'Different location', testimony_type: 'hearsay' },
    { incidentId: 'freak-offs', witnessId: 'security', level: 'moderate', details: 'Aware of activities in hotel', testimony_type: 'circumstantial' },
    { incidentId: 'intimidation', witnessId: 'security', level: 'weak', details: 'Observed controlling behavior', testimony_type: 'circumstantial' }
  ]

  const getCorrelation = (incidentId: string, witnessId: string): CorrelationEntry | null => {
    return correlations.find(c => c.incidentId === incidentId && c.witnessId === witnessId) || null
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'strong': return 'bg-green-500/80 text-white'
      case 'moderate': return 'bg-yellow-500/80 text-white'
      case 'weak': return 'bg-orange-500/80 text-white'
      case 'none': return 'bg-gray-500/40 text-gray-400'
      default: return 'bg-gray-500/40 text-gray-400'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'strong': return <CheckCircle className="w-4 h-4" />
      case 'moderate': return <AlertCircle className="w-4 h-4" />
      case 'weak': return <XCircle className="w-4 h-4" />
      case 'none': return <Minus className="w-4 h-4" />
      default: return <Minus className="w-4 h-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-500'
    }
  }

  const getCredibilityColor = (credibility: string) => {
    switch (credibility) {
      case 'high': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const correlationStats = useMemo(() => {
    const levels = correlations.reduce((acc, corr) => {
      acc[corr.level] = (acc[corr.level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: correlations.length,
      strong: levels.strong || 0,
      moderate: levels.moderate || 0,
      weak: levels.weak || 0,
      none: levels.none || 0
    }
  }, [correlations])

  const exportData = () => {
    const csvContent = [
      ['Incident', 'Witness', 'Corroboration Level', 'Testimony Type', 'Details'],
      ...correlations.map(corr => {
        const incident = incidents.find(i => i.id === corr.incidentId)
        const witness = witnesses.find(w => w.id === corr.witnessId)
        return [
          incident?.name || corr.incidentId,
          witness?.name || corr.witnessId,
          corr.level,
          corr.testimony_type,
          corr.details
        ]
      })
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-corroboration-matrix.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Witness Corroboration Matrix
          </h3>
          <p className="text-sm text-muted-foreground">
            Cross-reference of witness testimonies against key incidents - Day {trialDay.trialDayNumber}
          </p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg border border-accent/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export Matrix</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{correlationStats.total}</div>
          <div className="text-sm text-muted-foreground">Total Correlations</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{correlationStats.strong}</div>
          <div className="text-sm text-muted-foreground">Strong</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{correlationStats.moderate}</div>
          <div className="text-sm text-muted-foreground">Moderate</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">{correlationStats.weak}</div>
          <div className="text-sm text-muted-foreground">Weak</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-gray-400">{correlationStats.none}</div>
          <div className="text-sm text-muted-foreground">None</div>
        </div>
      </div>

      {/* Matrix */}
      <div className="glass-card p-6 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="text-left p-3 font-semibold text-foreground">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Incident / Witness</span>
                </div>
              </th>
              {witnesses.map(witness => (
                <th key={witness.id} className="text-center p-3 min-w-[120px]">
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground text-xs">{witness.name}</div>
                    <div className={`text-xs ${getCredibilityColor(witness.credibility)}`}>
                      {witness.credibility.toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground">{witness.role}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {incidents.map(incident => (
              <tr key={incident.id} className="border-t border-border">
                <td className={`p-3 border-l-4 ${getSeverityColor(incident.severity)}`}>
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground text-sm">{incident.name}</div>
                    <div className="text-xs text-muted-foreground">{incident.date}</div>
                    <div className="text-xs text-muted-foreground">{incident.description}</div>
                  </div>
                </td>
                {witnesses.map(witness => {
                  const correlation = getCorrelation(incident.id, witness.id)
                  const isSelected = selectedCell?.incidentId === incident.id && selectedCell?.witnessId === witness.id
                  
                  return (
                    <td key={witness.id} className="p-1">
                      <motion.button
                        onClick={() => setSelectedCell({ incidentId: incident.id, witnessId: witness.id })}
                        whileHover={reducedMotion ? {} : { scale: 1.05 }}
                        className={`w-full h-16 rounded-lg flex items-center justify-center transition-all ${
                          correlation ? getLevelColor(correlation.level) : 'bg-gray-500/20 text-gray-500'
                        } ${isSelected ? 'ring-2 ring-accent' : ''}`}
                      >
                        <div className="text-center">
                          {correlation ? getLevelIcon(correlation.level) : <Minus className="w-4 h-4" />}
                          <div className="text-xs mt-1 font-medium">
                            {correlation?.level.toUpperCase() || 'NONE'}
                          </div>
                        </div>
                      </motion.button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Cell Details */}
      {selectedCell && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
          className="glass-card p-6"
        >
          {(() => {
            const incident = incidents.find(i => i.id === selectedCell.incidentId)
            const witness = witnesses.find(w => w.id === selectedCell.witnessId)
            const correlation = getCorrelation(selectedCell.incidentId, selectedCell.witnessId)
            
            return (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Incident Details</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Name: </span>
                      <span className="text-sm font-medium text-foreground">{incident?.name}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Date: </span>
                      <span className="text-sm text-foreground">{incident?.date}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Severity: </span>
                      <span className={`text-sm font-medium ${
                        incident?.severity === 'high' ? 'text-red-400' : 
                        incident?.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {incident?.severity.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Description: </span>
                      <p className="text-sm text-foreground mt-1">{incident?.description}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">Witness & Corroboration</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Witness: </span>
                      <span className="text-sm font-medium text-foreground">{witness?.name}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Role: </span>
                      <span className="text-sm text-foreground">{witness?.role}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Credibility: </span>
                      <span className={`text-sm font-medium ${getCredibilityColor(witness?.credibility || 'low')}`}>
                        {witness?.credibility.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Corroboration Level: </span>
                      <span className={`text-sm font-medium ${
                        correlation?.level === 'strong' ? 'text-green-400' :
                        correlation?.level === 'moderate' ? 'text-yellow-400' :
                        correlation?.level === 'weak' ? 'text-orange-400' : 'text-gray-400'
                      }`}>
                        {correlation?.level.toUpperCase() || 'NONE'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Testimony Type: </span>
                      <span className="text-sm text-foreground">
                        {correlation?.testimony_type.toUpperCase() || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Details: </span>
                      <p className="text-sm text-foreground mt-1">
                        {correlation?.details || 'No corroboration available'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </motion.div>
      )}

      {/* Legend */}
      <div className="glass-card p-4">
        <h4 className="font-semibold text-foreground mb-3">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { level: 'strong', description: 'Direct witness or strong evidence' },
            { level: 'moderate', description: 'Circumstantial evidence or witness' },
            { level: 'weak', description: 'Indirect or hearsay evidence' },
            { level: 'none', description: 'No corroboration available' }
          ].map(item => (
            <div key={item.level} className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded flex items-center justify-center ${getLevelColor(item.level)}`}>
                {getLevelIcon(item.level)}
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{item.level.toUpperCase()}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}