

import React, { useState, useEffect } from 'react';
import type { CustomFormSectionData, LandingPageTheme, CrmForm } from '../../types';
import * as contactService from '../../services/contactService';
import LoaderIcon from '../icons/LoaderIcon';

interface CustomFormSectionProps {
  section: CustomFormSectionData;
  theme: LandingPageTheme;
  pageId?: string;
  allForms?: CrmForm[];
}

const CustomFormSection: React.FC<CustomFormSectionProps> = ({ section, theme, pageId, allForms }) => {
  const [form, setForm] = useState<CrmForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  useEffect(() => {
    // For published pages, fields are embedded directly
    if (section.fields) {
        setForm({
            id: section.formId,
            name: '', // Not needed for rendering
            fields: section.fields,
            // Dummy values for other required properties
            user_id: '',
            created_at: '',
        });
        setIsLoading(false);
        return;
    }

    // For editor view, fetch the form
    if (section.formId) {
      setIsLoading(true);
      setForm(null); // Reset form while loading new one

      const fetchForm = async () => {
        let idToFetch = section.formId;

        // In the editor, `allForms` will be provided. We can resolve AI-generated names.
        if (allForms && allForms.length > 0) {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idToFetch);
            if (!isUUID) {
                // It's likely a name from the AI, find the real ID
                const matchedForm = allForms.find(f => f.name.toLowerCase() === idToFetch.toLowerCase());
                idToFetch = matchedForm ? matchedForm.id : '';
            }
        }
        
        if (idToFetch) {
            const fetchedForm = await contactService.getFormById(idToFetch);
            setForm(fetchedForm);
        }
        setIsLoading(false);
      };
      
      fetchForm();
    } else {
        setIsLoading(false);
        setForm(null);
    }
  }, [section.formId, section.fields, allForms]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pageId || !form) return;

    setStatus('loading');
    const formData = new FormData(event.currentTarget);
    const submissionData: Record<string, string> = {};
    formData.forEach((value, key) => {
        submissionData[key] = value as string;
    });

    try {
        await contactService.handleCustomFormSubmission(pageId, form.id, submissionData);
        setStatus('success');
        (event.target as HTMLFormElement).reset();
    } catch (error) {
        console.error("Custom form submission error:", error);
        setStatus('error');
    }
  };

  return (
    <section id="customForm" className={`py-20 px-4 sm:px-6 lg:px-8 bg-${theme.textColorName}-50 dark:bg-gray-800`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className={`text-4xl font-extrabold text-${theme.textColorName}-900 dark:text-${theme.textColorName}-100`}>
          {section.title}
        </h2>
        <p className={`mt-4 text-lg text-${theme.textColorName}-600 dark:text-${theme.textColorName}-300`}>
          {section.subtitle}
        </p>
      </div>
      <div className="mt-12 max-w-3xl mx-auto">
        {isLoading && <LoaderIcon className="mx-auto w-8 h-8"/>}
        {!isLoading && form && (
             <form onSubmit={handleSubmit} className="space-y-6">
                 {form.fields.map(field => {
                     const InputComponent = field.type === 'textarea' ? 'textarea' : 'input';
                     return (
                        <div key={field.id}>
                             <label htmlFor={field.id} className={`block text-sm font-medium text-${theme.textColorName}-700 dark:text-${theme.textColorName}-300`}>{field.label}</label>
                            <div className="mt-1">
                                <InputComponent 
                                    id={field.id} 
                                    name={field.label}
                                    type={field.type === 'textarea' ? undefined : field.type}
                                    rows={field.type === 'textarea' ? 4 : undefined}
                                    required={field.required}
                                    className={`py-3 px-4 block w-full shadow-sm focus:ring-${theme.primaryColorName}-500 focus:border-${theme.primaryColorName}-500 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`} />
                            </div>
                        </div>
                     )
                 })}
                  <div>
                    <button type="submit" disabled={status === 'loading'} className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-${theme.primaryColorName}-600 hover:bg-${theme.primaryColorName}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.primaryColorName}-500 disabled:bg-gray-400`}>
                        {status === 'loading' ? <LoaderIcon className="w-5 h-5" /> : "Submit"}
                    </button>
                  </div>
                  {status === 'success' && <p className="text-center text-green-600 dark:text-green-400">Thank you! Your message has been sent.</p>}
                  {status === 'error' && <p className="text-center text-red-600 dark:text-red-400">There was an error submitting your message.</p>}
             </form>
        )}
        {!isLoading && !form && (
            <p className="text-center text-red-500">Form not found. Please select a valid form in the editor.</p>
        )}
      </div>
    </section>
  );
};

export default CustomFormSection;