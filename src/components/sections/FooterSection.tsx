import React from 'react';

interface FooterSectionProps {
  section: {
    id: string;
    type: string;
    content: {
      companyName?: string;
      description?: string;
      logo?: string;
      columns?: Array<{
        title: string;
        links: Array<{
          text: string;
          url: string;
        }>;
      }>;
      socialLinks?: Array<{
        platform: string;
        url: string;
        icon?: string;
      }>;
      contactInfo?: {
        email?: string;
        phone?: string;
        address?: string;
      };
      newsletter?: {
        title?: string;
        description?: string;
        placeholder?: string;
      };
      copyright?: string;
      backgroundColor?: string;
      textColor?: string;
    };
  };
}

const FooterSection: React.FC<FooterSectionProps> = ({ section }) => {
  const { content } = section;

  const defaultColumns = [
    {
      title: "Product",
      links: [
        { text: "Features", url: "#features" },
        { text: "Pricing", url: "#pricing" },
        { text: "API", url: "#api" },
        { text: "Documentation", url: "#docs" }
      ]
    },
    {
      title: "Company",
      links: [
        { text: "About", url: "#about" },
        { text: "Blog", url: "#blog" },
        { text: "Careers", url: "#careers" },
        { text: "Contact", url: "#contact" }
      ]
    },
    {
      title: "Support",
      links: [
        { text: "Help Center", url: "#help" },
        { text: "Community", url: "#community" },
        { text: "Status", url: "#status" },
        { text: "Security", url: "#security" }
      ]
    },
    {
      title: "Legal",
      links: [
        { text: "Privacy", url: "#privacy" },
        { text: "Terms", url: "#terms" },
        { text: "Cookies", url: "#cookies" },
        { text: "Licenses", url: "#licenses" }
      ]
    }
  ];

  const defaultSocialLinks = [
    { platform: "Twitter", url: "#", icon: "🐦" },
    { platform: "Facebook", url: "#", icon: "📘" },
    { platform: "LinkedIn", url: "#", icon: "💼" },
    { platform: "Instagram", url: "#", icon: "📷" }
  ];

  const columns = content.columns || defaultColumns;
  const socialLinks = content.socialLinks || defaultSocialLinks;

  const getSocialIcon = (platform: string, customIcon?: string) => {
    if (customIcon) return customIcon;
    
    switch (platform.toLowerCase()) {
      case 'twitter':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'instagram':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.017 0C8.396 0 7.989.013 7.041.072 6.094.131 5.436.268 4.862.463a5.95 5.95 0 00-2.142 1.396 5.95 5.95 0 00-1.396 2.142C.268 5.436.131 6.094.072 7.041.013 7.989 0 8.396 0 12.017s.013 4.028.072 4.976c.059.947.196 1.605.391 2.179a5.95 5.95 0 001.396 2.142 5.95 5.95 0 002.142 1.396c.574.195 1.232.332 2.179.391.948.059 1.355.072 4.976.072s4.028-.013 4.976-.072c.947-.059 1.605-.196 2.179-.391a5.95 5.95 0 002.142-1.396 5.95 5.95 0 001.396-2.142c.195-.574.332-1.232.391-2.179.059-.948.072-1.355.072-4.976s-.013-4.028-.072-4.976c-.059-.947-.196-1.605-.391-2.179a5.95 5.95 0 00-1.396-2.142A5.95 5.95 0 0018.964.463C18.39.268 17.732.131 16.785.072 15.837.013 15.43 0 12.017 0zm0 2.154c3.354 0 3.75.012 5.073.07.845.038 1.303.178 1.608.296.404.157.693.345.996.648.303.303.49.592.648.996.118.305.258.763.296 1.608.058 1.323.07 1.719.07 5.073s-.012 3.75-.07 5.073c-.038.845-.178 1.303-.296 1.608-.157.404-.345.693-.648.996-.303.303-.592.49-.996.648-.305.118-.763.258-1.608.296-1.323.058-1.719.07-5.073.07s-3.75-.012-5.073-.07c-.845-.038-1.303-.178-1.608-.296a2.64 2.64 0 01-.996-.648 2.64 2.64 0 01-.648-.996c-.118-.305-.258-.763-.296-1.608-.058-1.323-.07-1.719-.07-5.073s.012-3.75.07-5.073c.038-.845.178-1.303.296-1.608.157-.404.345-.693.648-.996a2.64 2.64 0 01.996-.648c.305-.118.763-.258 1.608-.296 1.323-.058 1.719-.07 5.073-.07z"/>
            <path d="M12.017 5.838a6.179 6.179 0 100 12.358 6.179 6.179 0 000-12.358zm0 10.188a4.009 4.009 0 110-8.018 4.009 4.009 0 010 8.018zm7.846-10.405a1.441 1.441 0 11-2.883 0 1.441 1.441 0 012.883 0z"/>
          </svg>
        );
      default:
        return customIcon || '🔗';
    }
  };

  return (
    <footer className={`${content.backgroundColor || 'bg-gray-900'} ${content.textColor || 'text-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              {content.logo && (
                <img src={content.logo} alt={content.companyName} className="h-8 w-auto mr-3" />
              )}
              {content.companyName && (
                <h3 className="text-xl font-bold">{content.companyName}</h3>
              )}
            </div>
            
            {content.description && (
              <p className="text-gray-300 mb-6 max-w-md">{content.description}</p>
            )}

            {/* Contact Info */}
            {content.contactInfo && (
              <div className="space-y-2 mb-6">
                {content.contactInfo.email && (
                  <div className="flex items-center text-gray-300">
                    <div className="w-4 h-4 mr-2">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm">{content.contactInfo.email}</span>
                  </div>
                )}
                {content.contactInfo.phone && (
                  <div className="flex items-center text-gray-300">
                    <div className="w-4 h-4 mr-2">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span className="text-sm">{content.contactInfo.phone}</span>
                  </div>
                )}
                {content.contactInfo.address && (
                  <div className="flex items-center text-gray-300">
                    <div className="w-4 h-4 mr-2">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-sm">{content.contactInfo.address}</span>
                  </div>
                )}
              </div>
            )}

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                >
                  {getSocialIcon(social.platform, social.icon)}
                </a>
              ))}
            </div>
          </div>

          {/* Footer Columns */}
          {columns.map((column, index) => (
            <div key={index}>
              <h4 className="text-lg font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.url}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        {content.newsletter && (
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="max-w-md mx-auto text-center">
              <h4 className="text-lg font-semibold mb-2">
                {content.newsletter.title || 'Stay Updated'}
              </h4>
              <p className="text-gray-300 text-sm mb-4">
                {content.newsletter.description || 'Get the latest news and updates.'}
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder={content.newsletter.placeholder || 'Enter your email'}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-l-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                />
                <button className="bg-blue-600 text-white px-6 py-2 rounded-r-lg hover:bg-blue-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            {content.copyright || `© ${new Date().getFullYear()} ${content.companyName || 'Company'}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
