
import React, { useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';

interface AccountPopoverProps {
    user: User;
    onLogout: () => void;
    onClose: () => void;
}

const AccountPopover: React.FC<AccountPopoverProps> = ({ user, onLogout, onClose }) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                // Also check if the click was on the account button itself
                const accountButton = document.querySelector('[aria-label="My Account"]');
                if (accountButton && !accountButton.contains(event.target as Node)) {
                    onClose();
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div 
            ref={popoverRef}
            className="absolute top-16 right-4 z-[60] w-64 bg-white dark:bg-slate-800 rounded-lg shadow-2xl ring-1 ring-black/5"
        >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Signed in as</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{user.email}</p>
            </div>
            <div className="p-2">
                <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AccountPopover;
