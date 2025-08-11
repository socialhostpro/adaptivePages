

import React, { useMemo } from 'react';
import type { ManagedOrder, ManagedProduct } from './types';
import DollarSignIcon from './components/icons/DollarSignIcon';
import TrendingUpIcon from './components/icons/TrendingUpIcon';
import ClipboardListIcon from './components/icons/ClipboardListIcon';
import PackageIcon from './components/icons/PackageIcon';
import RecentOrdersTable from './components/RecentOrdersTable';
import ComingSoon from './components/ComingSoon';
import LineChartIcon from './components/icons/LineChartIcon';

interface CartDashboardProps {
    orders: ManagedOrder[];
    products: ManagedProduct[];
}

const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string, icon: React.ElementType, description: string }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-500/20 p-3 rounded-full">
                <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{description}</p>
    </div>
);


const CartDashboard: React.FC<CartDashboardProps> = ({ orders, products }) => {
    
    const stats = useMemo(() => {
        const totalRevenue = orders
            .filter(o => o.status === 'Completed')
            .reduce((sum, o) => sum + o.total, 0);
        
        const pendingRevenue = orders
            .filter(o => ['New Order', 'Processing', 'Delivering', 'Pending Payment'].includes(o.status))
            .reduce((sum, o) => sum + o.total, 0);

        return {
            totalRevenue,
            pendingRevenue,
            totalSales: orders.length,
            totalProducts: products.length,
        };
    }, [orders, products]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value={`$${stats.totalRevenue.toFixed(2)}`}
                    icon={DollarSignIcon} 
                    description="From all completed orders."
                />
                <StatCard 
                    title="Pending Revenue" 
                    value={`$${stats.pendingRevenue.toFixed(2)}`}
                    icon={TrendingUpIcon} 
                    description="From orders in progress."
                />
                <StatCard 
                    title="Total Sales" 
                    value={stats.totalSales.toString()}
                    icon={ClipboardListIcon}
                    description="Total number of orders received."
                />
                <StatCard 
                    title="Total Products" 
                    value={stats.totalProducts.toString()}
                    icon={PackageIcon}
                    description="All products and services."
                />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md h-96">
                <ComingSoon 
                    title="Sales Analytics" 
                    message="Detailed charts showing revenue, sales trends, and top products are coming soon."
                    icon={LineChartIcon}
                />
            </div>

            <RecentOrdersTable orders={orders} />
        </div>
    );
};

export default CartDashboard;