

import React, { useEffect } from 'react';
import type { CartItem, LandingPageTheme, ImageStore } from '../src/types';
import XIcon from './icons/XIcon';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';
import TrashIcon from './icons/TrashIcon';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  theme: LandingPageTheme;
  images: ImageStore;
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onCheckout: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, cartItems, theme, images, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);

  useEffect(() => {
    const modalContent = document.getElementById('cart-content');
    if (isOpen) {
        modalContent?.classList.remove('translate-x-full');
    } else {
        modalContent?.classList.add('translate-x-full');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={onClose}>
      <div
        id="cart-content"
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl flex flex-col transform translate-x-full transition-transform duration-300"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">Your Cart</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-grow p-4 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="m-auto text-center h-full flex items-center justify-center">
                <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Your cart is empty.</h3>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-4 py-2 border-b dark:border-slate-700">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-slate-700 rounded-md flex-shrink-0 overflow-hidden">
                    {images[`product_${item.id.split('-')[0]}`] && <img src={images[`product_${item.id.split('-')[0]}`]} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-gray-800 dark:text-slate-200">{item.name}</h4>
                    {item.variantDescription && <p className="text-xs text-gray-500 dark:text-slate-400">{item.variantDescription}</p>}
                    <p className="text-sm text-gray-500 dark:text-slate-400">${(item.finalPrice || 0).toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500"><MinusIcon className="w-4 h-4" /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500"><PlusIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-between">
                    <p className="font-semibold text-gray-800 dark:text-slate-200">${((item.finalPrice || 0) * item.quantity).toFixed(2)}</p>
                    <button onClick={() => onRemoveItem(item.id)} className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 self-end"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex-shrink-0 space-y-3">
          <div className="flex justify-between font-semibold text-lg text-gray-800 dark:text-slate-200">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <button
            onClick={onCheckout}
            disabled={cartItems.length === 0}
            className={`w-full text-center py-3 px-6 rounded-lg font-semibold text-lg text-white bg-${theme.primaryColorName}-600 hover:bg-${theme.primaryColorName}-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed`}
          >
            Checkout
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CartModal;