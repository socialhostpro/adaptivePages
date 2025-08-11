
import React, { useState } from 'react';
import type { FAQSectionData, LandingPageTheme } from '../../types';

interface FAQItemProps {
  item: { question: string; answer: string };
  theme: LandingPageTheme;
}

const AccordionItem: React.FC<FAQItemProps> = ({ item, theme }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={`border-b border-${theme.textColorName}-200 dark:border-${theme.textColorName}-700`}>
            <h3>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex justify-between items-center w-full py-5 text-left"
                    aria-expanded={isOpen}
                >
                    <span className={`font-semibold text-lg text-${theme.textColorName}-800 dark:text-${theme.textColorName}-200`}>{item.question}</span>
                    <span className="ml-6 flex-shrink-0">
                        <svg className={`w-6 h-6 transform transition-transform text-gray-400 ${isOpen ? '-rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                </button>
            </h3>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className={`pb-5 pr-12 text-${theme.textColorName}-600 dark:text-${theme.textColorName}-400`}>
                    <p>{item.answer}</p>
                </div>
            </div>
        </div>
    );
};

interface FAQSectionProps {
  section: FAQSectionData;
  theme: LandingPageTheme;
}

const FAQSection: React.FC<FAQSectionProps> = ({ section, theme }) => {
  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 bg-${theme.textColorName}-50 dark:bg-gray-800`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className={`text-4xl font-extrabold text-${theme.textColorName}-900 dark:text-${theme.textColorName}-100`}>
          {section.title}
        </h2>
        <p className={`mt-4 text-lg text-${theme.textColorName}-600 dark:text-${theme.textColorName}-300`}>
          {section.subtitle}
        </p>
      </div>
      <div className="mt-12 max-w-3xl mx-auto">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {(section.items || []).map((faq, index) => (
            <AccordionItem key={index} item={faq} theme={theme} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;