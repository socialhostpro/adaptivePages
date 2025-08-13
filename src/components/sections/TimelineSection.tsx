import React from 'react';

interface TimelineSectionProps {
  section: {
    id: string;
    type: string;
    content: {
      title?: string;
      subtitle?: string;
      description?: string;
      timeline?: Array<{
        date?: string;
        title: string;
        description: string;
        icon?: string;
        status?: 'completed' | 'current' | 'upcoming';
        details?: string[];
      }>;
      layout?: 'vertical' | 'horizontal';
      backgroundColor?: string;
      textColor?: string;
    };
  };
}

const TimelineSection: React.FC<TimelineSectionProps> = ({ section }) => {
  const { content } = section;

  const defaultTimeline = [
    {
      date: 'Phase 1',
      title: 'Discovery & Planning',
      description: 'We start by understanding your needs and defining the project scope.',
      icon: '🔍',
      status: 'completed' as const,
      details: ['Requirements gathering', 'Market research', 'Strategy development']
    },
    {
      date: 'Phase 2', 
      title: 'Design & Development',
      description: 'Our team creates and builds your solution with attention to detail.',
      icon: '🎨',
      status: 'current' as const,
      details: ['UI/UX design', 'Development', 'Quality testing']
    },
    {
      date: 'Phase 3',
      title: 'Launch & Optimization',
      description: 'We deploy your solution and continuously optimize for best results.',
      icon: '🚀',
      status: 'upcoming' as const,
      details: ['Deployment', 'Performance monitoring', 'Ongoing support']
    },
    {
      date: 'Phase 4',
      title: 'Growth & Scale',
      description: 'We help you scale and grow with advanced features and support.',
      icon: '📈',
      status: 'upcoming' as const,
      details: ['Feature expansion', 'Scale optimization', 'Advanced analytics']
    }
  ];

  const timeline = content.timeline || defaultTimeline;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'current':
        return 'bg-blue-500 text-white animate-pulse';
      case 'upcoming':
        return 'bg-gray-300 text-gray-600';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getConnectorColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'current':
        return 'bg-gradient-to-b from-green-500 to-blue-500';
      case 'upcoming':
        return 'bg-gray-300';
      default:
        return 'bg-blue-500';
    }
  };

  if (content.layout === 'horizontal') {
    return (
      <section className={`py-16 px-4 sm:px-6 lg:px-8 ${content.backgroundColor || 'bg-gray-50'}`}>
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

          <div className="relative">
            {/* Horizontal line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gray-300 hidden md:block"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {timeline.map((item, index) => (
                <div key={index} className="relative text-center">
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl ${getStatusColor(item.status)} relative z-10`}>
                    {item.icon || (index + 1)}
                  </div>
                  
                  {/* Content */}
                  <div className="mt-4">
                    {item.date && (
                      <div className="text-sm font-medium text-blue-600 mb-2">{item.date}</div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                    
                    {item.details && (
                      <ul className="mt-3 text-xs text-gray-500 space-y-1">
                        {item.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center justify-center">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Vertical layout (default)
  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${content.backgroundColor || 'bg-white'}`}>
      <div className="max-w-4xl mx-auto">
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

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-300"></div>
          
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={index} className="relative flex items-start">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl ${getStatusColor(item.status)} relative z-10 flex-shrink-0`}>
                  {item.icon || (index + 1)}
                </div>
                
                {/* Connector to next item */}
                {index < timeline.length - 1 && (
                  <div className={`absolute left-8 top-16 w-1 h-8 ${getConnectorColor(item.status)}`}></div>
                )}
                
                {/* Content */}
                <div className="ml-6 flex-1">
                  {item.date && (
                    <div className="text-sm font-medium text-blue-600 mb-1">{item.date}</div>
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-3">{item.description}</p>
                  
                  {item.details && (
                    <ul className="space-y-1">
                      {item.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-sm text-gray-500">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0"></span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
