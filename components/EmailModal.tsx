
import React, { useState, useEffect } from 'react';
import type { ManagedOrder } from '../src/types';
import XIcon from './icons/XIcon';
import LoaderIcon from './icons/LoaderIcon';

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: ManagedOrder;
    pdfBlob: Blob | null;
    stripeEnabled: boolean;
}

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, order, pdfBlob, stripeEnabled }) => {
    const [isSending, setIsSending] = useState(false);
    const [subject, setSubject] = useState(`Invoice for Order #${order.id}`);
    const [body, setBody] = useState(
        `Hi ${order.customer.name},\n\nPlease find your invoice attached.\n\nThank you for your business!`
    );

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    
    const handleSend = () => {
        setIsSending(true);
        // Simulate sending email
        setTimeout(() => {
            setIsSending(false);
            alert("Email sent successfully (simulated).");
            onClose();
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[101] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Send Invoice</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <main className="p-6 space-y-4">
                    <div><label className="font-semibold">To:</label><input disabled value={order.customer.email} className="w-full p-2 mt-1 border rounded bg-slate-100 dark:bg-slate-700"/></div>
                    <div><label className="font-semibold">Subject:</label><input value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600"/></div>
                    <div><label className="font-semibold">Body:</label><textarea value={body} onChange={e => setBody(e.target.value)} rows={8} className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600"/></div>
                    {stripeEnabled && (
                        <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                             <p className="font-semibold mb-2">A "Pay Now" button will be included in the email.</p>
                             <button type="button" className="py-2 px-6 rounded-md font-semibold text-white bg-indigo-600">Pay Now (Example)</button>
                        </div>
                    )}
                    {pdfBlob && (
                        <div>
                            <p className="font-semibold">Attachment:</p>
                            <p className="text-sm p-2 bg-slate-100 dark:bg-slate-700 rounded-md">invoice_{order.id}.pdf ({(pdfBlob.size / 1024).toFixed(1)} KB)</p>
                        </div>
                    )}
                </main>
                <footer className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 flex justify-end">
                    <button onClick={handleSend} disabled={isSending} className="py-2 px-6 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center w-28">
                        {isSending ? <LoaderIcon className="w-5 h-5"/> : 'Send'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default EmailModal;