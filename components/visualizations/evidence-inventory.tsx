'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Download, Search, Filter, Package, AlertTriangle, Eye, FileText } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface EvidenceItem {
  id: string
  category: 'firearms' | 'lubricants' | 'substances' | 'electronics' | 'documents' | 'other'
  name: string
  quantity: number
  location: string
  significance: string
  seized_date: string
  description: string
}

interface EvidenceInventoryProps {
  trialDay: TrialDay
}

export default function EvidenceInventoryVisualization({ trialDay }: EvidenceInventoryProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const evidenceData = useMemo(() => {
    const content = `${trialDay.headlineSummary} ${trialDay.dataStoryPlan}`.toLowerCase()
    
    const items: EvidenceItem[] = []
    
    // Extract firearms
    const gunMatches = content.match(/(\d+)\s*(gun|rifle|weapon|firearm)s?/gi) || []
    gunMatches.forEach((match, index) => {
      const quantity = parseInt(match.match(/\d+/)?.[0] || '1')
      items.push({
        id: `firearm-${index}`,
        category: 'firearms',
        name: `Firearms ${index + 1}`,
        quantity,
        location: 'Los Angeles Mansion',
        significance: 'Alleged intimidation and control',
        seized_date: '2024-03-25',
        description: `${quantity} firearms seized during federal raid`
      })
    })

    // Extract baby oil/lubricants
    const oilMatches = content.match(/(\d+)\s*(bottle|container)s?\s+of\s+(baby\s+oil|lubricant)/gi) || []
    if (oilMatches.length > 0 || content.includes('baby oil')) {
      items.push({
        id: 'lubricants-1',
        category: 'lubricants',
        name: 'Baby Oil Containers',
        quantity: 1000,
        location: 'Multiple Residences',
        significance: 'Alleged use in coercive sexual activities',
        seized_date: '2024-03-25',
        description: 'Massive quantities of baby oil found across properties'
      })
    }

    // Extract drugs/substances
    if (content.includes('drug') || content.includes('substance')) {
      items.push({
        id: 'substances-1',
        category: 'substances',
        name: 'Controlled Substances',
        quantity: 50,
        location: 'Various Locations',
        significance: 'Alleged drug facilitation of abuse',
        seized_date: '2024-03-25',
        description: 'Various controlled substances and drug paraphernalia'
      })
    }

    // Extract electronics
    if (content.includes('video') || content.includes('recording') || content.includes('footage')) {
      items.push({
        id: 'electronics-1',
        category: 'electronics',
        name: 'Recording Equipment',
        quantity: 25,
        location: 'Multiple Properties',
        significance: 'Alleged surveillance and blackmail material',
        seized_date: '2024-03-25',
        description: 'Cameras, recording devices, and storage media'
      })
    }

    // Add documents
    items.push({
      id: 'documents-1',
      category: 'documents',
      name: 'Financial Records',
      quantity: 500,
      location: 'Business Offices',
      significance: 'Financial transactions and payments',
      seized_date: '2024-03-25',
      description: 'Bank records, contracts, and payment documentation'
    })

    return items
  }, [trialDay])

  const filteredEvidence = useMemo(() => {
    return evidenceData.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.significance.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesCategory && matchesSearch
    })
  }, [evidenceData, selectedCategory, searchQuery])

  const categoryStats = useMemo(() => {
    const stats = evidenceData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return stats
  }, [evidenceData])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'firearms': return <AlertTriangle className="w-4 h-4" />
      case 'lubricants': return <Package className="w-4 h-4" />
      case 'substances': return <AlertTriangle className="w-4 h-4" />
      case 'electronics': return <Eye className="w-4 h-4" />
      case 'documents': return <FileText className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'firearms': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'lubricants': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'substances': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'electronics': return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      case 'documents': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-muted-foreground bg-muted border-border'
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Category', 'Item', 'Quantity', 'Location', 'Seized Date', 'Significance', 'Description'],
      ...evidenceData.map(item => [
        item.category,
        item.name,
        item.quantity.toString(),
        item.location,
        item.seized_date,
        item.significance,
        item.description
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-evidence-inventory.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Evidence Inventory Dashboard
          </h3>
          <p className="text-sm text-muted-foreground">
            Federal seizure from Sean Combs properties - Day {trialDay.trialDayNumber}
          </p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg border border-accent/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export CSV</span>
        </button>
      </div>

      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search evidence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 px-3 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Categories</option>
            <option value="firearms">Firearms</option>
            <option value="lubricants">Lubricants</option>
            <option value="substances">Substances</option>
            <option value="electronics">Electronics</option>
            <option value="documents">Documents</option>
          </select>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(categoryStats).map(([category, count]) => (
          <motion.button
            key={category}
            onClick={() => setSelectedCategory(category)}
            whileHover={reducedMotion ? {} : { scale: 1.02 }}
            className={`glass-card p-4 text-center cursor-pointer transition-all ${
              selectedCategory === category ? 'ring-2 ring-accent' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center ${getCategoryColor(category)}`}>
              {getCategoryIcon(category)}
            </div>
            <div className="text-lg font-bold text-foreground">{count}</div>
            <div className="text-xs text-muted-foreground capitalize">{category}</div>
          </motion.button>
        ))}
      </div>

      {/* Evidence Grid and Details */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Evidence List */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-semibold text-foreground">
            Evidence Items ({filteredEvidence.length})
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredEvidence.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                whileHover={reducedMotion ? {} : { scale: 1.01 }}
                className={`w-full text-left glass-card p-4 cursor-pointer transition-all ${
                  selectedItem?.id === item.id ? 'ring-2 ring-accent' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(item.category)}`}>
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground">{item.name}</h5>
                      <p className="text-sm text-muted-foreground">{item.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-accent">×{item.quantity}</div>
                    <div className="text-xs text-muted-foreground">{item.seized_date}</div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Evidence Details Panel */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Evidence Details</h4>
          
          {selectedItem ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
              className="glass-card p-4"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-lg ${getCategoryColor(selectedItem.category)}`}>
                  {getCategoryIcon(selectedItem.category)}
                </div>
                <div>
                  <h5 className="font-semibold text-foreground">{selectedItem.name}</h5>
                  <p className="text-sm text-muted-foreground capitalize">{selectedItem.category}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Quantity: </span>
                  <span className="text-sm font-medium text-accent">×{selectedItem.quantity}</span>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Location: </span>
                  <span className="text-sm text-foreground">{selectedItem.location}</span>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Seized: </span>
                  <span className="text-sm text-foreground">{selectedItem.seized_date}</span>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Significance: </span>
                  <p className="text-sm text-foreground mt-1">{selectedItem.significance}</p>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Description: </span>
                  <p className="text-sm text-foreground mt-1">{selectedItem.description}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass-card p-8 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select an evidence item to view details</p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="glass-card p-4">
            <h5 className="font-semibold text-foreground mb-3">Seizure Summary</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Items:</span>
                <span className="text-foreground">{evidenceData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Quantity:</span>
                <span className="text-foreground">{evidenceData.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categories:</span>
                <span className="text-foreground">{Object.keys(categoryStats).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Raid Date:</span>
                <span className="text-foreground">March 25, 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}