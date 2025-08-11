


import React, { useState, useEffect } from 'react';
import type { CartSettings, BookingSettings, StripeSettings } from '../types';
import * as pageService from './services/pageService';
import XIcon from './icons/XIcon';
import LoaderIcon from './icons/LoaderIcon';

interface AppSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    pageId: string;
    cartSettings: CartSettings;
    bookingSettings: BookingSettings;
    stripeSettings: StripeSettings;
    headScripts?: string;
    bodyScripts?: string;
    onSave: (cartSettings: CartSettings, bookingSettings: BookingSettings, stripeSettings: StripeSettings, headScripts: string, bodyScripts: string) => Promise<void>;
}

const FormField = ({ label, children, description }: { label: string, children: React.ReactNode, description?: string }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">{label}</label>
        {children}
        {description && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{description}</p>}
    </div>
);

const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        type="text"
        {...props}
        className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-400"
    />
);

const TextAreaInput = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        {...props}
        className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 transition bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-400 font-mono text-xs"
    />
);

const AppSettingsModal: React.FC<AppSettingsModalProps> = ({ isOpen, onClose, pageId, cartSettings, bookingSettings, stripeSettings, headScripts, bodyScripts, onSave }) => {
    const [editableCartSettings, setEditableCartSettings] = useState(cartSettings);
    const [editableBookingSettings, setEditableBookingSettings] = useState(bookingSettings);
    const [editableStripeSettings, setEditableStripeSettings] = useState(stripeSettings);
    const [editableHeadScripts, setEditableHeadScripts] = useState(headScripts || '');
    const [editableBodyScripts, setEditableBodyScripts] = useState(bodyScripts || '');
    const [activeTab, setActiveTab] = useState('cart');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEditableCartSettings(cartSettings || { currency: '$', notificationEmail: '' });
        setEditableBookingSettings(bookingSettings || { notificationEmail: '' });
        setEditableStripeSettings(stripeSettings || { publishableKey: '', secretKey: '' });
        setEditableHeadScripts(headScripts || '');
        setEditableBodyScripts(bodyScripts || '');
    }, [cartSettings, bookingSettings, stripeSettings, headScripts, bodyScripts, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(editableCartSettings, editableBookingSettings, editableStripeSettings, editableHeadScripts, editableBodyScripts);
        } catch (e) {
            console.error("Failed to save app settings", e);
            alert("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl h-auto max-h-[90vh] flex flex-col overflow-hidden border dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">App Settings</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-grow flex flex-col min-h-0">
                    <div className="border-b border-gray-200 dark:border-slate-700">
                        <nav className="-mb-px flex space-x-6 px-6">
                            <button onClick={() => setActiveTab('cart')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'cart' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                Shopping Cart
                            </button>
                             <button onClick={() => setActiveTab('contact')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'contact' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                Contact Form
                            </button>
                             <button onClick={() => setActiveTab('stripe')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'stripe' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                Stripe
                            </button>
                             <button onClick={() => setActiveTab('scripts')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'scripts' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                Scripts
                            </button>
                        </nav>
                    </div>

                    <div className="p-6 space-y-4 overflow-y-auto">
                        {activeTab === 'cart' && (
                            <div className="space-y-4">
                                <FormField label="Currency Symbol">
                                    <TextInput value={editableCartSettings?.currency || '$'} onChange={e => setEditableCartSettings(prev => ({ ...prev, currency: e.target.value }))} />
                                </FormField>
                                <FormField label="New Order Notification Email">
                                    <TextInput type="email" value={editableCartSettings?.notificationEmail || ''} onChange={e => setEditableCartSettings(prev => ({ ...prev, notificationEmail: e.target.value }))} />
                                </FormField>
                            </div>
                        )}
                        {activeTab === 'contact' && (
                            <div className="space-y-4">
                                <FormField label="New Message Notification Email">
                                    <TextInput type="email" value={editableBookingSettings?.notificationEmail || ''} onChange={e => setEditableBookingSettings(prev => ({ ...prev, notificationEmail: e.target.value }))} />
                                </FormField>
                                <div className="pt-4 border-t dark:border-slate-600 space-y-4">
                                     <FormField label="Webhook URL" description="Receive contact form submissions as a JSON POST request to this URL.">
                                        <TextInput type="url" value={editableBookingSettings?.webhookUrl || ''} onChange={e => setEditableBookingSettings(prev => ({ ...prev, webhookUrl: e.target.value }))} placeholder="https://api.example.com/webhook" />
                                    </FormField>
                                    <FormField label="Webhook API Key (Optional)" description="If provided, this key will be sent in the 'X-API-Key' header.">
                                        <TextInput value={editableBookingSettings?.webhookApiKey || ''} onChange={e => setEditableBookingSettings(prev => ({ ...prev, webhookApiKey: e.target.value }))} />
                                    </FormField>
                                </div>
                            </div>
                        )}
                         {activeTab === 'stripe' && (
                            <div className="space-y-4">
                                <FormField label="Stripe Publishable Key">
                                    <TextInput value={editableStripeSettings?.publishableKey || ''} onChange={e => setEditableStripeSettings(prev => ({...prev, publishableKey: e.target.value}))} placeholder="pk_test_..."/>
                                </FormField>
                                <FormField label="Stripe Secret Key">
                                    <TextInput value={editableStripeSettings?.secretKey || ''} onChange={e => setEditableStripeSettings(prev => ({...prev, secretKey: e.target.value}))} placeholder="sk_test_..."/>
                                </FormField>
                            </div>
                        )}
                        {activeTab === 'scripts' && (
                            <div className="space-y-4">
                                <FormField label="Head Scripts" description="Scripts here will be added before the closing </head> tag. Ideal for analytics, meta tags, or fonts.">
                                    <TextAreaInput 
                                      value={editableHeadScripts} 
                                      onChange={e => setEditableHeadScripts(e.target.value)} 
                                      placeholder={`<script>... a chat bot script ...</script>`}
                                      rows={6}
                                      spellCheck="false"
                                    />
                                </FormField>
                                <FormField label="Body Scripts" description="Scripts here will be added before the closing </body> tag. Ideal for tracking pixels or post-load initializations.">
                                    <TextAreaInput 
                                      value={editableBodyScripts} 
                                      onChange={e => setEditableBodyScripts(e.target.value)} 
                                      placeholder={`<!-- Google Tag Manager (noscript) --> ...`}
                                      rows={6}
                                      spellCheck="false"
                                    />
                                </FormField>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex-shrink-0 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center justify-center py-2.5 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                    >
                        {isSaving ? <LoaderIcon className="w-5 h-5" /> : 'Save & Close'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AppSettingsModal;