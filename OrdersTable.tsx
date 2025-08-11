import React, { useState, useMemo, useEffect } from 'react';
import type { ManagedOrder, OrderStatus, Task, ManagedPage, StripeSettings } from './src/types';
import OrderCard from './components/OrderCard';
import OrderDetailModal from './components/OrderDetailModal';
import ChevronLeftIcon from './components/icons/ChevronLeftIcon';
import ChevronRightIcon from './components/icons/ChevronRightIcon';

interface OrdersTableProps {
    orders: ManagedOrder[];
    pages: ManagedPage[];
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
    highlightedOrderId: string | null;
    onHighlightComplete: () => void;
    showPageName: boolean;
    allTasks: Task[];
    onOpenTaskModal: (task: Task | null, initialLink: any) => void;
    onUpdate: () => void;
}

const ORDER_STATUSES: OrderStatus[] = ['New Order', 'Pending Payment', 'Processing', 'Delivering', 'Completed', 'Canceled', 'Refunded'];
const ITEMS_PER_PAGE = 5;

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, pages, onUpdateStatus, highlightedOrderId, onHighlightComplete, showPageName, allTasks, onOpenTaskModal, onUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
    const [selectedOrder, setSelectedOrder] = useState<ManagedOrder | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [stripeSettingsForSelected, setStripeSettingsForSelected] = useState<StripeSettings | null>(null);

    const sortedOrders = useMemo(() => {
        return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [orders]);

    const filteredOrders = useMemo(() => {
        return sortedOrders
            .filter(order => statusFilter === 'All' || order.status === statusFilter)
            .filter(order =>
                order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
    }, [sortedOrders, searchTerm, statusFilter]);

    useEffect(() => {
        if (highlightedOrderId) {
            const orderIndex = filteredOrders.findIndex(o => o.id === highlightedOrderId);
            if (orderIndex !== -1) {
                const pageNumber = Math.ceil((orderIndex + 1) / ITEMS_PER_PAGE);
                setCurrentPage(pageNumber);

                setTimeout(() => {
                    const element = document.getElementById(`order-${highlightedOrderId}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.classList.add('transition-colors', 'duration-1000', 'bg-indigo-100', 'dark:bg-indigo-900/30');
                        setTimeout(() => {
                            element.classList.remove('bg-indigo-100', 'dark:bg-indigo-900/30');
                            onHighlightComplete();
                        }, 2000);
                    } else {
                        onHighlightComplete();
                    }
                }, 100); // Small delay to allow page transition
            } else {
                onHighlightComplete();
            }
        }
    }, [highlightedOrderId, filteredOrders, onHighlightComplete]);


    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleViewDetails = (order: ManagedOrder) => {
        const pageForOrder = pages.find(p => p.id === order.pageId);
        setStripeSettingsForSelected(pageForOrder?.data?.stripeSettings || null);
        setSelectedOrder(order);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex flex-col md:flex-row gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by customer, order ID, product..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full md:flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value as OrderStatus | 'All'); setCurrentPage(1); }}
                    className="w-full md:w-auto p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
                >
                    <option value="All">All Statuses</option>
                    {ORDER_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {paginatedOrders.length > 0 ? (
                    paginatedOrders.map(order => (
                        <div key={order.id} id={`order-${order.id}`}>
                            <OrderCard order={order} onViewDetails={handleViewDetails} onUpdateStatus={onUpdateStatus} showPageName={showPageName} />
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10">
                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No orders found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex-shrink-0 flex justify-center items-center pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium mx-4">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    allTasks={allTasks}
                    onOpenTaskModal={onOpenTaskModal}
                    onUpdate={onUpdate}
                    stripeSettings={stripeSettingsForSelected}
                />
            )}
        </div>
    );
};

export default OrdersTable;