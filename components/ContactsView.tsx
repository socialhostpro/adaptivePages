

import React, { useState, useMemo } from 'react';
import type { CrmContact, CrmContactStatus } from '../src/types';
import * as contactService from '../services/contactService';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface ContactsViewProps {
    status: CrmContactStatus;
    contacts: CrmContact[];
    onUpdate: () => void;
    onViewDetails: (contact: CrmContact) => void;
}

const statusOptions: CrmContactStatus[] = ['Contact', 'Lead', 'Opportunity', 'Customer'];

const ContactsView: React.FC<ContactsViewProps> = ({ status, contacts, onUpdate, onViewDetails }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredContacts = useMemo(() => {
        return contacts.filter(c =>
            (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [contacts, searchTerm]);

    const handleStatusChange = async (contactId: number, newStatus: CrmContactStatus) => {
        await contactService.updateContactStatus(contactId, newStatus);
        onUpdate();
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md h-full flex flex-col">
            <div className="p-4 border-b dark:border-slate-700">
                <input
                    type="text"
                    placeholder={`Search ${status.toLowerCase()}s...`}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/2 p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm bg-white dark:bg-slate-700"
                />
            </div>
            <div className="overflow-x-auto flex-grow">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Source</th>
                            <th scope="col" className="px-6 py-3">Date Added</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContacts.map(contact => (
                            <tr key={contact.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/20">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{contact.name}</td>
                                <td className="px-6 py-4">{contact.email}</td>
                                <td className="px-6 py-4">{contact.source}</td>
                                <td className="px-6 py-4">{new Date(contact.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <select
                                        value={contact.status}
                                        onChange={(e) => handleStatusChange(contact.id, e.target.value as CrmContactStatus)}
                                        className="p-1 border-0 rounded bg-transparent text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => onViewDetails(contact)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredContacts.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        No {status.toLowerCase()}s found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactsView;