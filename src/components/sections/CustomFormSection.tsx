import React from 'react';

interface CustomFormSectionProps {
  section: {
    id: string;
    type: string;
    content: {
      title?: string;
      subtitle?: string;
      description?: string;
      formFields?: Array<{
        id: string;
        type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';
        label: string;
        placeholder?: string;
        required?: boolean;
        options?: string[];
      }>;
      submitText?: string;
      backgroundColor?: string;
      textColor?: string;
    };
  };
}

const CustomFormSection: React.FC<CustomFormSectionProps> = ({ section }) => {
  const { content } = section;

  const defaultFormFields = [
    {
      id: 'name',
      type: 'text' as const,
      label: 'Full Name',
      placeholder: 'Enter your full name',
      required: true
    },
    {
      id: 'email',
      type: 'email' as const,
      label: 'Email Address',
      placeholder: 'Enter your email',
      required: true
    },
    {
      id: 'phone',
      type: 'tel' as const,
      label: 'Phone Number',
      placeholder: 'Enter your phone number',
      required: false
    },
    {
      id: 'company',
      type: 'text' as const,
      label: 'Company',
      placeholder: 'Enter your company name',
      required: false
    },
    {
      id: 'interest',
      type: 'select' as const,
      label: 'Area of Interest',
      required: true,
      options: ['Product Demo', 'Pricing Information', 'Partnership', 'Technical Support', 'Other']
    },
    {
      id: 'message',
      type: 'textarea' as const,
      label: 'Message',
      placeholder: 'Tell us about your needs...',
      required: false
    }
  ];

  const formFields = content.formFields || defaultFormFields;

  const renderField = (field: typeof formFields[0], index: number) => {
    const baseClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            key={field.id}
            id={field.id}
            name={field.id}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={baseClasses}
          />
        );
      
      case 'select':
        return (
          <select
            key={field.id}
            id={field.id}
            name={field.id}
            required={field.required}
            className={baseClasses}
          >
            <option value="">Choose an option</option>
            {field.options?.map((option, optIndex) => (
              <option key={optIndex} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center">
            <input
              type="checkbox"
              id={field.id}
              name={field.id}
              required={field.required}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={field.id} className="ml-2 text-gray-700">
              {field.label}
            </label>
          </div>
        );
      
      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <span className="block text-sm font-medium text-gray-700">{field.label}</span>
            {field.options?.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.id}_${optIndex}`}
                  name={field.id}
                  value={option}
                  required={field.required}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor={`${field.id}_${optIndex}`} className="ml-2 text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            key={field.id}
            type={field.type}
            id={field.id}
            name={field.id}
            placeholder={field.placeholder}
            required={field.required}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${content.backgroundColor || 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          {content.title && (
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              {content.title}
            </h2>
          )}
          {content.subtitle && (
            <p className="text-xl text-gray-600 mb-6">
              {content.subtitle}
            </p>
          )}
          {content.description && (
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              {content.description}
            </p>
          )}
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg">
          <form className="space-y-6">
            {formFields.map((field, index) => (
              <div key={field.id}>
                {field.type !== 'checkbox' && field.type !== 'radio' && (
                  <label 
                    htmlFor={field.id} 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}
                {renderField(field, index)}
              </div>
            ))}
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                {content.submitText || 'Submit Form'}
              </button>
            </div>
          </form>
        </div>

        {/* Form Benefits */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-4 h-4 text-green-600 mr-2">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Quick Response</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 text-green-600 mr-2">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 text-green-600 mr-2">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span>No Spam</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomFormSection;
