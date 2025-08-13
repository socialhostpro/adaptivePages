import React from 'react';

interface ProductsSectionProps {
  section: {
    id: string;
    type: string;
    content: {
      title?: string;
      subtitle?: string;
      description?: string;
      products?: Array<{
        id: string;
        name: string;
        description: string;
        price: number;
        image?: string;
        category?: string;
        featured?: boolean;
      }>;
      showCategories?: boolean;
      backgroundColor?: string;
      textColor?: string;
    };
  };
  allProducts?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    category?: string;
    featured?: boolean;
  }>;
}

const ProductsSection: React.FC<ProductsSectionProps> = ({ section, allProducts = [] }) => {
  const { content } = section;

  const defaultProducts = [
    {
      id: '1',
      name: 'Premium Package',
      description: 'Our flagship offering with all the features you need to succeed.',
      price: 99,
      image: '/api/placeholder/300/200',
      category: 'Premium',
      featured: true
    },
    {
      id: '2',
      name: 'Standard Package',
      description: 'Perfect balance of features and affordability for growing businesses.',
      price: 49,
      image: '/api/placeholder/300/200',
      category: 'Standard',
      featured: false
    },
    {
      id: '3',
      name: 'Basic Package',
      description: 'Essential features to get you started on your journey.',
      price: 19,
      image: '/api/placeholder/300/200',
      category: 'Basic',
      featured: false
    }
  ];

  const products = content.products || allProducts || defaultProducts;
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${content.backgroundColor || 'bg-white'}`}>
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

        {/* Categories Filter */}
        {content.showCategories && categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">
              All
            </button>
            {categories.map((category, index) => (
              <button
                key={index}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div key={product.id || index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {product.featured && (
                <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 absolute z-10 m-3 rounded">
                  FEATURED
                </div>
              )}
              
              {product.image && (
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                  <span className="text-2xl font-bold text-blue-600">
                    ${typeof product.price === 'number' ? product.price : 0}
                  </span>
                </div>
                
                {product.category && (
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mb-3">
                    {product.category}
                  </span>
                )}
                
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Add to Cart
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <button className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition-colors font-semibold">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
