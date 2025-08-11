import React, { useState, useEffect } from 'react';
import type { CustomerUser, ManagedOrder, SupportTicket } from '../types';

interface CustomerPortalProps {
    customer: CustomerUser;
    onLogout: () => void;
}

const CustomerPortal: React.FC<CustomerPortalProps> = ({ customer, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'support'>('orders');
    const [orders, setOrders] = useState<ManagedOrder[]>([]);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(false);

    const tabs = [
        { key: 'orders' as const, label: 'My Orders', icon: '📦' },
        { key: 'profile' as const, label: 'My Profile', icon: '👤' },
        { key: 'support' as const, label: 'Support', icon: '💬' },
    ];

    useEffect(() => {
        loadCustomerData();
    }, []);

    const loadCustomerData = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API calls
            setOrders([
                {
                    id: '1',
                    customer: {
                        name: customer.name,
                        email: customer.email
                    },
                    items: [
                        { id: '1', name: 'Product A', price: 99.99, quantity: 1 }
                    ],
                    total: 99.99,
                    status: 'Completed',
                    createdAt: new Date().toISOString(),
                    pageId: 'page-1'
                }
            ]);

            setTickets([]);
        } catch (error) {
            console.error('Error loading customer data:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderOrdersTab = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">My Orders</h2>
            
            {orders.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No orders found
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        Order #{order.id}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    order.status === 'Completed' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                        : order.status === 'Processing'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                }`}>
                                    {order.status}
                                </span>
                            </div>
                            
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Items</h4>
                                {order.items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center py-2">
                                        <div>
                                            <span className="text-slate-900 dark:text-white">{item.name}</span>
                                            <span className="text-slate-500 dark:text-slate-400 ml-2">
                                                Qty: {item.quantity}
                                            </span>
                                        </div>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                                    <div className="flex justify-between items-center font-semibold text-lg">
                                        <span className="text-slate-900 dark:text-white">Total</span>
                                        <span className="text-slate-900 dark:text-white">${order.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                    Download Receipt
                                </button>
                                <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm">
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderProfileTab = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">My Profile</h2>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={customer.name}
                            readOnly
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={customer.email}
                            readOnly
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Phone
                        </label>
                        <input
                            type="tel"
                            value={customer.phone || ''}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            placeholder="Enter your phone number"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Preferred Contact Method
                        </label>
                        <select 
                            value={customer.preferred_contact_method || 'email'}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="sms">SMS</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Update Profile
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Account Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {customer.total_orders || 0}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Total Orders</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ${(customer.total_spent || 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Total Spent</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {new Date(customer.created_at).getFullYear()}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Customer Since</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSupportTab = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Support</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    New Ticket
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h3>
                <div className="space-y-3">
                    <div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">Email Support:</span>
                        <span className="ml-2 text-blue-600 dark:text-blue-400">support@company.com</span>
                    </div>
                    <div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">Phone Support:</span>
                        <span className="ml-2 text-slate-900 dark:text-white">1-800-SUPPORT</span>
                    </div>
                    <div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">Business Hours:</span>
                        <span className="ml-2 text-slate-900 dark:text-white">Mon-Fri 9AM-5PM EST</span>
                    </div>
                </div>
            </div>

            {tickets.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No support tickets found
                </div>
            ) : (
                <div className="space-y-4">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium text-slate-900 dark:text-white">{ticket.subject}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Created {new Date(ticket.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                                    ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {ticket.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'orders':
                return renderOrdersTab();
            case 'profile':
                return renderProfileTab();
            case 'support':
                return renderSupportTab();
            default:
                return renderOrdersTab();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                                Customer Portal
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Welcome back, {customer.name}
                            </p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.key
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    renderContent()
                )}
            </div>
        </div>
    );
};

export default CustomerPortal;
