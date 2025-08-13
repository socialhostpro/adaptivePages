/**
 * Phase 4 Data Display Components Demo
 * Comprehensive showcase of all data visualization and display components
 */

import React, { useState } from 'react';
import { DataTable, type TableColumn, type TableAction } from './DataTable';
import { Card, StatCard, ImageCard } from './Card';
import { ListView, ContactList, type ListItem } from './ListView';
import { LineChart, BarChart, PieChart, Sparkline } from './Charts';
import { Calendar, DatePicker, type DateRange } from './Calendar';
import { KanbanBoard, type KanbanColumn, type KanbanCard } from './KanbanBoard';

// Sample data for demos
const sampleUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', lastLogin: '2024-08-12', orders: 15 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', lastLogin: '2024-08-11', orders: 8 },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive', lastLogin: '2024-08-10', orders: 3 },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Moderator', status: 'Active', lastLogin: '2024-08-12', orders: 12 },
  { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Pending', lastLogin: '2024-08-09', orders: 0 }
];

const chartData = {
  line: [
    { name: 'Revenue', data: [4000, 3000, 2000, 2780, 1890, 2390, 3490], color: '#3B82F6' },
    { name: 'Profit', data: [2400, 1398, 9800, 3908, 4800, 3800, 4300], color: '#10B981' }
  ],
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  pie: [
    { label: 'Desktop', value: 44, color: '#3B82F6' },
    { label: 'Mobile', value: 35, color: '#10B981' },
    { label: 'Tablet', value: 21, color: '#F59E0B' }
  ],
  bar: [
    { label: 'Q1', value: 2400 },
    { label: 'Q2', value: 1398 },
    { label: 'Q3', value: 9800 },
    { label: 'Q4', value: 3908 }
  ],
  sparkline: [4, 6, 8, 6, 9, 12, 14, 11, 13, 16, 18, 15, 17, 20, 22, 19, 21, 24]
};

const kanbanData: KanbanColumn[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: '#EF4444',
    cards: [
      {
        id: '1',
        title: 'Design new homepage',
        description: 'Create wireframes and mockups for the new homepage design',
        assignee: { name: 'John Doe' },
        priority: 'high',
        tags: [{ label: 'Design', color: '#8B5CF6' }, { label: 'Frontend' }],
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        comments: 3
      },
      {
        id: '2',
        title: 'User research interviews',
        description: 'Conduct 5 user interviews to understand pain points',
        assignee: { name: 'Jane Smith' },
        priority: 'medium',
        tags: [{ label: 'Research' }],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: 'progress',
    title: 'In Progress',
    color: '#F59E0B',
    cards: [
      {
        id: '3',
        title: 'API integration',
        description: 'Integrate payment gateway API with checkout flow',
        assignee: { name: 'Bob Johnson' },
        priority: 'urgent',
        tags: [{ label: 'Backend' }, { label: 'API' }],
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        attachments: 2,
        comments: 7
      }
    ]
  },
  {
    id: 'review',
    title: 'Review',
    color: '#8B5CF6',
    cards: [
      {
        id: '4',
        title: 'Code review for login system',
        assignee: { name: 'Alice Brown' },
        priority: 'low',
        tags: [{ label: 'Review' }],
        comments: 2
      }
    ]
  },
  {
    id: 'done',
    title: 'Done',
    color: '#10B981',
    cards: [
      {
        id: '5',
        title: 'Set up CI/CD pipeline',
        description: 'Configure automated testing and deployment',
        assignee: { name: 'Charlie Wilson' },
        priority: 'medium',
        tags: [{ label: 'DevOps' }],
        comments: 1
      }
    ]
  }
];

export function Phase4Demo() {
  const [selectedTable, setSelectedTable] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRange, setSelectedRange] = useState<DateRange>({ start: null, end: null });
  const [kanbanColumns, setKanbanColumns] = useState(kanbanData);

  // Table configuration
  const tableColumns: TableColumn[] = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      sortable: true,
      filterable: true,
      filterType: 'text'
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      sortable: true,
      filterable: true,
      filterType: 'text'
    },
    {
      key: 'role',
      title: 'Role',
      dataIndex: 'role',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Admin', value: 'Admin' },
        { label: 'User', value: 'User' },
        { label: 'Moderator', value: 'Moderator' }
      ]
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Active' ? 'bg-green-100 text-green-800' :
          value === 'Inactive' ? 'bg-gray-100 text-gray-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'orders',
      title: 'Orders',
      dataIndex: 'orders',
      sortable: true,
      align: 'right'
    }
  ];

  const bulkActions: TableAction[] = [
    {
      key: 'activate',
      label: 'Activate',
      variant: 'primary',
      onClick: (selectedRows) => console.log('Activating:', selectedRows)
    },
    {
      key: 'deactivate',
      label: 'Deactivate',
      variant: 'secondary',
      onClick: (selectedRows) => console.log('Deactivating:', selectedRows)
    },
    {
      key: 'delete',
      label: 'Delete',
      variant: 'danger',
      onClick: (selectedRows) => console.log('Deleting:', selectedRows)
    }
  ];

  // Kanban handlers
  const handleCardMove = (cardId: string, fromColumnId: string, toColumnId: string, newIndex: number) => {
    console.log('Moving card:', { cardId, fromColumnId, toColumnId, newIndex });
    // Implementation would update the kanban state
  };

  return (
    <div className="phase4-demo p-6 space-y-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎨 Phase 4: Data Display Components
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Complete data visualization and display system with tables, charts, calendars, and kanban boards
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total Users"
            value="2,847"
            icon={<span className="text-2xl">👥</span>}
            trend={{ value: 12, direction: 'up', label: 'vs last month' }}
            color="blue"
          />
          <StatCard
            title="Revenue"
            value="$94,760"
            icon={<span className="text-2xl">💰</span>}
            trend={{ value: 8, direction: 'up', label: 'vs last month' }}
            color="green"
          />
          <StatCard
            title="Orders"
            value="1,293"
            icon={<span className="text-2xl">📦</span>}
            trend={{ value: 3, direction: 'down', label: 'vs last month' }}
            color="red"
          />
          <StatCard
            title="Conversion Rate"
            value="3.24%"
            icon={<span className="text-2xl">📈</span>}
            trend={{ value: 0, direction: 'neutral' }}
            color="purple"
          />
        </div>

        {/* Charts Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📊 Charts & Visualizations</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card title="Revenue Trends" subtitle="Monthly performance">
              <LineChart
                data={chartData.line}
                labels={chartData.labels}
                height={220}
                showLegend={true}
                showGrid={true}
              />
            </Card>

            <Card title="Quarterly Results" subtitle="Revenue by quarter">
              <BarChart
                data={chartData.bar}
                height={220}
                showValues={true}
                showGrid={true}
              />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Traffic Sources" subtitle="User acquisition channels">
              <PieChart
                data={chartData.pie}
                height={250}
                showLabels={true}
                showPercentages={true}
              />
            </Card>

            <Card title="Page Views" subtitle="Daily traffic">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold">47,293</span>
                  <Sparkline
                    data={chartData.sparkline}
                    width={120}
                    height={40}
                    color="#10B981"
                    fillArea={true}
                    trend="up"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  +18% from yesterday
                </p>
              </div>
            </Card>

            <Card title="Quick Stats">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Bounce Rate</span>
                    <span className="text-sm font-medium">32%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-1/3"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Session Duration</span>
                    <span className="text-sm font-medium">4m 32s</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Data Table Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📋 Data Tables</h2>
          
          <Card>
            <DataTable
              data={sampleUsers}
              columns={tableColumns}
              selectable={true}
              selectedRows={selectedTable}
              onSelectionChange={(selectedRowKeys) => setSelectedTable(selectedRowKeys)}
              bulkActions={bulkActions}
              rowActions={[
                {
                  key: 'edit',
                  label: 'Edit',
                  icon: '✏️',
                  onClick: (record) => console.log('Edit:', record)
                },
                {
                  key: 'delete',
                  label: 'Delete',
                  icon: '🗑️',
                  onClick: (record) => console.log('Delete:', record)
                }
              ]}
              pagination={{
                current: 1,
                pageSize: 10,
                total: sampleUsers.length,
                showSizeChanger: true,
                onPageChange: (page, pageSize) => console.log('Page change:', page, pageSize)
              }}
              hover={true}
              striped={true}
            />
          </Card>
        </section>

        {/* List Views Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📝 List Views</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Recent Activities">
              <ListView
                items={[
                  {
                    id: '1',
                    title: 'New user registration',
                    subtitle: 'john.doe@example.com',
                    description: 'User registered with Google OAuth',
                    icon: <span>👤</span>,
                    badge: { text: 'New', variant: 'success' },
                    metadata: [{ label: 'Time', value: '2 minutes ago' }]
                  },
                  {
                    id: '2',
                    title: 'Payment processed',
                    subtitle: '$299.00',
                    description: 'Order #12345 payment completed',
                    icon: <span>💳</span>,
                    badge: { text: 'Completed', variant: 'success' },
                    metadata: [{ label: 'Order', value: '#12345' }]
                  },
                  {
                    id: '3',
                    title: 'Server alert',
                    subtitle: 'High CPU usage',
                    description: 'Production server CPU at 85%',
                    icon: <span>⚠️</span>,
                    badge: { text: 'Warning', variant: 'warning' },
                    metadata: [{ label: 'Server', value: 'web-01' }]
                  }
                ]}
                variant="detailed"
              />
            </Card>

            <Card title="Team Members">
              <ContactList
                contacts={[
                  {
                    id: '1',
                    name: 'Sarah Johnson',
                    email: 'sarah@company.com',
                    role: 'Product Manager',
                    company: 'AdaptivePages',
                    status: 'online'
                  },
                  {
                    id: '2',
                    name: 'Mike Chen',
                    email: 'mike@company.com',
                    role: 'Senior Developer',
                    company: 'AdaptivePages',
                    status: 'away'
                  },
                  {
                    id: '3',
                    name: 'Emily Rodriguez',
                    email: 'emily@company.com',
                    role: 'UX Designer',
                    company: 'AdaptivePages',
                    status: 'offline'
                  }
                ]}
                selectable={true}
              />
            </Card>
          </div>
        </section>

        {/* Calendar Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📅 Calendars & Date Pickers</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Single Date Picker">
              <div className="space-y-4">
                <DatePicker
                  mode="single"
                  value={selectedDate}
                  onChange={(date) => setSelectedDate(date as Date)}
                  placeholder="Select a date"
                  clearable={true}
                />
                {selectedDate && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Selected: {selectedDate.toLocaleDateString()}
                  </p>
                )}
              </div>
            </Card>

            <Card title="Date Range Picker">
              <div className="space-y-4">
                <DatePicker
                  mode="range"
                  value={selectedRange}
                  onChange={(range) => setSelectedRange(range as DateRange)}
                  placeholder="Select date range"
                  clearable={true}
                />
                {selectedRange.start && selectedRange.end && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Range: {selectedRange.start.toLocaleDateString()} - {selectedRange.end.toLocaleDateString()}
                  </p>
                )}
              </div>
            </Card>

            <Card title="Calendar View">
              <Calendar
                mode="single"
                value={selectedDate}
                onChange={(date) => setSelectedDate(date as Date)}
                showToday={true}
                size="small"
              />
            </Card>
          </div>
        </section>

        {/* Kanban Board Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🗂️ Kanban Board</h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <KanbanBoard
              columns={kanbanColumns}
              onCardMove={handleCardMove}
              onCardClick={(card) => console.log('Card clicked:', card)}
              onCardAdd={(columnId) => console.log('Add card to:', columnId)}
              onCardEdit={(card) => console.log('Edit card:', card)}
              onCardDelete={(cardId) => console.log('Delete card:', cardId)}
              onColumnAdd={() => console.log('Add column')}
              onColumnEdit={(columnId) => console.log('Edit column:', columnId)}
              onColumnDelete={(columnId) => console.log('Delete column:', columnId)}
              editable={true}
            />
          </div>
        </section>

        {/* Image Cards Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🖼️ Media Cards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ImageCard
              title="Project Dashboard"
              description="Analytics and reporting interface"
              imageUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400"
              actions={
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  View Project
                </button>
              }
            />
            <ImageCard
              title="Team Collaboration"
              description="Real-time collaboration tools"
              imageUrl="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400"
              actions={
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  Join Team
                </button>
              }
            />
            <ImageCard
              title="Data Visualization"
              description="Advanced charts and graphs"
              imageUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400"
              actions={
                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                  Explore Data
                </button>
              }
            />
          </div>
        </section>

        {/* Summary */}
        <Card className="text-center">
          <div className="py-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🎉 Phase 4 Complete!
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              You now have a complete data display system with tables, charts, calendars, kanban boards, 
              and list views. All components support AI integration, responsive design, and accessibility.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
              <span>✅ Data Tables with filtering & sorting</span>
              <span>✅ Interactive charts & visualizations</span>
              <span>✅ Calendar & date range selection</span>
              <span>✅ Drag & drop kanban boards</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
