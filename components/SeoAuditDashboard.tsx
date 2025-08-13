import React, { useState } from 'react';

// Simple icon components since heroicons might not be available
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const LightBulbIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const XCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

import type { SeoAnalysis, SeoRecommendation, LocalSeoFactor } from './SeoOptimizationService';

interface SeoAuditDashboardProps {
  analysis: SeoAnalysis;
  onImplementRecommendation?: (recommendation: SeoRecommendation) => void;
  onAddKeywordsToSeo?: (keywords: string[], type: 'secondary' | 'longtail' | 'question') => void;
}

export function SeoAuditDashboard({ analysis, onImplementRecommendation, onAddKeywordsToSeo }: SeoAuditDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'local' | 'competitors'>('overview');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimized':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'needs_improvement':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'missing':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'keywords', label: 'Keywords', icon: SearchIcon },
    { id: 'local', label: 'Local SEO', icon: LightBulbIcon },
    { id: 'competitors', label: 'Competitors', icon: ChartBarIcon }
  ] as const;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              SEO Analysis Dashboard
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive analysis of your page's SEO performance
            </p>
          </div>
          <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg border ${getScoreBgColor(analysis.seoScore)}`}>
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">SEO Score</div>
              <div className={`text-2xl font-bold ${getScoreColor(analysis.seoScore)}`}>
                {analysis.seoScore}/100
              </div>
            </div>
            <div className="w-16 h-16">
              <svg className="transform -rotate-90 w-16 h-16">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - analysis.seoScore / 100)}`}
                  className={getScoreColor(analysis.seoScore).replace('text-', 'text-')}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                SEO Recommendations
              </h3>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {rec.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rec.priority)}`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {rec.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Impact: {rec.impact}
                      </p>
                    </div>
                    {onImplementRecommendation && (
                      <button
                        onClick={() => onImplementRecommendation(rec)}
                        className="ml-4 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700"
                      >
                        Implement
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Primary Keyword</div>
                <div className="text-lg font-semibold text-blue-900 dark:text-blue-100 mt-1">
                  {analysis.primaryKeyword}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="text-sm font-medium text-green-600 dark:text-green-400">Secondary Keywords</div>
                <div className="text-lg font-semibold text-green-900 dark:text-green-100 mt-1">
                  {analysis.secondaryKeywords.length}
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Long-tail Keywords</div>
                <div className="text-lg font-semibold text-purple-900 dark:text-purple-100 mt-1">
                  {analysis.longTailKeywords.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Primary Keyword
              </h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                  {analysis.primaryKeyword}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Secondary Keywords
                </h3>
                {onAddKeywordsToSeo && (
                  <button
                    onClick={() => onAddKeywordsToSeo(analysis.secondaryKeywords, 'secondary')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="w-3 h-3 mr-1" />
                    Add to SEO
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {analysis.secondaryKeywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300"
                  >
                    {keyword}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Long-tail Keywords
                </h3>
                {onAddKeywordsToSeo && (
                  <button
                    onClick={() => onAddKeywordsToSeo(analysis.longTailKeywords, 'longtail')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <PlusIcon className="w-3 h-3 mr-1" />
                    Add to SEO
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {analysis.longTailKeywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300"
                  >
                    {keyword}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Question Keywords
                </h3>
                {onAddKeywordsToSeo && (
                  <button
                    onClick={() => onAddKeywordsToSeo(analysis.questionKeywords, 'question')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-800 bg-yellow-200 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:text-yellow-200 dark:bg-yellow-900/50 dark:hover:bg-yellow-800/50"
                  >
                    <PlusIcon className="w-3 h-3 mr-1" />
                    Add to SEO
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {analysis.questionKeywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-sm text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800"
                  >
                    {keyword}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'local' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Local SEO Factors
              </h3>
              <div className="space-y-3">
                {analysis.localSeoFactors.map((factor, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    {getStatusIcon(factor.status)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {factor.factor}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            factor.status === 'optimized'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : factor.status === 'needs_improvement'
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}
                        >
                          {factor.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {factor.description}
                      </p>
                      {factor.recommendation && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Recommendation: {factor.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'competitors' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Competitor Analysis
              </h3>
              {analysis.competitorInsights.length > 0 ? (
                <div className="space-y-4">
                  {analysis.competitorInsights.map((competitor, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        {competitor.url}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                            Strengths
                          </h5>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            {competitor.strengths.map((strength, i) => (
                              <li key={i} className="flex items-center space-x-2">
                                <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                            Weaknesses
                          </h5>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            {competitor.weaknesses.map((weakness, i) => (
                              <li key={i} className="flex items-center space-x-2">
                                <XCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                            Keyword Gaps
                          </h5>
                          <div className="space-y-1">
                            {competitor.keywordGaps.map((gap, i) => (
                              <div
                                key={i}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-200"
                              >
                                {gap}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <SearchIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>No competitor URLs provided for analysis.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SeoAuditDashboard;
