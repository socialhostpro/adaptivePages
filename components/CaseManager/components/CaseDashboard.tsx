'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  FileText, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Phone,
  Mail,
  MessageSquare,
  ChevronRight,
  Eye
} from 'lucide-react';

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  totalClients: number;
  upcomingDeadlines: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface UpcomingDate {
  id: string;
  caseId: string;
  caseName: string;
  clientName: string;
  type: 'hearing' | 'deadline' | 'appointment' | 'filing';
  date: string;
  time: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface ClientContact {
  id: string;
  clientName: string;
  caseId: string;
  caseName: string;
  lastContactDate: string;
  contactType: 'phone' | 'email' | 'meeting' | 'text';
  daysSinceContact: number;
  notes: string;
}

interface CaseDashboardProps {
  onCaseSelect?: (caseId: string) => void;
  onViewAllCases?: () => void;
}

export function CaseDashboard({ onCaseSelect, onViewAllCases }: CaseDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 45,
    activeCases: 32,
    completedCases: 13,
    totalClients: 38,
    upcomingDeadlines: 7,
    totalRevenue: 485000,
    monthlyRevenue: 52000
  });

  const [upcomingDates, setUpcomingDates] = useState<UpcomingDate[]>([
    {
      id: '1',
      caseId: 'CASE-001',
      caseName: 'Johnson v. State Insurance',
      clientName: 'Maria Johnson',
      type: 'hearing',
      date: '2025-08-15',
      time: '09:00',
      description: 'Pre-trial hearing',
      priority: 'high'
    },
    {
      id: '2',
      caseId: 'CASE-003',
      caseName: 'Smith Corp Contract Dispute',
      clientName: 'Robert Smith',
      type: 'deadline',
      date: '2025-08-16',
      time: '17:00',
      description: 'Discovery response due',
      priority: 'high'
    },
    {
      id: '3',
      caseId: 'CASE-007',
      caseName: 'Davis Employment Case',
      clientName: 'Jennifer Davis',
      type: 'appointment',
      date: '2025-08-18',
      time: '14:30',
      description: 'Client consultation',
      priority: 'medium'
    },
    {
      id: '4',
      caseId: 'CASE-012',
      caseName: 'Williams Estate Planning',
      clientName: 'Thomas Williams',
      type: 'filing',
      date: '2025-08-20',
      time: '16:00',
      description: 'Will filing deadline',
      priority: 'medium'
    }
  ]);

  const [clientContacts, setClientContacts] = useState<ClientContact[]>([
    {
      id: '1',
      clientName: 'Maria Johnson',
      caseId: 'CASE-001',
      caseName: 'Johnson v. State Insurance',
      lastContactDate: '2025-08-11',
      contactType: 'phone',
      daysSinceContact: 1,
      notes: 'Discussed settlement options'
    },
    {
      id: '2',
      clientName: 'Robert Smith',
      caseId: 'CASE-003',
      caseName: 'Smith Corp Contract Dispute',
      lastContactDate: '2025-08-09',
      contactType: 'email',
      daysSinceContact: 3,
      notes: 'Sent discovery documents for review'
    },
    {
      id: '3',
      clientName: 'Jennifer Davis',
      caseId: 'CASE-007',
      caseName: 'Davis Employment Case',
      lastContactDate: '2025-08-07',
      contactType: 'meeting',
      daysSinceContact: 5,
      notes: 'In-person meeting about case strategy'
    },
    {
      id: '4',
      clientName: 'Michael Brown',
      caseId: 'CASE-009',
      caseName: 'Brown Personal Injury',
      lastContactDate: '2025-08-04',
      contactType: 'phone',
      daysSinceContact: 8,
      notes: 'Called to check on medical appointments'
    },
    {
      id: '5',
      clientName: 'Sarah Wilson',
      caseId: 'CASE-015',
      caseName: 'Wilson Divorce Proceedings',
      lastContactDate: '2025-07-30',
      contactType: 'email',
      daysSinceContact: 13,
      notes: 'Sent custody agreement draft'
    },
    {
      id: '6',
      clientName: 'David Garcia',
      caseId: 'CASE-018',
      caseName: 'Garcia Real Estate Dispute',
      lastContactDate: '2025-07-25',
      contactType: 'text',
      daysSinceContact: 18,
      notes: 'Quick update on property inspection'
    }
  ]);

  const getContactCardColor = (daysSinceContact: number) => {
    if (daysSinceContact <= 5) {
      return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
    } else if (daysSinceContact <= 10) {
      return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20';
    } else {
      return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
    }
  };

  const getContactCardTextColor = (daysSinceContact: number) => {
    if (daysSinceContact <= 5) {
      return 'text-blue-800 dark:text-blue-200';
    } else if (daysSinceContact <= 10) {
      return 'text-orange-800 dark:text-orange-200';
    } else {
      return 'text-red-800 dark:text-red-200';
    }
  };

  const getContactIcon = (contactType: string) => {
    switch (contactType) {
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'text': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-orange-600 dark:text-orange-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hearing': return <Users className="w-4 h-4" />;
      case 'deadline': return <Clock className="w-4 h-4" />;
      case 'appointment': return <Calendar className="w-4 h-4" />;
      case 'filing': return <FileText className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                  Total Cases
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {stats.totalCases}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                  Active Cases
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {stats.activeCases}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                  Total Clients
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {stats.totalClients}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                  Monthly Revenue
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(stats.monthlyRevenue)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Court Dates & Deadlines */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Dates
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                {upcomingDates.length} upcoming
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingDates.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  onClick={() => onCaseSelect?.(item.caseId)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-gray-100 dark:bg-slate-700 ${getPriorityColor(item.priority)}`}>
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.description}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {item.clientName} • {item.caseName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-slate-500">
                        {formatDate(item.date)} at {item.time}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <button className="w-full text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                View all upcoming dates
              </button>
            </div>
          </div>
        </div>

        {/* Client Contact Tracking */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Client Contact Status
              </h3>
              <div className="flex items-center space-x-2 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-500 dark:text-slate-400">0-5 days</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-500 dark:text-slate-400">5-10 days</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-500 dark:text-slate-400">10+ days</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {clientContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getContactCardColor(contact.daysSinceContact)}`}
                  onClick={() => onCaseSelect?.(contact.caseId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getContactCardTextColor(contact.daysSinceContact)}`}>
                        {getContactIcon(contact.contactType)}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${getContactCardTextColor(contact.daysSinceContact)}`}>
                          {contact.clientName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {contact.caseName}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">
                          {contact.notes}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${getContactCardTextColor(contact.daysSinceContact)}`}>
                        {contact.daysSinceContact} days ago
                      </p>
                      <p className="text-xs text-gray-400 dark:text-slate-500">
                        {formatDate(contact.lastContactDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <button 
                className="w-full text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                onClick={onViewAllCases}
              >
                View all client contacts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                  Cases Completed
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {stats.completedCases}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                  Upcoming Deadlines
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {stats.upcomingDeadlines}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                  Total Revenue
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalRevenue)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
