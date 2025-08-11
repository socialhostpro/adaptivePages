
import React, { useState, useMemo } from 'react';
import type { ManagedProduct, ProductStatus, FulfillmentType, Task } from '../src/types';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import TruckIcon from './icons/TruckIcon';
import DownloadCloudIcon from './icons/DownloadCloudIcon';
import WrenchIcon from './icons/WrenchIcon';
import VideoIcon from './icons/VideoIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';


interface ProductListProps {
    products: ManagedProduct[];
    addText: string;
    onAddProduct: () => void;
    onEditProduct: (product: ManagedProduct) => void;
    onDeleteProduct: (product: ManagedProduct) => void;
}

const PRODUCT_STATUSES: ProductStatus[] = ['Active', 'Draft', 'Archived'];
const ITEMS_PER_PAGE = 8;

const fulfillmentIcons: { [key in FulfillmentType]: React.ElementType } = {
    'Shippable': TruckIcon,
    'Digital': DownloadCloudIcon,
    'On-site Service': WrenchIcon,
    'VideoCourse': VideoIcon,
};

const statusColors: { [key in ProductStatus]: string } = {
    'Active': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Draft': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    'Archived': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};


const ProductList: React.FC<ProductListProps> = ({ products, addText, onAddProduct, onEditProduct, onDeleteProduct }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ProductStatus | 'All'>('All');
    const [currentPage, setCurrentPage] = useState(1);
    
    const filteredProducts = useMemo(() => {
        return products
            .filter(p => statusFilter === 'All' || p.status === statusFilter)
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md flex flex-col h-full">
            <div className="p-4 border-b dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
                 <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full md:w-1/3 p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm bg-white dark:bg-slate-700"
                />
                <div className="flex items-center gap-4">
                     <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setCurrentPage(1); }} className="p-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700">
                        <option value="All">All Statuses</option>
                        {PRODUCT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button
                        onClick={onAddProduct}
                        className="flex items-center gap-2 py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <PlusIcon className="w-5 h-5"/> {addText}
                    </button>
                </div>
            </div>
            <div className="flex-grow">
                {paginatedProducts.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        No items found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                        {paginatedProducts.map(product => {
                            const FulfillmentIcon = fulfillmentIcons[product.fulfillment_type];
                            return (
                                <div key={product.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col min-h-0" style={{maxWidth: '400px'}}>
                                    <div className="relative aspect-video bg-slate-200 dark:bg-slate-700 rounded-t-xl overflow-hidden group">
                                        <div className="w-full h-full flex items-center justify-center">
                                            {product.featured_image_url ? 
                                                <img src={product.featured_image_url} alt={product.name} className="w-full h-full object-cover"/>
                                                : <FulfillmentIcon className="w-12 h-12 text-slate-400 dark:text-slate-500"/>
                                            }
                                        </div>
                                    </div>
                                    <div className="p-4 flex-grow">
                                        <h2 className="text-lg font-bold truncate text-slate-900 dark:text-white">{product.name}</h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{product.category}</p>
                                        <p className="text-lg font-semibold text-slate-900 dark:text-white mt-2">${(product.price || 0).toFixed(2)}</p>
                                        <div className="mt-2">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[product.status]}`}>
                                                {product.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between text-sm">
                                        <div className="text-xs text-slate-500 dark:text-slate-400" title={product.fulfillment_type}>
                                            {product.fulfillment_type}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => onDeleteProduct(product)} 
                                                className="flex items-center gap-1 py-1.5 px-3 rounded-md font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                                                title="Delete Product"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => onEditProduct(product)} className="flex items-center gap-1 py-1.5 px-3 rounded-md font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors">
                                                <EditIcon className="w-4 h-4" /> Edit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
             {totalPages > 1 && (
                <div className="flex-shrink-0 flex justify-center items-center p-4 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium mx-4">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};
export default ProductList;
