'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, Download, MoreVertical, Eye, Edit, UserPlus, Clock, FileText, FolderPlus } from 'lucide-react';
import { StatusBadge, DateDisplay, PermissionGate } from './common';
import { CaseRow, CaseStatus } from '../types';
import { PermissionService, getCurrentUser } from '../utils/permissions';

interface CasesListProps {
  onCaseSelect?: (caseId: string) => void;
  searchQuery?: string;
}

// Mock data - replace with actual API calls
const mockCases: CaseRow[] = [
  {
    id: 'CASE-2025-000317',
    title: 'Personal Injury - Motor Vehicle Accident',
    caseType: 'Personal Injury',
    clientId: 'client-1',
    clientName: 'John Smith',
    leadAttorneyId: 'atty-1',
    leadAttorneyName: 'Sarah Wilson',
    status: 'Open',
    stage: 'Discovery',
    openedAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-19T14:45:00Z',
    nextEventAt: '2025-02-15T09:00:00Z',
    tags: ['motor-vehicle', 'personal-injury', 'active-litigation']
  },
  {
    id: 'CASE-2025-000316',
    title: 'Family Law - Divorce Proceedings',
    caseType: 'Family Law',
    clientId: 'client-2',
    clientName: 'Jane Doe',
    leadAttorneyId: 'atty-2',
    leadAttorneyName: 'Michael Johnson',
    status: 'Open',
    stage: 'Settlement',
    openedAt: '2025-01-10T08:15:00Z',
    updatedAt: '2025-01-18T16:20:00Z',
    nextEventAt: '2025-02-20T14:00:00Z',
    tags: ['family-law', 'divorce', 'child-custody']
  }
];

export function CasesList({ onCaseSelect, searchQuery: globalSearchQuery }: CasesListProps) {
  const [cases, setCases] = useState<CaseRow[]>(mockCases);
  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [practiceAreaFilter, setPracticeAreaFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const user = getCurrentUser();

  // Update search query when global search changes
  useEffect(() => {
    if (globalSearchQuery !== undefined) {
      setSearchQuery(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  // Filter and sort cases
  const filteredCases = useMemo(() => {
    let filtered = cases.filter(case_ => {
      const matchesSearch = searchQuery === '' || 
        case_.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        case_.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        case_.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || case_.priority === priorityFilter;
      const matchesPracticeArea = practiceAreaFilter === 'all' || case_.practiceArea === practiceAreaFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesPracticeArea;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof CaseRow];
      let bValue = b[sortBy as keyof CaseRow];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [cases, searchQuery, statusFilter, priorityFilter, practiceAreaFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectCase = (caseId: string) => {
    setSelectedCases(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
  };

  const handleSelectAll = () => {
    setSelectedCases(
      selectedCases.length === filteredCases.length ? [] : filteredCases.map(c => c.id)
    );
  };

  const getStatusColor = (status: CaseStatus): string => {
    const colors = {
      'Intake': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'Open': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'Stayed': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'Settled': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'Closed': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      'Archived': 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const getStageColor = (stage: string | undefined): string => {
    if (!stage) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    
    const colors = {
      'Discovery': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'Settlement': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'Trial': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'Pre-Trial': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cases</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {filteredCases.length} of {cases.length} cases
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <PermissionGate permission="export_data" userRole={user.role}>
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </PermissionGate>
          
          <PermissionGate permission="manage_cases" userRole={user.role}>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-800 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-slate-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 dark:text-white"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="Intake">Intake</option>
              <option value="Open">Open</option>
              <option value="Stayed">Stayed</option>
              <option value="Settled">Settled</option>
              <option value="Closed">Closed</option>
              <option value="Archived">Archived</option>
            </select>
            
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Filter className="h-4 w-4 mr-1" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-slate-700">
        <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedCases.length === filteredCases.length && filteredCases.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
              aria-label="Select all cases"
            />
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
              {selectedCases.length > 0 ? `${selectedCases.length} selected` : 'Select all'}
            </span>
          </div>
        </div>

        <ul className="divide-y divide-gray-200 dark:divide-slate-700">
          {paginatedCases.map((case_) => (
            <li key={case_.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
              <div className="px-4 py-4 flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedCases.includes(case_.id)}
                  onChange={() => handleSelectCase(case_.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                  aria-label={`Select case ${case_.title}`}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {case_.title}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          {case_.id}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-slate-400">
                        <span>Client: {case_.clientName}</span>
                        <span>•</span>
                        <span>Attorney: {case_.leadAttorneyName}</span>
                        <span>•</span>
                        <span>Stage: {case_.stage}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                        {case_.status}
                      </span>
                      
                      {case_.stage && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(case_.stage)}`}>
                          {case_.stage}
                        </span>
                      )}
                      
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-slate-400">
                        <span>{case_.caseType}</span>
                      </div>
                      
                      <button 
                        onClick={() => onCaseSelect?.(case_.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        title={`View case ${case_.id}`}
                        aria-label={`View case ${case_.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 sm:px-6">
          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          
          <div className="text-sm text-gray-700 dark:text-slate-300">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCases.length)} of {filteredCases.length} results
          </div>
        </div>
      </div>
    </div>
  );
}

export default CasesList;
