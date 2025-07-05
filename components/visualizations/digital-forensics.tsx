'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Download, Monitor, Smartphone, Camera, HardDrive, Clock, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface ForensicEvidence {
  id: string
  device_type: 'computer' | 'phone' | 'camera' | 'storage' | 'server'
  device_name: string
  timestamp: string
  evidence_type: 'metadata' | 'deleted_files' | 'communication' | 'media' | 'financial'
  description: string
  chain_of_custody: string[]
  verification_status: 'verified' | 'pending' | 'failed'
  hash_value: string
  file_path: string
  significance: 'critical' | 'high' | 'medium' | 'low'
  extracted_data: string
}

interface DigitalForensicsProps {
  trialDay: TrialDay
}

export default function DigitalForensicsVisualization({ trialDay }: DigitalForensicsProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedEvidence, setSelectedEvidence] = useState<ForensicEvidence | null>(null)
  const [filterDevice, setFilterDevice] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [timelineView, setTimelineView] = useState<'chronological' | 'device' | 'type'>('chronological')

  const forensicData: ForensicEvidence[] = useMemo(() => [
    {
      id: 'phone-metadata-1',
      device_type: 'phone',
      device_name: 'iPhone 12 Pro (Combs)',
      timestamp: '2024-03-25T09:15:00Z',
      evidence_type: 'metadata',
      description: 'Location data showing device at InterContinental Hotel during 2016 incident timeframe',
      chain_of_custody: ['FBI Agent Johnson', 'Digital Forensics Lab', 'Evidence Room 3A'],
      verification_status: 'verified',
      hash_value: 'SHA256:a1b2c3d4e5f6...',
      file_path: '/evidence/devices/phone_001/location_data.json',
      significance: 'critical',
      extracted_data: 'GPS coordinates: 40.7614, -73.9776 (InterContinental Hotel) at 2016-03-05 23:42:15'
    },
    {
      id: 'security-footage-1',
      device_type: 'camera',
      device_name: 'Hotel Security System DVR',
      timestamp: '2016-03-05T23:40:00Z',
      evidence_type: 'media',
      description: 'Original unedited security footage from hotel corridor cameras',
      chain_of_custody: ['Hotel Security', 'NYPD Detective Smith', 'FBI Digital Unit'],
      verification_status: 'verified',
      hash_value: 'SHA256:f7e8d9c0b1a2...',
      file_path: '/evidence/video/hotel_security_2016_03_05.mp4',
      significance: 'critical',
      extracted_data: 'Video shows physical altercation lasting 3 minutes 47 seconds'
    },
    {
      id: 'text-messages-1',
      device_type: 'phone',
      device_name: 'iPhone 11 (Ventura)',
      timestamp: '2018-09-12T14:30:00Z',
      evidence_type: 'communication',
      description: 'Text message thread between Combs and Ventura following alleged assault',
      chain_of_custody: ['Victim Advocate', 'NYPD Cyber Crimes', 'Federal Prosecutor'],
      verification_status: 'verified',
      hash_value: 'SHA256:c4d5e6f7a8b9...',
      file_path: '/evidence/communications/sms_thread_001.xml',
      significance: 'high',
      extracted_data: '47 messages showing pattern of manipulation and threats'
    },
    {
      id: 'financial-records-1',
      device_type: 'computer',
      device_name: 'Business Laptop (Bad Boy Records)',
      timestamp: '2020-01-15T10:22:00Z',
      evidence_type: 'financial',
      description: 'Bank transfer records and payment authorizations to alleged victims',
      chain_of_custody: ['IRS Investigator', 'Financial Crimes Unit', 'Trial Evidence Room'],
      verification_status: 'verified',
      hash_value: 'SHA256:b9a8c7d6e5f4...',
      file_path: '/evidence/financial/bank_transfers_2018_2020.xlsx',
      significance: 'high',
      extracted_data: '$2.3M in payments to 12 different individuals over 24 months'
    },
    {
      id: 'deleted-files-1',
      device_type: 'computer',
      device_name: 'Personal MacBook Pro (Combs)',
      timestamp: '2024-03-26T15:45:00Z',
      evidence_type: 'deleted_files',
      description: 'Recovered deleted files containing witness contact information and payments',
      chain_of_custody: ['FBI Cyber Division', 'Digital Recovery Specialist', 'Lead Prosecutor'],
      verification_status: 'pending',
      hash_value: 'SHA256:e3f2d1c0b9a8...',
      file_path: '/evidence/recovered/deleted_contacts_payments.db',
      significance: 'medium',
      extracted_data: 'Contact list with 156 entries marked as "silenced" or "paid"'
    },
    {
      id: 'cloud-storage-1',
      device_type: 'server',
      device_name: 'iCloud Account (Combs)',
      timestamp: '2019-07-22T08:30:00Z',
      evidence_type: 'media',
      description: 'Cloud-stored videos allegedly showing coercive sexual encounters',
      chain_of_custody: ['Apple Legal Compliance', 'FBI Digital Evidence Team', 'Court Security'],
      verification_status: 'verified',
      hash_value: 'SHA256:d7c6b5a4f3e2...',
      file_path: '/evidence/cloud/icloud_videos_2018_2020/',
      significance: 'critical',
      extracted_data: '47 video files totaling 23.4 GB showing alleged criminal activity'
    },
    {
      id: 'network-logs-1',
      device_type: 'server',
      device_name: 'Hotel WiFi Network Logs',
      timestamp: '2016-03-05T20:00:00Z',
      evidence_type: 'metadata',
      description: 'Network access logs showing device connections during incident timeframe',
      chain_of_custody: ['Hotel IT Manager', 'FBI Cyber Crimes', 'Digital Evidence Lab'],
      verification_status: 'verified',
      hash_value: 'SHA256:a8b7c6d5e4f3...',
      file_path: '/evidence/network/hotel_wifi_logs_2016_03_05.log',
      significance: 'medium',
      extracted_data: 'Device MAC addresses and connection times corroborate physical presence'
    },
    {
      id: 'social-media-1',
      device_type: 'phone',
      device_name: 'Instagram App Data',
      timestamp: '2018-12-31T23:59:00Z',
      evidence_type: 'communication',
      description: 'Direct messages and deleted posts related to alleged incidents',
      chain_of_custody: ['Meta Legal Team', 'Federal Subpoena Response', 'Prosecution Team'],
      verification_status: 'verified',
      hash_value: 'SHA256:f4e3d2c1b0a9...',
      file_path: '/evidence/social/instagram_dm_archive.json',
      significance: 'medium',
      extracted_data: '234 direct messages and 12 deleted posts containing threats and manipulation'
    }
  ], [])

  const filteredData = useMemo(() => {
    return forensicData.filter(item => {
      const deviceMatch = filterDevice === 'all' || item.device_type === filterDevice
      const typeMatch = filterType === 'all' || item.evidence_type === filterType
      return deviceMatch && typeMatch
    })
  }, [forensicData, filterDevice, filterType])

  const timelineSortedData = useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    return sorted
  }, [filteredData])

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'computer': return <Monitor className="w-4 h-4" />
      case 'phone': return <Smartphone className="w-4 h-4" />
      case 'camera': return <Camera className="w-4 h-4" />
      case 'storage': return <HardDrive className="w-4 h-4" />
      case 'server': return <Monitor className="w-4 h-4" />
      default: return <HardDrive className="w-4 h-4" />
    }
  }

  const getDeviceColor = (deviceType: string) => {
    switch (deviceType) {
      case 'computer': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'phone': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'camera': return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      case 'storage': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'server': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
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

  const exportData = () => {
    const csvContent = [
      ['Device', 'Type', 'Timestamp', 'Evidence Type', 'Description', 'Status', 'Hash', 'Significance'],
      ...forensicData.map(item => [
        item.device_name,
        item.device_type,
        item.timestamp,
        item.evidence_type,
        item.description,
        item.verification_status,
        item.hash_value,
        item.significance
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-digital-forensics.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Digital Forensics Timeline
          </h3>
          <p className="text-sm text-muted-foreground">
            Technological evidence analysis and chain of custody - Day {trialDay.trialDayNumber}
          </p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg border border-accent/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export Forensics</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Device:</span>
          <select
            value={filterDevice}
            onChange={(e) => setFilterDevice(e.target.value)}
            className="px-3 py-1 bg-muted/50 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Devices</option>
            <option value="computer">Computers</option>
            <option value="phone">Phones</option>
            <option value="camera">Cameras</option>
            <option value="storage">Storage</option>
            <option value="server">Servers</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Evidence:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1 bg-muted/50 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Types</option>
            <option value="metadata">Metadata</option>
            <option value="deleted_files">Deleted Files</option>
            <option value="communication">Communications</option>
            <option value="media">Media Files</option>
            <option value="financial">Financial</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {[
              { value: 'chronological', label: 'Timeline' },
              { value: 'device', label: 'By Device' },
              { value: 'type', label: 'By Type' }
            ].map((view) => (
              <button
                key={view.value}
                onClick={() => setTimelineView(view.value as any)}
                className={`px-3 py-1 text-sm transition-colors ${
                  timelineView === view.value
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-background hover:bg-muted text-muted-foreground'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{forensicData.length}</div>
          <div className="text-sm text-muted-foreground">Evidence Items</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {forensicData.filter(item => item.verification_status === 'verified').length}
          </div>
          <div className="text-sm text-muted-foreground">Verified</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {forensicData.filter(item => item.significance === 'critical').length}
          </div>
          <div className="text-sm text-muted-foreground">Critical</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {new Set(forensicData.map(item => item.device_type)).size}
          </div>
          <div className="text-sm text-muted-foreground">Device Types</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {new Set(forensicData.map(item => item.evidence_type)).size}
          </div>
          <div className="text-sm text-muted-foreground">Evidence Types</div>
        </div>
      </div>

      {/* Timeline and Details */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <h4 className="font-semibold text-foreground mb-4">Forensic Evidence Timeline</h4>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {timelineSortedData.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => setSelectedEvidence(item)}
                whileHover={reducedMotion ? {} : { scale: 1.01 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`w-full text-left glass-card p-4 cursor-pointer transition-all ${
                  selectedEvidence?.id === item.id ? 'ring-2 ring-accent' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getDeviceColor(item.device_type)}`}>
                      {getDeviceIcon(item.device_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-foreground">{item.device_name}</h5>
                      <p className="text-sm text-muted-foreground">{item.evidence_type.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getVerificationIcon(item.verification_status)}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSignificanceColor(item.significance)}`}>
                      {item.significance.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-foreground mb-2">{item.description}</p>
                <p className="text-xs text-accent font-mono">{item.extracted_data}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Details Panel */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Evidence Details</h4>
          
          {selectedEvidence ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
              className="glass-card p-6"
            >
              <div className="flex items-start space-x-3 mb-4">
                <div className={`p-2 rounded-lg ${getDeviceColor(selectedEvidence.device_type)}`}>
                  {getDeviceIcon(selectedEvidence.device_type)}
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-foreground">{selectedEvidence.device_name}</h5>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedEvidence.device_type} • {selectedEvidence.evidence_type.replace('_', ' ')}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {getVerificationIcon(selectedEvidence.verification_status)}
                  <span className="text-xs text-muted-foreground">{selectedEvidence.verification_status}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Timestamp: </span>
                  <span className="text-sm font-mono text-foreground">
                    {new Date(selectedEvidence.timestamp).toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Description: </span>
                  <p className="text-sm text-foreground mt-1">{selectedEvidence.description}</p>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Extracted Data: </span>
                  <p className="text-sm text-accent font-mono mt-1 bg-muted/50 p-2 rounded">
                    {selectedEvidence.extracted_data}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">File Path: </span>
                  <p className="text-xs font-mono text-foreground mt-1 break-all">
                    {selectedEvidence.file_path}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Hash: </span>
                  <p className="text-xs font-mono text-foreground mt-1 break-all">
                    {selectedEvidence.hash_value}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Chain of Custody: </span>
                  <div className="mt-1 space-y-1">
                    {selectedEvidence.chain_of_custody.map((custodian, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-accent rounded-full" />
                        <span className="text-xs text-foreground">{custodian}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass-card p-8 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select evidence to view forensic details</p>
            </div>
          )}

          {/* Verification Status Summary */}
          <div className="glass-card p-4">
            <h5 className="font-semibold text-foreground mb-3">Verification Status</h5>
            <div className="space-y-2">
              {[
                { status: 'verified', count: forensicData.filter(item => item.verification_status === 'verified').length, icon: <CheckCircle className="w-4 h-4 text-green-400" /> },
                { status: 'pending', count: forensicData.filter(item => item.verification_status === 'pending').length, icon: <Clock className="w-4 h-4 text-yellow-400" /> },
                { status: 'failed', count: forensicData.filter(item => item.verification_status === 'failed').length, icon: <AlertTriangle className="w-4 h-4 text-red-400" /> }
              ].map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span className="text-sm text-foreground capitalize">{item.status}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}