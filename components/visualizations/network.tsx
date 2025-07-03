
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Users, DollarSign, Link, Info } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface NetworkVisualizationProps {
  trialDay: TrialDay
}

interface NetworkNode {
  id: string
  label: string
  type: 'person' | 'entity' | 'event' | 'financial'
  size: number
  x: number
  y: number
  connections: string[]
}

interface NetworkEdge {
  from: string
  to: string
  label: string
  type: 'financial' | 'relationship' | 'legal' | 'communication'
  weight: number
}

export default function NetworkVisualization({ trialDay }: NetworkVisualizationProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const nodes: NetworkNode[] = [
    {
      id: 'combs',
      label: 'Sean Combs',
      type: 'person',
      size: 60,
      x: 400,
      y: 200,
      connections: ['cassie', 'badboy', 'hotel', 'settlement1', 'settlement2']
    },
    {
      id: 'cassie',
      label: 'Cassie Ventura',
      type: 'person',
      size: 50,
      x: 200,
      y: 150,
      connections: ['combs', 'settlement1', 'settlement2']
    },
    {
      id: 'badboy',
      label: 'Bad Boy Records',
      type: 'entity',
      size: 40,
      x: 300,
      y: 300,
      connections: ['combs', 'settlement1']
    },
    {
      id: 'hotel',
      label: 'InterContinental Hotels',
      type: 'entity',
      size: 35,
      x: 500,
      y: 300,
      connections: ['combs', 'settlement2']
    },
    {
      id: 'settlement1',
      label: '$20M Civil Settlement',
      type: 'financial',
      size: 45,
      x: 250,
      y: 50,
      connections: ['combs', 'cassie', 'badboy']
    },
    {
      id: 'settlement2',
      label: '$10M Hotel Settlement',
      type: 'financial',
      size: 35,
      x: 550,
      y: 100,
      connections: ['combs', 'cassie', 'hotel']
    },
    {
      id: 'lawsuit',
      label: '2023 Civil Lawsuit',
      type: 'event',
      size: 30,
      x: 100,
      y: 250,
      connections: ['cassie', 'settlement1']
    }
  ]

  const edges: NetworkEdge[] = [
    {
      from: 'combs',
      to: 'cassie',
      label: 'Relationship (2007-2018)',
      type: 'relationship',
      weight: 100
    },
    {
      from: 'combs',
      to: 'settlement1',
      label: '$20M Payment',
      type: 'financial',
      weight: 80
    },
    {
      from: 'cassie',
      to: 'settlement2',
      label: '$10M Payment',
      type: 'financial',
      weight: 60
    },
    {
      from: 'combs',
      to: 'badboy',
      label: 'CEO/Owner',
      type: 'legal',
      weight: 90
    },
    {
      from: 'settlement1',
      to: 'badboy',
      label: 'Payment Source',
      type: 'financial',
      weight: 70
    },
    {
      from: 'hotel',
      to: 'settlement2',
      label: 'Liability Payment',
      type: 'financial',
      weight: 60
    }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  const getNodeColor = (type: string, isSelected: boolean, isHovered: boolean) => {
    let baseColor = ''
    switch (type) {
      case 'person': baseColor = 'bg-blue-500'
        break
      case 'entity': baseColor = 'bg-purple-500'
        break
      case 'event': baseColor = 'bg-green-500'
        break
      case 'financial': baseColor = 'bg-yellow-500'
        break
      default: baseColor = 'bg-muted'
    }
    
    if (isSelected) return baseColor + ' ring-4 ring-accent'
    if (isHovered) return baseColor + ' ring-2 ring-white/50'
    return baseColor
  }

  const getEdgeStyle = (edge: NetworkEdge, fromNode: NetworkNode, toNode: NetworkNode) => {
    const isConnectedToSelected = selectedNode && 
      (selectedNode.id === edge.from || selectedNode.id === edge.to)
    
    return {
      stroke: isConnectedToSelected ? '#f59e0b' : '#6b7280',
      strokeWidth: isConnectedToSelected ? 3 : Math.max(1, edge.weight / 50),
      opacity: isConnectedToSelected ? 1 : 0.6
    }
  }

  if (!mounted) {
    return <div className="h-96 bg-muted rounded-lg animate-pulse" />
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          The Ecosystem of Allegations and Settlements
        </h3>
        <p className="text-sm text-muted-foreground">
          Network visualization of financial flows and relationships in the case
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Network Visualization */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6">
            <div className="relative w-full h-96 bg-slate-900/20 rounded-lg overflow-hidden">
              <svg viewBox="0 0 600 400" className="w-full h-full">
                {/* Edges */}
                <g>
                  {edges.map((edge, index) => {
                    const fromNode = nodes.find(n => n.id === edge.from)
                    const toNode = nodes.find(n => n.id === edge.to)
                    if (!fromNode || !toNode) return null
                    
                    return (
                      <motion.line
                        key={`${edge.from}-${edge.to}`}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ 
                          duration: reducedMotion ? 0.01 : 1, 
                          delay: reducedMotion ? 0 : index * 0.2 
                        }}
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        {...getEdgeStyle(edge, fromNode, toNode)}
                        strokeDasharray={edge.type === 'financial' ? '5,5' : 'none'}
                      />
                    )
                  })}
                </g>

                {/* Nodes */}
                <g>
                  {nodes.map((node, index) => (
                    <motion.g
                      key={node.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        duration: reducedMotion ? 0.01 : 0.5, 
                        delay: reducedMotion ? 0 : index * 0.1 
                      }}
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size / 2}
                        className={`cursor-pointer transition-all ${getNodeColor(
                          node.type, 
                          selectedNode?.id === node.id,
                          hoveredNode === node.id
                        )}`}
                        onClick={() => setSelectedNode(node)}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
                      />
                      
                      {/* Node labels */}
                      <text
                        x={node.x}
                        y={node.y + node.size / 2 + 20}
                        textAnchor="middle"
                        className="text-xs font-medium fill-foreground pointer-events-none"
                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                      >
                        {node.label}
                      </text>
                    </motion.g>
                  ))}
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="space-y-4">
          {/* Node Types Legend */}
          <div className="glass-card p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-5 h-5 text-accent" />
              <h4 className="font-semibold text-foreground">Node Types</h4>
            </div>
            
            <div className="space-y-2">
              {[
                { type: 'person', color: 'bg-blue-500', label: 'People', count: 2 },
                { type: 'entity', color: 'bg-purple-500', label: 'Organizations', count: 2 },
                { type: 'financial', color: 'bg-yellow-500', label: 'Financial', count: 2 },
                { type: 'event', color: 'bg-green-500', label: 'Legal Events', count: 1 }
              ].map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Node Details */}
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
              className="glass-card p-4"
            >
              <div className="flex items-center space-x-2 mb-3">
                <Info className="w-5 h-5 text-accent" />
                <h4 className="font-semibold text-foreground">{selectedNode.label}</h4>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Type: </span>
                  <span className="text-foreground capitalize">{selectedNode.type}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Connections: </span>
                  <span className="text-foreground">{selectedNode.connections.length}</span>
                </div>
                
                <div className="pt-2 border-t border-border">
                  <h5 className="text-sm font-medium text-foreground mb-1">Connected To:</h5>
                  <div className="space-y-1">
                    {selectedNode.connections.map(connId => {
                      const connectedNode = nodes.find(n => n.id === connId)
                      return connectedNode ? (
                        <div key={connId} className="text-xs text-muted-foreground">
                          • {connectedNode.label}
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Financial Summary */}
          <div className="glass-card p-4">
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="w-5 h-5 text-accent" />
              <h4 className="font-semibold text-foreground">Financial Flow</h4>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Civil Settlement:</span>
                <span className="text-foreground font-medium">$20M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hotel Settlement:</span>
                <span className="text-foreground font-medium">$10M</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">Total Settlements:</span>
                <span className="text-accent font-bold">$30M</span>
              </div>
            </div>
          </div>

          {/* Network Statistics */}
          <div className="glass-card p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Link className="w-5 h-5 text-accent" />
              <h4 className="font-semibold text-foreground">Network Stats</h4>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Nodes:</span>
                <span className="text-foreground">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connections:</span>
                <span className="text-foreground">{edges.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Central Node:</span>
                <span className="text-foreground">Sean Combs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
