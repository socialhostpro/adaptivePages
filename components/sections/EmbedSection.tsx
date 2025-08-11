




import React, { useEffect } from 'react';
import type { EmbedSectionData, LandingPageTheme } from '../../src/types';

interface EmbedSectionProps {
  section: EmbedSectionData;
  theme: LandingPageTheme;
  pageId?: string; // To create unique IDs for scripts
}

const EmbedSection: React.FC<EmbedSectionProps> = ({ section, theme, pageId }) => {

  if (section.embedType === 'inline-iframe') {
    return (
      <section id="embed" className={`py-20 px-4 sm:px-6 lg:px-8 bg-${theme.textColorName}-50 dark:bg-gray-800`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`text-4xl font-extrabold text-${theme.textColorName}-900 dark:text-${theme.textColorName}-100`}>
            {section.title}
          </h2>
          <p className={`mt-4 text-lg text-${theme.textColorName}-600 dark:text-${theme.textColorName}-300`}>
            {section.subtitle}
          </p>
          <div className="mt-12 max-w-3xl mx-auto">
            <div
              className="aspect-video w-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:rounded-xl [&>iframe]:shadow-lg"
              dangerouslySetInnerHTML={{ __html: section.embedCode.replace(/\[api_key\]/g, section.apiKey) }}
            />
          </div>
        </div>
      </section>
    );
  }

  // For floating-script, we still render the title and subtitle section, but the bot itself is appended to the body globally.
  return (
    <section id="embed" className={`py-20 px-4 sm:px-6 lg:px-8 bg-${theme.textColorName}-50 dark:bg-gray-800`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className={`text-4xl font-extrabold text-${theme.textColorName}-900 dark:text-${theme.textColorName}-100`}>
          {section.title}
        </h2>
        <p className={`mt-4 text-lg text-${theme.textColorName}-600 dark:text-${theme.textColorName}-300`}>
          {section.subtitle}
        </p>
      </div>
    </section>
  );
};

export default EmbedSection;