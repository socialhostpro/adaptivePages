import React from 'react';

interface LogoWallSectionProps {
  section: {
    id: string;
    type: string;
    content: {
      title?: string;
      subtitle?: string;
      logos?: Array<{
        name: string;
        src: string;
        url?: string;
        alt?: string;
      }>;
      layout?: 'grid' | 'scroll' | 'carousel';
      grayscale?: boolean;
      backgroundColor?: string;
      textColor?: string;
    };
  };
}

const LogoWallSection: React.FC<LogoWallSectionProps> = ({ section }) => {
  const { content } = section;

  const defaultLogos = [
    { name: 'Company 1', src: '/api/placeholder/120/60', alt: 'Company 1 Logo' },
    { name: 'Company 2', src: '/api/placeholder/120/60', alt: 'Company 2 Logo' },
    { name: 'Company 3', src: '/api/placeholder/120/60', alt: 'Company 3 Logo' },
    { name: 'Company 4', src: '/api/placeholder/120/60', alt: 'Company 4 Logo' },
    { name: 'Company 5', src: '/api/placeholder/120/60', alt: 'Company 5 Logo' },
    { name: 'Company 6', src: '/api/placeholder/120/60', alt: 'Company 6 Logo' },
    { name: 'Company 7', src: '/api/placeholder/120/60', alt: 'Company 7 Logo' },
    { name: 'Company 8', src: '/api/placeholder/120/60', alt: 'Company 8 Logo' }
  ];

  const logos = content.logos || defaultLogos;

  const getLayoutClasses = () => {
    switch (content.layout) {
      case 'scroll':
        return 'flex overflow-x-auto space-x-8 pb-4';
      case 'carousel':
        return 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8';
      default:
        return 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8';
    }
  };

  const getImageClasses = () => {
    const baseClasses = 'h-12 w-auto object-contain transition-all duration-300';
    const grayscaleClasses = content.grayscale ? 'grayscale hover:grayscale-0' : '';
    return `${baseClasses} ${grayscaleClasses}`;
  };

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${content.backgroundColor || 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {(content.title || content.subtitle) && (
          <div className="text-center mb-12">
            {content.title && (
              <h2 className={`text-2xl font-bold mb-4 ${content.textColor || 'text-gray-900'}`}>
                {content.title}
              </h2>
            )}
            {content.subtitle && (
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {content.subtitle}
              </p>
            )}
          </div>
        )}

        <div className={getLayoutClasses()}>
          {logos.map((logo, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center p-4 hover:scale-105 transition-transform duration-300"
            >
              {logo.url ? (
                <a 
                  href={logo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt || `${logo.name} logo`}
                    className={getImageClasses()}
                    loading="lazy"
                  />
                </a>
              ) : (
                <img
                  src={logo.src}
                  alt={logo.alt || `${logo.name} logo`}
                  className={getImageClasses()}
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>

        {/* Scrolling animation for scroll layout */}
        {content.layout === 'scroll' && (
          <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll {
              animation: scroll 30s linear infinite;
            }
          `}</style>
        )}

        {/* Trust indicators */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Trusted by leading companies worldwide
          </p>
        </div>
      </div>
    </section>
  );
};

export default LogoWallSection;
