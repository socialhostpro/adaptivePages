



import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ManagedPage, ManagedProduct, BookingSystemSettings, BusinessHour } from '../src/types';
import * as bookingService from '../services/bookingService';
import LoaderIcon from './icons/LoaderIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import XIcon from './icons/XIcon';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    page: ManagedPage;
    services: ManagedProduct[];
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, page, services }) => {
    const [existingBookings, setExistingBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedService, setSelectedService] = useState<ManagedProduct | null>(services[0] || null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    
    const [customerDetails, setCustomerDetails] = useState({ name: '', email: '', phone: '', notes: '' });
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const settings = useMemo(() => page?.data?.bookingSystemSettings, [page]);

    useEffect(() => {
        if (isOpen && page) {
            setIsLoading(true);
            bookingService.getBookingsForPage(page.id).then(bookings => {
                setExistingBookings(bookings);
                setIsLoading(false);
            });
             // Reset state when opening
            setSelectedDate(null);
            setSelectedTime(null);
            setCustomerDetails({ name: '', email: '', phone: '', notes: '' });
            setBookingStatus('idle');
            if (services.length > 0 && !selectedService) {
                setSelectedService(services[0]);
            }

        }
    }, [isOpen, page, services, selectedService]);

    const availableTimeSlots = useMemo(() => {
        if (!selectedDate || !settings || !selectedService) return [];
        const slots: string[] = [];
        const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }) as BusinessHour['day'];
        const businessHour = settings.businessHours.find(h => h.day === dayOfWeek);

        if (!businessHour || !businessHour.enabled) return [];
        
        const [startHour, startMinute] = businessHour.startTime.split(':').map(Number);
        const [endHour, endMinute] = businessHour.endTime.split(':').map(Number);
        const slotDuration = selectedService.options?.find(o => o.name.toLowerCase() === 'duration')?.values[0]?.priceModifier || settings.slotDuration;

        let currentTime = new Date(selectedDate);
        currentTime.setHours(startHour, startMinute, 0, 0);
        
        const endTime = new Date(selectedDate);
        endTime.setHours(endHour, endMinute, 0, 0);

        while (currentTime < endTime) {
            const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
            if (slotEnd > endTime) break;

            const isBooked = existingBookings.some(b => {
                const bookingStart = new Date(b.bookingDate);
                const bookingEnd = new Date(bookingStart.getTime() + b.duration * 60000);
                return (currentTime < bookingEnd && slotEnd > bookingStart);
            });
            
            if (!isBooked) {
                slots.push(currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            }
            
            currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
        }

        return slots;
    }, [selectedDate, settings, existingBookings, selectedService]);
    
    const handleDateSelect = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newDate);
        setSelectedTime(null);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!page || !selectedService || !selectedDate || !selectedTime) return;
        
        setBookingStatus('loading');
        try {
            const [hourStr, minuteStr] = selectedTime.split(/:| /);
            let hour = parseInt(hourStr, 10);
            if (selectedTime.includes('PM') && hour !== 12) hour += 12;
            if (selectedTime.includes('AM') && hour === 12) hour = 0;

            const bookingDate = new Date(selectedDate);
            bookingDate.setHours(hour, parseInt(minuteStr, 10), 0, 0);
            
            const [firstName, ...lastNameParts] = customerDetails.name.split(' ');
            const lastName = lastNameParts.join(' ');

            const bookingData = {
                customerInfo: {
                    firstName,
                    lastName,
                    email: customerDetails.email,
                    phone: customerDetails.phone,
                },
                serviceId: selectedService.id,
                serviceName: selectedService.name,
                bookingDate: bookingDate.toISOString(),
                duration: selectedService.options?.find(o => o.name.toLowerCase() === 'duration')?.values[0]?.priceModifier || settings!.slotDuration,
                notes: customerDetails.notes,
                price: selectedService.price
            };

            await bookingService.createBooking(bookingData, page.id, page.userId);
            setBookingStatus('success');
        } catch (e) {
            console.error(e);
            setBookingStatus('error');
        }
    };

    if (!isOpen) return null;

    if (bookingStatus === 'success') {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[101] flex items-center justify-center p-4" onClick={onClose}>
                <div className="max-w-md w-full text-center bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
                    <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">Booking Request Sent!</h2>
                    <p className="mt-4 text-slate-600 dark:text-slate-300">Thank you, {customerDetails.name}. Your request for {selectedService?.name} on {selectedDate?.toLocaleDateString()} at {selectedTime} has been received. You will receive a confirmation email shortly.</p>
                     <button onClick={onClose} className="mt-6 w-full py-2 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700">Close</button>
                </div>
            </div>
        );
    }
    
    // Calendar rendering logic
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array(firstDay).fill(null).concat(Array.from({length: daysInMonth}, (_, i) => i + 1));
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[101] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">{settings?.pageTitle}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="flex-grow md:grid md:grid-cols-3 min-h-0">
                    <div className="md:col-span-2 p-6 overflow-y-auto">
                        {isLoading ? <div className="flex justify-center items-center h-full"><LoaderIcon/></div> : (
                            <>
                                <div className="mt-6">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">Select a Service</label>
                                    <select onChange={e => setSelectedService(services.find(s => s.id === e.target.value) || null)} className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600">
                                        {services.map(s => <option key={s.id} value={s.id}>{s.name} (${s.price})</option>)}
                                    </select>
                                </div>

                                <div className="mt-6">
                                    <div className="flex justify-between items-center">
                                        <button onClick={() => setCurrentDate(d => new Date(d.setMonth(d.getMonth() - 1)))}><ChevronLeftIcon className="w-6 h-6"/></button>
                                        <h2 className="font-semibold">{currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}</h2>
                                        <button onClick={() => setCurrentDate(d => new Date(d.setMonth(d.getMonth() + 1)))}><ChevronRightIcon className="w-6 h-6"/></button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-2 mt-4 text-center text-sm">
                                        {dayNames.map(d => <div key={d} className="font-bold text-slate-500">{d}</div>)}
                                        {days.map((day, index) => (
                                            <div key={index} className="flex justify-center">
                                                {day && (
                                                    <button 
                                                        onClick={() => handleDateSelect(day)}
                                                        className={`w-10 h-10 rounded-full transition-colors ${
                                                            selectedDate?.getDate() === day && selectedDate.getMonth() === month ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                                                        }`}
                                                    >
                                                        {day}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {selectedTime && (
                                    <div className="mt-8">
                                        <h2 className="text-xl font-bold">Confirm Your Booking</h2>
                                        <form onSubmit={handleFormSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input required placeholder="Full Name" value={customerDetails.name} onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                                            <input required type="email" placeholder="Email" value={customerDetails.email} onChange={e => setCustomerDetails({...customerDetails, email: e.target.value})} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                                            <input type="tel" placeholder="Phone (Optional)" value={customerDetails.phone} onChange={e => setCustomerDetails({...customerDetails, phone: e.target.value})} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                                            <textarea placeholder="Notes (Optional)" value={customerDetails.notes} onChange={e => setCustomerDetails({...customerDetails, notes: e.target.value})} className="md:col-span-2 p-2 border rounded dark:bg-slate-700 dark:border-slate-600" rows={3}></textarea>
                                            <button type="submit" disabled={bookingStatus === 'loading'} className="md:col-span-2 w-full py-3 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                                                {bookingStatus === 'loading' ? <LoaderIcon className="w-6 h-6 mx-auto"/> : 'Request to Book'}
                                            </button>
                                            {bookingStatus === 'error' && <p className="text-red-500 md:col-span-2">Could not complete booking. Please try again.</p>}
                                        </form>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="md:col-span-1 p-6 bg-slate-50 dark:bg-slate-800/50 border-t md:border-t-0 md:border-l dark:border-slate-700 overflow-y-auto">
                        <h3 className="font-semibold text-center">{selectedDate?.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                        {selectedDate && (
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                {availableTimeSlots.length > 0 ? availableTimeSlots.map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`p-2 rounded-md border text-sm font-semibold ${
                                            selectedTime === time ? 'bg-indigo-600 text-white border-indigo-600' : 'border-indigo-300 text-indigo-600 hover:bg-indigo-100 dark:border-indigo-700 dark:hover:bg-indigo-900/50'
                                        }`}
                                    >
                                        {time}
                                    </button>
                                )) : <p className="col-span-2 text-center text-sm text-slate-500">No available slots.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;