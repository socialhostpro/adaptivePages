
import React from 'react';
import type { FooterSectionData, LandingPageTheme } from '../../src/types';
import { SocialIcon } from '../icons/SocialIcons';

interface FooterSectionProps {
  section: FooterSectionData;
  theme: LandingPageTheme;
}

const FooterSection: React.FC<FooterSectionProps> = ({ section, theme }) => {
  return (
    <footer id="footer" className={`bg-${theme.textColorName}-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700`}>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
        <p className={`text-base text-${theme.textColorName}-600 dark:text-${theme.textColorName}-400`}>
          {section.copyrightText}
        </p>
        <div className="flex space-x-6 mt-4 sm:mt-0">
          {(section.socialLinks || []).map((link) => (
            <a
              key={link.network}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-${theme.textColorName}-500 hover:text-${theme.primaryColorName}-600 dark:hover:text-${theme.primaryColorName}-400 transition-colors`}
            >
              <SocialIcon network={link.network} className="w-6 h-6" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;