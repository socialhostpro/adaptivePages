

import React, { useState, useMemo } from 'react';
import type { ManagedBooking } from '../src/types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface BookingCalendarViewProps {
    view: 'day' | 'week' | 'month';
    bookings: ManagedBooking[];
    onViewDetails: (booking: ManagedBooking) => void;
}

const statusColors: { [key in ManagedBooking['status']]: { bg: string, border: string } } = {
    'Pending': { bg: 'bg-yellow-100 dark:bg-yellow-900/50', border: 'border-l-4 border-yellow-500' },
    'Confirmed': { bg: 'bg-green-100 dark:bg-green-900/50', border: 'border-l-4 border-green-500' },
    'Canceled': { bg: 'bg-red-100 dark:bg-red-900/50', border: 'border-l-4 border-red-500' },
};

const getDayName = (date: Date, format: 'short' | 'long' = 'short') => date.toLocaleDateString(undefined, { weekday: format });
const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

const BookingCalendarView: React.FC<BookingCalendarViewProps> = ({ view, bookings, onViewDetails }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const navigateDate = (amount: number) => {
        const newDate = new Date(currentDate);
        if (view === 'day') newDate.setDate(newDate.getDate() + amount);
        if (view === 'week') newDate.setDate(newDate.getDate() + (amount * 7));
        if (view === 'month') newDate.setMonth(newDate.getMonth() + amount);
        setCurrentDate(newDate);
    };

    const headerTitle = useMemo(() => {
        if (view === 'day') return currentDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (view === 'week') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            return `${startOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
        return currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }, [currentDate, view]);

    const renderDayView = () => {
        const dayBookings = bookings.filter(b => isSameDay(new Date(b.bookingDate), currentDate));
        const timeSlots = Array.from({ length: 12 }, (_, i) => 8 + i); // 8am to 7pm

        return (
            <div className="border-t border-slate-200 dark:border-slate-700">
                {timeSlots.map(hour => (
                    <div key={hour} className="flex border-b border-slate-200 dark:border-slate-700 min-h-[80px]">
                        <div className="w-20 text-right p-2 text-sm text-slate-500 dark:text-slate-400">
                            {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                        </div>
                        <div className="flex-1 border-l border-slate-200 dark:border-slate-700 p-2 space-y-2">
                            {dayBookings.filter(b => new Date(b.bookingDate).getHours() === hour).map(booking => (
                                <button key={booking.id} onClick={() => onViewDetails(booking)} className={`w-full text-left p-2 rounded-lg text-sm ${statusColors[booking.status].bg} ${statusColors[booking.status].border}`}>
                                    <p className="font-bold text-slate-800 dark:text-white">{booking.serviceName}</p>
                                    <p className="text-slate-600 dark:text-slate-300">{booking.customer.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };
    
    const renderWeekView = () => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const days = Array.from({length: 7}, (_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);
            return date;
        });

        return (
            <div className="grid grid-cols-7 border-t border-l border-slate-200 dark:border-slate-700">
                {days.map(day => (
                    <div key={day.toISOString()} className="border-r border-b border-slate-200 dark:border-slate-700 min-h-[120px] flex flex-col">
                        <div className="text-center font-semibold p-2 border-b border-slate-200 dark:border-slate-700">
                            <span className="text-xs">{getDayName(day, 'short').toUpperCase()}</span>
                            <p className={`text-lg ${isSameDay(day, new Date()) ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}`}>{day.getDate()}</p>
                        </div>
                        <div className="p-2 space-y-2 flex-grow">
                            {bookings.filter(b => isSameDay(new Date(b.bookingDate), day)).map(booking => (
                                <button key={booking.id} onClick={() => onViewDetails(booking)} className={`w-full text-left p-1 rounded-md text-xs ${statusColors[booking.status].bg} ${statusColors[booking.status].border}`}>
                                    <p className="font-bold text-slate-800 dark:text-white truncate">{new Date(booking.bookingDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                    <p className="text-slate-600 dark:text-slate-300 truncate">{booking.customer.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderMonthView = () => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = Array(firstDay).fill(null).concat(Array.from({length: daysInMonth}, (_, i) => i + 1));
        
        return (
            <div className="grid grid-cols-7 border-t border-l border-slate-200 dark:border-slate-700">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="p-2 text-center font-bold text-sm text-slate-600 dark:text-slate-300 border-r border-b dark:border-slate-700">{day}</div>)}
                {days.map((day, index) => (
                    <div key={index} className="border-r border-b border-slate-200 dark:border-slate-700 h-32 flex flex-col">
                        {day && (
                            <>
                                <div className={`p-1 text-sm ${isSameDay(new Date(year, month, day), new Date()) ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}`}>{day}</div>
                                <div className="p-1 space-y-1 overflow-y-auto">
                                    {bookings.filter(b => isSameDay(new Date(b.bookingDate), new Date(year, month, day))).map(booking => (
                                        <button key={booking.id} onClick={() => onViewDetails(booking)} className={`w-full text-left text-[10px] rounded-sm ${statusColors[booking.status].bg} ${statusColors[booking.status].border} px-1`}>
                                            <p className="font-semibold text-slate-800 dark:text-white truncate">{booking.customer.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        )
    };
    
    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{headerTitle}</h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigateDate(-1)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <button onClick={() => setCurrentDate(new Date())} className="text-sm font-semibold px-4 py-2 rounded-md border dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">Today</button>
                    <button onClick={() => navigateDate(1)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronRightIcon className="w-5 h-5" /></button>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                {view === 'day' && renderDayView()}
                {view === 'week' && renderWeekView()}
                {view === 'month' && renderMonthView()}
            </div>
        </div>
    );
};

export default BookingCalendarView;