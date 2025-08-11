
import React from 'react';
import type { TestimonialsSectionData, LandingPageTheme, ImageStore } from '../../types';
import RefreshIcon from '../icons/RefreshIcon';
import LoaderIcon from '../icons/LoaderIcon';

interface TestimonialsSectionProps {
  section: TestimonialsSectionData;
  theme: LandingPageTheme;
  images: ImageStore;
  onRegenerateImage: (imageKey: string, prompt: string, aspectRatio: '1:1') => void;
  regeneratingImages: string[];
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ section, theme, images, onRegenerateImage, regeneratingImages }) => {
  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 bg-${theme.textColorName}-50 dark:bg-gray-800`}>
      <div className="max-w-7xl mx-auto text-center">
        <h2 className={`text-4xl font-extrabold text-${theme.textColorName}-900 dark:text-${theme.textColorName}-100`}>
          {section.title}
        </h2>
        <p className={`mt-4 max-w-2xl mx-auto text-lg text-${theme.textColorName}-600 dark:text-${theme.textColorName}-300`}>
          {section.subtitle}
        </p>
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {(section.items || []).map((testimonial, index) => {
            const imageKey = `testimonial_${index}`;
            const isRegenerating = regeneratingImages.includes(imageKey);

            return (
              <div key={index} className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg flex flex-col items-center text-center">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden mb-6 ring-4 ring-offset-4 ring-offset-white dark:ring-offset-gray-900 ring-indigo-200 dark:ring-indigo-700">
                  {images[imageKey] ? (
                    <img src={images[imageKey]} alt={testimonial.author} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
                  )}
                  {isRegenerating ? (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <LoaderIcon className="w-8 h-8 text-white" />
                      </div>
                  ) : (
                      <button
                          onClick={(e) => {
                              e.stopPropagation();
                              onRegenerateImage(imageKey, testimonial.avatarImagePrompt, '1:1');
                          }}
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Regenerate avatar for ${testimonial.author}`}
                      >
                          <RefreshIcon className="w-8 h-8" />
                      </button>
                  )}
                </div>
                <blockquote className={`text-lg text-${theme.textColorName}-700 dark:text-${theme.textColorName}-300 italic`}>
                  "{testimonial.quote}"
                </blockquote>
                <cite className="mt-6 not-italic">
                  <div className={`font-bold text-lg text-${theme.textColorName}-900 dark:text-${theme.textColorName}-100`}>{testimonial.author}</div>
                  <div className={`text-sm text-${theme.primaryColorName}-600 dark:text-${theme.primaryColorName}-400 font-semibold`}>{testimonial.role}</div>
                </cite>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;