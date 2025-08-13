'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, Eye, Search, Filter, MoreHorizontal, Plus, FolderPlus, Star, Share2, Trash2 } from 'lucide-react';
import { StatusBadge, DateDisplay, PermissionGate } from './common';
import { Select, Input, Checkbox } from './shared/FormComponents';
import { CaseDocument, DocumentFolder } from '../types';
import { getCurrentUser } from '../utils/permissions';

// Mock data
const mockDocuments: CaseDocument[] = [
  {
    id: 'doc-1',
    caseId: 'CASE-2025-000317',
    name: 'Medical Records - Hospital A',
    originalName: 'medical_records_2024.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 2456789,
    uploadedBy: 'Maria Garcia',
    uploadedAt: '2025-01-10T14:30:00Z',
    category: 'Medical Records',
    status: 'Active',
    isEvidence: true,
    confidential: true,
    folderId: null,
    pages: 45,
    checksum: 'abc123',
    ocrCompleted: true,
    ocrText: 'Patient presented with severe injuries...',
    version: 1,
    versionHistory: [],
    tags: ['Medical', 'Evidence', 'Hospital A'],
    metadata: {
      'Patient Name': 'John Smith',
      'Date of Service': '2024-11-15',
      'Provider': 'General Hospital'
    }
  },
  {
    id: 'doc-2',
    caseId: 'CASE-2025-000317',
    name: 'Police Report',
    originalName: 'accident_report_123456.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1234567,
    uploadedBy: 'Sarah Wilson',
    uploadedAt: '2025-01-08T10:15:00Z',
    category: 'Legal Documents',
    status: 'Active',
    isEvidence: true,
    confidential: false,
    folderId: null,
    pages: 12,
    checksum: 'def456',
    ocrCompleted: true,
    ocrText: 'Traffic collision occurred at...',
    version: 1,
    versionHistory: [],
    tags: ['Police', 'Evidence', 'Accident'],
    metadata: {
      'Incident Date': '2024-11-01',
      'Report Number': '123456',
      'Officer': 'Officer Johnson'
    }
  }
];

const mockFolders: DocumentFolder[] = [
  {
    id: 'folder-1',
    caseId: 'CASE-2025-000317',
    name: 'Discovery',
    description: 'Discovery phase documents',
    parentId: null,
    createdBy: 'Sarah Wilson',
    createdAt: '2024-12-15T00:00:00Z',
    color: '#3B82F6'
  },
  {
    id: 'folder-2',
    caseId: 'CASE-2025-000317',
    name: 'Evidence',
    description: 'Key evidence documents',
    parentId: null,
    createdBy: 'Maria Garcia',
    createdAt: '2024-12-15T00:00:00Z',
    color: '#EF4444'
  }
];

interface DocumentManagementProps {
  caseId: string;
}

export function DocumentManagement({ caseId }: DocumentManagementProps) {
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const user = getCurrentUser();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDocuments(mockDocuments);
      setFolders(mockFolders);
      setLoading(false);
    }, 500);
  }, [caseId]);

  const categories = [...new Set(documents.map(doc => doc.category))];
  
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    const matchesFolder = selectedFolder === null || doc.folderId === selectedFolder;
    return matchesSearch && matchesCategory && matchesFolder;
  });

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSelectDocument = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on documents:`, selectedDocuments);
    setSelectedDocuments([]);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
          <p className="text-sm text-gray-500 mt-1">
            {documents.length} documents in {folders.length} folders
          </p>
        </div>
        
        <div className="flex space-x-2">
          <PermissionGate permission="upload_documents" userRole={user.role}>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FolderPlus className="h-4 w-4 mr-1" />
              New Folder
            </button>
          </PermissionGate>
          
          <PermissionGate permission="upload_documents" userRole={user.role}>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload Documents
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <Input
                type="search"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="pl-10"
                aria-label="Search documents"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categories.map(category => ({ value: category, label: category }))}
              placeholder="All Categories"
              aria-label="Filter by category"
            />
            
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium border ${
                  viewMode === 'list' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } rounded-l-md`}
                title="List view"
              >
                List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium border-t border-r border-b ${
                  viewMode === 'grid' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } rounded-r-md`}
                title="Grid view"
              >
                Grid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Folder Navigation */}
      {folders.length > 0 && (
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedFolder(null)}
              className={`px-3 py-1 rounded-md text-sm ${
                selectedFolder === null 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Documents
            </button>
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`px-3 py-1 rounded-md text-sm flex items-center ${
                  selectedFolder === folder.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2 bg-blue-500" 
                  title={folder.name}
                ></div>
                {folder.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedDocuments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <PermissionGate permission="download_documents" userRole={user.role}>
                <button
                  onClick={() => handleBulkAction('download')}
                  className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
              </PermissionGate>
              
              <PermissionGate permission="manage_documents" userRole={user.role}>
                <button
                  onClick={() => handleBulkAction('move')}
                  className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                >
                  Move to Folder
                </button>
              </PermissionGate>
              
              <PermissionGate permission="delete_documents" userRole={user.role}>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </PermissionGate>
            </div>
          </div>
        </div>
      )}

      {/* Documents List/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <Checkbox
                    checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                    onChange={handleSelectAll}
                    aria-label="Select all documents"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filteredDocuments.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Checkbox
                      checked={selectedDocuments.includes(doc.id)}
                      onChange={() => handleSelectDocument(doc.id)}
                      aria-label={`Select ${doc.name}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-500">{doc.originalName}</div>
                        {doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {doc.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {tag}
                              </span>
                            ))}
                            {doc.tags.length > 3 && (
                              <span className="text-xs text-gray-500">+{doc.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={doc.category} type="document" />
                    <div className="flex items-center mt-1 space-x-2">
                      {doc.isEvidence && (
                        <Star className="h-3 w-3 text-yellow-500" title="Evidence" />
                      )}
                      {doc.confidential && (
                        <span className="text-xs text-red-600" title="Confidential">Confidential</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(doc.sizeBytes)}
                    {doc.pages && <div className="text-xs">{doc.pages} pages</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <DateDisplay date={doc.uploadedAt} />
                    <div className="text-xs">{doc.uploadedBy}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={doc.status} type="document" />
                    {doc.ocrCompleted && (
                      <div className="text-xs text-green-600 mt-1">OCR Complete</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <PermissionGate permission="view_documents" userRole={user.role}>
                        <button className="text-gray-400 hover:text-gray-600" title="Preview">
                          <Eye className="h-4 w-4" />
                        </button>
                      </PermissionGate>
                      
                      <PermissionGate permission="download_documents" userRole={user.role}>
                        <button className="text-gray-400 hover:text-gray-600" title="Download">
                          <Download className="h-4 w-4" />
                        </button>
                      </PermissionGate>
                      
                      <PermissionGate permission="share_documents" userRole={user.role}>
                        <button className="text-gray-400 hover:text-gray-600" title="Share">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </PermissionGate>
                      
                      <button className="text-gray-400 hover:text-gray-600" title="More actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or filters.' 
                  : 'Get started by uploading your first document.'}
              </p>
              <PermissionGate permission="upload_documents" userRole={user.role}>
                <div className="mt-6">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </button>
                </div>
              </PermissionGate>
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map(doc => (
            <div key={doc.id} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <Checkbox
                  checked={selectedDocuments.includes(doc.id)}
                  onChange={() => handleSelectDocument(doc.id)}
                  aria-label={`Select ${doc.name}`}
                />
                <div className="flex items-center space-x-1">
                  {doc.isEvidence && (
                    <Star className="h-4 w-4 text-yellow-500" title="Evidence" />
                  )}
                  {doc.confidential && (
                    <span className="text-xs text-red-600 dark:text-red-400">Confidential</span>
                  )}
                </div>
              </div>
              
              <div className="text-center mb-4">
                <FileText className="h-12 w-12 text-gray-400 dark:text-slate-500 mx-auto mb-2" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={doc.name}>
                  {doc.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate" title={doc.originalName}>
                  {doc.originalName}
                </p>
              </div>
              
              <div className="space-y-2 text-xs text-gray-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>{formatFileSize(doc.sizeBytes)}</span>
                </div>
                {doc.pages && (
                  <div className="flex justify-between">
                    <span>Pages:</span>
                    <span>{doc.pages}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Uploaded:</span>
                  <span><DateDisplay date={doc.uploadedAt} /></span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                <StatusBadge status={doc.category} type="document" className="mb-2" />
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200">
                        {tag}
                      </span>
                    ))}
                    {doc.tags.length > 2 && (
                      <span className="text-xs text-gray-500 dark:text-slate-400">+{doc.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-center space-x-2">
                <PermissionGate permission="view_documents" userRole={user.role}>
                  <button className="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300" title="Preview">
                    <Eye className="h-4 w-4" />
                  </button>
                </PermissionGate>
                
                <PermissionGate permission="download_documents" userRole={user.role}>
                  <button className="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300" title="Download">
                    <Download className="h-4 w-4" />
                  </button>
                </PermissionGate>
                
                <PermissionGate permission="share_documents" userRole={user.role}>
                  <button className="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300" title="Share">
                    <Share2 className="h-4 w-4" />
                  </button>
                </PermissionGate>
                
                <button className="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300" title="More actions">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal Placeholder */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upload Documents</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              Document upload functionality would be implemented here with drag-and-drop support, 
              metadata extraction, and automatic OCR processing.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
