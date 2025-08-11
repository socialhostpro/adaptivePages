
import React from 'react';
import type { ManagedOrder, OrderStatus } from '../src/types';
import MailIcon from './icons/MailIcon';
import PhoneIcon from './icons/PhoneIcon';

interface OrderCardProps {
    order: ManagedOrder;
    onViewDetails: (order: ManagedOrder) => void;
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
    showPageName: boolean;
}

const ORDER_STATUSES: OrderStatus[] = ['New Order', 'Pending Payment', 'Processing', 'Delivering', 'Completed', 'Canceled', 'Refunded'];

const statusColors: { [key in ManagedOrder['status']]: string } = {
    'New Order': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    'Pending Payment': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-700',
    'Processing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
    'Delivering': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-700',
    'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700',
    'Canceled': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700',
    'Refunded': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onViewDetails, onUpdateStatus, showPageName }) => {
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-lg text-slate-900 dark:text-white">Order #{order.id}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                 <select 
                    value={order.status} 
                    onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                    onClick={(e) => e.stopPropagation()}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[order.status]} appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                 >
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t border-b dark:border-slate-700 py-3">
                <div>
                    <p className="font-semibold text-slate-600 dark:text-slate-300">Owner</p>
                    <p className="text-slate-800 dark:text-slate-100">{order.customer.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                        <a href={`mailto:${order.customer.email}`} onClick={e => e.stopPropagation()} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" title={`Email ${order.customer.email}`}>
                            <MailIcon className="w-4 h-4 text-slate-500" />
                        </a>
                        {order.customer.phone && (
                            <a href={`tel:${order.customer.phone}`} onClick={e => e.stopPropagation()} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" title={`Call ${order.customer.phone}`}>
                                <PhoneIcon className="w-4 h-4 text-slate-500" />
                            </a>
                        )}
                    </div>
                </div>
                 {showPageName && (
                    <div>
                        <p className="font-semibold text-slate-600 dark:text-slate-300">Page</p>
                        <p className="text-slate-800 dark:text-slate-100">{order.pageName}</p>
                    </div>
                )}
            </div>

            <div>
                <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">Features ({totalItems} items)</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={order.items.map(i => i.name).join(', ')}>
                    {order.items.map(i => i.name).join(', ')}
                </p>
            </div>

            <div className="flex justify-between items-center pt-3">
                 <p className="text-2xl font-bold text-slate-900 dark:text-white">${order.total.toFixed(2)}</p>
                <button onClick={() => onViewDetails(order)} className="py-2 px-4 rounded-md text-sm font-semibold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30">
                    View Invoice
                </button>
            </div>
        </div>
    );
};

export default OrderCard;
