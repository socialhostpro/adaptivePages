import React, { useState, useRef, useEffect } from 'react';
import { Button } from './shared';
import EditIcon from './icons/EditIcon';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';

interface InlineTextEditorProps {
  text: string;
  onSave: (newText: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
}

const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  text,
  onSave,
  className = '',
  placeholder = 'Enter text...',
  multiline = false,
  maxLength
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [showEditButton, setShowEditButton] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editText.trim() !== text) {
      onSave(editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className="relative inline-block w-full">
        <div className="flex items-start space-x-2">
          <div className="flex-1">
            {multiline ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                maxLength={maxLength}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={3}
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                maxLength={maxLength}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
            {maxLength && (
              <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                {editText.length}/{maxLength}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1 mt-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={handleSave}
              disabled={!editText.trim()}
              icon={<CheckIcon className="w-3 h-3" />}
              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
              title="Save (Enter)"
            />
            <Button
              variant="ghost"
              size="xs"
              onClick={handleCancel}
              icon={<XIcon className="w-3 h-3" />}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Cancel (Esc)"
            />
          </div>
        </div>
        
        {multiline && (
          <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Press Ctrl+Enter to save, Esc to cancel
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`group relative inline-block ${className}`}
      onMouseEnter={() => setShowEditButton(true)}
      onMouseLeave={() => setShowEditButton(false)}
    >
      <span className="break-words">{text || placeholder}</span>
      
      {showEditButton && (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setIsEditing(true)}
          className="absolute -top-1 -right-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-600"
          icon={<EditIcon className="w-3 h-3" />}
          title="Click to edit"
        />
      )}
    </div>
  );
};

export default InlineTextEditor;
