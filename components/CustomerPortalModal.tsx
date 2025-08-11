

import React, { useState, useEffect } from 'react';
import type { LandingPageData } from '../src/types';
import XIcon from './icons/XIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';

interface CustomerPortalModalProps {
    isOpen: boolean;
    onClose: () => void;
    pageData: LandingPageData;
    onGoToCourse: () => void;
}

const CustomerPortalModal: React.FC<CustomerPortalModalProps> = ({ isOpen, onClose, pageData, onGoToCourse }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState('account');
    const [statusMessage, setStatusMessage] = useState('');
    const { theme, course, products } = pageData;
    const { primaryColorName } = theme;

    useEffect(() => {
        if (!isOpen) {
            // Reset login state when modal is closed
            setTimeout(() => setIsLoggedIn(false), 300);
        }
    }, [isOpen]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd call an auth service here.
        // For this simulation, we just toggle the state.
        setIsLoggedIn(true);
        setActiveTab('account'); // Default to account tab after login
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };
    
    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage('Profile updated successfully!');
        setTimeout(() => setStatusMessage(''), 3000);
    };

    const handleGoToCourseClick = () => {
        onGoToCourse();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[102] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl h-auto max-h-[90vh] flex flex-col overflow-hidden border dark:border-slate-700" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">
                        {isLoggedIn ? 'Customer Portal' : 'Sign In'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <XIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    </button>
                </header>

                {!isLoggedIn ? (
                    <div className="p-8">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-slate-200">Welcome back</h3>
                        <p className="text-gray-500 dark:text-slate-400">Sign in to access your content and orders.</p>
                        <form onSubmit={handleLogin} className="mt-6 space-y-4">
                            <div>
                                <label className="font-semibold text-sm text-gray-700 dark:text-slate-300">Email Address</label>
                                <input type="email" required defaultValue="customer@example.com" className="w-full p-2 mt-1 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600" />
                            </div>
                             <div>
                                <label className="font-semibold text-sm text-gray-700 dark:text-slate-300">Password</label>
                                <input type="password" required defaultValue="password" className="w-full p-2 mt-1 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600" />
                            </div>
                            <button type="submit" className={`w-full font-bold py-3 px-4 rounded-md bg-${primaryColorName}-600 text-white hover:bg-${primaryColorName}-700 text-lg`}>
                                Sign In
                            </button>
                            <p className="text-sm text-center text-gray-500 dark:text-slate-400">
                                Don't have an account? <button type="button" className={`font-semibold text-${primaryColorName}-600 dark:text-${primaryColorName}-400 hover:underline`}>Sign Up</button>
                            </p>
                        </form>
                    </div>
                ) : (
                    <div className="flex-grow flex min-h-0 md:h-[500px]">
                        <nav className="w-1/4 p-4 border-r dark:border-slate-700 hidden md:block">
                            <ul className="space-y-1">
                                <li>
                                    <button
                                        onClick={() => setActiveTab('account')}
                                        className={`w-full flex items-center gap-3 text-left font-semibold p-2 rounded-md ${activeTab === 'account' ? `bg-${primaryColorName}-100 dark:bg-${primaryColorName}-500/20 text-${primaryColorName}-700 dark:text-${primaryColorName}-300` : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                    >
                                        <UserCircleIcon className="w-5 h-5" /> My Account
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab('content')}
                                        className={`w-full flex items-center gap-3 text-left font-semibold p-2 rounded-md ${activeTab === 'content' ? `bg-${primaryColorName}-100 dark:bg-${primaryColorName}-500/20 text-${primaryColorName}-700 dark:text-${primaryColorName}-300` : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                    >
                                        <BriefcaseIcon className="w-5 h-5" /> My Content
                                    </button>
                                </li>
                            </ul>
                        </nav>
                        <div className="w-full md:w-3/4 p-6 overflow-y-auto">
                            {activeTab === 'account' && (
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-slate-200">Manage Your Account</h3>
                                    <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
                                        <div>
                                            <label className="font-semibold text-sm text-gray-700 dark:text-slate-300">Name</label>
                                            <input type="text" value="Jane Doe" disabled className="w-full p-2 mt-1 border rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600 cursor-not-allowed" />
                                        </div>
                                        <div>
                                            <label className="font-semibold text-sm text-gray-700 dark:text-slate-300">Email</label>
                                            <input type="email" value="customer@example.com" disabled className="w-full p-2 mt-1 border rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600 cursor-not-allowed" />
                                        </div>
                                        <div className="flex items-center gap-4 pt-2">
                                            <button type="submit" className={`font-bold py-2 px-4 rounded-md bg-${primaryColorName}-600 text-white hover:bg-${primaryColorName}-700`}>Update Profile</button>
                                            <button type="button" className="font-bold py-2 px-4 rounded-md border dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">Change Password</button>
                                        </div>
                                        <div className="text-sm font-semibold text-green-600 h-4">{statusMessage}</div>
                                        <div className="pt-4 border-t dark:border-slate-700">
                                             <button type="button" onClick={handleLogout} className="text-sm font-semibold text-red-600 dark:text-red-400 hover:underline">
                                                Sign Out
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                            {activeTab === 'content' && (
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-slate-200">My Content & Orders</h3>
                                    <div className="mt-6 space-y-4">
                                        {course && (
                                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                                <h4 className="font-bold text-lg text-gray-800 dark:text-slate-200">{course.title}</h4>
                                                <p className="text-sm text-green-600 dark:text-green-400 font-semibold">Full Access</p>
                                                <button onClick={handleGoToCourseClick} className={`mt-2 text-sm font-bold py-2 px-4 rounded-md bg-${primaryColorName}-600 text-white hover:bg-${primaryColorName}-700`}>View Course</button>
                                            </div>
                                        )}
                                        {products && products.itemIds && products.itemIds.length > 0 && (
                                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                                <h4 className="font-bold text-lg text-gray-800 dark:text-slate-200">Order History (Simulated)</h4>
                                                <ul className="text-sm mt-2 space-y-2 text-gray-700 dark:text-slate-300">
                                                    <li className="flex justify-between items-center py-1 border-b dark:border-slate-600"><span>Order #1235 - Sample Product</span><span className="font-semibold text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Delivered</span></li>
                                                    {products.itemIds.length > 1 && <li className="flex justify-between items-center py-1"><span>Order #1234 - Another Sample</span><span className="font-semibold text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">Shipped</span></li>}
                                                </ul>
                                            </div>
                                        )}
                                        {!course && (!products || !products.itemIds || products.itemIds.length === 0) && <p className="text-gray-500">You haven't purchased any content yet.</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerPortalModal;