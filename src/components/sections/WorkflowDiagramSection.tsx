import React from 'react';

interface WorkflowDiagramSectionProps {
  section: {
    id: string;
    type: string;
    content: {
      title?: string;
      subtitle?: string;
      description?: string;
      steps?: Array<{
        id: string;
        title: string;
        description: string;
        icon?: string;
        color?: string;
        connections?: string[]; // IDs of connected steps
      }>;
      layout?: 'linear' | 'branched' | 'circular';
      backgroundColor?: string;
      textColor?: string;
    };
  };
}

const WorkflowDiagramSection: React.FC<WorkflowDiagramSectionProps> = ({ section }) => {
  const { content } = section;

  const defaultSteps = [
    {
      id: '1',
      title: 'Input',
      description: 'Receive and process initial data',
      icon: '📥',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      title: 'Analysis',
      description: 'Analyze and validate the information',
      icon: '🔍',
      color: 'bg-green-500'
    },
    {
      id: '3',
      title: 'Processing',
      description: 'Apply business logic and rules',
      icon: '⚙️',
      color: 'bg-yellow-500'
    },
    {
      id: '4',
      title: 'Output',
      description: 'Generate and deliver results',
      icon: '📤',
      color: 'bg-purple-500'
    }
  ];

  const steps = content.steps || defaultSteps;

  const renderLinearWorkflow = () => (
    <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center text-center">
            {/* Step Icon */}
            <div className={`w-16 h-16 rounded-full ${step.color || 'bg-blue-500'} text-white flex items-center justify-center text-2xl mb-4 shadow-lg`}>
              {step.icon || (index + 1)}
            </div>
            
            {/* Step Content */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-gray-600 text-sm max-w-xs">{step.description}</p>
          </div>
          
          {/* Arrow */}
          {index < steps.length - 1 && (
            <div className="flex items-center justify-center md:flex-row flex-col">
              <div className="w-8 h-8 text-gray-400 transform md:rotate-0 rotate-90">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderCircularWorkflow = () => (
    <div className="relative w-96 h-96 mx-auto">
      {steps.map((step, index) => {
        const angle = (index * 360) / steps.length;
        const radian = (angle * Math.PI) / 180;
        const radius = 120;
        const x = Math.cos(radian) * radius;
        const y = Math.sin(radian) * radius;
        
        return (
          <div
            key={step.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full ${step.color || 'bg-blue-500'} text-white flex items-center justify-center text-sm mb-2 shadow-lg`}>
                {step.icon || (index + 1)}
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{step.title}</h4>
              <p className="text-xs text-gray-600 max-w-20">{step.description}</p>
            </div>
          </div>
        );
      })}
      
      {/* Center hub */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-16 h-16 bg-gray-800 text-white rounded-full flex items-center justify-center text-xl shadow-lg">
          ⚡
        </div>
      </div>
    </div>
  );

  const renderBranchedWorkflow = () => (
    <div className="space-y-8">
      {/* Main flow */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full ${steps[0]?.color || 'bg-blue-500'} text-white flex items-center justify-center text-2xl mb-4 shadow-lg`}>
            {steps[0]?.icon || '1'}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{steps[0]?.title}</h3>
          <p className="text-gray-600 text-sm max-w-xs">{steps[0]?.description}</p>
        </div>
      </div>
      
      {/* Branched steps */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          {steps.slice(1).map((step, index) => (
            <div key={step.id} className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-full ${step.color || 'bg-green-500'} text-white flex items-center justify-center text-lg mb-4 shadow-lg`}>
                {step.icon || (index + 2)}
              </div>
              <h3 className="text-md font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#9CA3AF" />
          </marker>
        </defs>
        {steps.slice(1).map((_, index) => (
          <line
            key={index}
            x1="50%"
            y1="30%"
            x2={`${33 + (index * 33)}%`}
            y2="70%"
            stroke="#9CA3AF"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        ))}
      </svg>
    </div>
  );

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

        <div className="relative">
          {content.layout === 'circular' && renderCircularWorkflow()}
          {content.layout === 'branched' && renderBranchedWorkflow()}
          {(!content.layout || content.layout === 'linear') && renderLinearWorkflow()}
        </div>

        {/* Process benefits */}
        <div className="mt-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <span className="text-green-500">✓</span>
              <span className="text-sm">Automated Process</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <span className="text-green-500">✓</span>
              <span className="text-sm">Quality Assured</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <span className="text-green-500">✓</span>
              <span className="text-sm">Fast & Reliable</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowDiagramSection;
