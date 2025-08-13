import React from 'react';

interface EmbedSectionProps {
  section: {
    id: string;
    type: string;
    content: {
      title?: string;
      subtitle?: string;
      description?: string;
      embedType?: 'iframe' | 'video' | 'map' | 'form' | 'calendar' | 'widget';
      embedUrl?: string;
      embedCode?: string;
      aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
      height?: number;
      backgroundColor?: string;
      textColor?: string;
    };
  };
}

const EmbedSection: React.FC<EmbedSectionProps> = ({ section }) => {
  const { content } = section;

  const getAspectRatioClass = () => {
    switch (content.aspectRatio) {
      case '16:9':
        return 'aspect-video';
      case '4:3':
        return 'aspect-[4/3]';
      case '1:1':
        return 'aspect-square';
      default:
        return '';
    }
  };

  const renderEmbed = () => {
    if (content.embedCode) {
      // Raw HTML embed code
      return (
        <div 
          className={`w-full ${getAspectRatioClass()}`}
          dangerouslySetInnerHTML={{ __html: content.embedCode }}
        />
      );
    }

    if (content.embedUrl) {
      const height = content.height || 400;
      
      switch (content.embedType) {
        case 'video':
          return (
            <div className={`w-full ${getAspectRatioClass() || 'aspect-video'}`}>
              <iframe
                src={content.embedUrl}
                title="Embedded Video"
                width="100%"
                height="100%"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
          );
        
        case 'map':
          return (
            <div className="w-full">
              <iframe
                src={content.embedUrl}
                title="Embedded Map"
                width="100%"
                height={height}
                frameBorder="0"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full rounded-lg"
              />
            </div>
          );
        
        case 'calendar':
          return (
            <div className="w-full">
              <iframe
                src={content.embedUrl}
                title="Calendar Booking"
                width="100%"
                height={height}
                frameBorder="0"
                className="w-full rounded-lg"
              />
            </div>
          );
        
        case 'form':
          return (
            <div className="w-full">
              <iframe
                src={content.embedUrl}
                title="Embedded Form"
                width="100%"
                height={height}
                frameBorder="0"
                className="w-full rounded-lg"
              />
            </div>
          );
        
        default:
          return (
            <div className="w-full">
              <iframe
                src={content.embedUrl}
                title="Embedded Content"
                width="100%"
                height={height}
                frameBorder="0"
                className="w-full rounded-lg"
              />
            </div>
          );
      }
    }

    // Fallback placeholder
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 text-gray-400 mx-auto mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500">Embedded content will appear here</p>
          <p className="text-sm text-gray-400 mt-2">Configure embed URL or code to display content</p>
        </div>
      </div>
    );
  };

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${content.backgroundColor || 'bg-white'}`}>
      <div className="max-w-6xl mx-auto">
        {(content.title || content.subtitle || content.description) && (
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
        )}

        <div className="bg-gray-50 p-8 rounded-lg">
          {renderEmbed()}
        </div>

        {/* Embed Info */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-4 h-4 text-blue-600 mr-2">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Secure Content</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 text-blue-600 mr-2">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span>Optimized Loading</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 text-blue-600 mr-2">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span>Mobile Responsive</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmbedSection;
