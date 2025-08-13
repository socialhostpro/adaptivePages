'use client';

import React, { useState, useEffect } from 'react';
import { X, Menu } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileMenu({ isOpen, onClose, children }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Mobile Menu */}
      <div className="fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto h-full">
          {children}
        </div>
      </div>
    </>
  );
}

interface MobileMenuButtonProps {
  onClick: () => void;
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-slate-300"
      aria-label="Open menu"
    >
      <Menu className="w-6 h-6" />
    </button>
  );
}
