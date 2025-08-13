import React from 'react';
import { Button } from '../shared';
import type { LocalBusinessData } from './types';

interface Step6SeoStrategyProps {
  businessData: LocalBusinessData;
  addToArray: (field: keyof LocalBusinessData, value: string) => void;
  removeFromArray: (field: keyof LocalBusinessData, index: number) => void;
}

export function Step6SeoStrategy({
  businessData,
  addToArray,
  removeFromArray
}: Step6SeoStrategyProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          SEO Strategy & Keywords
        </h3>
        <p className="text-gray-600 dark:text-slate-400">
          Define your services and competitive advantage for better search rankings.
        </p>
      </div>

      <div className="space-y-6">
        {/* Primary Services */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Primary Services * (What do you do?)
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add a service (e.g., Emergency Plumbing, Dental Cleaning)"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      addToArray('primaryServices', input.value.trim());
                      input.value = '';
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                  if (input?.value.trim()) {
                    addToArray('primaryServices', input.value.trim());
                    input.value = '';
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {businessData.primaryServices.map((service, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                >
                  {service}
                  <button
                    onClick={() => removeFromArray('primaryServices', index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Target Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Target Keywords (What do customers search for?)
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add keyword (e.g., plumber near me, emergency dental)"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      addToArray('targetKeywords', input.value.trim());
                      input.value = '';
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                  if (input?.value.trim()) {
                    addToArray('targetKeywords', input.value.trim());
                    input.value = '';
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {businessData.targetKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                >
                  {keyword}
                  <button
                    onClick={() => removeFromArray('targetKeywords', index)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Unique Selling Points */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            What Makes You Different? (Unique Selling Points)
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add USP (e.g., 24/7 Service, 20+ Years Experience)"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      addToArray('uniqueSellingPoints', input.value.trim());
                      input.value = '';
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                  if (input?.value.trim()) {
                    addToArray('uniqueSellingPoints', input.value.trim());
                    input.value = '';
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {businessData.uniqueSellingPoints.map((point, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                >
                  {point}
                  <button
                    onClick={() => removeFromArray('uniqueSellingPoints', index)}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Competitor URLs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Competitor Websites (Optional)
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="url"
                placeholder="Add competitor URL (helps us understand your market)"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      addToArray('competitorUrls', input.value.trim());
                      input.value = '';
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                  if (input?.value.trim()) {
                    addToArray('competitorUrls', input.value.trim());
                    input.value = '';
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {businessData.competitorUrls.map((url, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                >
                  {url}
                  <button
                    onClick={() => removeFromArray('competitorUrls', index)}
                    className="ml-2 text-orange-600 hover:text-orange-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">
          📈 SEO Strategy Benefits
        </h4>
        <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
          <li>• Services become your primary keyword targets</li>
          <li>• Keywords help optimize content for search engines</li>
          <li>• USPs create compelling, differentiated copy</li>
          <li>• Competitor analysis informs content strategy</li>
          <li>• Local modifiers boost local search visibility</li>
        </ul>
      </div>
    </div>
  );
}

export default Step6SeoStrategy;
