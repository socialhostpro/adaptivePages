
import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import LoaderIcon from './icons/LoaderIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import ComingSoon from './ComingSoon';
import UserIcon from './icons/UserIcon';
import BellIcon from './icons/BellIcon';
import CreditCardIcon from './icons/CreditCardIcon';
import PuzzleIcon from './icons/PuzzleIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface ProfileManagementProps {
    user: User;
    themeMode: 'light' | 'dark';
    setThemeMode: (mode: 'light' | 'dark') => void;
    activeSubTab: string;
    setActiveSubTab: (tab: string) => void;
}

interface NotificationSettings {
    emailNotifications: boolean;
    pageUpdates: boolean;
    orderNotifications: boolean;
    systemAlerts: boolean;
    marketingEmails: boolean;
}

interface UserProfile {
    fullName: string;
    company: string;
    phone: string;
    timezone: string;
}

const ProfileManagement: React.FC<ProfileManagementProps> = ({ user, themeMode, setThemeMode, activeSubTab, setActiveSubTab }) => {
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // User profile state
    const [userProfile, setUserProfile] = useState<UserProfile>({
        fullName: '',
        company: '',
        phone: '',
        timezone: 'UTC'
    });

    // Notification settings state
    const [notifications, setNotifications] = useState<NotificationSettings>({
        emailNotifications: true,
        pageUpdates: true,
        orderNotifications: true,
        systemAlerts: true,
        marketingEmails: false
    });

    // Set default tab to userInfo if none is active or if activeSubTab doesn't start with 'profile.'
    useEffect(() => {
        if (!activeSubTab || !activeSubTab.startsWith('profile.')) {
            setActiveSubTab('profile.userInfo');
        }
    }, [activeSubTab, setActiveSubTab]);

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
    };

    const toggleTheme = () => {
        setThemeMode(themeMode === 'light' ? 'dark' : 'light');
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSaveProfile = async () => {
        setSaveLoading(true);
        try {
            // Here you would save to your user_profiles table
            // For now, we'll just simulate a save
            await new Promise(resolve => setTimeout(resolve, 1000));
            showMessage('success', 'Profile updated successfully!');
        } catch (error) {
            showMessage('error', 'Failed to update profile. Please try again.');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleSaveNotifications = async () => {
        setSaveLoading(true);
        try {
            // Here you would save notification preferences
            await new Promise(resolve => setTimeout(resolve, 1000));
            showMessage('success', 'Notification preferences updated!');
        } catch (error) {
            showMessage('error', 'Failed to update notifications. Please try again.');
        } finally {
            setSaveLoading(false);
        }
    };
    
    const subTabs = [
        { key: 'profile.userInfo', label: 'User Info', icon: UserIcon },
        { key: 'profile.notifications', label: 'Notifications', icon: BellIcon },
        { key: 'profile.subscriptions', label: 'Subscriptions', icon: CreditCardIcon },
        { key: 'profile.addons', label: 'Addons', icon: PuzzleIcon },
    ];

    const renderContent = () => {
        switch(activeSubTab) {
            case 'profile.userInfo':
                return (
                    <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">User Information</h2>
                        
                        {message && (
                            <div className={`mb-4 p-3 rounded-md ${
                                message.type === 'success' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                            }`}>
                                {message.text}
                            </div>
                        )}
                        
                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                <input
                                    type="email"
                                    value={user.email || ''}
                                    disabled
                                    className="mt-1 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
                                />
                                <p className="mt-1 text-xs text-slate-500">Email cannot be changed</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                <input
                                    type="text"
                                    value={userProfile.fullName}
                                    onChange={(e) => setUserProfile({...userProfile, fullName: e.target.value})}
                                    placeholder="Your full name"
                                    className="mt-1 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Company</label>
                                <input
                                    type="text"
                                    value={userProfile.company}
                                    onChange={(e) => setUserProfile({...userProfile, company: e.target.value})}
                                    placeholder="Your company name"
                                    className="mt-1 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                                <input
                                    type="tel"
                                    value={userProfile.phone}
                                    onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                                    placeholder="Your phone number"
                                    className="mt-1 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Timezone</label>
                                <select
                                    value={userProfile.timezone}
                                    onChange={(e) => setUserProfile({...userProfile, timezone: e.target.value})}
                                    className="mt-1 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">Eastern Time</option>
                                    <option value="America/Chicago">Central Time</option>
                                    <option value="America/Denver">Mountain Time</option>
                                    <option value="America/Los_Angeles">Pacific Time</option>
                                    <option value="Europe/London">London</option>
                                    <option value="Europe/Paris">Paris</option>
                                    <option value="Asia/Tokyo">Tokyo</option>
                                </select>
                            </div>
                            
                            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                                <button
                                    type="submit"
                                    disabled={saveLoading}
                                    className="w-full flex items-center justify-center py-2.5 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                                >
                                    {saveLoading ? <LoaderIcon className="w-5 h-5" /> : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    className="w-full text-center py-2.5 px-4 rounded-md font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Change Password
                                </button>
                            </div>
                        </form>

                        <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Appearance</h3>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm text-slate-600 dark:text-slate-300">Interface Theme</span>
                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    className="flex items-center gap-2 py-2 px-3 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200"
                                >
                                    {themeMode === 'light' ? 
                                        <><MoonIcon className="w-5 h-5" /> Switch to Dark</> :
                                        <><SunIcon className="w-5 h-5" /> Switch to Light</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                );
                
            case 'profile.notifications':
                return (
                    <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Notification Preferences</h2>
                        
                        {message && (
                            <div className={`mb-4 p-3 rounded-md ${
                                message.type === 'success' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                            }`}>
                                {message.text}
                            </div>
                        )}
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-700">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Email Notifications</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive notifications via email</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications.emailNotifications}
                                        onChange={(e) => setNotifications({...notifications, emailNotifications: e.target.checked})}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                            
                            <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-700">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Page Updates</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Get notified when your pages are published or updated</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications.pageUpdates}
                                        onChange={(e) => setNotifications({...notifications, pageUpdates: e.target.checked})}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                            
                            <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-700">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Order Notifications</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Get notified about new orders and payments</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications.orderNotifications}
                                        onChange={(e) => setNotifications({...notifications, orderNotifications: e.target.checked})}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                            
                            <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-700">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">System Alerts</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Important system updates and security alerts</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications.systemAlerts}
                                        onChange={(e) => setNotifications({...notifications, systemAlerts: e.target.checked})}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                            
                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Marketing Emails</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive tips, feature updates, and promotional content</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications.marketingEmails}
                                        onChange={(e) => setNotifications({...notifications, marketingEmails: e.target.checked})}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                        
                        <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={handleSaveNotifications}
                                disabled={saveLoading}
                                className="w-full flex items-center justify-center py-2.5 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                            >
                                {saveLoading ? <LoaderIcon className="w-5 h-5" /> : 'Save Notification Preferences'}
                            </button>
                        </div>
                    </div>
                );
                
            case 'profile.subscriptions':
                return (
                    <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Subscription Management</h2>
                        
                        <div className="space-y-6">
                            {/* Current Plan */}
                            <div className="border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 bg-indigo-50 dark:bg-indigo-900/20">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircleIcon className="w-6 h-6 text-indigo-600" />
                                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Professional Plan</h3>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-600 text-white">Current</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mb-4">Unlimited pages, custom domains, and priority support</p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-2xl font-bold text-slate-900 dark:text-white">$29</span>
                                        <span className="text-slate-500 dark:text-slate-400">/month</span>
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        Next billing: January 15, 2025
                                    </div>
                                </div>
                            </div>
                            
                            {/* Available Plans */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Available Plans</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Starter</h4>
                                        <p className="text-slate-600 dark:text-slate-300 mb-4">Perfect for getting started</p>
                                        <div className="mb-4">
                                            <span className="text-2xl font-bold text-slate-900 dark:text-white">$9</span>
                                            <span className="text-slate-500 dark:text-slate-400">/month</span>
                                        </div>
                                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-6">
                                            <li>• Up to 3 pages</li>
                                            <li>• Basic templates</li>
                                            <li>• Email support</li>
                                        </ul>
                                        <button className="w-full py-2 px-4 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                                            Downgrade
                                        </button>
                                    </div>
                                    
                                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Enterprise</h4>
                                        <p className="text-slate-600 dark:text-slate-300 mb-4">For large organizations</p>
                                        <div className="mb-4">
                                            <span className="text-2xl font-bold text-slate-900 dark:text-white">$99</span>
                                            <span className="text-slate-500 dark:text-slate-400">/month</span>
                                        </div>
                                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-6">
                                            <li>• Unlimited everything</li>
                                            <li>• White-label options</li>
                                            <li>• Dedicated support</li>
                                        </ul>
                                        <button className="w-full py-2 px-4 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                                            Upgrade
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Billing History */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Billing History</h3>
                                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                        <div className="p-4 flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white">December 15, 2024</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">Professional Plan</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-slate-900 dark:text-white">$29.00</div>
                                                <div className="text-sm text-green-600 dark:text-green-400">Paid</div>
                                            </div>
                                        </div>
                                        <div className="p-4 flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white">November 15, 2024</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">Professional Plan</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-slate-900 dark:text-white">$29.00</div>
                                                <div className="text-sm text-green-600 dark:text-green-400">Paid</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
                
            case 'profile.addons':
                return (
                    <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Available Addons</h2>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* AI Content Generator */}
                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Content Generator</h3>
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Active</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mb-4">Generate high-quality content using advanced AI models</p>
                                <div className="mb-4">
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">$15</span>
                                    <span className="text-slate-500 dark:text-slate-400">/month</span>
                                </div>
                                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300 mb-6">
                                    <li>• 1000 AI generations/month</li>
                                    <li>• Multiple content types</li>
                                    <li>• SEO optimization</li>
                                </ul>
                                <button className="w-full py-2 px-4 rounded-md border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20">
                                    Cancel Addon
                                </button>
                            </div>
                            
                            {/* Advanced Analytics */}
                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Advanced Analytics</h3>
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">Available</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mb-4">Deep insights into your website performance and visitor behavior</p>
                                <div className="mb-4">
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">$10</span>
                                    <span className="text-slate-500 dark:text-slate-400">/month</span>
                                </div>
                                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300 mb-6">
                                    <li>• Real-time analytics</li>
                                    <li>• Conversion tracking</li>
                                    <li>• Custom reports</li>
                                </ul>
                                <button className="w-full py-2 px-4 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                                    Add Addon
                                </button>
                            </div>
                            
                            {/* Priority Support */}
                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Priority Support</h3>
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">Available</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mb-4">Get priority access to our support team with faster response times</p>
                                <div className="mb-4">
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">$20</span>
                                    <span className="text-slate-500 dark:text-slate-400">/month</span>
                                </div>
                                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300 mb-6">
                                    <li>• 24/7 priority support</li>
                                    <li>• Phone & video calls</li>
                                    <li>• Dedicated account manager</li>
                                </ul>
                                <button className="w-full py-2 px-4 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                                    Add Addon
                                </button>
                            </div>
                            
                            {/* Custom Integrations */}
                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Custom Integrations</h3>
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">Available</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mb-4">Connect with your favorite tools and services through custom integrations</p>
                                <div className="mb-4">
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">$25</span>
                                    <span className="text-slate-500 dark:text-slate-400">/month</span>
                                </div>
                                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300 mb-6">
                                    <li>• CRM integrations</li>
                                    <li>• Marketing automation</li>
                                    <li>• Custom webhooks</li>
                                </ul>
                                <button className="w-full py-2 px-4 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                                    Add Addon
                                </button>
                            </div>
                        </div>
                    </div>
                );
                
            default:
                return (
                    <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">User Information</h2>
                        
                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                <input
                                    type="email"
                                    value={user.email || ''}
                                    disabled
                                    className="mt-1 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    className="mt-1 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            
                            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                                <button
                                    type="button"
                                    className="w-full text-center py-2.5 px-4 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    className="w-full text-center py-2.5 px-4 rounded-md font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Change Password
                                </button>
                            </div>
                        </form>

                        <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Appearance</h3>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm text-slate-600 dark:text-slate-300">Interface Theme</span>
                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    className="flex items-center gap-2 py-2 px-3 rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200"
                                >
                                    {themeMode === 'light' ? 
                                        <><MoonIcon className="w-5 h-5" /> Switch to Dark</> :
                                        <><SunIcon className="w-5 h-5" /> Switch to Light</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="h-full flex flex-col">
             <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6">
                    {subTabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveSubTab(tab.key)}
                                className={`flex items-center gap-2 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                                    activeSubTab === tab.key
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>
            <div className="flex-grow pt-6 min-h-0 max-w-4xl mx-auto w-full">
                {renderContent()}
                <div className="mt-8">
                     <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="w-full flex items-center justify-center py-2.5 px-4 rounded-md font-semibold text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-300 dark:bg-red-900/50 dark:hover:bg-red-900"
                    >
                        {loading ? <LoaderIcon className="w-5 h-5" /> : 'Logout'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileManagement;
