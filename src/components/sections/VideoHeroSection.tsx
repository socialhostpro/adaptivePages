import React, { useState } from 'react';

interface VideoHeroSectionProps {
  section: {
    id: string;
    type: string;
    content: {
      title?: string;
      subtitle?: string;
      description?: string;
      ctaText?: string;
      ctaUrl?: string;
      secondaryCtaText?: string;
      secondaryCtaUrl?: string;
      videoUrl?: string;
      videoThumbnail?: string;
      autoplay?: boolean;
      loop?: boolean;
      muted?: boolean;
      overlayOpacity?: number;
      textAlign?: 'left' | 'center' | 'right';
      backgroundColor?: string;
      textColor?: string;
    };
  };
}

const VideoHeroSection: React.FC<VideoHeroSectionProps> = ({ section }) => {
  const { content } = section;
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  const getTextAlignment = () => {
    switch (content.textAlign) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      default:
        return 'text-center';
    }
  };

  const getJustifyContent = () => {
    switch (content.textAlign) {
      case 'left':
        return 'justify-start';
      case 'right':
        return 'justify-end';
      default:
        return 'justify-center';
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        {content.videoUrl && !videoError ? (
          <>
            {!isVideoPlaying && content.videoThumbnail ? (
              <div className="relative w-full h-full">
                <img
                  src={content.videoThumbnail}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={handlePlayVideo}
                    className="w-20 h-20 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg"
                    aria-label="Play video"
                  >
                    <div className="w-0 h-0 border-l-8 border-l-gray-800 border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1"></div>
                  </button>
                </div>
              </div>
            ) : (
              <video
                className="w-full h-full object-cover"
                autoPlay={content.autoplay || isVideoPlaying}
                loop={content.loop}
                muted={content.muted !== false}
                playsInline
                onError={handleVideoError}
              >
                <source src={content.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700"></div>
        )}
        
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: (content.overlayOpacity || 50) / 100 }}
        ></div>
      </div>

      {/* Content */}
      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${getTextAlignment()}`}>
        <div className={`flex ${getJustifyContent()}`}>
          <div className="max-w-4xl">
            {content.title && (
              <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 ${content.textColor || 'text-white'} leading-tight`}>
                {content.title}
              </h1>
            )}
            
            {content.subtitle && (
              <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
                {content.subtitle}
              </p>
            )}
            
            {content.description && (
              <p className="text-lg text-gray-300 mb-10 max-w-2xl leading-relaxed">
                {content.description}
              </p>
            )}

            {/* CTAs */}
            <div className={`flex flex-col sm:flex-row gap-4 ${getJustifyContent()}`}>
              {content.ctaText && (
                <a
                  href={content.ctaUrl || '#'}
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300 transform hover:scale-105 shadow-lg"
                >
                  {content.ctaText}
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
              
              {content.secondaryCtaText && (
                <a
                  href={content.secondaryCtaUrl || '#'}
                  className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold rounded-lg transition-colors duration-300"
                >
                  {content.secondaryCtaText}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white">
        <div className="flex flex-col items-center animate-bounce">
          <span className="text-sm mb-2">Scroll to explore</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Video controls overlay */}
      {isVideoPlaying && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setIsVideoPlaying(false)}
            className="w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all duration-300"
            aria-label="Pause video"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
};

export default VideoHeroSection;
