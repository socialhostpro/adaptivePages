import React, { useState } from 'react';
import type { ManagedOrder, OrderStatus, ManagedProduct, CrmContact } from '../src/types';
import XIcon from './icons/XIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

interface AddOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (order: Partial<ManagedOrder>) => void;
    products: ManagedProduct[];
    contacts: CrmContact[];
}

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

const AddOrderModal: React.FC<AddOrderModalProps> = ({ isOpen, onClose, onSubmit, products = [], contacts = [] }) => {
    const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [status, setStatus] = useState<OrderStatus>('New Order');
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Update customer fields when contact is selected
    const handleContactSelection = (contactId: number) => {
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
            setSelectedContactId(contactId);
            setCustomerName(contact.name || '');
            setCustomerEmail(contact.email || '');
        }
    };

    const addItem = () => {
        setItems([...items, { productId: '', name: '', price: 0, quantity: 1 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
        const newItems = [...items];
        if (field === 'productId' && typeof value === 'string') {
            const product = products.find(p => p.id === value);
            if (product) {
                newItems[index] = {
                    ...newItems[index],
                    productId: value,
                    name: product.name,
                    price: product.price
                };
            }
        } else {
            newItems[index] = { ...newItems[index], [field]: value };
        }
        setItems(newItems);
    };

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName || !customerEmail || items.length === 0) return;

        setLoading(true);
        try {
            const order: Partial<ManagedOrder> = {
                customer: {
                    name: customerName,
                    email: customerEmail
                },
                items: items.map(item => ({
                    id: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                total,
                status,
                createdAt: new Date().toISOString(),
                pageId: '' // Will be set by parent component
            };

            onSubmit(order);
            
            // Reset form
            setSelectedContactId(null);
            setCustomerName('');
            setCustomerEmail('');
            setStatus('New Order');
            setItems([]);
            onClose();
        } catch (error) {
            console.error('Error creating order:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Add New Order</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Customer Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Customer Information</h3>
                        
                        {/* Contact Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Select from CRM Contacts
                            </label>
                            <select
                                value={selectedContactId || ''}
                                onChange={(e) => {
                                    const contactId = e.target.value ? parseInt(e.target.value) : null;
                                    if (contactId) {
                                        handleContactSelection(contactId);
                                    } else {
                                        setSelectedContactId(null);
                                        setCustomerName('');
                                        setCustomerEmail('');
                                    }
                                }}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                            >
                                <option value="">Select a contact...</option>
                                {contacts.map(contact => (
                                    <option key={contact.id} value={contact.id}>
                                        {contact.name} - {contact.email} ({contact.status})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Manual Entry Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                                    placeholder="Enter name or select from contacts above"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                                    placeholder="Enter email or select from contacts above"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                            >
                                <option value="New Order">New Order</option>
                                <option value="Pending Payment">Pending Payment</option>
                                <option value="Processing">Processing</option>
                                <option value="Delivering">Delivering</option>
                                <option value="Completed">Completed</option>
                                <option value="Canceled">Canceled</option>
                                <option value="Refunded">Refunded</option>
                            </select>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Order Items</h3>
                        </div>

                        {/* Product Selection Grid */}
                        <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Available Products</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                                {products && products.length > 0 ? (
                                    products.map(product => {
                                        const isAdded = items.some(item => item.productId === product.id);
                                        return (
                                            <div
                                                key={product.id}
                                                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                                    isAdded
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                                                }`}
                                                onClick={() => {
                                                    if (!isAdded) {
                                                        setItems([...items, {
                                                            productId: product.id,
                                                            name: product.name,
                                                            price: product.price,
                                                            quantity: 1
                                                        }]);
                                                    }
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                                        isAdded
                                                            ? 'bg-blue-500 border-blue-500 text-white'
                                                            : 'border-slate-300 dark:border-slate-600'
                                                    }`}>
                                                        {isAdded && '✓'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm text-slate-900 dark:text-white">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                                            ${product.price.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full text-center py-8 text-slate-500 dark:text-slate-400">
                                        No products available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selected Items */}
                        {items.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                                Click on products above to add them to the order.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Selected Items</h4>
                                {items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">${item.price.toFixed(2)} each</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-slate-600 dark:text-slate-400">Qty:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                className="w-16 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                                            />
                                        </div>
                                        <div className="w-20 text-right font-medium text-slate-900 dark:text-white">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                            title="Remove item"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {items.length > 0 && (
                            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-600">
                                <div className="text-xl font-bold text-slate-900 dark:text-white">
                                    Total: ${total.toFixed(2)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-600">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !customerName || !customerEmail || items.length === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddOrderModal;
