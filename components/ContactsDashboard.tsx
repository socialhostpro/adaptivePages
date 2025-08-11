
import React, { useMemo } from 'react';
import type { CrmContact } from '../types';
import UsersIcon from './icons/UsersIcon';
import UserPlusIcon from './icons/UserPlusIcon';
import TargetIcon from './icons/TargetIcon';

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-500/20 p-3 rounded-full">
                <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
        </div>
    </div>
);

interface ContactsDashboardProps {
    contacts: CrmContact[];
    onNavigate: (tab: string) => void;
}

const ContactsDashboard: React.FC<ContactsDashboardProps> = ({ contacts, onNavigate }) => {
    const stats = useMemo(() => ({
        totalContacts: contacts.length,
        leads: contacts.filter(c => c.status === 'Lead').length,
        opportunities: contacts.filter(c => c.status === 'Opportunity').length,
        customers: contacts.filter(c => c.status === 'Customer').length,
    }), [contacts]);

    const recentContacts = useMemo(() => {
        return [...contacts]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);
    }, [contacts]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Contacts" value={stats.totalContacts.toString()} icon={UsersIcon} />
                <StatCard title="New Leads" value={stats.leads.toString()} icon={UserPlusIcon} />
                <StatCard title="Opportunities" value={stats.opportunities.toString()} icon={TargetIcon} />
                <StatCard title="Customers" value={stats.customers.toString()} icon={UsersIcon} />
            </div>
             <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Contacts</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Date Added</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentContacts.map(contact => (
                                <tr key={contact.id}>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{contact.name}</td>
                                    <td className="px-6 py-4">{contact.email}</td>
                                    <td className="px-6 py-4">{contact.status}</td>
                                    <td className="px-6 py-4">{new Date(contact.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {recentContacts.length === 0 && <p className="text-center py-8 text-slate-500">No contacts yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default ContactsDashboard;
