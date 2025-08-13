/**
 * Demo Component for JSON-Driven Feature System
 * Shows how to use responsive layouts and JSON configurations
 */
import React, { useState } from 'react';
import { JsonFeatureSystem, useJsonConfig } from './JsonFeatureSystem';
import { ResponsiveLayout, useDeviceDetection } from './ResponsiveLayout';
import { Button } from './ButtonComponents';
import { cn } from './utils';

// Simple Card component for demo
const Card = ({ title, children, className, ...props }: any) => (
  <div className={cn('bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6', className)} {...props}>
    {title && <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>}
    {children}
  </div>
);

export interface ResponsiveJsonDemoProps {
  className?: string;
}

/**
 * Demo data for the JSON system
 */
const DEMO_DATA = {
  stats: {
    activeCases: 24,
    activeCasesChange: 3,
    pendingTasks: 8,
    pendingTasksChange: 2,
    completedToday: 12,
    efficiency: 89
  },
  recentActivity: [
    { time: '2:30 PM', user: 'John Doe', action: 'Created case', case: 'CASE-001' },
    { time: '2:15 PM', user: 'Jane Smith', action: 'Updated task', case: 'CASE-002' },
    { time: '1:45 PM', user: 'Mike Johnson', action: 'Closed case', case: 'CASE-003' }
  ],
  users: [
    { value: 'john', label: 'John Doe' },
    { value: 'jane', label: 'Jane Smith' },
    { value: 'mike', label: 'Mike Johnson' }
  ],
  filteredCases: [
    { id: 'CASE-001', title: 'System Login Issue', status: 'Open', priority: 'High', assignee: 'John Doe', created: '2024-08-12' },
    { id: 'CASE-002', title: 'Feature Request', status: 'In Progress', priority: 'Medium', assignee: 'Jane Smith', created: '2024-08-11' },
    { id: 'CASE-003', title: 'Bug Report', status: 'Closed', priority: 'Low', assignee: 'Mike Johnson', created: '2024-08-10' }
  ],
  filters: {
    status: '',
    priority: '',
    assignee: '',
    search: ''
  },
  newCase: {
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    urgent: false
  },
  contact: {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    newsletter: false,
    updates: false
  }
};

export const ResponsiveJsonDemo: React.FC<ResponsiveJsonDemoProps> = ({
  className
}) => {
  const { device, screenSize, orientation } = useDeviceDetection();
  const [currentDemo, setCurrentDemo] = useState<'case-management' | 'contact-form'>('case-management');
  const [demoData, setDemoData] = useState(DEMO_DATA);
  const [showRawJson, setShowRawJson] = useState(false);

  // Load JSON configurations
  const caseManagementConfig = useJsonConfig('/configs/case-management-config.json');
  const contactFormConfig = useJsonConfig('/configs/contact-form-config.json');

  const handleDataChange = (newData: Record<string, any>) => {
    setDemoData({ ...demoData, ...newData });
  };

  const handleAction = (action: string, payload?: any) => {
    console.log('Demo Action:', action, payload);
    
    switch (action) {
      case 'create_case':
        console.log('Opening create case modal...');
        break;
      case 'create_task':
        console.log('Opening create task modal...');
        break;
      case 'generate_report':
        console.log('Generating report...');
        break;
      case 'submit_create_case':
        console.log('Creating new case:', demoData.newCase);
        // Reset form
        setDemoData({
          ...demoData,
          newCase: {
            title: '',
            description: '',
            priority: 'medium',
            assignee: '',
            urgent: false
          }
        });
        break;
      case 'submit_contact_form':
        console.log('Submitting contact form:', demoData.contact);
        // Reset form
        setDemoData({
          ...demoData,
          contact: {
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
            newsletter: false,
            updates: false
          }
        });
        break;
      case 'clear_form':
        if (currentDemo === 'contact-form') {
          setDemoData({
            ...demoData,
            contact: {
              name: '',
              email: '',
              phone: '',
              subject: '',
              message: '',
              newsletter: false,
              updates: false
            }
          });
        }
        break;
    }
  };

  const currentConfig = currentDemo === 'case-management' 
    ? caseManagementConfig.config 
    : contactFormConfig.config;

  if (caseManagementConfig.loading || contactFormConfig.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading configurations...</p>
        </div>
      </div>
    );
  }

  if (caseManagementConfig.error || contactFormConfig.error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-8">
        <p>Error loading configuration:</p>
        <p className="text-sm mt-2">{caseManagementConfig.error || contactFormConfig.error}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Demo Controls */}
      <div className="mb-8">
        <Card title="JSON-Driven Feature System Demo" className="mb-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Device: {device} ({screenSize.width}x{screenSize.height}, {orientation})
              </h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={currentDemo === 'case-management' ? 'primary' : 'outline'}
                  onClick={() => setCurrentDemo('case-management')}
                  size="sm"
                >
                  Case Management
                </Button>
                <Button
                  variant={currentDemo === 'contact-form' ? 'primary' : 'outline'}
                  onClick={() => setCurrentDemo('contact-form')}
                  size="sm"
                >
                  Contact Form
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowRawJson(!showRawJson)}
                  size="sm"
                >
                  {showRawJson ? 'Hide' : 'Show'} JSON Config
                </Button>
              </div>
            </div>
            
            {showRawJson && currentConfig && (
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-xs">
                <pre>{JSON.stringify(currentConfig, null, 2)}</pre>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* JSON Feature System */}
      {currentConfig && (
        <JsonFeatureSystem
          config={currentConfig}
          data={demoData}
          onDataChange={handleDataChange}
          onAction={handleAction}
        />
      )}

      {/* Debug Information */}
      <Card title="Debug Information" className="mt-8">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Data State
            </h4>
            <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-lg overflow-auto text-xs">
              <pre>{JSON.stringify(demoData, null, 2)}</pre>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Device Information
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Device:</span> {device}
              </div>
              <div>
                <span className="font-medium">Screen:</span> {screenSize.width}x{screenSize.height}
              </div>
              <div>
                <span className="font-medium">Orientation:</span> {orientation}
              </div>
              <div>
                <span className="font-medium">Demo:</span> {currentDemo}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * Example of how to create a custom JSON configuration programmatically
 */
export function createCustomJsonConfig() {
  return {
    id: 'custom_feature',
    name: 'Custom Feature',
    version: '1.0.0',
    description: 'Dynamically created feature',
    layout: {
      breakpoints: { mobile: 768, tablet: 1024, desktop: 1200 },
      layouts: {
        mobile: {
          type: 'app',
          header: { fixed: true, height: '60px', showTitle: true, actions: [] },
          navigation: { type: 'bottom-tabs', position: 'bottom', items: [] },
          content: { padding: '16px', scrollable: true, pullToRefresh: false },
          gestures: { swipeNavigation: false, pullToRefresh: false, longPress: false }
        },
        tablet: {
          orientation: 'auto',
          sidebar: { enabled: false, width: '0px', collapsible: false, position: 'left' },
          grid: { columns: 2, gap: '24px', responsive: true },
          tables: { horizontalScroll: true, stickyHeaders: true, compactMode: false }
        },
        desktop: {
          layout: 'standard',
          sidebar: { enabled: false, width: '0px', collapsible: false },
          header: { height: '64px', sticky: true },
          content: { maxWidth: '800px', centered: true }
        }
      },
      features: []
    },
    features: [
      {
        id: 'simple_form',
        name: 'Simple Form',
        type: 'page',
        route: '/simple',
        components: [
          {
            id: 'form_card',
            type: 'Card',
            props: { title: 'Simple Form', className: 'max-w-md mx-auto' },
            children: [
              {
                id: 'name_field',
                type: 'Input',
                props: {
                  label: 'Name',
                  placeholder: 'Enter your name',
                  dataBinding: 'form.name',
                  aiEnhancement: { enabled: true, types: ['proper_case'] }
                }
              },
              {
                id: 'message_field',
                type: 'Textarea',
                props: {
                  label: 'Message',
                  placeholder: 'Enter your message',
                  dataBinding: 'form.message',
                  voiceDictation: { enabled: true },
                  aiEnhancement: { enabled: true, types: ['grammar', 'professional'] }
                }
              },
              {
                id: 'submit_button',
                type: 'Button',
                props: {
                  variant: 'primary',
                  className: 'w-full mt-4',
                  children: 'Submit',
                  action: 'submit_form'
                }
              }
            ]
          }
        ],
        layout: { mobile: 'single_column', tablet: 'single_column', desktop: 'centered' },
        enabled: true
      }
    ],
    permissions: [],
    workflows: [],
    integrations: []
  };
}

export default ResponsiveJsonDemo;
