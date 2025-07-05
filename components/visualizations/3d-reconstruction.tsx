'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Download, Building, Users, AlertTriangle, Eye, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface SceneElement {
  id: string
  type: 'building' | 'balcony' | 'person' | 'safety_feature' | 'incident_marker'
  position: { x: number; y: number; z: number }
  size: { width: number; height: number; depth: number }
  label: string
  description: string
  safety_level: 'safe' | 'dangerous' | 'critical'
  testimony_reference: string
}

interface Reconstruction3DProps {
  trialDay: TrialDay
}

export default function Reconstruction3DVisualization({ trialDay }: Reconstruction3DProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedElement, setSelectedElement] = useState<SceneElement | null>(null)
  const [viewAngle, setViewAngle] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showLabels, setShowLabels] = useState(true)

  const sceneElements: SceneElement[] = useMemo(() => [
    // Building structure
    {
      id: 'main-building',
      type: 'building',
      position: { x: 400, y: 300, z: 0 },
      size: { width: 200, height: 400, depth: 150 },
      label: '17-Story Building',
      description: 'High-rise building where the alleged incident took place',
      safety_level: 'safe',
      testimony_reference: 'Building identified in Bryana Bongolan\'s testimony'
    },
    
    // Balcony - the critical location
    {
      id: 'incident-balcony',
      type: 'balcony',
      position: { x: 320, y: 140, z: 85 },
      size: { width: 80, height: 4, depth: 30 },
      label: '17th Floor Balcony',
      description: 'Balcony where Combs allegedly dangled Bryana over the edge',
      safety_level: 'critical',
      testimony_reference: 'Primary location of alleged life-threatening incident'
    },
    
    // Safety railing
    {
      id: 'safety-railing',
      type: 'safety_feature',
      position: { x: 320, y: 138, z: 85 },
      size: { width: 80, height: 8, depth: 2 },
      label: 'Safety Railing',
      description: 'Protective barrier intended to prevent falls from balcony',
      safety_level: 'safe',
      testimony_reference: 'Barrier that was allegedly overcome during incident'
    },
    
    // Person positions
    {
      id: 'bryana-position',
      type: 'person',
      position: { x: 350, y: 136, z: 85 },
      size: { width: 8, height: 15, depth: 8 },
      label: 'Bryana Bongolan',
      description: 'Alleged victim\'s position during the incident',
      safety_level: 'critical',
      testimony_reference: 'Witness testified to being dangled over balcony edge'
    },
    
    {
      id: 'combs-position',
      type: 'person',
      position: { x: 340, y: 142, z: 85 },
      size: { width: 8, height: 15, depth: 8 },
      label: 'Sean Combs',
      description: 'Alleged perpetrator\'s position during incident',
      safety_level: 'dangerous',
      testimony_reference: 'Accused of threatening to drop victim from balcony'
    },
    
    // Incident marker showing danger zone
    {
      id: 'danger-zone',
      type: 'incident_marker',
      position: { x: 360, y: 120, z: 85 },
      size: { width: 40, height: 2, depth: 20 },
      label: 'Danger Zone',
      description: 'Area over which victim was allegedly suspended',
      safety_level: 'critical',
      testimony_reference: '17-story drop zone referenced in testimony'
    },
    
    // Additional floor for context
    {
      id: 'floor-16',
      type: 'balcony',
      position: { x: 320, y: 160, z: 75 },
      size: { width: 80, height: 4, depth: 30 },
      label: '16th Floor',
      description: 'Floor below incident location for spatial context',
      safety_level: 'safe',
      testimony_reference: 'Adjacent floor providing height context'
    },
    
    {
      id: 'floor-18',
      type: 'balcony',
      position: { x: 320, y: 120, z: 95 },
      size: { width: 80, height: 4, depth: 30 },
      label: '18th Floor',
      description: 'Floor above incident location',
      safety_level: 'safe',
      testimony_reference: 'Upper floor for architectural context'
    }
  ], [])

  // Convert 3D coordinates to 2D isometric projection
  const to2D = (x: number, y: number, z: number) => {
    const angle = (viewAngle * Math.PI) / 180
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    
    // Apply rotation
    const rotatedX = x * cos - z * sin
    const rotatedZ = x * sin + z * cos
    
    // Isometric projection
    const screenX = (rotatedX - rotatedZ) * 0.866 * zoomLevel
    const screenY = (y - (rotatedX + rotatedZ) * 0.5) * zoomLevel
    
    return { x: screenX + 400, y: screenY + 200 }
  }

  const getElementColor = (element: SceneElement) => {
    switch (element.type) {
      case 'building': return 'fill-gray-600 stroke-gray-400'
      case 'balcony': 
        return element.safety_level === 'critical' 
          ? 'fill-red-500/60 stroke-red-400' 
          : 'fill-gray-500 stroke-gray-300'
      case 'person':
        return element.safety_level === 'critical'
          ? 'fill-red-400 stroke-red-300'
          : 'fill-blue-400 stroke-blue-300'
      case 'safety_feature': return 'fill-green-500/60 stroke-green-400'
      case 'incident_marker': return 'fill-yellow-500/40 stroke-yellow-400'
      default: return 'fill-gray-500 stroke-gray-400'
    }
  }

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'safe': return 'text-green-400 bg-green-500/20'
      case 'dangerous': return 'text-orange-400 bg-orange-500/20'
      case 'critical': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Element', 'Type', 'Description', 'Safety Level', 'Testimony Reference'],
      ...sceneElements.map(element => [
        element.label,
        element.type,
        element.description,
        element.safety_level,
        element.testimony_reference
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-3d-reconstruction.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            3D Environmental Reconstruction
          </h3>
          <p className="text-sm text-muted-foreground">
            17th-floor balcony incident simulation - Day {trialDay.trialDayNumber}
          </p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg border border-accent/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export Scene</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <button
            onClick={() => setViewAngle(prev => prev - 45)}
            className="p-2 bg-muted/50 hover:bg-muted rounded border border-border"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-sm text-foreground">{viewAngle}°</span>
          <button
            onClick={() => setViewAngle(prev => prev + 45)}
            className="p-2 bg-muted/50 hover:bg-muted rounded border border-border"
          >
            <RotateCcw className="w-4 h-4 rotate-180" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Zoom:</span>
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.2))}
            className="p-2 bg-muted/50 hover:bg-muted rounded border border-border"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-foreground">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.2))}
            className="p-2 bg-muted/50 hover:bg-muted rounded border border-border"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="show-labels"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
            className="rounded border-border"
          />
          <label htmlFor="show-labels" className="text-sm text-muted-foreground">
            Show Labels
          </label>
        </div>
      </div>

      {/* 3D Scene */}
      <div className="glass-card p-6">
        <div className="relative w-full h-[500px] bg-gradient-to-b from-sky-200/20 to-gray-800/20 rounded-lg overflow-hidden">
          <svg viewBox="0 0 800 400" className="w-full h-full">
            {/* Ground/Base reference */}
            <rect
              x="100" y="350" width="600" height="50"
              className="fill-gray-700/40 stroke-gray-600"
              strokeWidth="1"
            />
            
            {/* Render scene elements */}
            {sceneElements.map((element) => {
              const pos2D = to2D(element.position.x, element.position.y, element.position.z)
              const size2D = {
                width: element.size.width * zoomLevel,
                height: element.size.height * zoomLevel
              }
              
              const isSelected = selectedElement?.id === element.id
              
              if (element.type === 'building') {
                // Render building as multiple rectangles for 3D effect
                return (
                  <g key={element.id}>
                    {/* Main face */}
                    <rect
                      x={pos2D.x - size2D.width/2}
                      y={pos2D.y - size2D.height}
                      width={size2D.width}
                      height={size2D.height}
                      className={`${getElementColor(element)} cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-accent' : ''
                      }`}
                      onClick={() => setSelectedElement(element)}
                      strokeWidth="2"
                    />
                    
                    {/* Side face for 3D effect */}
                    <polygon
                      points={`${pos2D.x + size2D.width/2},${pos2D.y - size2D.height} ${pos2D.x + size2D.width/2 + 30},${pos2D.y - size2D.height - 20} ${pos2D.x + size2D.width/2 + 30},${pos2D.y - 20} ${pos2D.x + size2D.width/2},${pos2D.y}`}
                      className="fill-gray-500/80 stroke-gray-400"
                      strokeWidth="1"
                    />
                    
                    {/* Top face */}
                    <polygon
                      points={`${pos2D.x - size2D.width/2},${pos2D.y - size2D.height} ${pos2D.x + size2D.width/2},${pos2D.y - size2D.height} ${pos2D.x + size2D.width/2 + 30},${pos2D.y - size2D.height - 20} ${pos2D.x - size2D.width/2 + 30},${pos2D.y - size2D.height - 20}`}
                      className="fill-gray-400/60 stroke-gray-300"
                      strokeWidth="1"
                    />
                  </g>
                )
              }
              
              if (element.type === 'person') {
                return (
                  <g key={element.id}>
                    <circle
                      cx={pos2D.x}
                      cy={pos2D.y - size2D.height + 5}
                      r="5"
                      className={`${getElementColor(element)} cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-accent' : ''
                      }`}
                      onClick={() => setSelectedElement(element)}
                      strokeWidth="2"
                    />
                    <rect
                      x={pos2D.x - 4}
                      y={pos2D.y - size2D.height + 10}
                      width="8"
                      height={size2D.height - 10}
                      className={getElementColor(element)}
                      onClick={() => setSelectedElement(element)}
                      strokeWidth="1"
                    />
                  </g>
                )
              }
              
              // Default rectangular rendering for other elements
              return (
                <g key={element.id}>
                  <rect
                    x={pos2D.x - size2D.width/2}
                    y={pos2D.y - size2D.height}
                    width={size2D.width}
                    height={size2D.height}
                    className={`${getElementColor(element)} cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-accent' : ''
                    }`}
                    onClick={() => setSelectedElement(element)}
                    strokeWidth="2"
                  />
                  
                  {/* Label */}
                  {showLabels && (
                    <text
                      x={pos2D.x}
                      y={pos2D.y - size2D.height - 5}
                      textAnchor="middle"
                      className="text-xs font-medium fill-foreground pointer-events-none"
                    >
                      {element.label}
                    </text>
                  )}
                </g>
              )
            })}
            
            {/* Danger visualization - drop zone */}
            <defs>
              <pattern id="dangerPattern" patternUnits="userSpaceOnUse" width="4" height="4">
                <rect width="4" height="4" className="fill-red-500/20"/>
                <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" className="stroke-red-400" strokeWidth="0.5"/>
              </pattern>
            </defs>
            
            <rect
              x="300" y="250" width="120" height="150"
              fill="url(#dangerPattern)"
              className="stroke-red-400"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            
            <text
              x="360" y="270"
              textAnchor="middle"
              className="text-xs font-bold fill-red-400"
            >
              17-STORY DROP
            </text>
          </svg>
        </div>
      </div>

      {/* Element Details and Analysis */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Selected Element Details */}
        <div className="lg:col-span-2">
          <h4 className="font-semibold text-foreground mb-4">Scene Element Analysis</h4>
          {selectedElement ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
              className="glass-card p-6"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className={`p-3 rounded-lg ${
                  selectedElement.type === 'building' ? 'text-gray-400 bg-gray-500/20 border-gray-500/30' :
                  selectedElement.type === 'person' ? 'text-blue-400 bg-blue-500/20 border-blue-500/30' :
                  selectedElement.type === 'balcony' ? 'text-purple-400 bg-purple-500/20 border-purple-500/30' :
                  selectedElement.type === 'safety_feature' ? 'text-green-400 bg-green-500/20 border-green-500/30' :
                  'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
                }`}>
                  {selectedElement.type === 'building' && <Building className="w-6 h-6" />}
                  {selectedElement.type === 'person' && <Users className="w-6 h-6" />}
                  {selectedElement.type === 'balcony' && <Building className="w-6 h-6" />}
                  {selectedElement.type === 'safety_feature' && <AlertTriangle className="w-6 h-6" />}
                  {selectedElement.type === 'incident_marker' && <Eye className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <h5 className="text-lg font-semibold text-foreground mb-1">{selectedElement.label}</h5>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="capitalize">{selectedElement.type.replace('_', ' ')}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSafetyColor(selectedElement.safety_level)}`}>
                      {selectedElement.safety_level.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Description:</div>
                  <p className="text-sm text-foreground">{selectedElement.description}</p>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Testimony Reference:</div>
                  <p className="text-sm text-foreground">{selectedElement.testimony_reference}</p>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">3D Coordinates:</div>
                  <div className="text-xs font-mono text-accent bg-muted/50 p-2 rounded">
                    X: {selectedElement.position.x}, Y: {selectedElement.position.y}, Z: {selectedElement.position.z}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Dimensions:</div>
                  <div className="text-xs font-mono text-accent bg-muted/50 p-2 rounded">
                    {selectedElement.size.width} × {selectedElement.size.height} × {selectedElement.size.depth}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass-card p-8 text-center">
              <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Click on elements in the 3D scene to view detailed analysis</p>
            </div>
          )}
        </div>

        {/* Scene Statistics and Legend */}
        <div className="space-y-6">
          {/* Safety Assessment */}
          <div className="glass-card p-4">
            <h5 className="font-semibold text-foreground mb-3">Safety Assessment</h5>
            <div className="space-y-2">
              {[
                { level: 'safe', count: sceneElements.filter(e => e.safety_level === 'safe').length, description: 'Normal safety conditions' },
                { level: 'dangerous', count: sceneElements.filter(e => e.safety_level === 'dangerous').length, description: 'Elevated risk factors' },
                { level: 'critical', count: sceneElements.filter(e => e.safety_level === 'critical').length, description: 'Life-threatening danger' }
              ].map((item) => (
                <div key={item.level} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded ${getSafetyColor(item.level)}`} />
                    <div>
                      <div className="text-sm font-medium text-foreground capitalize">{item.level}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scene Elements */}
          <div className="glass-card p-4">
            <h5 className="font-semibold text-foreground mb-3">Scene Elements</h5>
            <div className="space-y-2">
              {[
                { type: 'building', count: sceneElements.filter(e => e.type === 'building').length },
                { type: 'balcony', count: sceneElements.filter(e => e.type === 'balcony').length },
                { type: 'person', count: sceneElements.filter(e => e.type === 'person').length },
                { type: 'safety_feature', count: sceneElements.filter(e => e.type === 'safety_feature').length },
                { type: 'incident_marker', count: sceneElements.filter(e => e.type === 'incident_marker').length }
              ].map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm text-foreground capitalize">{item.type.replace('_', ' ')}</span>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Analysis */}
          <div className="glass-card p-4">
            <h5 className="font-semibold text-foreground mb-3">Incident Analysis</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Floor Level:</span>
                <span className="text-foreground">17th Floor</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Height:</span>
                <span className="text-foreground">~170 feet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balcony Size:</span>
                <span className="text-foreground">8×3 feet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Risk Assessment:</span>
                <span className="text-red-400">Life-threatening</span>
              </div>
            </div>
          </div>

          {/* Controls Help */}
          <div className="glass-card p-4">
            <h5 className="font-semibold text-foreground mb-3">3D Controls</h5>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div>• Use rotation buttons to change viewing angle</div>
              <div>• Zoom in/out to examine details</div>
              <div>• Toggle labels for clarity</div>
              <div>• Click elements for detailed analysis</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}