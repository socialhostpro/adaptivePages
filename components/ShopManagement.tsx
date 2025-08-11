
import React, { useState, useMemo, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { ManagedOrder, OrderStatus, ManagedPage, ManagedProduct, ProductCategory, MediaFile, CrmContact, Task } from '../src/types';
import * as orderService from '../services/orderService';
import * as productService from '../services/productService';
import * as categoryService from '../services/categoryService';
import * as storageService from '../services/storageService';
import * as pageService from '../services/pageService';
import FinancialDashboard from '../FinancialDashboard';
import OrdersTable from './OrdersTable';
import LineChartIcon from './icons/LineChartIcon';
import ProductList from './ProductList';
import ComingSoon from './ComingSoon';
import AddEditProductModal from './AddEditProductModal';
import CategoryManagement from './CategoryManagement';
import CartReports from '../CartReports';

interface ShopManagementProps {
    pages: ManagedPage[];
    orders: ManagedOrder[];
    contacts: CrmContact[];
    products: ManagedProduct[];
    categories: ProductCategory[];
    media: MediaFile[];
    onUpdate: () => void;
    onSwitchMainTab: (tab: string) => void;
    session: Session;
    // Task props
    allTasks: Task[];
    team: any[]; // TeamMember[]
    onOpenTaskModal: (task?: Task | null, initialLink?: any) => void;
    onDeleteTask: (taskId: string) => void;
}

const ShopManagement: React.FC<ShopManagementProps> = (props) => {
    const { 
        pages, orders, contacts, products, categories, media, 
        onUpdate, onSwitchMainTab, session, allTasks, onOpenTaskModal
    } = props;
    const [activeTab, setActiveTab] = useState('dashboard');
    const [activeSubTab, setActiveSubTab] = useState('products');
    const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);
    
    // State for Product Modal
    const [isProductModalOpen, setProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<{product: ManagedProduct | null, type?: 'product' | 'service' | 'course'} | null>(null);

    const tabs = [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'orders', label: 'Orders' },
        { key: 'products-services', label: 'Products & Services' },
        { key: 'reports', label: 'Reports' },
    ];
    
    const subTabs = [
        { key: 'products', label: 'Products' },
        { key: 'services', label: 'Services' },
        { key: 'categories', label: 'Categories' },
    ];

    const [itemsToShow, addText, itemType] = useMemo(() => {
        switch (activeSubTab) {
            case 'services':
                return [
                    products.filter(p => p.fulfillment_type === 'On-site Service'),
                    'Add Service',
                    'service'
                ] as [ManagedProduct[], string, 'service'];
            case 'products':
            default:
                return [
                    products.filter(p => p.fulfillment_type === 'Shippable' || p.fulfillment_type === 'Digital'),
                    'Add Product',
                    'product'
                ] as [ManagedProduct[], string, 'product'];
        }
    }, [products, activeSubTab]);

    const handleNavigateToOrder = (orderId: string) => {
        setActiveTab('orders');
        setHighlightedOrderId(orderId);
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await orderService.updateOrderStatus(parseInt(orderId, 10), newStatus);
            onUpdate(); 
        } catch (error) {
            console.error("Failed to update order status:", error);
            alert("Could not update order status. Please try again.");
        }
    };

    const handleAddOrder = async (orderData: Partial<ManagedOrder>) => {
        try {
            // Add order logic here - you may need to implement this in your orderService
            console.log('Adding order:', orderData);
            onUpdate();
        } catch (error) {
            console.error("Failed to add order:", error);
            alert("Could not add order. Please try again.");
        }
    };
    
    const handleNavigation = (tab: string, subTab?: string) => {
        if (tab === 'main-bookings') {
            onSwitchMainTab('bookings');
        } else if (tab === 'main-videowall') {
            onSwitchMainTab('videowall');
        } else {
            setActiveTab(tab);
            if (subTab) {
                setActiveSubTab(subTab);
            }
        }
    };
    
    const handleUploadFile = async (file: File) => {
        await storageService.uploadAndAnalyzeFile(session.user.id, file);
        onUpdate();
    };

    // --- Product Management Handlers ---
    const handleAddProduct = (type: 'product' | 'service' | 'course') => {
        setEditingProduct({ product: null, type });
        setProductModalOpen(true);
    };

    const handleEditProduct = (product: ManagedProduct) => {
        let type: 'product' | 'service' | 'course' = 'product';
        if(product.fulfillment_type === 'On-site Service') type = 'service';
        if(product.fulfillment_type === 'VideoCourse') type = 'course';
        setEditingProduct({ product, type });
        setProductModalOpen(true);
    };

    const handleSaveProduct = async (productData: Omit<ManagedProduct, 'id' | 'user_id' | 'created_at'>, productId?: string) => {
        if (productId) { // Existing product
            await productService.updateProduct(productId, productData);
        } else { // New product
            await productService.createProduct(session.user.id, productData);
        }
        
        onUpdate();
        setProductModalOpen(false);
    };

    const handleDeleteProduct = async (product: ManagedProduct) => {
        if (!confirm(`Are you sure you want to delete "${product.name}"? This cannot be undone.`)) return;

        // Before deleting the product, we need to remove it from any pages that are using it.
        await pageService.removeProductIdFromPages(product.id);

        await productService.deleteProduct(product.id);
        onUpdate();
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard': return <FinancialDashboard orders={orders} products={products} />;
            case 'orders': return <OrdersTable pages={pages} orders={orders} products={products} contacts={contacts} onUpdateStatus={handleUpdateOrderStatus} onAddOrder={handleAddOrder} highlightedOrderId={highlightedOrderId} onHighlightComplete={() => setHighlightedOrderId(null)} showPageName={true} allTasks={allTasks} onOpenTaskModal={onOpenTaskModal} onUpdate={onUpdate} />;
            case 'products-services':
                return (
                     <div className="h-full flex flex-col">
                        <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700">
                            <nav className="-mb-px flex space-x-6">
                                {subTabs.map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveSubTab(tab.key)}
                                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                                            activeSubTab === tab.key
                                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="flex-grow pt-6 min-h-0">
                            {activeSubTab === 'categories' ? (
                                <CategoryManagement userId={session.user.id} categories={categories} onUpdate={onUpdate} />
                            ) : (
                                <ProductList
                                    products={itemsToShow}
                                    onAddProduct={() => handleAddProduct(itemType)}
                                    onEditProduct={handleEditProduct}
                                    onDeleteProduct={handleDeleteProduct}
                                    addText={addText}
                                />
                            )}
                        </div>
                    </div>
                )
            case 'reports': return <CartReports orders={orders} products={products} />;
            default: return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <nav className="-mb-px flex space-x-6 px-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.key
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex-grow pt-6 min-h-0">
                {renderContent()}
            </div>
            
            {isProductModalOpen && (
                <AddEditProductModal
                    isOpen={isProductModalOpen}
                    onClose={() => setProductModalOpen(false)}
                    onSave={handleSaveProduct}
                    productToEdit={editingProduct?.product || null}
                    newItemType={editingProduct?.type}
                    categories={categories}
                    mediaLibrary={media}
                    onUploadFile={handleUploadFile}
                    userId={session.user.id}
                    onCategoriesUpdate={onUpdate}
                    allTasks={allTasks}
                    onOpenTaskModal={onOpenTaskModal}
                />
            )}
        </div>
    );
};

export default ShopManagement;