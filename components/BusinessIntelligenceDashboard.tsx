import React, { useState, useEffect } from 'react';
import { 
  ArrowTrendingUpIcon, 
  UsersIcon, 
  EyeIcon, 
  CursorArrowRaysIcon,
  ChartBarIcon,
  PhotoIcon,
  GlobeAltIcon,
  ShareIcon,
  CurrencyDollarIcon,
  StarIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { comprehensiveApiService, ComprehensiveBusinessData } from '../services/comprehensiveApiService';
import { MonitoringDashboard } from './MonitoringDashboard';

interface BusinessIntelligenceDashboardProps {
  businessName?: string;
  domain?: string;
  onClose: () => void;
}

export const BusinessIntelligenceDashboard: React.FC<BusinessIntelligenceDashboardProps> = ({
  businessName = '',
  domain = '',
  onClose
}) => {
  const [data, setData] = useState<ComprehensiveBusinessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);
  const [showMonitoring, setShowMonitoring] = useState(false);

  useEffect(() => {
    if (businessName) {
      fetchBusinessIntelligence();
    }
  }, [businessName, domain]);

  const fetchBusinessIntelligence = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try to get cached data
      const cachedData = await comprehensiveApiService.getCachedBusinessData(businessName);
      
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        
        // Fetch fresh data in background
        comprehensiveApiService.fetchAllBusinessData(businessName, domain)
          .then(freshData => {
            setData(freshData);
          })
          .catch(console.error);
      } else {
        // Fetch fresh data
        const freshData = await comprehensiveApiService.fetchAllBusinessData(businessName, domain);
        setData(freshData);
      }
    } catch (err) {
      console.error('Error fetching business intelligence:', err);
      setError('Failed to fetch business intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'seo', name: 'SEO & Search', icon: ArrowTrendingUpIcon },
    { id: 'analytics', name: 'Analytics', icon: EyeIcon },
    { id: 'ads', name: 'Advertising', icon: CurrencyDollarIcon },
    { id: 'social', name: 'Social Media', icon: ShareIcon },
    { id: 'media', name: 'Media & Assets', icon: PhotoIcon },
    { id: 'competitors', name: 'Competitors', icon: StarIcon }
  ];

  if (loading && !data) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Gathering Business Intelligence
            </h3>
            <p className="text-sm text-gray-500">
              Fetching data from Google APIs, social media platforms, and other sources...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-2xl font-bold">Business Intelligence Dashboard</h2>
              <p className="text-blue-100 mt-1">
                {businessName} {domain && `• ${domain}`}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowMonitoring(true)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <BellIcon className="h-5 w-5" />
                <span>Real-time Monitoring</span>
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
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
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">
                <ChartBarIcon className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={fetchBusinessIntelligence}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab data={data} />}
              {activeTab === 'seo' && <SEOTab data={data} />}
              {activeTab === 'analytics' && <AnalyticsTab data={data} />}
              {activeTab === 'ads' && <AdsTab data={data} />}
              {activeTab === 'social' && <SocialTab data={data} />}
              {activeTab === 'media' && <MediaTab data={data} />}
              {activeTab === 'competitors' && <CompetitorsTab data={data} />}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Last updated: {data?.businessInfo.lastUpdated ? 
                new Date(data.businessInfo.lastUpdated).toLocaleString() : 'Never'}
            </p>
            <button
              onClick={fetchBusinessIntelligence}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Monitoring Dashboard Modal */}
      {showMonitoring && (
        <MonitoringDashboard
          businessName={businessName}
          onClose={() => setShowMonitoring(false)}
        />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ data: ComprehensiveBusinessData | null }> = ({ data }) => {
  if (!data) {
    return <div className="text-center py-8 text-gray-500">No data available</div>;
  }

  const metrics = [
    {
      name: 'Search Console Clicks',
      value: data.googleSearchConsole?.clicks?.toLocaleString() || 'N/A',
      icon: CursorArrowRaysIcon,
      color: 'text-blue-600'
    },
    {
      name: 'Analytics Sessions',
      value: data.googleAnalytics?.sessions?.toLocaleString() || 'N/A',
      icon: UsersIcon,
      color: 'text-green-600'
    },
    {
      name: 'Total Social Followers',
      value: calculateTotalFollowers(data.socialMedia),
      icon: ShareIcon,
      color: 'text-purple-600'
    },
    {
      name: 'Ad Spend',
      value: `$${data.googleAds?.campaigns?.reduce((sum, campaign) => sum + (campaign.cost || 0), 0)?.toFixed(2) || '0.00'}`,
      icon: CurrencyDollarIcon,
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white border rounded-lg p-6">
            <div className="flex items-center">
              <metric.icon className={`h-8 w-8 ${metric.color}`} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{metric.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Top Performing Content</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {data.googleSearchConsole?.topQueries?.slice(0, 3).map((query, index) => (
                <li key={index}>• {query.query} ({query.clicks} clicks)</li>
              )) || <li>No data available</li>}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Social Media Highlights</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {data.socialMedia?.facebook && (
                <li>• Facebook: {data.socialMedia.facebook.followers.toLocaleString()} followers</li>
              )}
              {data.socialMedia?.instagram && (
                <li>• Instagram: {data.socialMedia.instagram.followers.toLocaleString()} followers</li>
              )}
              {data.socialMedia?.twitter && (
                <li>• Twitter: {data.socialMedia.twitter.followers.toLocaleString()} followers</li>
              )}
              {!data.socialMedia && <li>No social media data available</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// SEO Tab Component
const SEOTab: React.FC<{ data: ComprehensiveBusinessData | null }> = ({ data }) => {
  if (!data?.googleSearchConsole) {
    return <div className="text-center py-8 text-gray-500">No Search Console data available</div>;
  }

  const { googleSearchConsole: seo } = data;

  return (
    <div className="space-y-6">
      {/* SEO Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Total Clicks" value={seo.clicks.toLocaleString()} />
        <MetricCard title="Total Impressions" value={seo.impressions.toLocaleString()} />
        <MetricCard title="Average CTR" value={`${(seo.ctr * 100).toFixed(2)}%`} />
        <MetricCard title="Average Position" value={seo.position.toFixed(1)} />
      </div>

      {/* Top Queries */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Queries</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Query
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impressions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CTR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {seo.topQueries.map((query, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {query.query}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {query.clicks.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {query.impressions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(query.ctr * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {query.position.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Performance */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance by Device</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DeviceCard
            device="Mobile"
            data={seo.devicePerformance.mobile}
          />
          <DeviceCard
            device="Desktop"
            data={seo.devicePerformance.desktop}
          />
          <DeviceCard
            device="Tablet"
            data={seo.devicePerformance.tablet}
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const MetricCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className="bg-white border rounded-lg p-6">
    <div className="text-sm font-medium text-gray-500">{title}</div>
    <div className="mt-2 text-3xl font-semibold text-gray-900">{value}</div>
  </div>
);

const DeviceCard: React.FC<{ device: string; data: { clicks: number; impressions: number; ctr: number } }> = ({ 
  device, 
  data 
}) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <h4 className="font-medium text-gray-900 mb-3">{device}</h4>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500">Clicks:</span>
        <span className="font-medium">{data.clicks.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Impressions:</span>
        <span className="font-medium">{data.impressions.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">CTR:</span>
        <span className="font-medium">{(data.ctr * 100).toFixed(2)}%</span>
      </div>
    </div>
  </div>
);

// Placeholder components for other tabs
const AnalyticsTab: React.FC<{ data: ComprehensiveBusinessData | null }> = ({ data }) => (
  <div className="text-center py-8 text-gray-500">Analytics data coming soon...</div>
);

const AdsTab: React.FC<{ data: ComprehensiveBusinessData | null }> = ({ data }) => (
  <div className="text-center py-8 text-gray-500">Google Ads data coming soon...</div>
);

const SocialTab: React.FC<{ data: ComprehensiveBusinessData | null }> = ({ data }) => (
  <div className="text-center py-8 text-gray-500">Social media data coming soon...</div>
);

const MediaTab: React.FC<{ data: ComprehensiveBusinessData | null }> = ({ data }) => (
  <div className="text-center py-8 text-gray-500">Media assets coming soon...</div>
);

const CompetitorsTab: React.FC<{ data: ComprehensiveBusinessData | null }> = ({ data }) => (
  <div className="text-center py-8 text-gray-500">Competitor analysis coming soon...</div>
);

// Helper function
const calculateTotalFollowers = (socialMedia: any): string => {
  if (!socialMedia) return 'N/A';
  
  let total = 0;
  if (socialMedia.facebook?.followers) total += socialMedia.facebook.followers;
  if (socialMedia.instagram?.followers) total += socialMedia.instagram.followers;
  if (socialMedia.twitter?.followers) total += socialMedia.twitter.followers;
  if (socialMedia.linkedin?.followers) total += socialMedia.linkedin.followers;
  
  return total > 0 ? total.toLocaleString() : 'N/A';
};
