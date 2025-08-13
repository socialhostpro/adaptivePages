import React from 'react';

interface MetricsCounterSectionProps {
  section: {
    id: string;
    type: string;
    content: {
      title?: string;
      subtitle?: string;
      description?: string;
      metrics?: Array<{
        value: string | number;
        label: string;
        suffix?: string;
        prefix?: string;
        icon?: string;
        color?: string;
      }>;
      layout?: 'horizontal' | 'grid';
      animated?: boolean;
      backgroundColor?: string;
      textColor?: string;
    };
  };
}

const MetricsCounterSection: React.FC<MetricsCounterSectionProps> = ({ section }) => {
  const { content } = section;

  const defaultMetrics = [
    {
      value: '10K+',
      label: 'Happy Customers',
      icon: '👥',
      color: 'text-blue-600'
    },
    {
      value: '99.9',
      suffix: '%',
      label: 'Uptime',
      icon: '⚡',
      color: 'text-green-600'
    },
    {
      value: '50',
      suffix: '+',
      label: 'Countries',
      icon: '🌍',
      color: 'text-purple-600'
    },
    {
      value: '24/7',
      label: 'Support',
      icon: '🛟',
      color: 'text-orange-600'
    }
  ];

  const metrics = content.metrics || defaultMetrics;

  const getLayoutClasses = () => {
    if (content.layout === 'horizontal') {
      return 'flex flex-wrap justify-center items-center gap-8 md:gap-16';
    }
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8';
  };

  const formatValue = (metric: typeof metrics[0]) => {
    const prefix = metric.prefix || '';
    const suffix = metric.suffix || '';
    return `${prefix}${metric.value}${suffix}`;
  };

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${content.backgroundColor || 'bg-white'}`}>
      <div className="max-w-7xl mx-auto">
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

        <div className={getLayoutClasses()}>
          {metrics.map((metric, index) => (
            <div 
              key={index} 
              className={`text-center ${content.layout === 'horizontal' ? 'flex-shrink-0' : ''}`}
            >
              {metric.icon && (
                <div className="text-4xl mb-3">{metric.icon}</div>
              )}
              
              <div 
                className={`text-3xl md:text-4xl font-bold mb-2 ${
                  metric.color || content.textColor || 'text-gray-900'
                } ${content.animated ? 'animate-pulse' : ''}`}
              >
                {formatValue(metric)}
              </div>
              
              <div className="text-lg text-gray-600 font-medium">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {/* Additional context */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Real-time metrics updated daily
          </p>
        </div>

        {/* Optional animated counter effect */}
        {content.animated && (
          <style>{`
            @keyframes countUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-count {
              animation: countUp 0.6s ease-out forwards;
            }
          `}</style>
        )}
      </div>
    </section>
  );
};

export default MetricsCounterSection;
