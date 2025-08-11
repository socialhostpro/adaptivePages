
import React, { useState } from 'react';
import type { ContactSectionData, LandingPageTheme, BookingSettings } from '../../src/types';
import * as contactService from '../../services/contactService';
import LoaderIcon from '../icons/LoaderIcon';

interface ContactSectionProps {
  section: ContactSectionData;
  theme: LandingPageTheme;
  pageId?: string;
  settings?: BookingSettings;
}

const ContactSection: React.FC<ContactSectionProps> = ({ section, theme, pageId, settings }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pageId) {
      alert("This form is not connected to a page.");
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    
    const formData = new FormData(event.currentTarget);
    const message = {
      pageId,
      firstName: formData.get('first-name') as string,
      lastName: formData.get('last-name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    };

    try {
      await contactService.createContactMessage(message);
      setStatus('success');
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Contact form submission error:", error);
      setStatus('error');
      setErrorMessage((error as Error).message || 'There was an error submitting your message.');
    }
  };

  return (
    <section id="contact" className={`py-20 px-4 sm:px-6 lg:px-8 bg-${theme.textColorName}-50 dark:bg-gray-800`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className={`text-4xl font-extrabold text-${theme.textColorName}-900 dark:text-${theme.textColorName}-100`}>
          {section.title}
        </h2>
        <p className={`mt-4 text-lg text-${theme.textColorName}-600 dark:text-${theme.textColorName}-300`}>
          {section.subtitle}
        </p>
      </div>
      <div className="mt-12 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
          <div>
            <label htmlFor="first-name" className={`block text-sm font-medium text-${theme.textColorName}-700 dark:text-${theme.textColorName}-300`}>First name</label>
            <div className="mt-1">
              <input required type="text" name="first-name" id="first-name" autoComplete="given-name" className={`py-3 px-4 block w-full shadow-sm focus:ring-${theme.primaryColorName}-500 focus:border-${theme.primaryColorName}-500 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`} />
            </div>
          </div>
          <div>
            <label htmlFor="last-name" className={`block text-sm font-medium text-${theme.textColorName}-700 dark:text-${theme.textColorName}-300`}>Last name</label>
            <div className="mt-1">
              <input required type="text" name="last-name" id="last-name" autoComplete="family-name" className={`py-3 px-4 block w-full shadow-sm focus:ring-${theme.primaryColorName}-500 focus:border-${theme.primaryColorName}-500 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`} />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="email" className={`block text-sm font-medium text-${theme.textColorName}-700 dark:text-${theme.textColorName}-300`}>Email</label>
            <div className="mt-1">
              <input required id="email" name="email" type="email" autoComplete="email" className={`py-3 px-4 block w-full shadow-sm focus:ring-${theme.primaryColorName}-500 focus:border-${theme.primaryColorName}-500 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`} />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="message" className={`block text-sm font-medium text-${theme.textColorName}-700 dark:text-${theme.textColorName}-300`}>Message</label>
            <div className="mt-1">
              <textarea required id="message" name="message" rows={4} className={`py-3 px-4 block w-full shadow-sm focus:ring-${theme.primaryColorName}-500 focus:border-${theme.primaryColorName}-500 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}></textarea>
            </div>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={status === 'loading'} className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-${theme.primaryColorName}-600 hover:bg-${theme.primaryColorName}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.primaryColorName}-500 disabled:bg-gray-400`}>
              {status === 'loading' ? <LoaderIcon className="w-5 h-5" /> : "Let's talk"}
            </button>
          </div>
          {status === 'success' && <p className="sm:col-span-2 text-center text-green-600 dark:text-green-400">Thank you! Your message has been sent.</p>}
          {status === 'error' && <p className="sm:col-span-2 text-center text-red-600 dark:text-red-400">{errorMessage}</p>}
        </form>
      </div>
    </section>
  );
};

export default ContactSection;