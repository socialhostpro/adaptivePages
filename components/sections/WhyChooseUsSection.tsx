
import React from 'react';
import type { WhyChooseUsSectionData, LandingPageTheme } from '../../src/types';
import DynamicIcon from '../icons/DynamicIcon';

interface WhyChooseUsSectionProps {
  section: WhyChooseUsSectionData;
  theme: LandingPageTheme;
}

const WhyChooseUsSection: React.FC<WhyChooseUsSectionProps> = ({ section, theme }) => {
  return (
    <section id="whyChooseUs" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className={`text-4xl font-extrabold text-${theme.textColorName}-900 dark:text-${theme.textColorName}-100`}>
          {section.title}
        </h2>
        <p className={`mt-4 max-w-2xl mx-auto text-lg text-${theme.textColorName}-600 dark:text-${theme.textColorName}-300`}>
          {section.subtitle}
        </p>
        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {(section.items || []).map((item, index) => (
            <div key={index} className="text-center p-6">
              <div className={`inline-block text-${theme.primaryColorName}-600 dark:text-${theme.primaryColorName}-400 bg-${theme.primaryColorName}-100 dark:bg-${theme.primaryColorName}-900/50 p-4 rounded-full mb-4`}>
                <DynamicIcon iconName={item.iconName} className="w-8 h-8" />
              </div>
              <h3 className={`text-xl font-bold text-${theme.textColorName}-900 dark:text-${theme.textColorName}-100`}>
                {item.title}
              </h3>
              <p className={`mt-2 text-base text-${theme.textColorName}-600 dark:text-${theme.textColorName}-400`}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;