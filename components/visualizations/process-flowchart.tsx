'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Download, Play, ArrowRight, AlertTriangle, DollarSign, Phone, Clock } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface FlowchartNode {
  id: string
  label: string
  type: 'trigger' | 'action' | 'decision' | 'outcome' | 'process'
  position: { x: number; y: number }
  connections: string[]
  details: string
  timestamp?: string
  actor?: string
}

interface ProcessFlowchartProps {
  trialDay: TrialDay
}

export default function ProcessFlowchartVisualization({ trialDay }: ProcessFlowchartProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedNode, setSelectedNode] = useState<FlowchartNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const flowData = useMemo(() => {
    // Generate flowchart based on trial day
    if (trialDay.trialDayNumber === 7) {
      // Cassie's Mother - Extortion sequence
      return {
        title: "Anatomy of an Alleged Extortion",
        subtitle: "Regina Ventura's testimony on Sean Combs's demand for $20,000",
        nodes: [
          {
            id: 'trigger',
            label: 'Cassie Seeks Medical Help',
            type: 'trigger' as const,
            position: { x: 100, y: 50 },
            connections: ['discovery'],
            details: 'Cassie visits mother showing visible bruises and injuries from alleged assault',
            timestamp: 'Day after incident',
            actor: 'Cassie Ventura'
          },
          {
            id: 'discovery',
            label: 'Mother Discovers Injuries',
            type: 'process' as const,
            position: { x: 300, y: 50 },
            connections: ['confrontation'],
            details: 'Regina Ventura witnesses physical evidence of abuse including bruises and emotional distress',
            timestamp: 'Same day',
            actor: 'Regina Ventura'
          },
          {
            id: 'confrontation',
            label: 'Mother Threatens Action',
            type: 'decision' as const,
            position: { x: 500, y: 50 },
            connections: ['contact'],
            details: 'Regina threatens to call police or take other protective measures for her daughter',
            timestamp: 'Immediately after',
            actor: 'Regina Ventura'
          },
          {
            id: 'contact',
            label: 'Combs Contacts Mother',
            type: 'action' as const,
            position: { x: 700, y: 50 },
            connections: ['demand'],
            details: 'Sean Combs or representative makes direct contact with Regina to address the situation',
            timestamp: 'Within hours',
            actor: 'Sean Combs'
          },
          {
            id: 'demand',
            label: '$20,000 Demand',
            type: 'action' as const,
            position: { x: 500, y: 200 },
            connections: ['negotiation'],
            details: 'Combs demands $20,000 payment from Regina, allegedly to cover expenses or as compensation',
            timestamp: 'During contact',
            actor: 'Sean Combs'
          },
          {
            id: 'negotiation',
            label: 'Attempted Resolution',
            type: 'process' as const,
            position: { x: 300, y: 200 },
            connections: ['outcome'],
            details: 'Discussion of payment terms and conditions, with implied threats if demand not met',
            timestamp: 'Ongoing discussion',
            actor: 'Both parties'
          },
          {
            id: 'outcome',
            label: 'Silence Achieved',
            type: 'outcome' as const,
            position: { x: 100, y: 200 },
            connections: [],
            details: 'Incident is not reported to authorities, family remains silent about the abuse',
            timestamp: 'Long-term result',
            actor: 'Ventura family'
          }
        ],
        connections: [
          { from: 'trigger', to: 'discovery' },
          { from: 'discovery', to: 'confrontation' },
          { from: 'confrontation', to: 'contact' },
          { from: 'contact', to: 'demand' },
          { from: 'demand', to: 'negotiation' },
          { from: 'negotiation', to: 'outcome' }
        ]
      }
    } else if (trialDay.trialDayNumber === 17) {
      // Hotel Security Officer - Cover-up sequence
      return {
        title: "The Anatomy of an Alleged Cover-Up",
        subtitle: "Eddy Garcia's testimony on $100,000 payment to suppress assault footage",
        nodes: [
          {
            id: 'incident',
            label: 'Hotel Assault Occurs',
            type: 'trigger' as const,
            position: { x: 100, y: 50 },
            connections: ['recording'],
            details: 'Physical assault takes place in hotel corridor, captured by security cameras',
            timestamp: '2016-03-05',
            actor: 'Sean Combs'
          },
          {
            id: 'recording',
            label: 'Security Footage Captured',
            type: 'process' as const,
            position: { x: 300, y: 50 },
            connections: ['discovery'],
            details: 'Multiple security cameras record the assault from different angles',
            timestamp: 'Real-time during incident',
            actor: 'Hotel Security System'
          },
          {
            id: 'discovery',
            label: 'Footage Reviewed',
            type: 'action' as const,
            position: { x: 500, y: 50 },
            connections: ['assessment'],
            details: 'Security personnel review footage and identify the assault and perpetrator',
            timestamp: 'Hours after incident',
            actor: 'Eddy Garcia'
          },
          {
            id: 'assessment',
            label: 'Severity Assessment',
            type: 'decision' as const,
            position: { x: 700, y: 50 },
            connections: ['contact-combs'],
            details: 'Security team determines footage shows clear evidence of violent assault',
            timestamp: 'Same day',
            actor: 'Hotel Management'
          },
          {
            id: 'contact-combs',
            label: 'Combs Team Contacted',
            type: 'action' as const,
            position: { x: 700, y: 200 },
            connections: ['negotiation'],
            details: 'Hotel management or security reaches out to Combs representatives about the footage',
            timestamp: 'Day after incident',
            actor: 'Hotel Management'
          },
          {
            id: 'negotiation',
            label: 'Payment Negotiation',
            type: 'process' as const,
            position: { x: 500, y: 200 },
            connections: ['payment'],
            details: 'Discussions about suppressing footage, amount of payment, and terms of silence',
            timestamp: 'Following days',
            actor: 'Both parties'
          },
          {
            id: 'payment',
            label: '$100,000 Payment',
            type: 'action' as const,
            position: { x: 300, y: 200 },
            connections: ['suppression'],
            details: 'Combs or representatives provide $100,000 payment to hotel security',
            timestamp: 'Within week',
            actor: 'Sean Combs'
          },
          {
            id: 'suppression',
            label: 'Footage Suppressed',
            type: 'outcome' as const,
            position: { x: 100, y: 200 },
            connections: [],
            details: 'Security footage is not released to authorities or media, incident covered up',
            timestamp: 'Immediate and ongoing',
            actor: 'Hotel Security'
          }
        ],
        connections: [
          { from: 'incident', to: 'recording' },
          { from: 'recording', to: 'discovery' },
          { from: 'discovery', to: 'assessment' },
          { from: 'assessment', to: 'contact-combs' },
          { from: 'contact-combs', to: 'negotiation' },
          { from: 'negotiation', to: 'payment' },
          { from: 'payment', to: 'suppression' }
        ]
      }
    } else {
      // Generic process flow
      return {
        title: "Process Flow Diagram",
        subtitle: "Sequence of events analysis",
        nodes: [
          {
            id: 'start',
            label: 'Initial Event',
            type: 'trigger' as const,
            position: { x: 100, y: 100 },
            connections: ['process1'],
            details: 'Starting point of the sequence',
            actor: 'Various',
            timestamp: undefined
          },
          {
            id: 'process1',
            label: 'Follow-up Action',
            type: 'process' as const,
            position: { x: 300, y: 100 },
            connections: ['decision'],
            details: 'Subsequent actions taken',
            actor: 'Various',
            timestamp: undefined
          },
          {
            id: 'decision',
            label: 'Decision Point',
            type: 'decision' as const,
            position: { x: 500, y: 100 },
            connections: ['outcome'],
            details: 'Critical decision moment',
            actor: 'Decision Maker',
            timestamp: undefined
          },
          {
            id: 'outcome',
            label: 'Final Result',
            type: 'outcome' as const,
            position: { x: 700, y: 100 },
            connections: [],
            details: 'End result of the process',
            actor: 'Various',
            timestamp: undefined
          }
        ],
        connections: [
          { from: 'start', to: 'process1' },
          { from: 'process1', to: 'decision' },
          { from: 'decision', to: 'outcome' }
        ]
      }
    }
  }, [trialDay.trialDayNumber])

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'trigger': return <Play className="w-4 h-4" />
      case 'action': return <ArrowRight className="w-4 h-4" />
      case 'decision': return <AlertTriangle className="w-4 h-4" />
      case 'outcome': return <Clock className="w-4 h-4" />
      case 'process': return <ArrowRight className="w-4 h-4" />
      default: return <ArrowRight className="w-4 h-4" />
    }
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'trigger': return 'bg-green-500/20 border-green-500 text-green-400'
      case 'action': return 'bg-blue-500/20 border-blue-500 text-blue-400'
      case 'decision': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
      case 'outcome': return 'bg-red-500/20 border-red-500 text-red-400'
      case 'process': return 'bg-purple-500/20 border-purple-500 text-purple-400'
      default: return 'bg-gray-500/20 border-gray-500 text-gray-400'
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Node', 'Type', 'Actor', 'Timestamp', 'Details'],
      ...flowData.nodes.map(node => [
        node.label,
        node.type,
        node.actor ?? '',
        node.timestamp ?? '',
        node.details
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-process-flow.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {flowData.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {flowData.subtitle} - Day {trialDay.trialDayNumber}
          </p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg border border-accent/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export Flow</span>
        </button>
      </div>

      {/* Process Flow Diagram */}
      <div className="glass-card p-6">
        <div className="relative w-full h-96 bg-slate-900/20 rounded-lg overflow-hidden">
          <svg viewBox="0 0 800 300" className="w-full h-full">
            {/* Render connections first */}
            {flowData.connections.map((conn, index) => {
              const fromNode = flowData.nodes.find(n => n.id === conn.from)
              const toNode = flowData.nodes.find(n => n.id === conn.to)
              
              if (!fromNode || !toNode) return null
              
              return (
                <line
                  key={index}
                  x1={fromNode.position.x + 50}
                  y1={fromNode.position.y + 25}
                  x2={toNode.position.x}
                  y2={toNode.position.y + 25}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-accent/50"
                  markerEnd="url(#arrowhead)"
                />
              )
            })}
            
            {/* Arrow marker definition */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="currentColor"
                  className="text-accent/50"
                />
              </marker>
            </defs>
            
            {/* Render nodes on top */}
            {flowData.nodes.map((node) => (
              <g key={node.id}>
                <motion.rect
                  x={node.position.x}
                  y={node.position.y}
                  width="100"
                  height="50"
                  rx="8"
                  className={`${getNodeColor(node.type)} cursor-pointer transition-all ${
                    selectedNode?.id === node.id ? 'ring-2 ring-accent' : ''
                  } ${hoveredNode === node.id ? 'brightness-110' : ''}`}
                  onClick={() => setSelectedNode(node)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  whileHover={reducedMotion ? {} : { scale: 1.05 }}
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="currentColor"
                />
                <text
                  x={node.position.x + 50}
                  y={node.position.y + 25}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-medium fill-current pointer-events-none"
                  onClick={() => setSelectedNode(node)}
                >
                  {node.label.split(' ').map((word, i) => (
                    <tspan key={i} x={node.position.x + 50} dy={i === 0 ? 0 : 12}>
                      {word}
                    </tspan>
                  ))}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Node Details and Legend */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Selected Node Details */}
        <div className="lg:col-span-2">
          <h4 className="font-semibold text-foreground mb-4">Step Details</h4>
          {selectedNode ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
              className="glass-card p-6"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className={`p-3 rounded-lg ${getNodeColor(selectedNode.type)}`}>
                  {getNodeIcon(selectedNode.type)}
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-foreground mb-1">{selectedNode.label}</h5>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="capitalize">{selectedNode.type}</span>
                    {selectedNode.actor && <span>Actor: {selectedNode.actor}</span>}
                    {selectedNode.timestamp && <span>Time: {selectedNode.timestamp}</span>}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Description: </span>
                  <p className="text-sm text-foreground mt-1">{selectedNode.details}</p>
                </div>
                
                {selectedNode.connections.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Leads to: </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedNode.connections.map(connId => {
                        const connectedNode = flowData.nodes.find(n => n.id === connId)
                        return connectedNode ? (
                          <button
                            key={connId}
                            onClick={() => setSelectedNode(connectedNode)}
                            className="text-xs px-2 py-1 bg-accent/20 hover:bg-accent/30 rounded border border-accent/30 transition-colors"
                          >
                            {connectedNode.label}
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
              <ArrowRight className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Click on a node in the flowchart to view details</p>
            </div>
          )}
        </div>

        {/* Legend and Process Statistics */}
        <div className="space-y-6">
          {/* Legend */}
          <div className="glass-card p-4">
            <h5 className="font-semibold text-foreground mb-3">Node Types</h5>
            <div className="space-y-2">
              {[
                { type: 'trigger', label: 'Trigger Event', description: 'Initial catalyst' },
                { type: 'process', label: 'Process', description: 'Ongoing action' },
                { type: 'action', label: 'Action', description: 'Specific action taken' },
                { type: 'decision', label: 'Decision', description: 'Critical choice point' },
                { type: 'outcome', label: 'Outcome', description: 'Final result' }
              ].map((item) => (
                <div key={item.type} className="flex items-center space-x-3">
                  <div className={`p-2 rounded ${getNodeColor(item.type)}`}>
                    {getNodeIcon(item.type)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Process Statistics */}
          <div className="glass-card p-4">
            <h5 className="font-semibold text-foreground mb-3">Process Statistics</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Steps:</span>
                <span className="text-foreground">{flowData.nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connections:</span>
                <span className="text-foreground">{flowData.connections.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Decision Points:</span>
                <span className="text-foreground">
                  {flowData.nodes.filter(n => n.type === 'decision').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Key Actors:</span>
                <span className="text-foreground">
                  {new Set(flowData.nodes.map(n => n.actor).filter(Boolean)).size}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Summary */}
          {trialDay.trialDayNumber === 17 && (
            <div className="glass-card p-4">
              <h5 className="font-semibold text-foreground mb-3">Financial Impact</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-foreground font-medium">$100,000</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Payment allegedly made to suppress hotel security footage
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}