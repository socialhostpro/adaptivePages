/**
 * @file RefundModal component.
 * @description This modal provides a UI for processing full or partial refunds for an order.
 */
import React, { useState } from 'react';
import type { ManagedOrder } from '../types';
import XIcon from './icons/XIcon';
import LoaderIcon from './icons/LoaderIcon';

interface RefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: ManagedOrder;
    onRefund: (orderId: string, amount: number, reason: string) => Promise<void>;
}

const RefundModal: React.FC<RefundModalProps> = ({ isOpen, onClose, order, onRefund }) => {
    const [amount, setAmount] = useState<number>(order.total);
    const [reason, setReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleRefund = async () => {
        if (amount <= 0 || amount > order.total) {
            alert("Please enter a valid refund amount.");
            return;
        }
        if (!reason) {
            alert("Please provide a reason for the refund.");
            return;
        }
        setIsProcessing(true);
        try {
            await onRefund(order.id, amount, reason);
            onClose();
        } catch (error) {
            alert(`Refund failed: ${(error as Error).message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[101] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Process Refund</h2>
                    <p className="text-sm text-slate-500">Order #{order.id}</p>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <label className="font-semibold">Refund Amount</label>
                        <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                            <input
                                type="number"
                                step="0.01"
                                max={order.total}
                                value={amount}
                                onChange={e => setAmount(parseFloat(e.target.value))}
                                className="w-full p-2 pl-6 border rounded dark:bg-slate-700 dark:border-slate-600"
                            />
                        </div>
                        <button type="button" onClick={() => setAmount(order.total)} className="text-xs text-indigo-600 hover:underline mt-1">Full Refund</button>
                    </div>
                    <div>
                        <label className="font-semibold">Reason for Refund</label>
                        <input
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            required
                            placeholder="e.g., Customer request, damaged item"
                            className="w-full p-2 mt-1 border rounded dark:bg-slate-700 dark:border-slate-600"
                        />
                    </div>
                </main>
                <footer className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 flex justify-end">
                    <button
                        onClick={handleRefund}
                        disabled={isProcessing}
                        className="py-2 px-4 rounded-md font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 flex items-center justify-center w-40"
                    >
                        {isProcessing ? <LoaderIcon className="w-5 h-5"/> : `Refund $${amount.toFixed(2)}`}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default RefundModal;
