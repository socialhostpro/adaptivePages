



import React from 'react';
import type { BookingSectionData, LandingPageTheme } from '../../src/types';

interface BookingSectionProps {
  section: BookingSectionData;
  theme: LandingPageTheme;
  onOpenModal: () => void;
}

const BookingSection: React.FC<BookingSectionProps> = ({ section, theme, onOpenModal }) => {
  const ctaClasses = `inline-block bg-${theme.primaryColorName}-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-${theme.primaryColorName}-700 transition-transform transform hover:scale-105 shadow-lg`;

  return (
    <section id="booking" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className={`text-4xl font-extrabold text-${theme.textColorName}-900 dark:text-${theme.textColorName}-100`}>
          {section.title}
        </h2>
        <p className={`mt-4 max-w-2xl mx-auto text-lg text-${theme.textColorName}-600 dark:text-${theme.textColorName}-300`}>
          {section.subtitle}
        </p>
        <div className="mt-10">
          <button onClick={onOpenModal} className={ctaClasses}>
            {section.ctaText}
          </button>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;