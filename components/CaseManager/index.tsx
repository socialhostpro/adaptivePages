'use client';

import React, { useState } from 'react';
import { FileText, Users, CheckSquare, Calendar, DollarSign, Settings, BarChart3, Search, Home, Menu, X } from 'lucide-react';
import { CasesList } from './components/CasesList';
import { CaseOverview } from './components/CaseOverview';
import { DocumentManagement } from './components/DocumentManagement';
import { TaskManagement } from './components/TaskManagement';
import { CaseSettings } from './components/CaseSettings';
import { CaseDashboard } from './components/CaseDashboard';
import { PermissionGate } from './components/common';
import { getCurrentUser } from './utils/permissions';

type ViewMode = 'dashboard' | 'cases' | 'case-detail' | 'documents' | 'tasks' | 'calendar' | 'financials' | 'analytics' | 'settings';

interface CaseManagerProps {
  initialView?: ViewMode;
  initialCaseId?: string;
  isFullscreen?: boolean;
  onBackToHome?: () => void;
}

export function CaseManager({ initialView = 'dashboard', initialCaseId, isFullscreen = false, onBackToHome }: CaseManagerProps) {
  const [currentView, setCurrentView] = useState<ViewMode>(initialView);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(initialCaseId || null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const user = getCurrentUser();

  const navigation = [
    { name: 'Dashboard', icon: Home, view: 'dashboard' as ViewMode, permission: 'view_dashboard' },
    { name: 'Cases', icon: FileText, view: 'cases' as ViewMode, permission: 'view_case' },
    { name: 'Documents', icon: FileText, view: 'documents' as ViewMode, permission: 'view_documents' },
    { name: 'Tasks', icon: CheckSquare, view: 'tasks' as ViewMode, permission: 'manage_tasks' },
    { name: 'Calendar', icon: Calendar, view: 'calendar' as ViewMode, permission: 'manage_deadlines' },
    { name: 'Financials', icon: DollarSign, view: 'financials' as ViewMode, permission: 'view_billing' },
    { name: 'Analytics', icon: BarChart3, view: 'analytics' as ViewMode, permission: 'view_reports' },
    { name: 'Settings', icon: Settings, view: 'settings' as ViewMode, permission: 'manage_settings' }
  ];

  const handleCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCurrentView('case-detail');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <CaseDashboard onCaseSelect={handleCaseSelect} onViewAllCases={() => setCurrentView('cases')} />;
      case 'cases':
        return <CasesList onCaseSelect={handleCaseSelect} />;
      case 'case-detail':
        return selectedCaseId ? <CaseOverview caseId={selectedCaseId} /> : <div>No case selected</div>;
      case 'documents':
        return <DocumentManagement caseId={selectedCaseId || 'all'} />;
      case 'tasks':
        return <TaskManagement caseId={selectedCaseId || 'all'} />;
      case 'settings':
        return <CaseSettings />;
      case 'calendar':
        return <div className="text-center py-12"><Calendar className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium text-gray-900">Calendar & Docket</h3></div>;
      case 'financials':
        return <div className="text-center py-12"><DollarSign className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium text-gray-900">Financial Management</h3></div>;
      case 'analytics':
        return <div className="text-center py-12"><BarChart3 className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium text-gray-900">Analytics & Reporting</h3></div>;
      default:
        return <div>Page not found</div>;
    }
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'cases': return 'Cases';
      case 'case-detail': return 'Case Details';
      case 'documents': return 'Documents';
      case 'tasks': return 'Tasks';
      case 'calendar': return 'Calendar';
      case 'financials': return 'Financials';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      default: return 'Case Manager';
    }
  };

  return (
    <div className="h-screen w-screen bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
      {/* Mobile Header - ONLY on phone */}
      <div className="md:hidden bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Home className="h-5 w-5 text-gray-500 dark:text-slate-400" />
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Case Manager</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-md text-gray-400 dark:text-slate-400 hover:text-gray-500 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay - ONLY on phone */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.view;
                return (
                  <div key={item.name}>
                    <PermissionGate permission={item.permission} userRole={user.role}>
                      <button
                        onClick={() => {
                          setCurrentView(item.view);
                          if (item.view === 'cases' || item.view === 'dashboard') setSelectedCaseId(null);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                          isActive ? 'bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </button>
                    </PermissionGate>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Tab Navigation - ALWAYS VISIBLE */}
      <div className="block bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="px-4">
          <nav className="flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <div key={item.name}>
                  <PermissionGate permission={item.permission} userRole={user.role}>
                    <button
                      onClick={() => {
                        setCurrentView(item.view);
                        if (item.view === 'cases' || item.view === 'dashboard') setSelectedCaseId(null);
                      }}
                      className={`inline-flex items-center px-4 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                        isActive
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-transparent text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mr-2`} />
                      {item.name}
                    </button>
                  </PermissionGate>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content - FULL SCREEN */}
      <div className="flex-1 p-4 bg-white dark:bg-slate-900 overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{getPageTitle()}</h2>
          {currentView === 'case-detail' && selectedCaseId && (
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Case ID: {selectedCaseId}</p>
          )}
        </div>
        <div className="h-full overflow-y-auto">{renderContent()}</div>
      </div>
    </div>
  );
}

export default CaseManager;
