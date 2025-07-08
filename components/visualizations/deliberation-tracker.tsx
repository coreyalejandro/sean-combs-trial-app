'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Download, Clock, Users, MessageSquare, Gavel, CheckCircle, AlertTriangle, Timer } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface DeliberationSession {
  id: string
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  session_type: 'initial' | 'continued' | 'final' | 'clarification'
  jury_questions: JuryQuestion[]
  key_discussions: string[]
  evidence_requests: string[]
  status: 'in_progress' | 'completed' | 'suspended' | 'interrupted'
  notes: string
}

interface JuryQuestion {
  id: string
  timestamp: string
  question: string
  category: 'legal_instruction' | 'evidence_clarification' | 'procedure' | 'verdict_form'
  court_response: string
  impact: 'high' | 'medium' | 'low'
}

interface DeliberationTrackerProps {
  trialDay: TrialDay
}

export default function DeliberationTrackerVisualization({ trialDay }: DeliberationTrackerProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedSession, setSelectedSession] = useState<DeliberationSession | null>(null)
  const [viewMode, setViewMode] = useState<'timeline' | 'sessions' | 'questions'>('timeline')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const deliberationData: DeliberationSession[] = useMemo(() => [
    {
      id: 'session-1',
      date: '2024-12-02',
      start_time: '09:00',
      end_time: '12:00',
      duration_minutes: 180,
      session_type: 'initial',
      jury_questions: [
        {
          id: 'q-1-1',
          timestamp: '10:30',
          question: 'Can we review the definition of "coercive control" as provided in the jury instructions?',
          category: 'legal_instruction',
          court_response: 'Court provided clarified definition and examples of coercive control behavior patterns.',
          impact: 'high'
        },
        {
          id: 'q-1-2',
          timestamp: '11:45',
          question: 'What is the burden of proof required for RICO conspiracy charges?',
          category: 'legal_instruction',
          court_response: 'Court re-read relevant jury instruction on beyond reasonable doubt standard for RICO charges.',
          impact: 'high'
        }
      ],
      key_discussions: [
        'Review of video evidence significance',
        'Discussion of witness credibility standards',
        'Initial impressions of prosecution vs defense narratives',
        'Organization of evidence by charge and timeline'
      ],
      evidence_requests: [
        'Hotel security footage (March 2016)',
        'Financial payment records timeline',
        'Victim testimony transcripts'
      ],
      status: 'completed',
      notes: 'Jury spent significant time organizing evidence and understanding legal standards. Good engagement with materials.'
    },
    {
      id: 'session-2',
      date: '2024-12-02',
      start_time: '14:00',
      end_time: '17:30',
      duration_minutes: 210,
      session_type: 'continued',
      jury_questions: [
        {
          id: 'q-2-1',
          timestamp: '15:15',
          question: 'Can we review the hotel security footage again, specifically the audio components?',
          category: 'evidence_clarification',
          court_response: 'Court confirmed no audio available in security footage, jury may consider visual evidence only.',
          impact: 'medium'
        },
        {
          id: 'q-2-2',
          timestamp: '16:20',
          question: 'How should we weigh witness testimony when there are financial settlements involved?',
          category: 'legal_instruction',
          court_response: 'Court provided instruction on assessing witness credibility considering all circumstances.',
          impact: 'high'
        }
      ],
      key_discussions: [
        'Detailed analysis of witness testimony credibility',
        'Financial evidence interpretation',
        'Timeline correlation between incidents and payments',
        'Discussion of consent and coercion legal standards'
      ],
      evidence_requests: [
        'Bank transfer documentation',
        'Text message thread exhibits',
        'Expert testimony on coercive control'
      ],
      status: 'completed',
      notes: 'Jury showing careful attention to credibility assessment and legal standards application.'
    },
    {
      id: 'session-3',
      date: '2024-12-03',
      start_time: '09:00',
      end_time: '12:30',
      duration_minutes: 210,
      session_type: 'continued',
      jury_questions: [
        {
          id: 'q-3-1',
          timestamp: '10:00',
          question: 'For the racketeering charges, do we need to find each specific act proven, or just the overall pattern?',
          category: 'legal_instruction',
          court_response: 'Court clarified RICO pattern requirements and unanimity needed for predicate acts.',
          impact: 'high'
        },
        {
          id: 'q-3-2',
          timestamp: '11:30',
          question: 'Can we have a list of all exhibits related to the March 2016 hotel incident?',
          category: 'evidence_clarification',
          court_response: 'Court provided comprehensive exhibit list for March 2016 incident.',
          impact: 'medium'
        }
      ],
      key_discussions: [
        'RICO conspiracy elements analysis',
        'March 2016 incident evidence review',
        'Discussion of pattern vs individual acts',
        'Debate on enterprise structure proof'
      ],
      evidence_requests: [
        'All March 2016 related exhibits',
        'RICO instruction summary',
        'Enterprise structure organizational chart'
      ],
      status: 'completed',
      notes: 'Jury focusing intensively on RICO elements. Detailed legal standard discussions indicate thorough deliberation.'
    },
    {
      id: 'session-4',
      date: '2024-12-03',
      start_time: '14:00',
      end_time: '18:00',
      duration_minutes: 240,
      session_type: 'continued',
      jury_questions: [
        {
          id: 'q-4-1',
          timestamp: '15:45',
          question: 'What are the specific elements we must find for the sex trafficking charges?',
          category: 'legal_instruction',
          court_response: 'Court re-read sex trafficking elements and defined force, fraud, and coercion.',
          impact: 'high'
        }
      ],
      key_discussions: [
        'Sex trafficking charges element-by-element analysis',
        'Force, fraud, and coercion definitions and applications',
        'Victim testimony credibility assessment',
        'Interstate commerce nexus discussion'
      ],
      evidence_requests: [
        'Sex trafficking jury instructions',
        'Interstate travel evidence',
        'Victim impact statements'
      ],
      status: 'completed',
      notes: 'Extended session focused on sex trafficking charges. Jury requesting detailed instruction review suggests careful consideration.'
    },
    {
      id: 'session-5',
      date: '2024-12-04',
      start_time: '09:00',
      end_time: '11:30',
      duration_minutes: 150,
      session_type: 'final',
      jury_questions: [
        {
          id: 'q-5-1',
          timestamp: '09:30',
          question: 'How do we properly complete the verdict form for multiple counts?',
          category: 'verdict_form',
          court_response: 'Court provided detailed explanation of verdict form completion procedures.',
          impact: 'medium'
        }
      ],
      key_discussions: [
        'Final review of all charges and elements',
        'Verdict form completion procedures',
        'Final polling and consensus building',
        'Double-checking of decisions against evidence'
      ],
      evidence_requests: [
        'Blank verdict forms',
        'Charge summary sheet'
      ],
      status: 'completed',
      notes: 'Final deliberation session. Jury reached consensus and completed verdict forms. Total deliberation time: 990 minutes (16.5 hours).'
    }
  ], [])

  const filteredSessions = useMemo(() => {
    if (filterStatus === 'all') return deliberationData
    return deliberationData.filter(session => session.status === filterStatus)
  }, [deliberationData, filterStatus])

  const totalDeliberationTime = useMemo(() => {
    return deliberationData.reduce((total, session) => total + session.duration_minutes, 0)
  }, [deliberationData])

  const allJuryQuestions = useMemo(() => {
    return deliberationData.flatMap(session => session.jury_questions)
  }, [deliberationData])

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'initial': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'continued': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'final': return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      case 'clarification': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'suspended': return <AlertTriangle className="w-4 h-4 text-orange-400" />
      case 'interrupted': return <AlertTriangle className="w-4 h-4 text-red-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const exportData = () => {
    const csvContent = [
      ['Date', 'Session Type', 'Duration (minutes)', 'Questions Asked', 'Evidence Requests', 'Status'],
      ...deliberationData.map(session => [
        session.date,
        session.session_type,
        session.duration_minutes.toString(),
        session.jury_questions.length.toString(),
        session.evidence_requests.length.toString(),
        session.status
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-deliberation-tracker.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Jury Deliberation Tracker
          </h3>
          <p className="text-sm text-muted-foreground">
            Real-time tracking of jury deliberation sessions, questions, and progress - Day {trialDay.trialDayNumber}
          </p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg border border-accent/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export Tracker</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {[
              { value: 'timeline', label: 'Timeline', icon: Clock },
              { value: 'sessions', label: 'Sessions', icon: Users },
              { value: 'questions', label: 'Questions', icon: MessageSquare }
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
          <span className="text-sm text-muted-foreground">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 bg-muted/50 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Sessions</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Deliberation Overview */}
      <div className="glass-card p-6">
        <h4 className="font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Timer className="w-5 h-5" />
          <span>Deliberation Overview</span>
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{deliberationData.length}</div>
            <div className="text-sm text-muted-foreground">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{formatDuration(totalDeliberationTime)}</div>
            <div className="text-sm text-muted-foreground">Total Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{allJuryQuestions.length}</div>
            <div className="text-sm text-muted-foreground">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {deliberationData.reduce((sum, s) => sum + s.evidence_requests.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Evidence Requests</div>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-accent/30"></div>
          <div className="space-y-4">
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start space-x-4"
              >
                <div className="relative z-10 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-accent-foreground">{index + 1}</span>
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-foreground">
                      {session.date} • {session.start_time} - {session.end_time}
                    </h5>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSessionTypeColor(session.session_type)}`}>
                        {session.session_type.replace('_', ' ').toUpperCase()}
                      </span>
                      {getStatusIcon(session.status)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Duration: {formatDuration(session.duration_minutes)} • 
                    {session.jury_questions.length} questions • 
                    {session.evidence_requests.length} evidence requests
                  </div>
                  <button
                    onClick={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}
                    className="text-sm text-accent hover:text-accent/80 underline"
                  >
                    {selectedSession?.id === session.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Session Information */}
      {selectedSession && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-foreground">
              Session Details - {selectedSession.date}
            </h4>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded ${getSessionTypeColor(selectedSession.session_type)}`}>
                {selectedSession.session_type.replace('_', ' ').toUpperCase()}
              </span>
              {getStatusIcon(selectedSession.status)}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Session Info and Discussions */}
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-foreground mb-2">Session Information</h5>
                <div className="bg-muted/50 p-3 rounded-lg space-y-1 text-sm">
                  <div>Time: {selectedSession.start_time} - {selectedSession.end_time}</div>
                  <div>Duration: {formatDuration(selectedSession.duration_minutes)}</div>
                  <div>Type: {selectedSession.session_type.replace('_', ' ')}</div>
                  <div>Status: {selectedSession.status}</div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-foreground mb-2">Key Discussions</h5>
                <ul className="space-y-1">
                  {selectedSession.key_discussions.map((discussion, index) => (
                    <li key={index} className="text-sm text-foreground flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      {discussion}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-foreground mb-2">Evidence Requests</h5>
                <ul className="space-y-1">
                  {selectedSession.evidence_requests.map((request, index) => (
                    <li key={index} className="text-sm text-foreground flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      {request}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Jury Questions */}
            <div>
              <h5 className="font-semibold text-foreground mb-2">Jury Questions ({selectedSession.jury_questions.length})</h5>
              <div className="space-y-3">
                {selectedSession.jury_questions.map((question) => (
                  <div key={question.id} className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{question.timestamp}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded">
                          {question.category.replace('_', ' ')}
                        </span>
                        <span className={`text-xs font-medium ${getImpactColor(question.impact)}`}>
                          {question.impact} impact
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-2">{question.question}</p>
                    <p className="text-xs text-muted-foreground">{question.court_response}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedSession.notes && (
            <div className="mt-6 pt-4 border-t border-border">
              <h5 className="font-semibold text-foreground mb-2">Session Notes</h5>
              <p className="text-sm text-foreground italic bg-muted/30 p-3 rounded">
                {selectedSession.notes}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{deliberationData.length}</div>
          <div className="text-sm text-muted-foreground">Total Sessions</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {Math.round(totalDeliberationTime / 60 * 10) / 10}
          </div>
          <div className="text-sm text-muted-foreground">Hours</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{allJuryQuestions.length}</div>
          <div className="text-sm text-muted-foreground">Questions</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {allJuryQuestions.filter(q => q.impact === 'high').length}
          </div>
          <div className="text-sm text-muted-foreground">High Impact</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {deliberationData.reduce((sum, s) => sum + s.evidence_requests.length, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Evidence Requests</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-red-400">3</div>
          <div className="text-sm text-muted-foreground">Days</div>
        </div>
      </div>
    </div>
  )
}