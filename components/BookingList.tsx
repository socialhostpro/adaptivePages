

import React, { useState, useMemo } from 'react';
import type { ManagedBooking, BookingStatus } from '../src/types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface BookingListProps {
    bookings: ManagedBooking[];
    onViewDetails: (booking: ManagedBooking) => void;
}

const ITEMS_PER_PAGE = 10;

const statusColors: { [key in ManagedBooking['status']]: string } = {
    'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    'Confirmed': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Canceled': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

const BookingList: React.FC<BookingListProps> = ({ bookings, onViewDetails }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const sortedBookings = useMemo(() => {
        return [...bookings].sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        return sortedBookings.filter(b => 
            b.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sortedBookings, searchTerm]);

    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
    const paginatedBookings = filteredBookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 mb-4">
                 <input
                    type="text"
                    placeholder="Search by customer or service..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full md:w-1/2 p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
                />
            </div>
            <div className="flex-grow overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3">Service</th>
                            <th scope="col" className="px-6 py-3">Date & Time</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedBookings.map(booking => (
                            <tr key={booking.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/20">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{booking.customer.name}</td>
                                <td className="px-6 py-4">{booking.serviceName}</td>
                                <td className="px-6 py-4">{new Date(booking.bookingDate).toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[booking.status]}`}>{booking.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => onViewDetails(booking)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {paginatedBookings.length === 0 && (
                    <div className="text-center py-10">
                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No bookings found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search criteria.</p>
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
        </div>
    );
};

export default BookingList;