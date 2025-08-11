

import React, { useState } from 'react';
import type { ManagedBooking, BookingStatus, Task } from '../src/types';
import XIcon from './icons/XIcon';
import UserCheckIcon from './icons/UserCheckIcon';
import UserXIcon from './icons/UserXIcon';
import ClockIcon from './icons/ClockIcon';
import LoaderIcon from './icons/LoaderIcon';
import AssociatedTasks from './AssociatedTasks';

interface BookingDetailModalProps {
    booking: ManagedBooking;
    isOpen: boolean;
    onClose: () => void;
    onUpdateStatus: (bookingId: string, newStatus: BookingStatus) => Promise<void>;
    // Task props
    allTasks?: Task[];
    onOpenTaskModal?: (task: Task | null, initialLink: any) => void;
}

const statusInfo: { [key in ManagedBooking['status']]: { text: string, color: string, icon: React.ElementType } } = {
    'Pending': { text: 'This booking is awaiting confirmation.', color: 'text-yellow-600 dark:text-yellow-400', icon: ClockIcon },
    'Confirmed': { text: 'This booking has been confirmed.', color: 'text-green-600 dark:text-green-400', icon: UserCheckIcon },
    'Canceled': { text: 'This booking has been canceled.', color: 'text-red-600 dark:text-red-400', icon: UserXIcon },
};

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ booking, isOpen, onClose, onUpdateStatus, allTasks = [], onOpenTaskModal }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;
    
    const StatusIcon = statusInfo[booking.status].icon;

    const handleAction = async (newStatus: BookingStatus) => {
        setIsProcessing(true);
        await onUpdateStatus(booking.id, newStatus);
        setIsProcessing(false);
    };

     // --- Task Handlers ---
    const handleAddTask = () => {
        onOpenTaskModal && onOpenTaskModal(null, { type: 'booking', id: booking.id });
    };

    const handleEditTask = (task: Task) => {
        onOpenTaskModal && onOpenTaskModal(task, null);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Booking Details</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">ID: {booking.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <XIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto space-y-6">
                    <div className={`p-4 rounded-lg flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50`}>
                        <StatusIcon className={`w-6 h-6 ${statusInfo[booking.status].color}`} />
                        <p className={`font-semibold ${statusInfo[booking.status].color}`}>{statusInfo[booking.status].text}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Customer</h3>
                            <p className="text-slate-900 dark:text-white">{booking.customer.name}</p>
                            <a href={`mailto:${booking.customer.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{booking.customer.email}</a>
                            {booking.customer.phone && <p className="text-slate-500 dark:text-slate-400">{booking.customer.phone}</p>}
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Appointment</h3>
                            <p className="text-slate-900 dark:text-white font-semibold">{booking.serviceName}</p>
                            <p className="text-slate-600 dark:text-slate-300">{new Date(booking.bookingDate).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{booking.duration} minutes</p>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-slate-700 dark:text-slate-300">Invoice Details</h3>
                        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border dark:border-slate-700">
                            <div className="flex justify-between items-center">
                                <span>Service Cost</span>
                                <span className="font-bold text-lg text-slate-900 dark:text-white">${booking.price.toFixed(2)}</span>
                            </div>
                            {booking.orderId && (
                                <div className="flex justify-between items-center text-sm mt-1 pt-1 border-t dark:border-slate-600">
                                     <span>Order ID</span>
                                     <span className="font-semibold text-indigo-600 dark:text-indigo-400">#{booking.orderId}</span>
                                </div>
                            )}
                        </div>
                    </div>

                     {booking.notes && (
                        <div>
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Notes</h3>
                            <p className="text-slate-600 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md border dark:border-slate-700">{booking.notes}</p>
                        </div>
                     )}
                     
                    {onOpenTaskModal && (
                        <AssociatedTasks
                            entityType="booking"
                            entityId={booking.id}
                            allTasks={allTasks}
                            onAddTask={handleAddTask}
                            onEditTask={handleEditTask}
                        />
                    )}
                </main>
                 {booking.status === 'Pending' && (
                    <footer className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex-shrink-0 flex justify-end items-center gap-3">
                        <button onClick={() => handleAction('Canceled')} disabled={isProcessing} className="py-2 px-4 rounded-md font-semibold text-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900 disabled:opacity-50">
                           {isProcessing ? <LoaderIcon className="w-5 h-5" /> : 'Decline'}
                        </button>
                        <button onClick={() => handleAction('Confirmed')} disabled={isProcessing} className="py-2 px-4 rounded-md font-semibold text-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                           {isProcessing ? <LoaderIcon className="w-5 h-5" /> : 'Accept Booking'}
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default BookingDetailModal;