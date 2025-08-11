



import React, { useState } from 'react';
import type { CartItem, LandingPageTheme, CartSettings } from '../src/types';
import XIcon from './icons/XIcon';
import * as orderService from '../services/orderService';
import LoaderIcon from './icons/LoaderIcon';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId?: string;
  cartItems: CartItem[];
  theme: LandingPageTheme;
  settings?: CartSettings;
  onSuccess: (purchasedItems: CartItem[]) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, pageId, cartItems, theme, settings, onSuccess }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const subtotal = cartItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);

  const handleCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pageId) {
        alert("This checkout form is not connected to a page.");
        return;
    }
    
    setStatus('loading');
    setErrorMessage('');

    const formData = new FormData(event.currentTarget);
    const order = {
        pageId,
        customerInfo: {
            firstName: formData.get('first-name') as string,
            lastName: formData.get('last-name') as string,
            email: formData.get('email') as string,
            address: formData.get('address') as string,
        },
        items: cartItems,
        total: subtotal,
        status: 'New Order' as const,
    };

    try {
        await orderService.createOrder(order);
        setStatus('success');
        onSuccess(cartItems);
    } catch (error) {
        console.error("Checkout error:", error);
        setStatus('error');
        setErrorMessage((error as Error).message || "There was an error processing your order.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[101] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden border dark:border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">Checkout</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        {status === 'success' ? (
            <div className="p-8 text-center">
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">Thank You!</h3>
                <p className="mt-2 text-gray-600 dark:text-slate-300">Your order has been placed successfully.</p>
                <button onClick={onClose} className={`mt-6 w-full text-center py-3 px-6 rounded-lg font-semibold text-lg text-white bg-${theme.primaryColorName}-600 hover:bg-${theme.primaryColorName}-700`}>
                    Close
                </button>
            </div>
        ) : (
            <form onSubmit={handleCheckout}>
                <div className="p-6 overflow-y-auto space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-2">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex justify-between">
                                <span className="text-gray-600 dark:text-slate-400">{item.name} x {item.quantity}</span>
                                <span className="text-gray-800 dark:text-slate-200">{settings?.currency || '$'}{(item.finalPrice * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between font-bold pt-2 border-t dark:border-slate-600">
                            <span className="text-gray-800 dark:text-slate-200">Total</span>
                            <span className="text-gray-800 dark:text-slate-200">{settings?.currency || '$'}{subtotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-2">Shipping Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input required name="first-name" placeholder="First Name" className="p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600 w-full" />
                            <input required name="last-name" placeholder="Last Name" className="p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600 w-full" />
                        </div>
                        <input required name="email" type="email" placeholder="Email" className="p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600 w-full mt-4" />
                        <input required name="address" placeholder="Address" className="p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600 w-full mt-4" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-2">Payment Details (Demo)</h3>
                        <input required placeholder="Card Number" className="p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600 w-full" />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <input required placeholder="MM / YY" className="p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600 w-full" />
                            <input required placeholder="CVC" className="p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600 w-full" />
                        </div>
                    </div>
                </div>
                {status === 'error' && <p className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20 p-3 rounded-md">{errorMessage}</p>}
                </div>
                
                <footer className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex-shrink-0 flex justify-end">
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className={`w-full text-center py-3 px-6 rounded-lg font-semibold text-lg text-white bg-${theme.primaryColorName}-600 hover:bg-${theme.primaryColorName}-700 disabled:bg-gray-400`}
                >
                    {status === 'loading' ? <LoaderIcon className="w-6 h-6 mx-auto" /> : `Pay ${settings?.currency || '$'}${subtotal.toFixed(2)}`}
                </button>
                </footer>
            </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;