import React, { useState } from 'react';

interface AnnouncementBarSectionProps {
  section: {
    id: string;
    type: string;
    content: {
      message?: string;
      type?: 'info' | 'warning' | 'success' | 'promo' | 'urgent';
      ctaText?: string;
      ctaUrl?: string;
      dismissible?: boolean;
      icon?: string;
      backgroundColor?: string;
      textColor?: string;
      blinking?: boolean;
    };
  };
}

const AnnouncementBarSection: React.FC<AnnouncementBarSectionProps> = ({ section }) => {
  const { content } = section;
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (content.type) {
      case 'warning':
        return 'bg-yellow-600 text-white';
      case 'success':
        return 'bg-green-600 text-white';
      case 'promo':
        return 'bg-purple-600 text-white';
      case 'urgent':
        return 'bg-red-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  const getIcon = () => {
    if (content.icon) return content.icon;
    
    switch (content.type) {
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'promo':
        return '🎉';
      case 'urgent':
        return '🚨';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`${content.backgroundColor || getTypeStyles()} relative z-50 ${content.blinking ? 'animate-pulse' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center justify-center flex-1 text-sm font-medium">
            <span className="mr-2">{getIcon()}</span>
            <span>{content.message || 'Important announcement'}</span>
            {content.ctaText && content.ctaUrl && (
              <a
                href={content.ctaUrl}
                className="ml-4 inline-flex items-center px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-sm font-medium transition-colors"
              >
                {content.ctaText}
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </div>
          
          {content.dismissible && (
            <button
              onClick={() => setIsVisible(false)}
              className="flex-shrink-0 ml-4 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              aria-label="Dismiss announcement"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBarSection;
