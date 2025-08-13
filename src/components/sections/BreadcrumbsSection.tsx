import React from 'react';

interface BreadcrumbsSectionProps {
  section: {
    id: string;
    type: string;
    content: {
      items?: Array<{
        label: string;
        url?: string;
        current?: boolean;
      }>;
      separator?: string;
      showHome?: boolean;
      backgroundColor?: string;
      textColor?: string;
    };
  };
}

const BreadcrumbsSection: React.FC<BreadcrumbsSectionProps> = ({ section }) => {
  const { content } = section;

  const defaultItems = [
    { label: 'Home', url: '/' },
    { label: 'Products', url: '/products' },
    { label: 'Category', url: '/products/category' },
    { label: 'Current Page', current: true }
  ];

  const items = content.items || defaultItems;
  const separator = content.separator || '/';

  const renderSeparator = () => {
    if (separator === '/') {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      );
    }
    return <span className="text-gray-400 mx-2">{separator}</span>;
  };

  return (
    <section className={`py-4 px-4 sm:px-6 lg:px-8 ${content.backgroundColor || 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            {content.showHome !== false && !items.find(item => item.url === '/') && (
              <>
                <li>
                  <a
                    href="/"
                    className="text-gray-500 hover:text-gray-700 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                  </a>
                </li>
                <li className="flex items-center">
                  {renderSeparator()}
                </li>
              </>
            )}
            
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <li>
                  {item.current ? (
                    <span 
                      className={`font-medium ${content.textColor || 'text-gray-900'}`}
                      aria-current="page"
                    >
                      {item.label}
                    </span>
                  ) : (
                    <a
                      href={item.url}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
                
                {index < items.length - 1 && (
                  <li className="flex items-center">
                    {renderSeparator()}
                  </li>
                )}
              </React.Fragment>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
};

export default BreadcrumbsSection;
