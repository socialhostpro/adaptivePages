import React from 'react';
import { Button, Textarea } from '../shared';
import GlobeIcon from '../icons/GlobeIcon';
import type { LocalBusinessData } from './types';

interface Step1BasicInfoProps {
  prompt: string;
  setPrompt: (value: string) => void;
  enableSeoMode: boolean;
  businessSearchQuery: string;
  setBusinessSearchQuery: (value: string) => void;
  isSearchingBusiness: boolean;
  showBusinessResults: boolean;
  businessSearchResults: any[];
  businessData: LocalBusinessData;
  updateBusinessData: (data: Partial<LocalBusinessData>) => void;
  isAnalyzingWebsite: boolean;
  websiteAnalysisResults: any;
  handleBusinessSearch: () => void;
  handleSelectBusinessResult: (result: any) => void;
  analyzeWebsite: (url: string) => void;
}

export function Step1BasicInfo({
  prompt,
  setPrompt,
  enableSeoMode,
  businessSearchQuery,
  setBusinessSearchQuery,
  isSearchingBusiness,
  showBusinessResults,
  businessSearchResults,
  businessData,
  updateBusinessData,
  isAnalyzingWebsite,
  websiteAnalysisResults,
  handleBusinessSearch,
  handleSelectBusinessResult,
  analyzeWebsite
}: Step1BasicInfoProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          What do you want to create?
        </h3>
        <p className="text-gray-600 dark:text-slate-400">
          Describe your landing page in detail. The more specific you are, the better the AI can help you.
        </p>
      </div>

      {/* Business Search Section */}
      {enableSeoMode && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-semibold text-green-900 dark:text-green-300 mb-3 flex items-center">
            🔍 Auto-Lookup: Search for your business
          </h4>
          <p className="text-sm text-green-800 dark:text-green-300 mb-4">
            Enter your business name and area code, and we'll find all your business information automatically!
          </p>
          
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={businessSearchQuery}
                onChange={(e) => setBusinessSearchQuery(e.target.value)}
                placeholder="e.g., 'Smith Dental 415' or 'Pizza Palace downtown'"
                className="flex-1 px-4 py-3 border-2 border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleBusinessSearch()}
              />
              <Button
                onClick={handleBusinessSearch}
                disabled={isSearchingBusiness || !businessSearchQuery.trim()}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50"
              >
                {isSearchingBusiness ? 'Searching...' : 'Search'}
              </Button>
            </div>
            
            {/* Business Search Results */}
            {showBusinessResults && businessSearchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-green-900 dark:text-green-300">Found businesses:</h5>
                  <div className="flex items-center space-x-2">
                    {businessSearchResults[0]?.isReal ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        ✅ Real Data
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                        🧪 Demo Data
                      </span>
                    )}
                  </div>
                </div>
                {businessSearchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white dark:bg-slate-700 border border-green-200 dark:border-green-600 rounded-lg cursor-pointer hover:bg-green-50 dark:hover:bg-slate-600 transition-colors"
                    onClick={() => handleSelectBusinessResult(result)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h6 className="font-semibold text-gray-900 dark:text-white">{result.name}</h6>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{result.businessType}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{result.address}</p>
                        {result.phone && <p className="text-sm text-gray-500 dark:text-gray-400">{result.phone}</p>}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                          ⭐ {result.rating} ({result.reviewCount} reviews)
                        </div>
                        <Button
                          size="sm"
                          className="mt-2 bg-green-600 hover:bg-green-700 text-white"
                        >
                          Use This Business
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {showBusinessResults && businessSearchResults.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  No businesses found. Try a different search term or use the website URL option below.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Website Auto-Fill Section */}
      {enableSeoMode && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center">
            <GlobeIcon className="w-5 h-5 mr-2" />
            🚀 Quick Start: Do you have an existing website?
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
            Enter your website URL and we'll automatically analyze it to fill in all your business information!
          </p>
          
          <div className="relative">
            <input
              type="url"
              value={businessData.website}
              onChange={(e) => {
                const url = e.target.value;
                updateBusinessData({ website: url });
                
                // Auto-analyze when a valid URL is entered (debounced)
                if (url && url.startsWith('http') && url.includes('.') && url.length > 10) {
                  setTimeout(() => {
                    console.log('🕐 Debounced analysis triggered for:', url);
                    analyzeWebsite(url);
                  }, 1500);
                }
              }}
              onBlur={(e) => {
                // Also analyze on blur if we have a valid URL
                const url = e.target.value;
                if (url && url.startsWith('http') && url.includes('.') && url.length > 10) {
                  console.log('🎯 Blur analysis triggered for:', url);
                  analyzeWebsite(url);
                }
              }}
              onKeyDown={(e) => {
                // Trigger analysis on Enter key
                if (e.key === 'Enter') {
                  const url = e.currentTarget.value;
                  if (url && url.startsWith('http') && url.includes('.') && url.length > 10) {
                    console.log('⚡ Enter key analysis triggered for:', url);
                    analyzeWebsite(url);
                  }
                }
              }}
              placeholder="https://yourbusiness.com"
              className="w-full px-4 py-3 pr-12 border-2 border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            {businessData.website && (
              <Button
                type="button"
                onClick={() => analyzeWebsite(businessData.website)}
                disabled={isAnalyzingWebsite}
                variant="ghost"
                size="sm"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2"
                title="Analyze website to auto-fill business information"
              >
                {isAnalyzingWebsite ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <GlobeIcon className="w-5 h-5" />
                )}
              </Button>
            )}
          </div>
          
          {isAnalyzingWebsite && (
            <div className="mt-3 flex items-center text-sm text-blue-700 dark:text-blue-300">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              🔍 Analyzing website for business information, keywords, services, and content...
            </div>
          )}
          
          {websiteAnalysisResults && (
            <div className="mt-3 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-sm border border-green-300 dark:border-green-700">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  ✅ 
                </div>
                <div className="ml-2">
                  <div className="font-semibold text-green-800 dark:text-green-300 mb-2">
                    Website Analysis Complete!
                  </div>
                  {websiteAnalysisResults.comprehensive && (
                    <div className="space-y-1 text-green-700 dark:text-green-400">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>📊 Keywords: {websiteAnalysisResults.extractedData?.keywords || 0}</div>
                        <div>🛠️ Services: {websiteAnalysisResults.extractedData?.services || 0}</div>
                        <div>🏷️ Brand Terms: {websiteAnalysisResults.extractedData?.brandTerms || 0}</div>
                        <div>⭐ USPs: {websiteAnalysisResults.extractedData?.usps || 0}</div>
                      </div>
                      <div className="mt-2 text-xs text-green-600 dark:text-green-500">
                        Auto-filled business information, services, SEO keywords, and unique selling points from your website.
                      </div>
                    </div>
                  )}
                  {!websiteAnalysisResults.comprehensive && (
                    <div className="text-green-700 dark:text-green-400 text-xs">
                      Basic business information extracted and auto-filled.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            Don't have a website? No problem! Just skip this and fill out the information manually in the next steps.
          </p>
          
          {/* Quick Test Buttons */}
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
              <strong>🧪 Quick Test:</strong> Try these sample websites to see comprehensive auto-fill in action:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const testUrl = 'https://johnsplumbing.com';
                  updateBusinessData({ website: testUrl });
                  analyzeWebsite(testUrl);
                }}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50"
              >
                Test: johnsplumbing.com
              </button>
              <button
                type="button"
                onClick={() => {
                  const testUrl = 'https://smithlawfirm.com';
                  updateBusinessData({ website: testUrl });
                  analyzeWebsite(testUrl);
                }}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50"
              >
                Test: smithlawfirm.com
              </button>
              <button
                type="button"
                onClick={() => {
                  const testUrl = 'https://mariabakery.com';
                  updateBusinessData({ website: testUrl });
                  analyzeWebsite(testUrl);
                }}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50"
              >
                Test: mariabakery.com
              </button>
              <button
                type="button"
                onClick={() => {
                  const testUrl = 'https://moderndentalclinic.com';
                  updateBusinessData({ website: testUrl });
                  analyzeWebsite(testUrl);
                }}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50"
              >
                Test: moderndentalclinic.com
              </button>
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
              Each test will extract: Business info, Services, Keywords, Brand terms, and Unique selling points
            </p>
          </div>
        </div>
      )}
      
      <Textarea
        value={prompt}
        onChange={setPrompt}
        placeholder="Example: A modern landing page for a SaaS productivity app targeting small businesses. Include features showcase, pricing tiers, customer testimonials, and a free trial signup form."
        rows={6}
        className="w-full"
        aria-label="Page description"
      />
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
          💡 Pro Tips
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Include your target audience</li>
          <li>• Mention specific features or benefits</li>
          <li>• Specify the main call-to-action</li>
          <li>• Include any special requirements</li>
        </ul>
      </div>
    </div>
  );
}

export default Step1BasicInfo;
