import React from 'react';

interface WhyChooseUsSectionProps {
  section: {
    id: string;
    type: string;
    content: {
      title?: string;
      subtitle?: string;
      description?: string;
      reasons?: Array<{
        title: string;
        description: string;
        icon?: string;
      }>;
      backgroundColor?: string;
      textColor?: string;
    };
  };
}

const WhyChooseUsSection: React.FC<WhyChooseUsSectionProps> = ({ section }) => {
  const { content } = section;

  const defaultReasons = [
    {
      title: "Expert Team",
      description: "Our experienced professionals deliver top-quality results with attention to detail.",
      icon: "⭐"
    },
    {
      title: "Proven Results",
      description: "Track record of success with measurable outcomes for our clients.",
      icon: "📊"
    },
    {
      title: "Customer First",
      description: "We prioritize your needs and provide exceptional customer service.",
      icon: "🤝"
    },
    {
      title: "Innovation",
      description: "Stay ahead with cutting-edge solutions and latest industry trends.",
      icon: "🚀"
    }
  ];

  const reasons = content.reasons || defaultReasons;

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${content.backgroundColor || 'bg-white'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          {content.title && (
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="text-center">
              <div className="mb-4">
                {reason.icon ? (
                  <div className="text-4xl mb-4">{reason.icon}</div>
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 text-blue-600">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{reason.title}</h3>
              <p className="text-gray-600">{reason.description}</p>
            </div>
          ))}
        </div>

        {/* Optional CTA */}
        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
