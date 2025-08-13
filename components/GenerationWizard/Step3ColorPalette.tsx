import React from 'react';
import CheckIcon from '../icons/CheckIcon';

interface Step3ColorPaletteProps {
  palette: string;
  setPalette: (value: string) => void;
  paletteOptions: Array<{
    value: string;
    label: string;
    description?: string;
    colors?: string[];
  }>;
}

export function Step3ColorPalette({
  palette,
  setPalette,
  paletteOptions
}: Step3ColorPaletteProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Choose Your Colors
        </h3>
        <p className="text-gray-600 dark:text-slate-400">
          Select a color palette that reflects your brand personality.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
          Color Palette
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paletteOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setPalette(option.value)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                palette === option.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    {option.description}
                  </p>
                </div>
                {palette === option.value && (
                  <CheckIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <div className="mt-3 flex space-x-2">
                {option.colors?.map((color, index) => (
                  <div 
                    key={index}
                    className={`w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-sm`}
                    data-color={color}
                    title={color}
                  ></div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Step3ColorPalette;
