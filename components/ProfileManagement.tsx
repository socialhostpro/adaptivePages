
import React from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import LoaderIcon from './icons/LoaderIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import ComingSoon from './ComingSoon';
import UserIcon from './icons/UserIcon';

interface ProfileManagementProps {
    user: User;
    themeMode: 'light' | 'dark';
    setThemeMode: (mode: 'light' | 'dark') => void;
    activeSubTab: string;
    setActiveSubTab: (tab: string) => void;
}

const ProfileManagement: React.FC<ProfileManagementProps> = ({ user, themeMode, setThemeMode, activeSubTab, setActiveSubTab }) => {
    const [loading, setLoading] = React.useState(false);

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
    };

    const toggleTheme = () => {
        setThemeMode(themeMode === 'light' ? 'dark' : 'light');
    };
    
    const subTabs = [
        { key: 'profile.userInfo', label: 'User Info' },
        { key: 'profile.notifications', label: 'Notifications' },
        { key: 'profile.subscriptions', label: 'Subscriptions' },
        { key: 'profile.addons', label: 'Addons' },
    ];

    const renderContent = () => {
        switch(activeSubTab) {
            case 'profile.userInfo':
                return (
                     <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">User Information</h2>
                        
                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                <input
                                    type="email"
                                    value={user.email}
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
            case 'profile.notifications':
            case 'profile.subscriptions':
            case 'profile.addons':
                 return <ComingSoon title="Coming Soon" message="This feature is under development." icon={UserIcon}/>
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
             <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6">
                    {subTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveSubTab(tab.key)}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                                activeSubTab === tab.key
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex-grow pt-6 min-h-0 max-w-2xl mx-auto w-full">
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
