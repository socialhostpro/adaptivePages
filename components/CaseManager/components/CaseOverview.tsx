'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Clock, FileText, Users, Calendar, DollarSign, MessageSquare, History } from 'lucide-react';
import { StatusBadge, DateDisplay, CurrencyDisplay, PermissionGate } from './common';
import { CaseDetail, CaseEvent, TeamMember, Party } from '../types';
import { getCurrentUser } from '../utils/permissions';

// Mock data
const mockCaseDetail: CaseDetail = {
  id: 'CASE-2025-000317',
  title: 'Smith v. Johnson Personal Injury',
  description: 'Motor vehicle accident on I-95 resulting in serious injuries to plaintiff. Defendant ran red light.',
  caseType: 'Personal Injury',
  jurisdiction: 'FL - Leon County',
  court: '2nd Judicial Circuit',
  leadAttorneyId: 'atty-1',
  leadAttorneyName: 'Sarah Wilson',
  clientId: 'client-1',
  clientName: 'John Smith',
  status: 'Open',
  stage: 'Discovery',
  openedAt: '2024-12-15T00:00:00Z',
  nextEventAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-10T14:30:00Z',
  tags: ['PI', 'Motor Vehicle', 'High Value'],
  team: [
    { userId: 'atty-1', name: 'Sarah Wilson', role: 'Attorney' },
    { userId: 'para-1', name: 'Maria Garcia', role: 'Paralegal' },
    { userId: 'bill-1', name: 'Tom Johnson', role: 'Billing' }
  ],
  parties: [
    {
      id: 'party-1',
      role: 'Client',
      contactId: 'contact-1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      notes: 'Primary plaintiff in motor vehicle accident'
    },
    {
      id: 'party-2',
      role: 'Opposing',
      contactId: 'contact-2',
      name: 'Rachel Johnson',
      email: 'rachel.johnson@email.com',
      phone: '(555) 987-6543',
      notes: 'Defendant driver'
    }
  ],
  docket: [],
  tasks: [
    {
      id: 'task-1',
      caseId: 'CASE-2025-000317',
      title: 'Request medical records',
      status: 'In Progress',
      priority: 'High',
      assigneeId: 'para-1',
      dueAt: '2025-01-20T00:00:00Z',
      notes: 'Need complete records from hospital',
      watchers: ['atty-1'],
      createdAt: '2025-01-10T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z'
    }
  ],
  financials: {
    billed: 25000.00,
    paid: 15000.00,
    outstanding: 10000.00,
    trustBalance: 5000.00,
    currency: 'USD'
  },
  confidentiality: {
    piiMasked: false,
    restricted: false
  },
  history: [
    {
      timestamp: '2025-01-10T14:30:00Z',
      user: 'Sarah Wilson',
      description: 'Updated case status to Open'
    },
    {
      timestamp: '2024-12-15T00:00:00Z',
      user: 'Maria Garcia',
      description: 'Case created and assigned to team'
    }
  ]
};

interface CaseOverviewProps {
  caseId: string;
  onBack?: () => void;
  onEdit?: () => void;
}

export function CaseOverview({ caseId, onBack, onEdit }: CaseOverviewProps) {
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [notes, setNotes] = useState('');
  
  const user = getCurrentUser();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCaseDetail(mockCaseDetail);
      setLoading(false);
    }, 500);
  }, [caseId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!caseDetail) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-slate-400">Case not found</p>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'parties', label: 'Parties', icon: Users },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'notes', label: 'Notes', icon: MessageSquare },
    { id: 'history', label: 'History', icon: History }
  ];

  const handleAddNote = () => {
    if (notes.trim()) {
      console.log('Adding note:', notes);
      setNotes('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-md"
              title="Back to cases"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{caseDetail.title}</h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-500 dark:text-slate-400">{caseDetail.id}</span>
              <StatusBadge status={caseDetail.status} type="case" />
              {caseDetail.stage && (
                <span className="text-sm text-gray-500 dark:text-slate-400">• {caseDetail.stage}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <PermissionGate permission="manage_tasks" userRole={user.role}>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Plus className="h-4 w-4 mr-1" />
              New Task
            </button>
          </PermissionGate>
          
          <PermissionGate permission="upload_documents" userRole={user.role}>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <FileText className="h-4 w-4 mr-1" />
              Upload Doc
            </button>
          </PermissionGate>
          
          <PermissionGate permission="file_docket" userRole={user.role}>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Calendar className="h-4 w-4 mr-1" />
              Add Docket
            </button>
          </PermissionGate>
          
          <PermissionGate permission="log_time" userRole={user.role}>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Clock className="h-4 w-4 mr-1" />
              Log Time
            </button>
          </PermissionGate>
          
          <PermissionGate permission="edit_case" userRole={user.role}>
            <button
              onClick={onEdit}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Edit Case
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Case Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-800 shadow rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Case Information</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Case Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{caseDetail.caseType}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Jurisdiction</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{caseDetail.jurisdiction || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Court</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{caseDetail.court || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Lead Attorney</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{caseDetail.leadAttorneyName || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Client</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{caseDetail.clientName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Opened</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      <DateDisplay date={caseDetail.openedAt} format="long" />
                    </dd>
                  </div>
                  {caseDetail.nextEventAt && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Next Event</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        <DateDisplay date={caseDetail.nextEventAt} format="time" />
                      </dd>
                    </div>
                  )}
                  {caseDetail.description && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{caseDetail.description}</dd>
                    </div>
                  )}
                  {caseDetail.tags.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Tags</dt>
                      <dd className="mt-1">
                        <div className="flex flex-wrap gap-2">
                          {caseDetail.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Recent Tasks */}
              <div className="bg-white dark:bg-slate-800 shadow rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Tasks</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-500">View All</button>
                </div>
                <div className="space-y-3">
                  {caseDetail.tasks.slice(0, 3).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <StatusBadge status={task.status} type="task" />
                          <StatusBadge status={task.priority} type="priority" />
                          {task.dueAt && (
                            <span className="text-xs text-gray-500 dark:text-slate-400">
                              Due: <DateDisplay date={task.dueAt} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {caseDetail.tasks.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">No tasks yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* KPIs */}
              <div className="bg-white dark:bg-slate-800 shadow rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-slate-400">Open Tasks</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {caseDetail.tasks.filter(t => t.status !== 'Done' && t.status !== 'Canceled').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-slate-400">Next Deadline</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {caseDetail.nextEventAt ? <DateDisplay date={caseDetail.nextEventAt} /> : '-'}
                    </span>
                  </div>
                  <PermissionGate permission="view_financials" userRole={user.role}>
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500 dark:text-slate-400">Billed</span>
                        <CurrencyDisplay amount={caseDetail.financials.billed} className="text-sm font-medium text-gray-900 dark:text-white" />
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500 dark:text-slate-400">Outstanding</span>
                        <CurrencyDisplay amount={caseDetail.financials.outstanding} className="text-sm font-medium text-red-600" />
                      </div>
                      {caseDetail.financials.trustBalance && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-slate-400">Trust Balance</span>
                          <CurrencyDisplay amount={caseDetail.financials.trustBalance} className="text-sm font-medium text-green-600" />
                        </div>
                      )}
                    </div>
                  </PermissionGate>
                </div>
              </div>

              {/* Team */}
              <div className="bg-white dark:bg-slate-800 shadow rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team</h3>
                  <PermissionGate permission="manage_parties" userRole={user.role}>
                    <button className="text-sm text-blue-600 hover:text-blue-500">Manage</button>
                  </PermissionGate>
                </div>
                <div className="space-y-3">
                  {caseDetail.team.map(member => (
                    <div key={member.userId} className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-700">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'parties' && (
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Parties</h3>
              <PermissionGate permission="manage_parties" userRole={user.role}>
                <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Party
                </button>
              </PermissionGate>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {caseDetail.parties.map(party => (
                    <tr key={party.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{party.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={party.role} type="case" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {party.email && <div>{party.email}</div>}
                        {party.phone && <div>{party.phone}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 max-w-xs truncate">
                        {party.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <PermissionGate permission="manage_parties" userRole={user.role}>
                          <button className="text-blue-600 hover:text-blue-900">Edit</button>
                        </PermissionGate>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Members</h3>
              <PermissionGate permission="manage_parties" userRole={user.role}>
                <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Member
                </button>
              </PermissionGate>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {caseDetail.team.map(member => (
                  <div key={member.userId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{member.role}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <PermissionGate permission="manage_parties" userRole={user.role}>
                        <button className="text-sm text-blue-600 hover:text-blue-500">
                          Edit Permissions
                        </button>
                      </PermissionGate>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            {/* Add Note */}
            <div className="bg-white dark:bg-slate-800 shadow rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Note</h3>
              <div className="space-y-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a note about this case..."
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddNote}
                    disabled={!notes.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Notes */}
            <div className="bg-white dark:bg-slate-800 shadow rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Case Notes</h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">No notes yet</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Audit History</h3>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {caseDetail.history.map((event, eventIdx) => (
                    <li key={eventIdx}>
                      <div className="relative pb-8">
                        {eventIdx !== caseDetail.history.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <History className="h-4 w-4 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-slate-400">
                                {event.description} by <span className="font-medium text-gray-900 dark:text-white">{event.user}</span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-slate-400">
                              <DateDisplay date={event.timestamp} format="time" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
