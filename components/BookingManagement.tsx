
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { ManagedBooking, BookingStatus, ManagedPage, Task } from '../src/types';
import BookingCalendarView from './BookingCalendarView';
import BookingList from './BookingList';
import BookingDetailModal from './BookingDetailModal';
import * as bookingService from '../services/bookingService';
import * as pageService from '../services/pageService';
import * as orderService from '../services/orderService';
import type { Session } from '@supabase/supabase-js';
import LoaderIcon from './icons/LoaderIcon';
import BookingSettingsView from './BookingSettingsView';

interface BookingManagementProps {
    session: Session;
    pages: ManagedPage[];
    onUpdatePage: () => void;
    bookings: ManagedBooking[];
    allTasks: Task[];
    onOpenTaskModal: (task?: Task | null, initialLink?: any) => void;
}


const BookingManagement: React.FC<BookingManagementProps> = ({ session, pages, onUpdatePage, bookings, allTasks, onOpenTaskModal }) => {
    const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month' | 'list' | 'settings'>('day');
    const [selectedBooking, setSelectedBooking] = useState<ManagedBooking | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [selectedPage, setSelectedPage] = useState<ManagedPage | null>(null);
    
    const bookingPages = useMemo(() => pages.filter(p => p.data?.bookingSettings || p.data?.booking || p.data?.bookingSystemSettings), [pages]);
    const bookingsForPage = useMemo(() => bookings.filter(b => b.pageId === selectedPageId), [bookings, selectedPageId]);

    useEffect(() => {
        if (bookingPages.length > 0 && !selectedPageId) {
            setSelectedPageId(bookingPages[0].id);
        }
    }, [bookingPages, selectedPageId]);
    
    useEffect(() => {
        if (selectedPageId) {
            const page = pages.find(p => p.id === selectedPageId);
            setSelectedPage(page || null);
        }
    }, [selectedPageId, pages]);


    const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
        let bookingToUpdate = bookings.find(b => b.id === bookingId);
        if (!bookingToUpdate) return;
        
        if (newStatus === 'Confirmed' && bookingToUpdate.price > 0 && !bookingToUpdate.orderId) {
            try {
                const newOrder = await orderService.createOrderFromBooking(bookingToUpdate);
                bookingToUpdate = { ...bookingToUpdate, status: newStatus, orderId: String(newOrder.id) };
            } catch (error) {
                console.error("Failed to create order from booking:", error);
                alert("Could not create invoice for this booking. Please try again.");
                return; 
            }
        } else {
            bookingToUpdate = { ...bookingToUpdate, status: newStatus };
        }
        
        await bookingService.updateBookingStatus(bookingToUpdate.id, newStatus, bookingToUpdate.orderId || null);
        
        if (selectedBooking?.id === bookingId) {
            setSelectedBooking(bookingToUpdate);
        }
        onUpdatePage(); // Refresh all data
    };
    
    const handleSaveSettings = async (newPageData: ManagedPage['data']) => {
        if (!selectedPage) return;
        
        const pageToSave: ManagedPage = { ...selectedPage, data: newPageData };
        await pageService.savePage(pageToSave);
        setSelectedPage(pageToSave);
        onUpdatePage(); // Refresh pages list in dashboard
        alert("Settings saved!");
    };
    
    const tabs = [
        { key: 'day', label: "Today's Calendar" },
        { key: 'week', label: 'Week' },
        { key: 'month', label: 'Month' },
        { key: 'list', label: 'All Bookings' },
        { key: 'settings', label: 'Settings' },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <nav className="-mb-px flex space-x-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
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
                 <select
                    value={selectedPageId || ''}
                    onChange={e => setSelectedPageId(e.target.value)}
                    className="p-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
                    disabled={bookingPages.length === 0}
                >
                    {bookingPages.length === 0 ? (
                        <option>No pages with booking enabled</option>
                    ) : (
                       bookingPages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                    )}
                </select>
            </div>
            <div className="flex-grow pt-6 min-h-0">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full"><LoaderIcon className="w-8 h-8"/></div>
                ) : activeTab === 'settings' ? (
                     selectedPage?.data ? <BookingSettingsView page={selectedPage} onSave={handleSaveSettings} /> : <p>Select a page to configure settings.</p>
                ) : activeTab === 'list' ? (
                    <BookingList 
                        bookings={bookingsForPage} 
                        onViewDetails={setSelectedBooking}
                    />
                ) : (
                    <BookingCalendarView
                        view={activeTab}
                        bookings={bookingsForPage}
                        onViewDetails={setSelectedBooking}
                    />
                )}
            </div>
            {selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    isOpen={!!selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onUpdateStatus={handleUpdateStatus}
                    allTasks={allTasks}
                    onOpenTaskModal={onOpenTaskModal}
                />
            )}
        </div>
    );
};

export default BookingManagement;