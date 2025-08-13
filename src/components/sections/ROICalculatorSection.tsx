import React, { useState } from 'react';

interface ROICalculatorSectionProps {
  section: {
    id: string;
    type: string;
    content: {
      title?: string;
      subtitle?: string;
      description?: string;
      calculator?: {
        inputs: Array<{
          id: string;
          label: string;
          type: 'number' | 'slider' | 'select';
          min?: number;
          max?: number;
          step?: number;
          defaultValue?: number;
          options?: Array<{ label: string; value: number }>;
          suffix?: string;
          prefix?: string;
        }>;
        formula?: string; // Basic formula description
        results: Array<{
          id: string;
          label: string;
          calculation: string; // How to calculate this result
          format?: 'currency' | 'percentage' | 'number';
          color?: string;
        }>;
      };
      backgroundColor?: string;
      textColor?: string;
    };
  };
}

const ROICalculatorSection: React.FC<ROICalculatorSectionProps> = ({ section }) => {
  const { content } = section;
  
  const defaultCalculator = {
    inputs: [
      { id: 'currentCost', label: 'Current Monthly Cost', type: 'number' as const, defaultValue: 1000, prefix: '$' },
      { id: 'efficiency', label: 'Expected Efficiency Gain', type: 'slider' as const, min: 10, max: 80, defaultValue: 30, suffix: '%' },
      { id: 'timeFrame', label: 'Time Frame', type: 'select' as const, defaultValue: 12, options: [
        { label: '6 months', value: 6 },
        { label: '1 year', value: 12 },
        { label: '2 years', value: 24 }
      ]}
    ],
    results: [
      { id: 'monthlySavings', label: 'Monthly Savings', calculation: 'currentCost * (efficiency/100)', format: 'currency' as const, color: 'text-green-600' },
      { id: 'totalSavings', label: 'Total Savings', calculation: 'monthlySavings * timeFrame', format: 'currency' as const, color: 'text-blue-600' },
      { id: 'roi', label: 'ROI', calculation: '((totalSavings - investmentCost) / investmentCost) * 100', format: 'percentage' as const, color: 'text-purple-600' }
    ]
  };

  const calculator = content.calculator || defaultCalculator;
  const [inputs, setInputs] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    calculator.inputs.forEach(input => {
      initial[input.id] = input.defaultValue || 0;
    });
    return initial;
  });

  const handleInputChange = (id: string, value: number) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const calculateResult = (calculation: string): number => {
    try {
      // Simple calculation engine - replace variable names with values
      let formula = calculation;
      Object.entries(inputs).forEach(([key, value]) => {
        formula = formula.replace(new RegExp(key, 'g'), value.toString());
      });
      
      // Add investment cost assumption for ROI calculation
      formula = formula.replace(/investmentCost/g, '5000');
      
      // Evaluate the formula (basic operations only)
      return eval(formula);
    } catch {
      return 0;
    }
  };

  const formatValue = (value: number, format?: string): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const renderInput = (input: typeof calculator.inputs[0]) => {
    const value = inputs[input.id] || 0;

    switch (input.type) {
      case 'slider':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {input.label}: {input.prefix}{value}{input.suffix}
            </label>
            <input
              type="range"
              min={input.min || 0}
              max={input.max || 100}
              step={input.step || 1}
              value={value}
              onChange={(e) => handleInputChange(input.id, Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{input.prefix}{input.min}{input.suffix}</span>
              <span>{input.prefix}{input.max}{input.suffix}</span>
            </div>
          </div>
        );
      
      case 'select':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {input.label}
            </label>
            <select
              value={value}
              onChange={(e) => handleInputChange(input.id, Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {input.options?.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      
      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {input.label}
            </label>
            <div className="relative">
              {input.prefix && (
                <span className="absolute left-3 top-2 text-gray-500">{input.prefix}</span>
              )}
              <input
                type="number"
                value={value}
                onChange={(e) => handleInputChange(input.id, Number(e.target.value))}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  input.prefix ? 'pl-8' : ''
                } ${input.suffix ? 'pr-8' : ''}`}
                min={input.min}
                max={input.max}
                step={input.step}
              />
              {input.suffix && (
                <span className="absolute right-3 top-2 text-gray-500">{input.suffix}</span>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${content.backgroundColor || 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        {(content.title || content.subtitle || content.description) && (
          <div className="text-center mb-12">
            {content.title && (
              <h2 className={`text-3xl font-bold mb-4 ${content.textColor || 'text-gray-900'}`}>
                {content.title}
              </h2>
            )}
            {content.subtitle && (
              <p className="text-xl text-gray-600 mb-6">
                {content.subtitle}
              </p>
            )}
            {content.description && (
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                {content.description}
              </p>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Calculator Inputs</h3>
              {calculator.inputs.map((input, index) => (
                <div key={input.id}>
                  {renderInput(input)}
                </div>
              ))}
            </div>

            {/* Results */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Results</h3>
              <div className="space-y-4">
                {calculator.results.map((result, index) => {
                  const value = calculateResult(result.calculation);
                  return (
                    <div key={result.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">{result.label}</span>
                        <span className={`text-2xl font-bold ${result.color || 'text-gray-900'}`}>
                          {formatValue(value, result.format)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Ready to Start Saving?</h4>
                <p className="text-blue-700 text-sm mb-4">
                  See how our solution can deliver these results for your business.
                </p>
                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  Get Started Today
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            * Results are estimates based on typical use cases. Actual results may vary.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ROICalculatorSection;
