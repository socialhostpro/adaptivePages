import React, { useState } from 'react';
import FloatingSectionControls from './FloatingSectionControls';
import InlineTextEditor from './InlineTextEditor';

interface SectionWrapperProps {
  sectionKey: string;
  sectionTitle: string;
  children: React.ReactNode;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onUpdateContent: (updates: Record<string, any>) => void;
  isEditMode?: boolean;
  className?: string;
  isDarkBackground?: boolean;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  sectionKey,
  sectionTitle,
  children,
  isFirst,
  isLast,
  onEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
  onUpdateContent,
  isEditMode = true,
  className = '',
  isDarkBackground = false
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentBgMode, setCurrentBgMode] = useState<'light' | 'dark'>(
    isDarkBackground ? 'dark' : 'light'
  );

  const handleColorPicker = () => {
    setShowColorPicker(true);
    // This would open a color picker modal
    // For now, we'll just show an alert
    alert(`Color picker for ${sectionTitle} - Feature coming soon!`);
  };

  const handleBackgroundToggle = () => {
    const newMode = currentBgMode === 'light' ? 'dark' : 'light';
    setCurrentBgMode(newMode);
    onUpdateContent({ backgroundMode: newMode });
  };

  // Enhanced children with inline editing capabilities
  const enhanceChildrenWithInlineEditing = (children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;

      // Look for text elements that can be made editable
      const enhanceElement = (element: React.ReactElement): React.ReactElement => {
        const props = element.props;
        
        // If element has text content and is editable
        if (props.children && typeof props.children === 'string' && isEditMode) {
          // Check if it's a heading, paragraph, or other text element
          const isTextElement = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'].includes(element.type as string);
          
          if (isTextElement) {
            return React.cloneElement(element, {
              children: (
                <InlineTextEditor
                  text={props.children}
                  onSave={(newText) => {
                    onUpdateContent({
                      [`${element.type}_${Math.random().toString(36).substr(2, 9)}`]: newText
                    });
                  }}
                  multiline={element.type === 'p'}
                  maxLength={element.type === 'h1' ? 60 : element.type?.startsWith('h') ? 80 : 200}
                />
              )
            });
          }
        }

        // Recursively enhance children
        if (props.children && React.isValidElement(props.children)) {
          return React.cloneElement(element, {
            children: enhanceElement(props.children)
          });
        }

        if (props.children && Array.isArray(props.children)) {
          return React.cloneElement(element, {
            children: props.children.map((child: React.ReactNode) => 
              React.isValidElement(child) ? enhanceElement(child) : child
            )
          });
        }

        return element;
      };

      return enhanceElement(child);
    });
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Floating Section Controls */}
      {isEditMode && (
        <FloatingSectionControls
          sectionKey={sectionKey}
          sectionTitle={sectionTitle}
          isFirst={isFirst}
          isLast={isLast}
          onEdit={onEdit}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          onColorPicker={handleColorPicker}
          onBackgroundToggle={handleBackgroundToggle}
          isDarkBackground={currentBgMode === 'dark'}
        />
      )}

      {/* Section Content */}
      <div className="relative">
        {isEditMode ? enhanceChildrenWithInlineEditing(children) : children}
      </div>

      {/* Section Overlay for Editing Mode */}
      {isEditMode && (
        <div className="absolute inset-0 pointer-events-none group-hover:bg-blue-50 group-hover:bg-opacity-10 group-hover:border-2 group-hover:border-blue-300 group-hover:border-dashed transition-all duration-200 rounded-lg" />
      )}
    </div>
  );
};

export default SectionWrapper;
