import React from 'react';
import { Input } from '../shared';
import type { LocalBusinessData, WebsiteAnalysisResult } from './types';

interface Step5BusinessInfoProps {
  businessData: LocalBusinessData;
  updateBusinessData: (data: Partial<LocalBusinessData>) => void;
  websiteAnalysisResults: WebsiteAnalysisResult | null;
}

export function Step5BusinessInfo({
  businessData,
  updateBusinessData,
  websiteAnalysisResults
}: Step5BusinessInfoProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Local Business Information
        </h3>
        <p className="text-gray-600 dark:text-slate-400">
          {businessData.businessName ? 
            `Great! We found information for ${businessData.businessName}. Please review and complete any missing details.` :
            'Please provide your business information for SEO optimization.'
          }
        </p>
      </div>

      {/* Show website analyzed status if applicable */}
      {websiteAnalysisResults && businessData.website && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-green-900 dark:text-green-300 mb-2 flex items-center">
            ✅ Website Analyzed: {businessData.website}
          </h4>
          <p className="text-sm text-green-800 dark:text-green-300">
            We've automatically filled in your business information from your website. Please review and update any details below.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Business Name *
            </label>
            <input
              type="text"
              value={businessData.businessName}
              onChange={(e) => updateBusinessData({ businessName: e.target.value })}
              placeholder="Your Business Name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Business Type *
            </label>
            <input
              type="text"
              value={businessData.businessType}
              onChange={(e) => updateBusinessData({ businessType: e.target.value })}
              placeholder="e.g., Restaurant, Law Firm, Plumber"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            ZIP Code * (Primary Location)
          </label>
          <input
            type="text"
            value={businessData.zipCode}
            onChange={(e) => updateBusinessData({ zipCode: e.target.value })}
            placeholder="12345"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Full Address
          </label>
          <Input
            value={businessData.address}
            onChange={(value) => updateBusinessData({ address: value })}
            placeholder="123 Main St, City, State 12345"
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Phone Number
            </label>
            <Input
              value={businessData.phone}
              onChange={(value) => updateBusinessData({ phone: value })}
              placeholder="(555) 123-4567"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <Input
              value={businessData.email}
              onChange={(value) => updateBusinessData({ email: value })}
              placeholder="contact@yourbusiness.com"
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
          🎯 Why This Matters for SEO
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Local business information improves Google My Business optimization</li>
          <li>• ZIP code helps target location-specific keywords</li>
          <li>• NAP consistency (Name, Address, Phone) boosts local search rankings</li>
          <li>• Existing website analysis helps preserve valuable SEO equity</li>
        </ul>
      </div>
    </div>
  );
}

export default Step5BusinessInfo;
