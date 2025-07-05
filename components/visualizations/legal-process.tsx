'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Download, Scale, FileText, AlertTriangle, CheckCircle, XCircle, Clock, Gavel } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface LegalProcess {
  id: string
  process_type: 'motion' | 'evidence' | 'objection' | 'ruling' | 'procedure' | 'testimony'
  title: string
  description: string
  initiated_by: 'prosecution' | 'defense' | 'court'
  timestamp: string
  status: 'pending' | 'granted' | 'denied' | 'withdrawn' | 'deferred'
  legal_basis: string
  court_response: string
  implications: string
  related_evidence: string[]
  precedent_cited: string[]
  next_steps: string[]
}

interface LegalProcessProps {
  trialDay: TrialDay
}

export default function LegalProcessVisualization({ trialDay }: LegalProcessProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedProcess, setSelectedProcess] = useState<LegalProcess | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterParty, setFilterParty] = useState<string>('all')

  const legalProcesses: LegalProcess[] = useMemo(() => [
    {
      id: 'mistrial-motion-1',
      process_type: 'motion',
      title: 'Defense Motion for Mistrial',
      description: 'Defense argues that prejudicial evidence and testimony have irreparably tainted the jury pool',
      initiated_by: 'defense',
      timestamp: '2025-05-28T09:30:00Z',
      status: 'denied',
      legal_basis: 'Federal Rule of Criminal Procedure 33 - grounds for mistrial due to prejudicial error',
      court_response: 'Court finds no prejudicial error that would warrant declaring a mistrial. Jury instructions adequate to cure any potential prejudice.',
      implications: 'Trial continues with existing jury. Defense may appeal ruling post-conviction.',
      related_evidence: [
        'Testimony regarding destroyed fingerprints',
        'Corroborated beating testimony from multiple witnesses',
        'Video evidence of hotel assault'
      ],
      precedent_cited: [
        'United States v. Dominguez Benitez (2004)',
        'United States v. Young (1985)',
        'Federal Rule of Criminal Procedure 33'
      ],
      next_steps: [
        'Defense to continue cross-examination',
        'Prosecution to present rebuttal witnesses',
        'Court to provide curative jury instructions'
      ]
    },
    {
      id: 'evidence-destruction-1',
      process_type: 'evidence',
      title: 'Testimony on Destroyed Fingerprint Evidence',
      description: 'Witness testimony reveals systematic destruction of fingerprint evidence from crime scenes',
      initiated_by: 'prosecution',
      timestamp: '2025-05-28T11:15:00Z',
      status: 'granted',
      legal_basis: 'Federal Rules of Evidence 401-403 - relevant evidence of consciousness of guilt',
      court_response: 'Court allows testimony as evidence of consciousness of guilt and obstruction of justice.',
      implications: 'Establishes pattern of evidence destruction and consciousness of guilt for jury consideration.',
      related_evidence: [
        'FBI forensics report on destroyed evidence',
        'Witness testimony about evidence tampering',
        'Documentation of missing fingerprint cards'
      ],
      precedent_cited: [
        'United States v. Zolin (1989)',
        'Chambers v. Mississippi (1973)',
        'Federal Rules of Evidence 404(b)'
      ],
      next_steps: [
        'Cross-examination of forensics expert',
        'Additional witnesses on evidence handling',
        'Jury instruction on consciousness of guilt'
      ]
    },
    {
      id: 'corroboration-ruling-1',
      process_type: 'ruling',
      title: 'Court Ruling on Corroborative Evidence Standards',
      description: 'Judge clarifies standards for corroborative evidence in sexual assault cases',
      initiated_by: 'court',
      timestamp: '2025-05-28T14:20:00Z',
      status: 'granted',
      legal_basis: 'Federal Rules of Evidence 608 and 609 regarding witness credibility and character evidence',
      court_response: 'Court instructs jury on standards for evaluating corroborative evidence and witness credibility.',
      implications: 'Provides framework for jury to evaluate multiple witness testimonies and corroborating evidence.',
      related_evidence: [
        'Multiple witness testimonies',
        'Physical evidence corroborating assault claims',
        'Medical records supporting abuse allegations'
      ],
      precedent_cited: [
        'Crawford v. Washington (2004)',
        'United States v. White (1992)',
        'Federal Rules of Evidence 608'
      ],
      next_steps: [
        'Jury to apply corroboration standards',
        'Additional witness testimony evaluation',
        'Final jury instructions on credibility'
      ]
    },
    {
      id: 'objection-hearsay-1',
      process_type: 'objection',
      title: 'Defense Objection to Hearsay Testimony',
      description: 'Defense objects to admission of statements made to third parties as hearsay',
      initiated_by: 'defense',
      timestamp: '2025-05-28T10:45:00Z',
      status: 'denied',
      legal_basis: 'Federal Rules of Evidence 802 - hearsay rule exclusions',
      court_response: 'Court finds statements fall under excited utterance exception and present sense impression.',
      implications: 'Hearsay testimony admitted for jury consideration under established exceptions.',
      related_evidence: [
        'Statements made immediately after assault',
        'Emergency call recordings',
        'Medical personnel testimony'
      ],
      precedent_cited: [
        'Federal Rules of Evidence 803(1)',
        'Federal Rules of Evidence 803(2)',
        'United States v. Iron Shell (1980)'
      ],
      next_steps: [
        'Testimony continues with hearsay statements',
        'Defense may challenge weight vs. admissibility',
        'Cross-examination of hearsay declarants'
      ]
    },
    {
      id: 'procedure-jury-instruction-1',
      process_type: 'procedure',
      title: 'Special Jury Instruction on Pattern Evidence',
      description: 'Court provides specific instruction on how jury should consider pattern of behavior evidence',
      initiated_by: 'court',
      timestamp: '2025-05-28T16:00:00Z',
      status: 'granted',
      legal_basis: 'Federal Rules of Evidence 404(b) - evidence of other crimes, wrongs, or acts',
      court_response: 'Court instructs jury on proper use of pattern evidence for motive, intent, and common scheme.',
      implications: 'Jury can consider pattern evidence for specific purposes but not for propensity reasoning.',
      related_evidence: [
        'Multiple victim testimonies showing pattern',
        'Similar modus operandi across incidents',
        'Timeline of escalating behavior'
      ],
      precedent_cited: [
        'Federal Rules of Evidence 404(b)',
        'United States v. Huddleston (1988)',
        'United States v. Beechum (1978)'
      ],
      next_steps: [
        'Jury deliberation with pattern instruction',
        'Closing arguments addressing pattern evidence',
        'Verdict consideration of pattern elements'
      ]
    },
    {
      id: 'motion-suppress-1',
      process_type: 'motion',
      title: 'Defense Motion to Suppress Digital Evidence',
      description: 'Defense challenges admissibility of digital evidence obtained through search warrants',
      initiated_by: 'defense',
      timestamp: '2025-05-28T08:00:00Z',
      status: 'deferred',
      legal_basis: 'Fourth Amendment protections and Federal Rules of Criminal Procedure 41',
      court_response: 'Court defers ruling pending additional briefing on scope of digital search warrants.',
      implications: 'Digital evidence remains potentially admissible pending final ruling on suppression motion.',
      related_evidence: [
        'Cell phone data and communications',
        'Cloud storage content',
        'Computer hard drive evidence'
      ],
      precedent_cited: [
        'Riley v. California (2014)',
        'United States v. Warshak (2010)',
        'Carpenter v. United States (2018)'
      ],
      next_steps: [
        'Additional briefing on digital privacy rights',
        'Hearing on scope of search warrants',
        'Final ruling on evidence suppression'
      ]
    }
  ], [])

  const filteredProcesses = useMemo(() => {
    return legalProcesses.filter(process => {
      const typeMatch = filterType === 'all' || process.process_type === filterType
      const partyMatch = filterParty === 'all' || process.initiated_by === filterParty
      return typeMatch && partyMatch
    })
  }, [legalProcesses, filterType, filterParty])

  const getProcessIcon = (type: string) => {
    switch (type) {
      case 'motion': return <FileText className="w-4 h-4" />
      case 'evidence': return <Scale className="w-4 h-4" />
      case 'objection': return <AlertTriangle className="w-4 h-4" />
      case 'ruling': return <Gavel className="w-4 h-4" />
      case 'procedure': return <CheckCircle className="w-4 h-4" />
      case 'testimony': return <FileText className="w-4 h-4" />
      default: return <Scale className="w-4 h-4" />
    }
  }

  const getProcessColor = (type: string) => {
    switch (type) {
      case 'motion': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'evidence': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'objection': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'ruling': return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      case 'procedure': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'testimony': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getPartyColor = (party: string) => {
    switch (party) {
      case 'prosecution': return 'text-red-400'
      case 'defense': return 'text-blue-400'
      case 'court': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'granted': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'denied': return <XCircle className="w-4 h-4 text-red-400" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'withdrawn': return <XCircle className="w-4 h-4 text-gray-400" />
      case 'deferred': return <Clock className="w-4 h-4 text-orange-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Process', 'Type', 'Initiated By', 'Status', 'Legal Basis', 'Court Response', 'Implications'],
      ...legalProcesses.map(process => [
        process.title,
        process.process_type,
        process.initiated_by,
        process.status,
        process.legal_basis,
        process.court_response,
        process.implications
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-legal-process.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Legal Process and Evidence-Flow Diagram
          </h3>
          <p className="text-sm text-muted-foreground">
            Procedural analysis and legal maneuvering - Day {trialDay.trialDayNumber}
          </p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg border border-accent/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export Process</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Process Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1 bg-muted/50 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Types</option>
            <option value="motion">Motions</option>
            <option value="evidence">Evidence</option>
            <option value="objection">Objections</option>
            <option value="ruling">Rulings</option>
            <option value="procedure">Procedures</option>
            <option value="testimony">Testimony</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Initiated By:</span>
          <select
            value={filterParty}
            onChange={(e) => setFilterParty(e.target.value)}
            className="px-3 py-1 bg-muted/50 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Parties</option>
            <option value="prosecution">Prosecution</option>
            <option value="defense">Defense</option>
            <option value="court">Court</option>
          </select>
        </div>
      </div>

      {/* Process Flow Visualization */}
      <div className="glass-card p-6">
        <h4 className="font-semibold text-foreground mb-4">Legal Process Flow</h4>
        
        <div className="space-y-4">
          {filteredProcesses.map((process, index) => (
            <motion.button
              key={process.id}
              onClick={() => setSelectedProcess(process)}
              whileHover={reducedMotion ? {} : { scale: 1.01 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedProcess?.id === process.id 
                  ? 'border-accent bg-accent/10' 
                  : 'border-border bg-muted/50 hover:bg-muted'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded ${getProcessColor(process.process_type)}`}>
                    {getProcessIcon(process.process_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-foreground">{process.title}</h5>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span className="capitalize">{process.process_type}</span>
                      <span className={`font-medium ${getPartyColor(process.initiated_by)}`}>
                        {process.initiated_by}
                      </span>
                      <span>{new Date(process.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(process.status)}
                  <span className="text-sm font-medium capitalize">{process.status}</span>
                </div>
              </div>
              
              <p className="text-sm text-foreground mb-2">{process.description}</p>
              <p className="text-xs text-muted-foreground">{process.implications}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Detailed Process Analysis */}
      {selectedProcess && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-start space-x-4 mb-6">
            <div className={`p-3 rounded-lg ${getProcessColor(selectedProcess.process_type)}`}>
              {getProcessIcon(selectedProcess.process_type)}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-foreground mb-1">{selectedProcess.title}</h4>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span className="capitalize">{selectedProcess.process_type}</span>
                <span className={`font-medium ${getPartyColor(selectedProcess.initiated_by)}`}>
                  Initiated by {selectedProcess.initiated_by}
                </span>
                <span>{new Date(selectedProcess.timestamp).toLocaleString()}</span>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(selectedProcess.status)}
                  <span className="capitalize font-medium">{selectedProcess.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Legal Details */}
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-foreground mb-2">Legal Basis</h5>
                <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                  {selectedProcess.legal_basis}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-foreground mb-2">Court Response</h5>
                <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                  {selectedProcess.court_response}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-foreground mb-2">Implications</h5>
                <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                  {selectedProcess.implications}
                </p>
              </div>
            </div>

            {/* Supporting Information */}
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-foreground mb-2">Related Evidence</h5>
                <ul className="space-y-1">
                  {selectedProcess.related_evidence.map((evidence, index) => (
                    <li key={index} className="text-sm text-foreground flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      {evidence}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-foreground mb-2">Legal Precedent Cited</h5>
                <ul className="space-y-1">
                  {selectedProcess.precedent_cited.map((precedent, index) => (
                    <li key={index} className="text-sm text-foreground flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      {precedent}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-foreground mb-2">Next Steps</h5>
                <ul className="space-y-1">
                  {selectedProcess.next_steps.map((step, index) => (
                    <li key={index} className="text-sm text-foreground flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Process Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{legalProcesses.length}</div>
          <div className="text-sm text-muted-foreground">Total Processes</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {legalProcesses.filter(p => p.status === 'granted').length}
          </div>
          <div className="text-sm text-muted-foreground">Granted</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {legalProcesses.filter(p => p.status === 'denied').length}
          </div>
          <div className="text-sm text-muted-foreground">Denied</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {legalProcesses.filter(p => p.status === 'pending' || p.status === 'deferred').length}
          </div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {legalProcesses.filter(p => p.initiated_by === 'defense').length}
          </div>
          <div className="text-sm text-muted-foreground">Defense</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {legalProcesses.filter(p => p.initiated_by === 'prosecution').length}
          </div>
          <div className="text-sm text-muted-foreground">Prosecution</div>
        </div>
      </div>
    </div>
  )
}