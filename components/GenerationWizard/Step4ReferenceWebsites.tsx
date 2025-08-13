import React from 'react';
import SparklesIcon from '../icons/SparklesIcon';

interface Step4ReferenceWebsitesProps {
  inspirationUrl: string;
  setInspirationUrl: (value: string) => void;
}

export function Step4ReferenceWebsites({
  inspirationUrl,
  setInspirationUrl
}: Step4ReferenceWebsitesProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Reference Websites (Optional)
        </h3>
        <p className="text-gray-600 dark:text-slate-400">
          Add inspiration websites to guide the design and content style.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            <SparklesIcon className="w-4 h-4 inline mr-1" />
            Inspiration Website
          </label>
          <input
            type="url"
            value={inspirationUrl}
            onChange={(e) => setInspirationUrl(e.target.value)}
            placeholder="https://inspiration-site.com"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            A site you admire that we can use as design inspiration.
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>Note:</strong> These URLs are optional but can significantly improve the quality and relevance of your generated page.
        </p>
      </div>
    </div>
  );
}

export default Step4ReferenceWebsites;
