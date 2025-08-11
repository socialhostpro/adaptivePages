

import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { CrmContact, CrmForm, Task } from './types';
import ContactsView from './components/ContactsView';
import FormBuilderView from './components/FormBuilderView';
import ContactDetailModal from './components/ContactDetailModal';

interface ContactManagementProps {
    session: Session;
    contacts: CrmContact[];
    forms: CrmForm[];
    onUpdate: () => void;
    allTasks: Task[];
    onOpenTaskModal: (task: Task | null, initialLink: any) => void;
}

const ContactManagement: React.FC<ContactManagementProps> = ({ session, contacts, forms, onUpdate, allTasks, onOpenTaskModal }) => {
    const [activeTab, setActiveTab] = useState('contacts');
    const [viewingContact, setViewingContact] = useState<CrmContact | null>(null);

    const tabs = [
        { key: 'contacts', label: 'Contacts' },
        { key: 'leads', label: 'Leads' },
        { key: 'opportunities', label: 'Opportunities' },
        { key: 'formBuilder', label: 'Form Builder' },
    ];

    const renderContent = () => {
        const commonProps = { onUpdate, onViewDetails: setViewingContact };
        switch(activeTab) {
            case 'contacts':
                return <ContactsView status="Contact" contacts={contacts.filter(c => c.status === 'Contact')} {...commonProps} />;
            case 'leads':
                return <ContactsView status="Lead" contacts={contacts.filter(c => c.status === 'Lead')} {...commonProps} />;
            case 'opportunities':
                return <ContactsView status="Opportunity" contacts={contacts.filter(c => c.status === 'Opportunity')} {...commonProps} />;
            case 'formBuilder':
                return <FormBuilderView forms={forms} onUpdate={onUpdate} userId={session.user.id} />;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.key
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex-grow pt-6 min-h-0">
                {renderContent()}
            </div>
            {viewingContact && (
                <ContactDetailModal
                    isOpen={!!viewingContact}
                    onClose={() => setViewingContact(null)}
                    contact={viewingContact}
                    allTasks={allTasks}
                    onOpenTaskModal={onOpenTaskModal}
                />
            )}
        </div>
    );
};

export default ContactManagement;