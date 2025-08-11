
import React, { useMemo } from 'react';
import type { ManagedOrder, ManagedProduct, OrderStatus } from './src/types';
import DollarSignIcon from './components/icons/DollarSignIcon';
import TrendingUpIcon from './components/icons/TrendingUpIcon';
import ClipboardListIcon from './components/icons/ClipboardListIcon';

interface CartReportsProps {
    orders: ManagedOrder[];
    products: ManagedProduct[];
}

const StatCard = ({ title, value }: { title: string, value: string }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
    </div>
);

const CartReports: React.FC<CartReportsProps> = ({ orders, products }) => {
    
    const reportData = useMemo(() => {
        const completedOrders = orders.filter(o => o.status === 'Completed');
        const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
        const totalSales = completedOrders.length;
        const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

        const productSales = new Map<string, { count: number, revenue: number }>();
        orders.forEach(order => {
            order.items.forEach(item => {
                const existing = productSales.get(item.name) || { count: 0, revenue: 0 };
                productSales.set(item.name, {
                    count: existing.count + item.quantity,
                    revenue: existing.revenue + (item.finalPrice * item.quantity),
                });
            });
        });
        
        const topProducts = [...productSales.entries()]
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 5)
            .map(([name, data]) => ({ name, ...data }));
            
        const salesByStatus = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as Record<OrderStatus, number>);
        
        const maxStatusCount = Math.max(0, ...Object.values(salesByStatus).map(v => Number(v)));

        return { totalRevenue, totalSales, averageOrderValue, topProducts, salesByStatus, maxStatusCount };
    }, [orders]);

    const statusColors: Record<OrderStatus, string> = {
        'New Order': 'bg-blue-500',
        'Processing': 'bg-yellow-500',
        'Delivering': 'bg-purple-500',
        'Completed': 'bg-green-500',
        'Canceled': 'bg-red-500',
        'Refunded': 'bg-gray-500',
        'Pending Payment': 'bg-orange-500',
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Revenue" value={`$${reportData.totalRevenue.toFixed(2)}`} />
                <StatCard title="Total Sales" value={reportData.totalSales.toString()} />
                <StatCard title="Average Order Value" value={`$${reportData.averageOrderValue.toFixed(2)}`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top Selling Products</h3>
                    <ul className="space-y-3">
                        {reportData.topProducts.map(product => (
                            <li key={product.name} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-700 dark:text-slate-200">{product.name}</span>
                                <span className="font-semibold text-slate-500 dark:text-slate-400">{product.count} sold</span>
                            </li>
                        ))}
                    </ul>
                     {reportData.topProducts.length === 0 && <p className="text-center text-sm text-slate-400 py-4">No sales data yet.</p>}
                </div>
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Sales by Status</h3>
                    <div className="space-y-3">
                        {Object.entries(reportData.salesByStatus).map(([status, count]) => (
                             <div key={status} className="flex items-center gap-3 text-sm">
                                <span className="w-28 font-medium text-slate-700 dark:text-slate-300">{status}</span>
                                <div className="flex-grow bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                                    <div 
                                        className={`${statusColors[status as OrderStatus]} h-4 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold`} 
                                        style={{ width: `${reportData.maxStatusCount > 0 ? (Number(count) / reportData.maxStatusCount) * 100 : 0}%` }}
                                    >
                                        {count}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartReports;
