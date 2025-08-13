import React, { useState, useEffect } from 'react'
import { 
  ExclamationTriangleIcon, 
  ChatBubbleLeftRightIcon, 
  NewspaperIcon, 
  ChartBarIcon,
  ShareIcon,
  EyeIcon,
  CheckCircleIcon,
  XMarkIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { businessMonitoringService, type NewsAlert, type ReviewAlert, type TrendAlert, type SocialMentionAlert } from '../services/businessMonitoringService'

interface MonitoringDashboardProps {
  businessName: string
  onClose: () => void
}

interface AlertCounts {
  total: number
  unread: number
  critical: number
  last24h: number
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ businessName, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [newsAlerts, setNewsAlerts] = useState<NewsAlert[]>([])
  const [reviewAlerts, setReviewAlerts] = useState<ReviewAlert[]>([])
  const [trendAlerts, setTrendAlerts] = useState<TrendAlert[]>([])
  const [socialAlerts, setSocialAlerts] = useState<SocialMentionAlert[]>([])
  const [alertCounts, setAlertCounts] = useState<AlertCounts>({ total: 0, unread: 0, critical: 0, last24h: 0 })
  const [reputationScore, setReputationScore] = useState(75)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMonitoringData()
  }, [businessName])

  const loadMonitoringData = async () => {
    try {
      setLoading(true)

      // Load all alerts in parallel
      const [news, reviews, trends, social] = await Promise.all([
        businessMonitoringService.getNewsAlerts(businessName),
        businessMonitoringService.getReviewAlerts(businessName),
        businessMonitoringService.getTrendAlerts(businessName),
        businessMonitoringService.getSocialMentionAlerts(businessName)
      ])

      setNewsAlerts(news)
      setReviewAlerts(reviews)
      setTrendAlerts(trends)
      setSocialAlerts(social)

      // Calculate alert counts
      const allAlerts = [...news, ...reviews, ...trends, ...social]
      const unread = allAlerts.filter(alert => !alert.isRead).length
      const critical = allAlerts.filter(alert => alert.severity === 'critical').length
      const last24h = allAlerts.filter(alert => 
        new Date(alert.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length

      setAlertCounts({
        total: allAlerts.length,
        unread,
        critical,
        last24h
      })

      // Load reputation score
      const reputation = await businessMonitoringService.getReputationHistory(businessName, 1)
      if (reputation.length > 0) {
        setReputationScore(reputation[0].overallScore)
      }

    } catch (error) {
      console.error('Error loading monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (alertType: string, alertId: string) => {
    try {
      await businessMonitoringService.markAlertAsRead(alertType, alertId)
      await loadMonitoringData() // Refresh data
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading monitoring data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Business Monitoring</h2>
              <p className="text-gray-600 mt-1">{businessName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{reputationScore}</div>
                  <div className="text-sm text-gray-600">Reputation Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{alertCounts.unread}</div>
                  <div className="text-sm text-gray-600">Unread Alerts</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Alert Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <BellIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <div className="text-2xl font-bold text-blue-900">{alertCounts.total}</div>
                  <div className="text-sm text-blue-600">Total Alerts</div>
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <div className="text-2xl font-bold text-red-900">{alertCounts.critical}</div>
                  <div className="text-sm text-red-600">Critical</div>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <EyeIcon className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <div className="text-2xl font-bold text-orange-900">{alertCounts.unread}</div>
                  <div className="text-sm text-orange-600">Unread</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <div className="text-2xl font-bold text-green-900">{alertCounts.last24h}</div>
                  <div className="text-sm text-green-600">Last 24h</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'news', name: 'News', icon: NewspaperIcon, count: newsAlerts.length },
              { id: 'reviews', name: 'Reviews', icon: ChatBubbleLeftRightIcon, count: reviewAlerts.length },
              { id: 'trends', name: 'Trends', icon: ChartBarIcon, count: trendAlerts.length },
              { id: 'social', name: 'Social', icon: ShareIcon, count: socialAlerts.length },
              { id: 'settings', name: 'Settings', icon: Cog6ToothIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
                {tab.count !== undefined && (
                  <span className="bg-gray-100 text-gray-900 rounded-full px-2 py-1 text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Recent News */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Recent News</h3>
                  <div className="space-y-2">
                    {newsAlerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="bg-white rounded p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{alert.title}</h4>
                            <p className="text-gray-600 text-xs mt-1">{alert.source}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${getSentimentColor(alert.sentiment)}`}>
                            {alert.sentiment}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Reviews */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Reviews</h3>
                  <div className="space-y-2">
                    {reviewAlerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="bg-white rounded p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{alert.reviewerName}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-xs ${
                                      i < alert.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 text-xs mt-1 line-clamp-2">{alert.reviewText}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reputation Chart Placeholder */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Reputation Trend</h3>
                <div className="h-32 bg-white rounded flex items-center justify-center">
                  <p className="text-gray-500">Reputation chart visualization</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-4">
              {newsAlerts.map((alert) => (
                <div key={alert.id} className={`border rounded-lg p-4 ${alert.isRead ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className={`text-sm font-medium ${getSentimentColor(alert.sentiment)}`}>
                          {alert.sentiment}
                        </span>
                        <span className="text-sm text-gray-500">{formatDate(alert.createdAt)}</span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">{alert.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{alert.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{alert.source}</span>
                        {alert.url && (
                          <a href={alert.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Read more
                          </a>
                        )}
                      </div>
                    </div>
                    {!alert.isRead && (
                      <button
                        onClick={() => markAsRead('news', alert.id)}
                        className="text-gray-400 hover:text-gray-600 ml-4"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {newsAlerts.length === 0 && (
                <div className="text-center py-8">
                  <NewspaperIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No news alerts found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviewAlerts.map((alert) => (
                <div key={alert.id} className={`border rounded-lg p-4 ${alert.isRead ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < alert.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(alert.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">{alert.reviewerName}</span>
                        <span className="text-sm text-gray-500">on {alert.platform}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{alert.reviewText}</p>
                      {alert.reviewUrl && (
                        <a href={alert.reviewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                          View on {alert.platform}
                        </a>
                      )}
                    </div>
                    {!alert.isRead && (
                      <button
                        onClick={() => markAsRead('review', alert.id)}
                        className="text-gray-400 hover:text-gray-600 ml-4"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {reviewAlerts.length === 0 && (
                <div className="text-center py-8">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No review alerts found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-4">
              {trendAlerts.map((alert) => (
                <div key={alert.id} className={`border rounded-lg p-4 ${alert.isRead ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-sm text-gray-500">{formatDate(alert.createdAt)}</span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">"{alert.keyword}" is {alert.trendType}</h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Current Volume:</span>
                          <div className="font-medium">{alert.searchVolume.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Previous Volume:</span>
                          <div className="font-medium">{alert.previousVolume.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Change:</span>
                          <div className={`font-medium ${alert.percentageChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {alert.percentageChange > 0 ? '+' : ''}{alert.percentageChange.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      {alert.relatedQueries && alert.relatedQueries.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm text-gray-500">Related queries:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {alert.relatedQueries.slice(0, 5).map((query, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {query}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {!alert.isRead && (
                      <button
                        onClick={() => markAsRead('trend', alert.id)}
                        className="text-gray-400 hover:text-gray-600 ml-4"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {trendAlerts.length === 0 && (
                <div className="text-center py-8">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No trend alerts found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-4">
              {socialAlerts.map((alert) => (
                <div key={alert.id} className={`border rounded-lg p-4 ${alert.isRead ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-sm text-gray-500">{alert.platform}</span>
                        <span className="text-sm text-gray-500">{formatDate(alert.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">@{alert.authorUsername}</span>
                        <span className="text-sm text-gray-500">({alert.authorFollowers?.toLocaleString()} followers)</span>
                        <span className={`text-sm font-medium ${getSentimentColor(alert.sentiment)}`}>
                          {alert.sentiment}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{alert.mentionText}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>♥️ {alert.likes}</span>
                        <span>🔄 {alert.shares}</span>
                        <span>💬 {alert.comments}</span>
                        {alert.postUrl && (
                          <a href={alert.postUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View post
                          </a>
                        )}
                      </div>
                    </div>
                    {!alert.isRead && (
                      <button
                        onClick={() => markAsRead('social', alert.id)}
                        className="text-gray-400 hover:text-gray-600 ml-4"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {socialAlerts.length === 0 && (
                <div className="text-center py-8">
                  <ShareIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No social media alerts found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Settings</h3>
                <p className="text-gray-600 mb-4">Configure when and how you receive alerts for {businessName}</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">News Alerts</label>
                      <p className="text-sm text-gray-600">Get notified when your business appears in news</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">Review Alerts</label>
                      <p className="text-sm text-gray-600">Get notified about new customer reviews</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">Trend Alerts</label>
                      <p className="text-sm text-gray-600">Get notified about search trend changes</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">Social Media Alerts</label>
                      <p className="text-sm text-gray-600">Get notified about social media mentions</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
