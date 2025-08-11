
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ManagedPage, ManagedProduct, BookingSystemSettings, BusinessHour } from './types';
import * as pageService from './services/pageService';
import * as productService from './services/productService';
import * as bookingService from './services/bookingService';
import LoaderIcon from './components/icons/LoaderIcon';
import ChevronLeftIcon from './components/icons/ChevronLeftIcon';
import ChevronRightIcon from './components/icons/ChevronRightIcon';

interface PublicBookingPageProps {
    slug: string;
}

const PublicBookingPage: React.FC<PublicBookingPageProps> = ({ slug }) => {
    const [page, setPage] = useState<ManagedPage | null>(null);
    const [services, setServices] = useState<ManagedProduct[]>([]);
    const [existingBookings, setExistingBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedService, setSelectedService] = useState<ManagedProduct | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    
    const [customerDetails, setCustomerDetails] = useState({ name: '', email: '', phone: '', notes: '' });
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const settings = useMemo(() => page?.data?.bookingSystemSettings, [page]);

    const fetchData = useCallback(async () => {
        try {
            const pageData = await pageService.getPublicPageBySlug(slug);
            if (!pageData || !pageData.data?.bookingSystemSettings?.enabled) {
                throw new Error("Booking page not found or not enabled.");
            }
            setPage(pageData);
            
            const productIds = pageData.data?.products?.itemIds || [];
            if (productIds.length > 0) {
                const allProducts = await productService.getProductsByIds(productIds);
                const serviceProducts = allProducts.filter(p => p.fulfillment_type === 'On-site Service');
                setServices(serviceProducts);
                if (serviceProducts.length > 0) {
                    setSelectedService(serviceProducts[0]);
                }
            }
            
            const bookings = await bookingService.getBookingsForPage(pageData.id);
            setExistingBookings(bookings);

        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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


    if (isLoading) return <div className="h-screen w-screen flex items-center justify-center"><LoaderIcon className="w-12 h-12" /></div>;
    if (error) return <div className="h-screen w-screen flex items-center justify-center text-red-500">{error}</div>;

    if (bookingStatus === 'success') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
                    <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">Booking Request Sent!</h2>
                    <p className="mt-4 text-slate-600 dark:text-slate-300">Thank you, {customerDetails.name}. Your request for {selectedService?.name} on {selectedDate?.toLocaleDateString()} at {selectedTime} has been received. You will receive a confirmation email shortly.</p>
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden md:grid md:grid-cols-3">
                <div className="md:col-span-2 p-6">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{settings?.pageTitle}</h1>
                    
                    <div className="mt-6">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">Select a Service</label>
                        <select onChange={e => setSelectedService(services.find(s => s.id === e.target.value) || null)} className="w-full p-2 mt-1 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600">
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
                </div>
                <div className="md:col-span-1 p-6 bg-slate-50 dark:bg-slate-800/50 border-t md:border-t-0 md:border-l dark:border-slate-700">
                    <h3 className="font-semibold text-center">{selectedDate?.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                    {selectedDate && (
                         <div className="mt-4 grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
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

            {selectedTime && (
                <div className="max-w-4xl mx-auto mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6">
                    <h2 className="text-2xl font-bold">Confirm Your Booking</h2>
                    <form onSubmit={handleFormSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input required placeholder="Full Name" value={customerDetails.name} onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})} className="p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600"/>
                        <input required type="email" placeholder="Email" value={customerDetails.email} onChange={e => setCustomerDetails({...customerDetails, email: e.target.value})} className="p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600"/>
                        <input type="tel" placeholder="Phone (Optional)" value={customerDetails.phone} onChange={e => setCustomerDetails({...customerDetails, phone: e.target.value})} className="p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600"/>
                        <textarea placeholder="Notes (Optional)" value={customerDetails.notes} onChange={e => setCustomerDetails({...customerDetails, notes: e.target.value})} className="md:col-span-2 p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600" rows={3}></textarea>
                        <button type="submit" disabled={bookingStatus === 'loading'} className="md:col-span-2 w-full py-3 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                            {bookingStatus === 'loading' ? <LoaderIcon className="w-6 h-6 mx-auto"/> : 'Request to Book'}
                        </button>
                        {bookingStatus === 'error' && <p className="text-red-500 md:col-span-2">Could not complete booking. Please try again.</p>}
                    </form>
                </div>
            )}
        </div>
    );
};

export default PublicBookingPage;
