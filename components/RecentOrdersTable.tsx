import React from 'react';
import type { ManagedOrder } from '../types';

interface RecentOrdersTableProps {
    orders: ManagedOrder[];
}

const statusColors: { [key in ManagedOrder['status']]: string } = {
    'New Order': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    'Pending Payment': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    'Processing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    'Delivering': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Canceled': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    'Refunded': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({ orders }) => {
    const recentOrders = orders.slice(0, 5);

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Sales</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Order ID</th>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Total</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {recentOrders.map(order => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">#{order.id}</td>
                                <td className="px-6 py-4">{order.customer.name}</td>
                                <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-semibold">${order.total.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {recentOrders.length === 0 && <p className="text-center py-8 text-slate-500">No recent sales.</p>}
            </div>
        </div>
    );
};

export default RecentOrdersTable;
