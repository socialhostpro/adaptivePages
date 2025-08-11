
import React, { useState, useEffect } from 'react';
import type { CartItem, PricingStatus } from '../src/types';
import XIcon from './icons/XIcon';
import LoaderIcon from './icons/LoaderIcon';
import CheckIcon from './icons/CheckIcon';

interface ItemPricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    onSave: (finalItems: CartItem[]) => Promise<void>;
}

type Step = 'selection' | 'configuration' | 'approval' | 'summary';

const ItemPricingModal: React.FC<ItemPricingModalProps> = ({ isOpen, onClose, items, onSave }) => {
    const [currentStep, setCurrentStep] = useState<Step>('selection');
    const [pricedItems, setPricedItems] = useState<CartItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Initialize items with a 'pending' status for the workflow
            setPricedItems(items.map(item => ({ ...item, pricingStatus: 'pending', finalPrice: item.finalPrice || item.price })));
            setCurrentStep('selection');
        }
    }, [isOpen, items]);

    const handleSelection = (itemId: string, shouldPrice: boolean) => {
        setPricedItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, pricingStatus: shouldPrice ? 'pending' : 'skipped' } : item
        ));
    };

    const handlePriceChange = (itemId: string, newPrice: number) => {
        setPricedItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, finalPrice: isNaN(newPrice) ? item.price : newPrice } : item
        ));
    };

    const handleApproval = (itemId: string, status: 'approved' | 'rejected') => {
        setPricedItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, pricingStatus: status } : item
        ));
    };

    const handleSaveAndClose = async () => {
        setIsSaving(true);
        const finalItems = pricedItems.map(item => {
            if (item.pricingStatus === 'rejected' || item.pricingStatus === 'skipped') {
                return { ...item, finalPrice: item.price }; // Revert to original price
            }
            return item;
        });
        await onSave(finalItems);
        setIsSaving(false);
        onClose();
    };
    
    const itemsToConfigure = pricedItems.filter(item => item.pricingStatus === 'pending');
    const allDecided = itemsToConfigure.every(item => item.pricingStatus === 'approved' || item.pricingStatus === 'rejected');


    if (!isOpen) return null;

    const renderContent = () => {
        switch (currentStep) {
            case 'selection':
                return (
                    <>
                        <h3 className="text-lg font-semibold">Step 1: Select Items to Price</h3>
                        <p className="text-sm text-slate-500 mb-4">Choose which items you want to set a final price for. Skipped items will retain their default price.</p>
                        <div className="space-y-2">
                            {pricedItems.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-2 border rounded-md dark:border-slate-700">
                                    <span>{item.name} {item.variantDescription && `(${item.variantDescription})`}</span>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => handleSelection(item.id, true)} className={`px-3 py-1 rounded-md text-sm ${item.pricingStatus !== 'skipped' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}>Price</button>
                                        <button type="button" onClick={() => handleSelection(item.id, false)} className={`px-3 py-1 rounded-md text-sm ${item.pricingStatus === 'skipped' ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}>Skip</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case 'configuration':
                 return (
                    <>
                        <h3 className="text-lg font-semibold">Step 2: Configure Prices</h3>
                        <p className="text-sm text-slate-500 mb-4">Enter the final price for each selected item.</p>
                         <div className="space-y-3">
                            {itemsToConfigure.map(item => (
                                <div key={item.id} className="flex justify-between items-center gap-4">
                                    <label htmlFor={`price-${item.id}`} className="flex-grow">{item.name} {item.variantDescription && `(${item.variantDescription})`}</label>
                                    <input
                                        id={`price-${item.id}`}
                                        type="number"
                                        step="0.01"
                                        value={item.finalPrice}
                                        onChange={(e) => handlePriceChange(item.id, parseFloat(e.target.value))}
                                        className="w-32 p-1 border rounded dark:bg-slate-700 dark:border-slate-600"
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                );
             case 'approval':
                return (
                    <>
                        <h3 className="text-lg font-semibold">Step 3: Approve Prices</h3>
                        <p className="text-sm text-slate-500 mb-4">Review and approve or reject each proposed price.</p>
                        <div className="space-y-2">
                             {itemsToConfigure.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-2 border rounded-md dark:border-slate-700">
                                    <span>{item.name}: <strong>${item.finalPrice.toFixed(2)}</strong></span>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => handleApproval(item.id, 'approved')} className={`p-1.5 rounded-full ${item.pricingStatus === 'approved' ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-600 hover:bg-green-200'}`}><CheckIcon className="w-4 h-4"/></button>
                                        <button type="button" onClick={() => handleApproval(item.id, 'rejected')} className={`p-1.5 rounded-full ${item.pricingStatus === 'rejected' ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-600 hover:bg-red-200'}`}><XIcon className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                );
             case 'summary':
                return (
                     <>
                        <h3 className="text-lg font-semibold">Step 4: Final Summary</h3>
                        <p className="text-sm text-slate-500 mb-4">Review the final pricing status for all items before saving.</p>
                        <ul className="space-y-2">
                            {pricedItems.map(item => (
                                <li key={item.id} className="flex justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                    <span>{item.name}</span>
                                    {item.pricingStatus === 'approved' && <span className="font-semibold text-green-600">${item.finalPrice.toFixed(2)}</span>}
                                    {item.pricingStatus === 'rejected' && <span className="font-semibold text-red-500">Rejected (reverts to ${item.price.toFixed(2)})</span>}
                                    {item.pricingStatus === 'skipped' && <span className="font-semibold text-slate-500">Skipped (uses ${item.price.toFixed(2)})</span>}
                                    {item.pricingStatus === 'pending' && <span className="font-semibold text-yellow-500">Pending Approval</span>}
                                </li>
                            ))}
                        </ul>
                    </>
                );
        }
    };

    const nextStep = () => {
        if (currentStep === 'selection') setCurrentStep(itemsToConfigure.length > 0 ? 'configuration' : 'approval');
        if (currentStep === 'configuration') setCurrentStep('approval');
        if (currentStep === 'approval') setCurrentStep('summary');
    };
    
    const prevStep = () => {
        if (currentStep === 'summary') setCurrentStep('approval');
        if (currentStep === 'approval') setCurrentStep(itemsToConfigure.length > 0 ? 'configuration' : 'selection');
        if (currentStep === 'configuration') setCurrentStep('selection');
    };

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[101] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Item Pricing Workflow</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <XIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {renderContent()}
                </main>
                <footer className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-between items-center">
                    <button onClick={prevStep} disabled={currentStep === 'selection'} className="py-2 px-4 rounded-md font-semibold text-sm border dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50">Back</button>
                    {currentStep === 'summary' ? (
                         <button onClick={handleSaveAndClose} disabled={isSaving} className="py-2 px-4 rounded-md font-semibold text-sm text-white bg-green-600 hover:bg-green-700 flex items-center w-36 justify-center">
                           {isSaving ? <LoaderIcon className="w-5 h-5"/> : 'Save & Finalize'}
                         </button>
                    ) : (
                        <button onClick={nextStep} disabled={currentStep === 'approval' && !allDecided} className="py-2 px-4 rounded-md font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                            {currentStep === 'approval' ? 'Review Summary' : 'Next Step'}
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default ItemPricingModal;