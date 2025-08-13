import React, { useState } from 'react';
import { Button } from './shared';
import EditIcon from './icons/EditIcon';
import ChevronUpIcon from './icons/ChevronUpIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import PaletteIcon from './icons/PaletteIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import TrashIcon from './icons/TrashIcon';
import DragHandleIcon from './icons/DragHandleIcon';

interface FloatingSectionControlsProps {
  sectionKey: string;
  sectionTitle: string;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onColorPicker: () => void;
  onBackgroundToggle: () => void;
  isDarkBackground?: boolean;
}

const FloatingSectionControls: React.FC<FloatingSectionControlsProps> = ({
  sectionKey,
  sectionTitle,
  isFirst,
  isLast,
  onEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
  onColorPicker,
  onBackgroundToggle,
  isDarkBackground = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-30">
      {/* Main Toggle Button */}
      <div className="relative">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="shadow-lg hover:shadow-xl transition-shadow"
          icon={<EditIcon className="w-4 h-4" />}
          title={`Edit ${sectionTitle}`}
        />

        {/* Expanded Controls */}
        {isExpanded && (
          <div className="absolute top-0 right-12 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl p-2 min-w-[200px]">
            <div className="space-y-2">
              {/* Section Title */}
              <div className="text-xs font-medium text-gray-600 dark:text-slate-400 px-2 py-1 border-b border-gray-100 dark:border-slate-700">
                {sectionTitle}
              </div>

              {/* Main Controls Row */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onEdit}
                  icon={<EditIcon className="w-3 h-3" />}
                  title="Edit section content"
                />
                
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onMoveUp}
                  disabled={isFirst}
                  icon={<ChevronUpIcon className="w-3 h-3" />}
                  title="Move section up"
                />
                
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onMoveDown}
                  disabled={isLast}
                  icon={<ChevronDownIcon className="w-3 h-3" />}
                  title="Move section down"
                />
                
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onColorPicker}
                  icon={<PaletteIcon className="w-3 h-3" />}
                  title="Change colors"
                />
                
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onBackgroundToggle}
                  icon={isDarkBackground ? <SunIcon className="w-3 h-3" /> : <MoonIcon className="w-3 h-3" />}
                  title={`Switch to ${isDarkBackground ? 'light' : 'dark'} background`}
                />
              </div>

              {/* Delete Section */}
              <div className="border-t border-gray-100 dark:border-slate-700 pt-2">
                {!showDeleteConfirm ? (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                    icon={<TrashIcon className="w-3 h-3" />}
                  >
                    Delete Section
                  </Button>
                ) : (
                  <div className="space-y-1">
                    <div className="text-xs text-red-600 dark:text-red-400 text-center font-medium">
                      Delete this section?
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() => {
                          onDelete();
                          setShowDeleteConfirm(false);
                          setIsExpanded(false);
                        }}
                        className="flex-1"
                      >
                        Yes
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1"
                      >
                        No
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="border-t border-gray-100 dark:border-slate-700 pt-2">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsExpanded(false)}
                  className="w-full text-gray-500"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingSectionControls;
