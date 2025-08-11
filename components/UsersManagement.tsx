import React, { useState, useEffect } from 'react';
import type { StaffUser, CustomerUser, UserPermission, StaffInvitation, SupportTicket } from '../types';
import UsersIcon from './icons/UsersIcon';
import PlusIcon from './icons/PlusIcon';
import SearchIcon from './icons/SearchIcon';

interface UsersManagementProps {
    onUpdate: () => void;
}

const UsersManagement: React.FC<UsersManagementProps> = ({ onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'staff' | 'customers' | 'invitations' | 'support'>('staff');
    const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
    const [customerUsers, setCustomerUsers] = useState<CustomerUser[]>([]);
    const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);

    const tabs = [
        { key: 'staff' as const, label: 'Staff', icon: UsersIcon },
        { key: 'customers' as const, label: 'Customers', icon: UsersIcon },
        { key: 'invitations' as const, label: 'Invitations', icon: UsersIcon },
        { key: 'support' as const, label: 'Support Tickets', icon: UsersIcon },
    ];

    const permissionOptions: { key: UserPermission; label: string; description: string }[] = [
        { key: 'view_orders', label: 'View Orders', description: 'Can view order information' },
        { key: 'manage_orders', label: 'Manage Orders', description: 'Can create, update, and delete orders' },
        { key: 'view_customers', label: 'View Customers', description: 'Can view customer information' },
        { key: 'manage_customers', label: 'Manage Customers', description: 'Can create, update, and delete customers' },
        { key: 'view_products', label: 'View Products', description: 'Can view product catalog' },
        { key: 'manage_products', label: 'Manage Products', description: 'Can create, update, and delete products' },
        { key: 'view_bookings', label: 'View Bookings', description: 'Can view booking information' },
        { key: 'manage_bookings', label: 'Manage Bookings', description: 'Can create, update, and delete bookings' },
        { key: 'view_contacts', label: 'View Contacts', description: 'Can view contact information' },
        { key: 'manage_contacts', label: 'Manage Contacts', description: 'Can create, update, and delete contacts' },
        { key: 'view_proofing', label: 'View Proofing', description: 'Can view proofing requests' },
        { key: 'manage_proofing', label: 'Manage Proofing', description: 'Can handle proofing workflows' },
        { key: 'view_analytics', label: 'View Analytics', description: 'Can view business analytics' },
        { key: 'manage_staff', label: 'Manage Staff', description: 'Can invite and manage staff members' },
        { key: 'manage_company_settings', label: 'Company Settings', description: 'Can modify company settings' },
    ];

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            // TODO: Replace with actual API calls
            setStaffUsers([
                {
                    id: '1',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    email: 'owner@company.com',
                    name: 'Business Owner',
                    role: 'owner',
                    status: 'active',
                    company_id: 'comp-1',
                    permissions: permissionOptions.map(p => p.key),
                    department: 'Management',
                    title: 'Owner'
                }
            ]);

            setCustomerUsers([
                {
                    id: '1',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    email: 'customer@example.com',
                    name: 'John Customer',
                    role: 'customer',
                    status: 'active',
                    company_id: 'comp-1',
                    phone: '555-0123',
                    total_orders: 5,
                    total_spent: 1250.00,
                    preferred_contact_method: 'email'
                }
            ]);

            setInvitations([]);
            setSupportTickets([]);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const filteredStaff = staffUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCustomers = customerUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderStaffTab = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Staff Management</h2>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <PlusIcon className="w-4 h-4" />
                    Invite Staff
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search staff..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                    Staff Member
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                    Role & Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                    Permissions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredStaff.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                {user.name}
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                {user.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                {user.role === 'owner' ? 'Owner' : 'Staff'}
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                {user.department} • {user.title}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.status === 'active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            {user.permissions.length} permissions
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                                            Edit
                                        </button>
                                        {user.role !== 'owner' && (
                                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                Remove
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderCustomersTab = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Customer Management</h2>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <PlusIcon className="w-4 h-4" />
                    Add Customer
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                    Contact Info
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                    Orders & Spending
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredCustomers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                {user.name}
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                Customer since {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm text-slate-900 dark:text-white">
                                                {user.email}
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                {user.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                {user.total_orders} orders
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                ${user.total_spent?.toFixed(2)} total
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.status === 'active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                                            View Portal
                                        </button>
                                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                                            Edit
                                        </button>
                                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                            Suspend
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'staff':
                return renderStaffTab();
            case 'customers':
                return renderCustomersTab();
            case 'invitations':
                return <div className="text-center py-8 text-slate-500">Staff invitations coming soon...</div>;
            case 'support':
                return <div className="text-center py-8 text-slate-500">Support tickets coming soon...</div>;
            default:
                return renderStaffTab();
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
            <div className="flex-shrink-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="flex space-x-1 p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-grow overflow-auto p-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default UsersManagement;
