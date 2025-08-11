
import React from 'react';
import type { GallerySectionData, LandingPageTheme, ImageStore } from '../../src/types';
import RefreshIcon from '../icons/RefreshIcon';
import LoaderIcon from '../icons/LoaderIcon';

interface GallerySectionProps {
  section: GallerySectionData;
  theme: LandingPageTheme;
  images: ImageStore;
  onRegenerateImage: (imageKey: string, prompt: string, aspectRatio?: '16:9' | '1:1') => void;
  regeneratingImages: string[];
}

const GallerySection: React.FC<GallerySectionProps> = ({ section, theme, images, onRegenerateImage, regeneratingImages }) => {
  return (
    <section id="gallery" className={`py-20 px-4 sm:px-6 lg:px-8 bg-${theme.textColorName}-50 dark:bg-gray-800`}>
      <div className="max-w-7xl mx-auto text-center">
        <h2 className={`text-4xl font-extrabold text-${theme.textColorName}-900 dark:text-${theme.textColorName}-100`}>
          {section.title}
        </h2>
        <p className={`mt-4 max-w-2xl mx-auto text-lg text-${theme.textColorName}-600 dark:text-${theme.textColorName}-300`}>
          {section.subtitle}
        </p>
      </div>
      <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(section.items || []).map((item, index) => {
          const imageKey = `gallery_${index}`;
          const isRegenerating = regeneratingImages.includes(imageKey);
          return (
            <div key={index} className="relative aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg group">
              {images[imageKey] ? (
                <img src={images[imageKey]} alt={item.altText} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full animate-pulse"></div>
              )}

              {isRegenerating ? (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center transition-opacity">
                    <LoaderIcon className="w-10 h-10 text-white" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                        onClick={() => onRegenerateImage(imageKey, item.imagePrompt, '16:9')}
                        className="text-white bg-black/50 p-3 rounded-full hover:bg-black/80 transform hover:scale-110 transition-all"
                        aria-label="Regenerate image"
                    >
                        <RefreshIcon className="w-8 h-8" />
                    </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  );
};

export default GallerySection;