/**
 * Button Components Demo
 * Test component to showcase all button variants and functionality
 */
import React, { useState } from 'react';
import { 
  Button, 
  IconButton, 
  ButtonGroup, 
  DropdownButton,
  DropdownItem 
} from './index';

// Sample icons (you can replace with your preferred icon library)
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const ButtonDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');

  const handleAsyncAction = async () => {
    setLoading(true);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  const dropdownItems: DropdownItem[] = [
    {
      key: 'edit',
      label: 'Edit Item',
      icon: <EditIcon />,
      onClick: () => setSelectedAction('Edit clicked')
    },
    {
      key: 'download',
      label: 'Download',
      icon: <DownloadIcon />,
      onClick: () => setSelectedAction('Download clicked')
    },
    {
      key: 'divider1',
      label: '',
      divider: true,
      onClick: () => {}
    },
    {
      key: 'delete',
      label: 'Delete Item',
      icon: <DeleteIcon />,
      onClick: () => setSelectedAction('Delete clicked')
    },
    {
      key: 'disabled',
      label: 'Disabled Action',
      disabled: true,
      onClick: () => {}
    }
  ];

  return (
    <div className="p-8 space-y-8 bg-white dark:bg-slate-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Button Components Demo
        </h1>

        {selectedAction && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-blue-800 dark:text-blue-200">Action: {selectedAction}</p>
            <button 
              onClick={() => setSelectedAction('')}
              className="text-blue-600 dark:text-blue-400 text-sm underline ml-2"
            >
              Clear
            </button>
          </div>
        )}

        {/* Basic Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </section>

        {/* Button Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Style Variants</h2>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 w-16">Solid:</span>
              <Button styleVariant="solid" variant="primary">Solid</Button>
              <Button styleVariant="solid" variant="success">Success</Button>
              <Button styleVariant="solid" variant="danger">Danger</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 w-16">Outline:</span>
              <Button styleVariant="outline" variant="primary">Outline</Button>
              <Button styleVariant="outline" variant="success">Success</Button>
              <Button styleVariant="outline" variant="danger">Danger</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 w-16">Ghost:</span>
              <Button styleVariant="ghost" variant="primary">Ghost</Button>
              <Button styleVariant="ghost" variant="success">Success</Button>
              <Button styleVariant="ghost" variant="danger">Danger</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 w-16">Link:</span>
              <Button styleVariant="link" variant="primary">Link</Button>
              <Button styleVariant="link" variant="success">Success Link</Button>
              <Button styleVariant="link" variant="danger">Danger Link</Button>
            </div>
          </div>
        </section>

        {/* Button Sizes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Button Sizes</h2>
          <div className="flex flex-wrap items-end gap-4">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        {/* Button States */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Button States</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Normal</Button>
            <Button disabled>Disabled</Button>
            <Button loading={loading} onClick={handleAsyncAction}>
              {loading ? 'Loading...' : 'Click to Load'}
            </Button>
          </div>
        </section>

        {/* Buttons with Icons */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Buttons with Icons</h2>
          <div className="flex flex-wrap gap-4">
            <Button icon={<PlusIcon />} iconPosition="left">Add New</Button>
            <Button icon={<EditIcon />} iconPosition="right" variant="secondary">Edit</Button>
            <Button icon={<DeleteIcon />} variant="danger" styleVariant="outline">Delete</Button>
          </div>
        </section>

        {/* Icon Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Icon Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <IconButton icon={<PlusIcon />} aria-label="Add" variant="primary" />
            <IconButton icon={<EditIcon />} aria-label="Edit" variant="secondary" />
            <IconButton icon={<DeleteIcon />} aria-label="Delete" variant="danger" />
            <IconButton icon={<DownloadIcon />} aria-label="Download" variant="success" styleVariant="outline" />
          </div>
        </section>

        {/* Button Groups */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Button Groups</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Connected Horizontal</h3>
              <ButtonGroup connected orientation="horizontal">
                <Button>First</Button>
                <Button>Second</Button>
                <Button>Third</Button>
              </ButtonGroup>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Spaced Horizontal</h3>
              <ButtonGroup orientation="horizontal">
                <Button variant="primary">Save</Button>
                <Button variant="secondary">Cancel</Button>
                <Button variant="danger" styleVariant="outline">Delete</Button>
              </ButtonGroup>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Connected Vertical</h3>
              <ButtonGroup connected orientation="vertical">
                <Button>Top</Button>
                <Button>Middle</Button>
                <Button>Bottom</Button>
              </ButtonGroup>
            </div>
          </div>
        </section>

        {/* Dropdown Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Dropdown Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <DropdownButton 
              items={dropdownItems}
              variant="primary"
            >
              Actions
            </DropdownButton>
            
            <DropdownButton 
              items={dropdownItems}
              variant="secondary"
              styleVariant="outline"
              placement="bottom-end"
            >
              More Options
            </DropdownButton>

            <DropdownButton 
              items={dropdownItems}
              variant="success"
              styleVariant="ghost"
              showArrow={false}
              icon={<PlusIcon />}
            >
              Create
            </DropdownButton>
          </div>
        </section>

        {/* Full Width Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Full Width Buttons</h2>
          <div className="max-w-sm space-y-2">
            <Button fullWidth variant="primary">Full Width Primary</Button>
            <Button fullWidth variant="secondary" styleVariant="outline">Full Width Outline</Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ButtonDemo;
