
import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { UserSettings } from '../types';
import * as profileService from '../services/profileService';
import LoaderIcon from './icons/LoaderIcon';
import SaveIcon from './icons/SaveIcon';
import PasswordInput from './shared/PasswordInput';
import KeyIcon from './icons/KeyIcon';
import FileJsonIcon from './icons/FileJsonIcon';
import GlobeIcon from './icons/GlobeIcon';
import MailIcon from './icons/MailIcon';
import MessageSquareIcon from './icons/MessageSquareIcon';

interface SettingsManagementProps {
    session: Session;
}

const SettingsCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <div className="flex items-center gap-3 mb-4">
            <Icon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const SettingsManagement: React.FC<SettingsManagementProps> = ({ session }) => {
    const [settings, setSettings] = useState<Partial<UserSettings>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const loadData = useCallback(async () => {
        setIsLoading(true);
        const profile = await profileService.getProfile(session.user.id);
        if (profile) {
            setSettings(profile);
        }
        setIsLoading(false);
    }, [session.user.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let configToSave = settings.google_build_config;
            if (typeof configToSave === 'string' && configToSave.trim()) {
                try {
                    configToSave = JSON.parse(configToSave);
                } catch (jsonError) {
                    alert('Google Build Config is not valid JSON.');
                    setIsSaving(false);
                    return;
                }
            } else if (typeof configToSave === 'string' && !configToSave.trim()) {
                configToSave = null;
            }
            
            const settingsToSave = { ...settings, google_build_config: configToSave };
            await profileService.updateProfile(session.user.id, settingsToSave as UserSettings);
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleChange = (field: keyof UserSettings, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><LoaderIcon className="w-8 h-8" /></div>;
    }

    return (
        <form onSubmit={handleSave} className="max-w-3xl mx-auto space-y-8">
            <SettingsCard title="API Keys" icon={KeyIcon}>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">ElevenLabs API Key</label>
                    <PasswordInput
                        value={settings.elevenlabs_api_key || ''}
                        onChange={e => handleChange('elevenlabs_api_key', e.target.value)}
                        placeholder="Enter your ElevenLabs API Key"
                    />
                     <p className="text-xs text-slate-500 mt-1">Used for AI voice generation features.</p>
                </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Google API Key</label>
                    <PasswordInput
                        value={settings.google_api_key || ''}
                        onChange={e => handleChange('google_api_key', e.target.value)}
                        placeholder="Enter your Google API Key"
                    />
                     <p className="text-xs text-slate-500 mt-1">Used for Google services like Maps or specific AI features.</p>
                </div>
            </SettingsCard>

            <SettingsCard title="SendGrid Email" icon={MailIcon}>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">SendGrid API Key</label>
                    <PasswordInput
                        value={settings.sendgrid_api_key || ''}
                        onChange={e => handleChange('sendgrid_api_key', e.target.value)}
                        placeholder="Enter your SendGrid API Key"
                    />
                    <p className="text-xs text-slate-500 mt-1">Used for system-wide email notifications (e.g., order confirmations).</p>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Default "From" Email</label>
                    <input
                        type="email"
                        value={settings.sendgrid_from_email || ''}
                        onChange={e => handleChange('sendgrid_from_email', e.target.value)}
                        placeholder="notifications@yourdomain.com"
                        className="w-full p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                    />
                </div>
            </SettingsCard>
            
            <SettingsCard title="Twilio SMS" icon={MessageSquareIcon}>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Twilio Account SID</label>
                    <input
                        value={settings.twilio_account_sid || ''}
                        onChange={e => handleChange('twilio_account_sid', e.target.value)}
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Twilio Auth Token</label>
                    <PasswordInput
                        value={settings.twilio_auth_token || ''}
                        onChange={e => handleChange('twilio_auth_token', e.target.value)}
                        placeholder="Enter your Twilio Auth Token"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Twilio "From" Number</label>
                    <input
                        type="tel"
                        value={settings.twilio_from_number || ''}
                        onChange={e => handleChange('twilio_from_number', e.target.value)}
                        placeholder="+15017122661"
                        className="w-full p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                    />
                     <p className="text-xs text-slate-500 mt-1">Your purchased Twilio phone number.</p>
                </div>
            </SettingsCard>
            
            <SettingsCard title="Build Configuration" icon={FileJsonIcon}>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Google Build Config (JSON)</label>
                    <textarea
                        value={typeof settings.google_build_config === 'string' ? settings.google_build_config : JSON.stringify(settings.google_build_config || {}, null, 2)}
                        onChange={e => handleChange('google_build_config', e.target.value)}
                        rows={6}
                        className="w-full p-2 font-mono text-xs border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                        placeholder='{ "key": "value" }'
                    />
                     <p className="text-xs text-slate-500 mt-1">Advanced JSON configuration for Google Cloud Build.</p>
                </div>
            </SettingsCard>

            <SettingsCard title="Domain" icon={GlobeIcon}>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Custom Domain</label>
                    <input
                        value={settings.default_custom_domain || ''}
                        onChange={e => handleChange('default_custom_domain', e.target.value)}
                        placeholder="e.g., www.mybusiness.com"
                        className="w-full p-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                    />
                    <p className="text-xs text-slate-500 mt-1">This can be used as a default for new pages.</p>
                </div>
            </SettingsCard>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 py-2.5 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                    {isSaving ? <LoaderIcon className="w-5 h-5" /> : <SaveIcon className="w-5 h-5" />}
                    {isSaving ? 'Saving...' : 'Save All Settings'}
                </button>
            </div>
        </form>
    );
};

export default SettingsManagement;