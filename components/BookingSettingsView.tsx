

import React, { useState } from 'react';
import type { ManagedPage, BookingSystemSettings, BusinessHour } from '../src/types';
import LoaderIcon from './icons/LoaderIcon';

interface BookingSettingsViewProps {
    page: ManagedPage;
    onSave: (newData: ManagedPage['data']) => Promise<void>;
}

const DAYS_OF_WEEK: BusinessHour['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const defaultSettings: BookingSystemSettings = {
    enabled: false,
    pageTitle: 'Book an Appointment',
    slotDuration: 30,
    businessHours: DAYS_OF_WEEK.map(day => ({
        day,
        enabled: day !== 'Sunday' && day !== 'Saturday',
        startTime: '09:00',
        endTime: '17:00'
    })),
    leadTime: 2, // hours
    afterTime: 48, // hours
};

const BookingSettingsView: React.FC<BookingSettingsViewProps> = ({ page, onSave }) => {
    const [settings, setSettings] = useState<BookingSystemSettings>(page.data?.bookingSystemSettings || defaultSettings);
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSettingChange = (field: keyof BookingSystemSettings, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleHourChange = (day: BusinessHour['day'], field: 'enabled' | 'startTime' | 'endTime', value: any) => {
        const newHours = settings.businessHours.map(h => {
            if (h.day === day) {
                return { ...h, [field]: value };
            }
            return h;
        });
        handleSettingChange('businessHours', newHours);
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const newPageData = {
                ...page.data!,
                bookingSystemSettings: settings
            };
            await onSave(newPageData);
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert("Could not save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">General Settings</h3>
                <div className="mt-4 space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Enable Public Booking Page</span>
                        <div className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.enabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}`}>
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                            <input type="checkbox" className="absolute w-full h-full opacity-0" checked={settings.enabled} onChange={e => handleSettingChange('enabled', e.target.checked)}/>
                        </div>
                    </label>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Page Title</label>
                        <input type="text" value={settings.pageTitle} onChange={e => handleSettingChange('pageTitle', e.target.value)} className="w-full p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600"/>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Slot Duration</label>
                        <select value={settings.slotDuration} onChange={e => handleSettingChange('slotDuration', Number(e.target.value))} className="w-full p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600">
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>60 minutes</option>
                        </select>
                         <p className="text-xs text-slate-500 mt-1">This is the default. Individual services can override this duration.</p>
                    </div>
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Business Hours</h3>
                 <div className="mt-4 space-y-3">
                    {settings.businessHours.map(hour => (
                        <div key={hour.day} className="grid grid-cols-4 items-center gap-4 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <div className="col-span-1">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={hour.enabled} onChange={e => handleHourChange(hour.day, 'enabled', e.target.checked)} className="h-4 w-4 rounded" />
                                    <span className="font-semibold">{hour.day}</span>
                                </label>
                            </div>
                             {hour.enabled ? (
                                <>
                                    <div className="col-span-1">
                                        <input type="time" value={hour.startTime} onChange={e => handleHourChange(hour.day, 'startTime', e.target.value)} className="w-full p-1 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600 text-sm"/>
                                    </div>
                                    <div className="col-span-1">
                                        <input type="time" value={hour.endTime} onChange={e => handleHourChange(hour.day, 'endTime', e.target.value)} className="w-full p-1 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600 text-sm"/>
                                    </div>
                                </>
                             ) : (
                                <div className="col-span-3 text-sm text-slate-500">Unavailable</div>
                             )}
                        </div>
                    ))}
                 </div>
            </div>

            <div className="flex justify-end">
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="py-2 px-6 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center justify-center w-36"
                >
                    {isSaving ? <LoaderIcon className="w-5 h-5" /> : 'Save Settings'}
                </button>
            </div>
        </div>
    );
};

export default BookingSettingsView;