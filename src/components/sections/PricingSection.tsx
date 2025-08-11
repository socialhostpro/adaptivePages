
import React from 'react';
import type { PricingSectionData, LandingPageTheme } from '../../types';

interface PricingSectionProps {
  section: PricingSectionData;
  theme: LandingPageTheme;
  onLinkClick?: (event: React.MouseEvent, link: string) => void;
}

const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const PricingSection: React.FC<PricingSectionProps> = ({ section, theme, onLinkClick }) => {
  
  const handleClick = (e: React.MouseEvent, link: string) => {
    if (onLinkClick) {
        onLinkClick(e, link);
    } else if (link?.startsWith('#')) {
        e.preventDefault();
        document.querySelector(link)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className={`text-4xl font-extrabold text-${theme.textColorName}-900 dark:text-${theme.textColorName}-100`}>
          {section.title}
        </h2>
        <p className={`mt-4 max-w-2xl mx-auto text-lg text-${theme.textColorName}-600 dark:text-${theme.textColorName}-300`}>
          {section.subtitle}
        </p>
        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:items-center">
          {(section.plans || []).map((plan, index) => {
            const isFeatured = plan.isFeatured;
            const featuredClasses = isFeatured
              ? `border-4 border-${theme.primaryColorName}-500 dark:border-${theme.primaryColorName}-400 scale-105 z-10`
              : 'border-2 border-gray-200 dark:border-gray-700';
            const buttonClasses = isFeatured
              ? `bg-${theme.primaryColorName}-600 text-white hover:bg-${theme.primaryColorName}-700`
              : `bg-${theme.primaryColorName}-100 text-${theme.primaryColorName}-700 hover:bg-${theme.primaryColorName}-200 dark:bg-${theme.primaryColorName}-900/50 dark:text-${theme.primaryColorName}-300 dark:hover:bg-${theme.primaryColorName}-900/80`;
            
            const isExternal = plan.ctaLink?.startsWith('http');

            return (
              <div key={index} className={`relative bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col transition-transform ${featuredClasses}`}>
                {isFeatured && (
                  <div className={`absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-${theme.primaryColorName}-500 text-white text-sm font-semibold px-4 py-1 rounded-full`}>
                    Most Popular
                  </div>
                )}
                <h3 className={`text-2xl font-bold text-${theme.textColorName}-900 dark:text-${theme.textColorName}-100`}>{plan.name}</h3>
                <p className={`mt-4 text-4xl font-extrabold text-${theme.textColorName}-900 dark:text-${theme.textColorName}-100`}>
                  {plan.price}
                </p>
                <ul className={`mt-8 space-y-4 text-left text-${theme.textColorName}-600 dark:text-${theme.textColorName}-300 flex-grow`}>
                  {(plan.features || []).map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      <CheckIcon className="w-6 h-6 mr-2 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.ctaLink || '#'}
                  onClick={(e) => handleClick(e, plan.ctaLink)}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className={`mt-10 block w-full text-center py-3 px-6 rounded-lg font-semibold text-lg transition ${buttonClasses}`}>
                  {plan.ctaText}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;