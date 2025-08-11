import React, { useState, useEffect } from 'react';
import type { ProofingAsset, PricingStatus } from '../types';
import XIcon from './icons/XIcon';
import LoaderIcon from './icons/LoaderIcon';
import CheckIcon from './icons/CheckIcon';

interface AssetPricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    assets: ProofingAsset[];
    onSave: (finalAssets: ProofingAsset[]) => Promise<void>;
}

type Step = 'selection' | 'configuration' | 'approval' | 'summary';

const AssetPricingModal: React.FC<AssetPricingModalProps> = ({ isOpen, onClose, assets, onSave }) => {
    const [currentStep, setCurrentStep] = useState<Step>('selection');
    const [pricedAssets, setPricedAssets] = useState<ProofingAsset[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Initialize assets with a 'pending' status for the workflow
            setPricedAssets(assets.map(asset => ({ ...asset, pricingStatus: asset.pricingStatus || 'pending', price: asset.price || 0 })));
            setCurrentStep('selection');
        }
    }, [isOpen, assets]);

    const handleSelection = (assetUrl: string, shouldPrice: boolean) => {
        setPricedAssets(prev => prev.map(asset =>
            asset.url === assetUrl ? { ...asset, pricingStatus: shouldPrice ? 'pending' : 'skipped' } : asset
        ));
    };

    const handlePriceChange = (assetUrl: string, newPrice: number) => {
        setPricedAssets(prev => prev.map(asset =>
            asset.url === assetUrl ? { ...asset, price: isNaN(newPrice) ? 0 : newPrice } : asset
        ));
    };

    const handleApproval = (assetUrl: string, status: 'approved' | 'rejected') => {
        setPricedAssets(prev => prev.map(asset =>
            asset.url === assetUrl ? { ...asset, pricingStatus: status } : asset
        ));
    };

    const handleSaveAndClose = async () => {
        setIsSaving(true);
        const finalAssets = pricedAssets.map(asset => {
            if (asset.pricingStatus === 'rejected' || asset.pricingStatus === 'skipped') {
                // If rejected or skipped, we can nullify the price or keep original. Let's nullify.
                return { ...asset, price: undefined }; 
            }
            return asset;
        });
        await onSave(finalAssets);
        setIsSaving(false);
        onClose();
    };
    
    const assetsToConfigure = pricedAssets.filter(asset => asset.pricingStatus === 'pending');
    const allDecided = assetsToConfigure.every(asset => asset.pricingStatus === 'approved' || asset.pricingStatus === 'rejected');


    if (!isOpen) return null;

    const renderContent = () => {
        switch (currentStep) {
            case 'selection':
                return (
                    <>
                        <h3 className="text-lg font-semibold">Step 1: Select Assets to Price</h3>
                        <p className="text-sm text-slate-500 mb-4">Choose which assets you want to set a final price for.</p>
                        <div className="space-y-2">
                            {pricedAssets.map(asset => (
                                <div key={asset.url} className="flex justify-between items-center p-2 border rounded-md dark:border-slate-700">
                                    <span className="truncate text-sm">{asset.url.split('/').pop()}</span>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => handleSelection(asset.url, true)} className={`px-3 py-1 rounded-md text-sm ${asset.pricingStatus !== 'skipped' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}>Price</button>
                                        <button type="button" onClick={() => handleSelection(asset.url, false)} className={`px-3 py-1 rounded-md text-sm ${asset.pricingStatus === 'skipped' ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}>Skip</button>
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
                        <p className="text-sm text-slate-500 mb-4">Enter the final price for each selected asset.</p>
                         <div className="space-y-3">
                            {assetsToConfigure.map(asset => (
                                <div key={asset.url} className="flex justify-between items-center gap-4">
                                    <label htmlFor={`price-${asset.url}`} className="flex-grow truncate text-sm">{asset.url.split('/').pop()}</label>
                                    <input
                                        id={`price-${asset.url}`}
                                        type="number"
                                        step="0.01"
                                        value={asset.price}
                                        onChange={(e) => handlePriceChange(asset.url, parseFloat(e.target.value))}
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
                             {assetsToConfigure.map(asset => (
                                <div key={asset.url} className="flex justify-between items-center p-2 border rounded-md dark:border-slate-700">
                                    <span className="truncate text-sm">{asset.url.split('/').pop()}: <strong>${(asset.price || 0).toFixed(2)}</strong></span>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => handleApproval(asset.url, 'approved')} className={`p-1.5 rounded-full ${asset.pricingStatus === 'approved' ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-600 hover:bg-green-200'}`}><CheckIcon className="w-4 h-4"/></button>
                                        <button type="button" onClick={() => handleApproval(asset.url, 'rejected')} className={`p-1.5 rounded-full ${asset.pricingStatus === 'rejected' ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-600 hover:bg-red-200'}`}><XIcon className="w-4 h-4"/></button>
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
                        <p className="text-sm text-slate-500 mb-4">Review the final pricing status for all assets before saving.</p>
                        <ul className="space-y-2">
                            {pricedAssets.map(asset => (
                                <li key={asset.url} className="flex justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                    <span className="truncate text-sm">{asset.url.split('/').pop()}</span>
                                    {asset.pricingStatus === 'approved' && <span className="font-semibold text-green-600">${(asset.price || 0).toFixed(2)}</span>}
                                    {asset.pricingStatus === 'rejected' && <span className="font-semibold text-red-500">Rejected (No Price)</span>}
                                    {asset.pricingStatus === 'skipped' && <span className="font-semibold text-slate-500">Skipped (No Price)</span>}
                                    {asset.pricingStatus === 'pending' && <span className="font-semibold text-yellow-500">Pending Approval</span>}
                                </li>
                            ))}
                        </ul>
                    </>
                );
        }
    };

    const nextStep = () => {
        if (currentStep === 'selection') setCurrentStep(assetsToConfigure.length > 0 ? 'configuration' : 'approval');
        if (currentStep === 'configuration') setCurrentStep('approval');
        if (currentStep === 'approval') setCurrentStep('summary');
    };
    
    const prevStep = () => {
        if (currentStep === 'summary') setCurrentStep('approval');
        if (currentStep === 'approval') setCurrentStep(assetsToConfigure.length > 0 ? 'configuration' : 'selection');
        if (currentStep === 'configuration') setCurrentStep('selection');
    };

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[101] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Asset Pricing Workflow</h2>
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

export default AssetPricingModal;