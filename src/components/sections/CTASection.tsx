
import React from 'react';
import type { CTASectionData, LandingPageTheme } from '../../types';

interface CTASectionProps {
  section: CTASectionData;
  theme: LandingPageTheme;
  onLinkClick?: (event: React.MouseEvent, link: string) => void;
}

const CTASection: React.FC<CTASectionProps> = ({ section, theme, onLinkClick }) => {
  const ctaClasses = `inline-block bg-white text-${theme.primaryColorName}-600 font-bold py-4 px-10 rounded-lg text-xl hover:bg-gray-100 transition-transform transform hover:scale-105 shadow-lg`;
  
  const isExternal = section.ctaLink?.startsWith('http');

  const handleClick = (e: React.MouseEvent) => {
    if (onLinkClick) {
      onLinkClick(e, section.ctaLink);
    } else if (section.ctaLink?.startsWith('#')) {
      e.preventDefault();
      document.querySelector(section.ctaLink)?.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <section className={`bg-gradient-to-r from-${theme.primaryColorName}-600 to-${theme.primaryColorName}-800 dark:from-${theme.primaryColorName}-700 dark:to-${theme.primaryColorName}-900`}>
      <div className="max-w-4xl mx-auto text-center py-20 px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-white">
          {section.title}
        </h2>
        <p className="mt-4 text-lg text-gray-200">
          {section.subtitle}
        </p>
        <div className="mt-8">
          <a
            href={section.ctaLink || '#'}
            onClick={handleClick}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className={ctaClasses}
          >
            {section.ctaText}
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;