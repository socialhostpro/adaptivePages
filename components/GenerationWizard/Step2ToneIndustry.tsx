import React from 'react';
import { Select } from '../shared';

interface Step2ToneIndustryProps {
  tone: string;
  setTone: (value: string) => void;
  industry: string;
  setIndustry: (value: string) => void;
  toneOptions: Array<{ value: string; label: string }>;
  industryOptions: Array<{ value: string; label: string }>;
}

export function Step2ToneIndustry({
  tone,
  setTone,
  industry,
  setIndustry,
  toneOptions,
  industryOptions
}: Step2ToneIndustryProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Tone & Industry
        </h3>
        <p className="text-gray-600 dark:text-slate-400">
          Set the personality and context for your landing page.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Tone of Voice
          </label>
          <Select
            value={tone}
            onChange={setTone}
            options={toneOptions}
            placeholder="Select the tone that matches your brand..."
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Industry
          </label>
          <Select
            value={industry}
            onChange={setIndustry}
            options={industryOptions}
            placeholder="Choose your industry for optimized content..."
            className="w-full"
          />
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <p className="text-sm text-green-800 dark:text-green-300">
          <strong>Why this matters:</strong> These choices help the AI create content that resonates with your audience and follows industry best practices.
        </p>
      </div>
    </div>
  );
}

export default Step2ToneIndustry;
