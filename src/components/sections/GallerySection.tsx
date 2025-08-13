import React from 'react';

interface GallerySectionProps {
  section: {
    id: string;
    type: string;
    content: {
      title?: string;
      subtitle?: string;
      description?: string;
      images?: Array<{
        src: string;
        alt: string;
        caption?: string;
      }>;
      layout?: 'grid' | 'masonry' | 'carousel';
      backgroundColor?: string;
      textColor?: string;
    };
  };
}

const GallerySection: React.FC<GallerySectionProps> = ({ section }) => {
  const { content } = section;

  const defaultImages = [
    { src: "/api/placeholder/400/300", alt: "Gallery Image 1", caption: "Beautiful moment captured" },
    { src: "/api/placeholder/400/400", alt: "Gallery Image 2", caption: "Excellence in action" },
    { src: "/api/placeholder/400/250", alt: "Gallery Image 3", caption: "Quality showcase" },
    { src: "/api/placeholder/400/350", alt: "Gallery Image 4", caption: "Professional results" },
    { src: "/api/placeholder/400/300", alt: "Gallery Image 5", caption: "Attention to detail" },
    { src: "/api/placeholder/400/320", alt: "Gallery Image 6", caption: "Creative solutions" }
  ];

  const images = content.images || defaultImages;

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${content.backgroundColor || 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
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

        {/* Gallery Grid */}
        <div className={`grid gap-4 ${
          content.layout === 'masonry' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : content.layout === 'carousel'
            ? 'grid-cols-1 overflow-x-auto'
            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        }`}>
          {images.map((image, index) => (
            <div 
              key={index} 
              className={`group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow ${
                content.layout === 'masonry' && index % 3 === 1 ? 'md:row-span-2' : ''
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {image.caption && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end">
                  <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-sm font-medium">{image.caption}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            View Full Gallery
          </button>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
