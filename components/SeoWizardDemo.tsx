import React, { useState } from 'react';
import EnhancedControlPanel from './EnhancedControlPanel';
import FloatingActionButton from './FloatingActionButton';
import { LocalBusinessData } from './GenerationWizard';

export function SeoWizardDemo() {
  const [showWizard, setShowWizard] = useState(false);
  const [seoMode, setSeoMode] = useState(true);
  const [businessProfile, setBusinessProfile] = useState<LocalBusinessData | null>(null);

  const handleGeneration = (data: any) => {
    console.log('Generated with data:', data);
    alert('SEO-optimized page generated! Check console for data.');
    setShowWizard(false);
  };

  const mockPageSections = [
    {
      id: 'hero',
      type: 'hero',
      title: 'Professional Plumbing Services',
      content: 'Emergency repairs, installations, and maintenance.'
    },
    {
      id: 'services',
      type: 'services',
      title: 'Our Services',
      content: 'Comprehensive plumbing solutions for homes and businesses.'
    },
    {
      id: 'about',
      type: 'about',
      title: 'About Our Company',
      content: 'Trusted local experts with 15+ years of experience.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Demo Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            SEO-First Page Generation Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Advanced wizard with local business optimization and SEO analysis
          </p>
          
          <div className="flex items-center justify-center space-x-4 mb-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={seoMode}
                onChange={(e) => setSeoMode(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable SEO Mode (6-step wizard)
              </span>
            </label>
          </div>

          <button
            onClick={() => setShowWizard(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition-colors"
          >
            Open {seoMode ? 'SEO' : 'Standard'} Generation Wizard
          </button>

          {/* Floating Button Demo */}
          <div className="mt-8 flex flex-col items-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Custom Floating Action Button
            </h3>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <FloatingActionButton
                  onClick={() => alert('Plus button clicked!')}
                  size="sm"
                  variant="default"
                  aria-label="Add new item"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Small Plus</p>
              </div>
              <div className="text-center">
                <FloatingActionButton
                  onClick={() => alert('Sparkles button clicked!')}
                  size="md"
                  variant="sparkles"
                  aria-label="Generate with AI"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Medium Sparkles</p>
              </div>
              <div className="text-center">
                <FloatingActionButton
                  onClick={() => alert('Settings button clicked!')}
                  size="lg"
                  variant="settings"
                  aria-label="Open settings"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Large Settings</p>
              </div>
              <div className="text-center">
                <FloatingActionButton
                  onClick={() => alert('Close button clicked!')}
                  size="md"
                  variant="close"
                  aria-label="Close panel"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Close</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Profile Display */}
        {businessProfile && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📋 Business Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Basic Info</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                  <li><strong>Business:</strong> {businessProfile.businessName}</li>
                  <li><strong>Type:</strong> {businessProfile.businessType}</li>
                  <li><strong>Location:</strong> {businessProfile.zipCode}</li>
                  <li><strong>Phone:</strong> {businessProfile.phone}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Services</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {businessProfile.primaryServices.map((service, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {businessProfile.uniqueSellingPoints.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Unique Selling Points</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {businessProfile.uniqueSellingPoints.map((usp, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                    >
                      {usp}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mock Page Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              🚀 Generated Page Preview
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Interactive demo of the enhanced control panel system
            </p>
          </div>

          <div className="relative">
            {/* Mock Page Content */}
            <div className="p-6 space-y-8">
              {mockPageSections.map((section) => (
                <div
                  key={section.id}
                  className="relative group"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {section.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {section.content}
                    </p>
                    {businessProfile && (
                      <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
                        SEO optimized for: {businessProfile.businessName} • {businessProfile.businessType} • {businessProfile.zipCode}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Control Panel */}
            <EnhancedControlPanel
              isEditMode={true}
              onEditModeChange={() => {}}
              onNewGeneration={() => setShowWizard(true)}
              seoMode={seoMode}
              businessData={businessProfile}
            />
          </div>
        </div>

        {/* Features List */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🎯 SEO Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Local business data collection</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Keyword strategy development</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Competitor analysis integration</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>AI-powered SEO audit dashboard</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Schema markup generation</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Content optimization recommendations</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ⚡ Enhanced Controls
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Floating control hub with organized menus</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Section-level editing with drag & drop</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Inline text editing with click-to-edit</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Smart color and background controls</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Real-time preview with live updates</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Wizard-guided content generation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {seoMode ? 'SEO-Optimized' : 'Standard'} Page Generation
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {seoMode ? '6-step wizard with local business optimization' : '4-step quick setup'}
                  </p>
                </div>
                <button
                  onClick={() => setShowWizard(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Close wizard"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Wizard Integration In Progress
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  The full wizard component will be rendered here with {seoMode ? 'SEO' : 'standard'} mode.
                </p>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <p>✅ Enhanced Control Panel - Complete</p>
                  <p>✅ SEO Optimization Service - Complete</p>
                  <p>✅ SEO Audit Dashboard - Complete</p>
                  <p>🔄 Generation Wizard Integration - In Progress</p>
                </div>
                <button
                  onClick={() => {
                    // Mock business data for demo
                    const mockBusiness: LocalBusinessData = {
                      businessName: 'Downtown Plumbing Pro',
                      businessType: 'Plumbing',
                      website: 'https://downtown-plumbing.com',
                      zipCode: '90210',
                      address: '123 Main St, Beverly Hills, CA',
                      phone: '(555) 123-4567',
                      email: 'info@downtown-plumbing.com',
                      serviceAreaZips: ['90210', '90211', '90212'],
                      brandTerms: ['Downtown Plumbing', 'Plumbing Pro'],
                      targetKeywords: ['emergency plumber', 'pipe repair', 'bathroom renovation'],
                      competitorUrls: ['https://competitor1.com', 'https://competitor2.com'],
                      primaryServices: ['Emergency Repairs', 'Pipe Installation', 'Drain Cleaning'],
                      uniqueSellingPoints: ['24/7 Emergency Service', 'Licensed & Insured', '15+ Years Experience']
                    };
                    setBusinessProfile(mockBusiness);
                    handleGeneration({ seoMode, businessData: mockBusiness });
                  }}
                  className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Generate Demo Page with SEO Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeoWizardDemo;
