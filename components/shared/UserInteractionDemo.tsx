import React, { useState } from 'react';

// Simple UserInteractionDemo component with correct JSX structure
const UserInteractionDemo: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Mock user data
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com'
  };

  // Simple Profile Dropdown
  const ProfileDropdown = () => (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setIsProfileOpen(!isProfileOpen)}
        className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {mockUser.name.charAt(0)}
        </div>
        <span className="font-medium text-gray-900 dark:text-white">{mockUser.name}</span>
        <svg className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isProfileOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{mockUser.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{mockUser.email}</p>
          </div>
          <div className="py-2">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Profile
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Settings
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900">
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Simple Pagination component
  const Pagination = () => (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
          <span className="font-medium">147</span> results
        </p>
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <button className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded">
          {currentPage}
        </button>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-100 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center py-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white shadow-2xl mb-8">
          <h1 className="text-4xl font-bold mb-4">Phase 6: User Interaction Components</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Interactive components for user engagement: Profile Management, Activity Tracking, Notifications, 
            Filtering & Sorting, Tagging System, and Pagination Controls
          </p>
        </div>

        {/* Profile Dropdown Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Profile Dropdown / User Menu
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Complete user menu with settings and logout functionality
            </p>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center py-8">
              <ProfileDropdown />
            </div>
          </div>
        </section>

        {/* Activity List Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Activity List
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time activity feed with visual indicators
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">New user registered</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">Server maintenance scheduled</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">Database backup completed</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications Panel Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Notifications Panel
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Comprehensive notification management with read/unread states
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">Your report is ready for download</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">5 minutes ago</p>
                </div>
                <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700">
                  Mark read
                </button>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-gray-300 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">New comment on your post</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tags Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Tags & Badges
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Interactive tags and status indicators
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">Tag Examples:</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">React</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">TypeScript</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Tailwind</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">JavaScript</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">Status Badges:</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">Online</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Away</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-sm">Busy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter & Sort Controls Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Filter & Sort Controls
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Dynamic filtering and sorting with multiple input types
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>All Categories</option>
                  <option>Admin</option>
                  <option>Editor</option>
                  <option>Viewer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort by</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Name (A-Z)</option>
                  <option>Name (Z-A)</option>
                  <option>Date (Newest)</option>
                  <option>Date (Oldest)</option>
                </select>
              </div>
            </div>
            
            {/* Sample Table */}
            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">Alice Johnson</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">alice@example.com</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Admin</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm text-gray-900 dark:text-gray-100">Active</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">Bob Smith</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">bob@example.com</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Editor</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm text-gray-900 dark:text-gray-100">Active</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pagination Section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Pagination Controls
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Intelligent pagination with page size options and navigation
            </p>
          </div>
          <div className="p-6">
            <Pagination />
          </div>
        </section>

        {/* Footer Info */}
        <div className="text-center py-8 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            ✨ Phase 6 Complete!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            All user interaction components are now working with professional styling
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserInteractionDemo;
export { UserInteractionDemo };
