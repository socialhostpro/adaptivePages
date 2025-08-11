
import React, { useState, useMemo, useEffect } from 'react';
import type { ManagedOrder, OrderStatus, Task, ManagedPage, StripeSettings, ManagedProduct, CrmContact } from '../src/types';
import OrderCard from './OrderCard';
import OrderDetailModal from './OrderDetailModal';
import AddOrderModal from './AddOrderModal';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import PlusIcon from './icons/PlusIcon';

interface OrdersTableProps {
    orders: ManagedOrder[];
    pages: ManagedPage[];
    products: ManagedProduct[];
    contacts: CrmContact[];
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
    onAddOrder: (order: Partial<ManagedOrder>) => void;
    highlightedOrderId: string | null;
    onHighlightComplete: () => void;
    showPageName: boolean;
    allTasks: Task[];
    onOpenTaskModal: (task: Task | null, initialLink: any) => void;
    onUpdate: () => void;
}

type SortField = 'createdAt' | 'total' | 'status' | 'customer' | 'items';
type SortDirection = 'asc' | 'desc';

const ORDER_STATUSES: OrderStatus[] = ['New Order', 'Pending Payment', 'Processing', 'Delivering', 'Completed', 'Canceled', 'Refunded'];
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

const statusColors: { [key in OrderStatus]: string } = {
    'New Order': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    'Pending Payment': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    'Processing': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    'Delivering': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Canceled': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    'Refunded': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, pages, products, contacts, onUpdateStatus, onAddOrder, highlightedOrderId, onHighlightComplete, showPageName, allTasks, onOpenTaskModal, onUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
    const [selectedOrder, setSelectedOrder] = useState<ManagedOrder | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [stripeSettingsForSelected, setStripeSettingsForSelected] = useState<StripeSettings | null>(null);
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
        setCurrentPage(1);
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const filteredAndSortedOrders = useMemo(() => {
        let filtered = orders.filter(order => {
            // Status filter
            if (statusFilter !== 'All' && order.status !== statusFilter) return false;
            
            // Search filter
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                order.customer.name.toLowerCase().includes(searchLower) ||
                order.id.toLowerCase().includes(searchLower) ||
                order.customer.email.toLowerCase().includes(searchLower) ||
                order.items.some(item => item.name.toLowerCase().includes(searchLower));
            if (!matchesSearch) return false;

            // Date filter
            const orderDate = new Date(order.createdAt);
            const now = new Date();
            switch (dateFilter) {
                case 'today':
                    if (orderDate.toDateString() !== now.toDateString()) return false;
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (orderDate < weekAgo) return false;
                    break;
                case 'month':
                    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    if (orderDate < monthAgo) return false;
                    break;
                case 'year':
                    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                    if (orderDate < yearAgo) return false;
                    break;
            }

            // Amount filter
            if (minAmount && order.total < parseFloat(minAmount)) return false;
            if (maxAmount && order.total > parseFloat(maxAmount)) return false;

            return true;
        });

        // Sort
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortField) {
                case 'createdAt':
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
                case 'total':
                    aValue = a.total;
                    bValue = b.total;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'customer':
                    aValue = a.customer.name.toLowerCase();
                    bValue = b.customer.name.toLowerCase();
                    break;
                case 'items':
                    aValue = a.items.length;
                    bValue = b.items.length;
                    break;
                default:
                    aValue = a.createdAt;
                    bValue = b.createdAt;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [orders, searchTerm, statusFilter, dateFilter, minAmount, maxAmount, sortField, sortDirection]);

    const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
    const paginatedOrders = filteredAndSortedOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        if (highlightedOrderId) {
            const orderIndex = filteredAndSortedOrders.findIndex(o => o.id === highlightedOrderId);
            if (orderIndex !== -1) {
                const pageNumber = Math.ceil((orderIndex + 1) / itemsPerPage);
                setCurrentPage(pageNumber);
                setTimeout(() => {
                    const element = document.getElementById(`order-row-${highlightedOrderId}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.classList.add('bg-blue-100', 'dark:bg-blue-900/50');
                        setTimeout(() => {
                            element.classList.remove('bg-blue-100', 'dark:bg-blue-900/50');
                            onHighlightComplete();
                        }, 3000);
                    }
                }, 100);
            }
        }
    }, [highlightedOrderId, filteredAndSortedOrders, itemsPerPage, onHighlightComplete]);

    const handleViewDetails = async (order: ManagedOrder) => {
        setSelectedOrder(order);
        const page = pages.find(p => p.id === order.pageId);
        if (page?.data?.stripeSettings) {
            setStripeSettingsForSelected(page.data.stripeSettings);
        } else {
            setStripeSettingsForSelected(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPageName = (pageId: string) => {
        const page = pages.find(p => p.id === pageId);
        return page?.name || 'Unknown Page';
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header with Add Button */}
            <div className="flex-shrink-0 flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Orders</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Order
                    </button>
                </div>
            </div>

            {/* Collapsible Filters */}
            {showFilters && (
                <div className="flex-shrink-0 mb-4">
                    <div className="flex flex-wrap gap-3 items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="flex-1 min-w-64 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value as OrderStatus | 'All'); setCurrentPage(1); }}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
                            title="Filter by status"
                        >
                            <option value="All">All Statuses</option>
                            {ORDER_STATUSES.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <select
                            value={dateFilter}
                            onChange={(e) => { setDateFilter(e.target.value as any); setCurrentPage(1); }}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
                            title="Filter by date"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Min $"
                            value={minAmount}
                            onChange={(e) => { setMinAmount(e.target.value); setCurrentPage(1); }}
                            className="w-20 px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
                        />
                        <input
                            type="number"
                            placeholder="Max $"
                            value={maxAmount}
                            onChange={(e) => { setMaxAmount(e.target.value); setCurrentPage(1); }}
                            className="w-20 px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
                        />
                        <select
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
                            title="Items per page"
                        >
                            {ITEMS_PER_PAGE_OPTIONS.map(option => (
                                <option key={option} value={option}>{option}/page</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Results Summary */}
            <div className="flex-shrink-0 flex justify-between items-center mb-4 text-sm text-slate-600 dark:text-slate-400">
                <span>
                    Showing {paginatedOrders.length} of {filteredAndSortedOrders.length} orders
                    {filteredAndSortedOrders.length !== orders.length && ` (filtered from ${orders.length} total)`}
                </span>
                <span>Page {currentPage} of {totalPages}</span>
            </div>

            {/* Content - Mobile Cards + Desktop Table */}
            <div className="flex-grow overflow-auto">
                {/* Mobile Card View */}
                <div className="block md:hidden space-y-4">
                    {paginatedOrders.map((order) => (
                        <div 
                            key={order.id} 
                            id={`order-card-${order.id}`}
                            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                                        #{order.id.slice(-8)}
                                    </div>
                                    <div className="font-medium text-slate-900 dark:text-white">
                                        {order.customer.name}
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        {order.customer.email}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                                        ${order.total.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {formatDate(order.createdAt)}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <div className="text-sm font-medium">
                                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-48">
                                        {order.items.map(item => item.name).join(', ')}
                                    </div>
                                </div>
                                <select
                                    value={order.status}
                                    onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                                    className={`px-2 py-1 text-xs font-semibold rounded-full border-none ${statusColors[order.status]}`}
                                    title="Change order status"
                                >
                                    {ORDER_STATUSES.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {showPageName && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                    Page: {getPageName(order.pageId)}
                                </div>
                            )}
                            
                            <button 
                                onClick={() => handleViewDetails(order)}
                                className="w-full px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                                👁️ View Details
                            </button>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300 sticky top-0">
                            <tr>
                                <th scope="col" className="px-4 py-3">
                                    <button 
                                        onClick={() => handleSort('createdAt')}
                                        className="flex items-center font-semibold hover:text-slate-900 dark:hover:text-white"
                                        title="Sort by date"
                                    >
                                        Date <SortIcon field="createdAt" />
                                    </button>
                                </th>
                                <th scope="col" className="px-4 py-3">Order ID</th>
                                <th scope="col" className="px-4 py-3">
                                    <button 
                                        onClick={() => handleSort('customer')}
                                        className="flex items-center font-semibold hover:text-slate-900 dark:hover:text-white"
                                        title="Sort by customer"
                                    >
                                        Customer <SortIcon field="customer" />
                                    </button>
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    <button 
                                        onClick={() => handleSort('items')}
                                        className="flex items-center font-semibold hover:text-slate-900 dark:hover:text-white"
                                        title="Sort by item count"
                                    >
                                        Items <SortIcon field="items" />
                                    </button>
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    <button 
                                        onClick={() => handleSort('total')}
                                        className="flex items-center font-semibold hover:text-slate-900 dark:hover:text-white"
                                        title="Sort by total amount"
                                    >
                                        Total <SortIcon field="total" />
                                    </button>
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    <button 
                                        onClick={() => handleSort('status')}
                                        className="flex items-center font-semibold hover:text-slate-900 dark:hover:text-white"
                                        title="Sort by status"
                                    >
                                        Status <SortIcon field="status" />
                                    </button>
                                </th>
                                {showPageName && <th scope="col" className="px-4 py-3">Page</th>}
                                <th scope="col" className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.map((order) => (
                                <tr 
                                    key={order.id} 
                                    id={`order-row-${order.id}`}
                                    className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/20 transition-colors"
                                >
                                    <td className="px-4 py-4 font-medium">
                                        {formatDate(order.createdAt)}
                                    </td>
                                    <td className="px-4 py-4 font-mono text-xs">
                                        {order.id.slice(-8)}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div>
                                            <div className="font-medium text-slate-900 dark:text-white">
                                                {order.customer.name}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {order.customer.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div>
                                            <div className="font-medium">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-32">
                                                {order.items.map(item => item.name).join(', ')}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">
                                        ${order.total.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                                            className={`px-2 py-1 text-xs font-semibold rounded-full border-none ${statusColors[order.status]}`}
                                            title="Change order status"
                                        >
                                            {ORDER_STATUSES.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                    {showPageName && (
                                        <td className="px-4 py-4 text-xs">
                                            {getPageName(order.pageId)}
                                        </td>
                                    )}
                                    <td className="px-4 py-4">
                                        <button 
                                            onClick={() => handleViewDetails(order)}
                                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                            title="View order details"
                                        >
                                            👁️ View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {paginatedOrders.length === 0 && (
                    <div className="text-center py-10">
                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No orders found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex-shrink-0 flex justify-between items-center pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedOrders.length)} of {filteredAndSortedOrders.length} results
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setCurrentPage(1)} 
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm rounded-md disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Go to first page"
                        >
                            First
                        </button>
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                            disabled={currentPage === 1}
                            className="p-2 rounded-md disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Previous page"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 text-sm rounded-md ${
                                            currentPage === pageNum
                                                ? 'bg-blue-600 text-white'
                                                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                        title={`Go to page ${pageNum}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Next page"
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setCurrentPage(totalPages)} 
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm rounded-md disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Go to last page"
                        >
                            Last
                        </button>
                    </div>
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

            <AddOrderModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={onAddOrder}
                products={products}
                contacts={contacts}
            />
        </div>
    );
};

export default OrdersTable;