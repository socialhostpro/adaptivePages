
import React, { useState, useMemo, useEffect } from 'react';
import type { ProductsSectionData, LandingPageTheme, ImageStore, ManagedProduct } from '../../src/types';
import LoaderIcon from '../icons/LoaderIcon';
import RefreshIcon from '../icons/RefreshIcon';

interface ProductCardProps {
  item: ManagedProduct;
  theme: LandingPageTheme;
  image: string;
  onAddToCart: (product: ManagedProduct, selectedOptions: Record<string, string>) => void;
  isRegenerating: boolean;
  onRegenerate: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, theme, image, onAddToCart, isRegenerating, onRegenerate }) => {
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [currentPrice, setCurrentPrice] = useState(item.price || 0);

    useEffect(() => {
        // Set initial default options
        const defaults: Record<string, string> = {};
        if (item.options) {
            for (const option of item.options) {
                if (option.values.length > 0) {
                    defaults[option.name] = option.values[0].value;
                }
            }
        }
        setSelectedOptions(defaults);
    }, [item.options]);

    useEffect(() => {
        // Recalculate price when options change
        let price = item.price || 0;
        if (item.options) {
            for (const option of item.options) {
                const selectedValue = selectedOptions[option.name];
                if (selectedValue) {
                    const valueObj = option.values.find(v => v.value === selectedValue);
                    if (valueObj) {
                        price += valueObj.priceModifier;
                    }
                }
            }
        }
        setCurrentPrice(price);
    }, [selectedOptions, item.price, item.options]);

    const handleOptionChange = (optionName: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-col overflow-hidden group">
            <div className="relative aspect-square bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {image ? (
                    <img src={image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                    <div className="w-full h-full animate-pulse"></div>
                )}
                {isRegenerating ? (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center"> <LoaderIcon className="w-8 h-8 text-white" /> </div>
                ) : (
                    <button onClick={onRegenerate} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Regenerate image for ${item.name}`}>
                        <RefreshIcon className="w-8 h-8" />
                    </button>
                )}
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className={`text-lg font-bold text-${theme.textColorName}-900 dark:text-white`}>{item.name}</h3>
                <p className={`mt-1 text-sm text-${theme.textColorName}-600 dark:text-${theme.textColorName}-400 flex-grow`}>{item.description}</p>

                {item.options && item.options.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {item.options.map(option => (
                            <div key={option.name}>
                                <label className={`text-xs font-semibold text-${theme.textColorName}-600 dark:text-${theme.textColorName}-400`}>{option.name}</label>
                                <select 
                                    value={selectedOptions[option.name] || ''} 
                                    onChange={e => handleOptionChange(option.name, e.target.value)}
                                    className={`w-full p-1.5 mt-1 border border-gray-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200`}
                                >
                                    {option.values.map(v => <option key={v.value} value={v.value}>{v.value} {v.priceModifier !== 0 ? `(${v.priceModifier > 0 ? '+' : ''}$${v.priceModifier.toFixed(2)})` : ''}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-4 flex justify-between items-center">
                    <span className={`text-xl font-bold text-${theme.textColorName}-900 dark:text-white`}>${currentPrice.toFixed(2)}</span>
                    <button
                        onClick={() => onAddToCart(item, selectedOptions)}
                        className={`bg-${theme.primaryColorName}-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-${theme.primaryColorName}-700 transition`}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};


interface ProductsSectionProps {
  section: ProductsSectionData;
  allProducts: ManagedProduct[];
  theme: LandingPageTheme;
  images: ImageStore;
  onAddToCart: (product: ManagedProduct, selectedOptions: Record<string, string>) => void;
  regeneratingImages: string[];
  onRegenerateImage: (imageKey: string, prompt: string, aspectRatio?: '16:9' | '1:1') => void;
}

const ProductsSection: React.FC<ProductsSectionProps> = ({ section, allProducts, theme, images, onAddToCart, regeneratingImages, onRegenerateImage }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  const productsForSection = useMemo(() => {
    if (!section.itemIds || !allProducts) return [];
    const productMap = new Map(allProducts.map(p => [p.id, p]));
    return section.itemIds.map(id => productMap.get(id)).filter(Boolean) as ManagedProduct[];
  }, [section.itemIds, allProducts]);

  const categories = useMemo(() => {
    if (!productsForSection) return [];
    const allCategories = productsForSection.map(item => item.category).filter(Boolean);
    return ['All', ...Array.from(new Set(allCategories as string[]))];
  }, [productsForSection]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return productsForSection || [];
    return productsForSection.filter(item => item.category === activeCategory);
  }, [productsForSection, activeCategory]);

  return (
    <section id="products" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className={`text-4xl font-extrabold text-${theme.textColorName}-900 dark:text-${theme.textColorName}-100`}>
            {section.title}
          </h2>
          <p className={`mt-4 max-w-2xl mx-auto text-lg text-${theme.textColorName}-600 dark:text-${theme.textColorName}-300`}>
            {section.subtitle}
          </p>
        </div>

        {categories.length > 1 && (
          <div className="flex justify-center flex-wrap gap-2 my-12">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  activeCategory === category
                    ? `bg-${theme.primaryColorName}-600 text-white shadow-md`
                    : `bg-white dark:bg-slate-800 text-${theme.textColorName}-700 dark:text-${theme.textColorName}-300 hover:bg-slate-100 dark:hover:bg-slate-700 ring-1 ring-inset ring-slate-200 dark:ring-slate-700`
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {(filteredProducts || []).map((item) => {
            const imageKey = `product_${item.id}`;
            const isRegenerating = regeneratingImages.includes(imageKey);

            return (
              <ProductCard
                key={item.id}
                item={item}
                theme={theme}
                image={images[imageKey]}
                onAddToCart={onAddToCart}
                isRegenerating={isRegenerating}
                onRegenerate={() => onRegenerateImage(imageKey, item.featured_image_url || '', '1:1')}
              />
            )
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;