/**
 * Enhanced Form Components with AI Enhancement and Voice Dictation
 * Supports automatic text improvement and voice-to-text functionality
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FormComponentProps } from './types';
import { 
  cn, 
  enhanceTextWithAI, 
  createVoiceRecognition, 
  isVoiceRecognitionSupported,
  VoiceRecognition,
  AIEnhancementOptions 
} from './utils';

// Icons for enhancement and voice features
const SparklesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const MicrophoneIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const LoadingIcon = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  'aria-label': ariaLabel,
  disabled = false
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

interface InputProps extends FormComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  value = '',
  onChange,
  placeholder,
  className = "",
  'aria-label': ariaLabel,
  disabled = false,
  required = false,
  aiEnhancement,
  voiceDictation,
  onTextEnhanced,
  onVoiceStart,
  onVoiceEnd,
  onVoiceError,
  ...props
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceRecognition, setVoiceRecognition] = useState<VoiceRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Initialize voice recognition
  useEffect(() => {
    if (voiceDictation?.enabled && isVoiceRecognitionSupported()) {
      const recognition = createVoiceRecognition({
        language: voiceDictation.language || 'en-US',
        continuous: voiceDictation.continuous ?? false,
        interimResults: voiceDictation.interimResults ?? true,
        onResult: (transcript, isFinal) => {
          if (isFinal) {
            onChange?.(transcript);
          }
        },
        onStart: () => {
          setIsListening(true);
          onVoiceStart?.();
        },
        onEnd: () => {
          setIsListening(false);
          onVoiceEnd?.();
        },
        onError: (error) => {
          setIsListening(false);
          onVoiceError?.(error);
        }
      });
      setVoiceRecognition(recognition);
    }
  }, [voiceDictation, onChange, onVoiceStart, onVoiceEnd, onVoiceError]);
  
  const handleEnhancement = useCallback(async () => {
    if (!value.trim() || !aiEnhancement?.enabled) return;
    
    setIsEnhancing(true);
    try {
      const enhancedText = await enhanceTextWithAI(value, {
        type: aiEnhancement.type || 'grammar',
        customPrompt: aiEnhancement.customPrompt
      });
      
      if (enhancedText !== value) {
        onChange?.(enhancedText);
        onTextEnhanced?.(value, enhancedText);
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setIsEnhancing(false);
    }
  }, [value, aiEnhancement, onChange, onTextEnhanced]);
  
  const handleVoiceToggle = useCallback(() => {
    if (!voiceRecognition) return;
    voiceRecognition.toggle();
  }, [voiceRecognition]);
  
  const handleBlur = useCallback(async () => {
    if (aiEnhancement?.autoEnhance && value.trim()) {
      await handleEnhancement();
    }
  }, [aiEnhancement?.autoEnhance, value, handleEnhancement]);
  
  const hasEnhancements = aiEnhancement?.enabled || voiceDictation?.enabled;
  
  return (
    <div className="relative">
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          'block w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md',
          'bg-white dark:bg-slate-800 text-gray-900 dark:text-white',
          'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          hasEnhancements && 'pr-20', // Add space for buttons
          className
        )}
        aria-label={ariaLabel}
        disabled={disabled}
        required={required}
        {...props}
      />
      
      {/* Enhancement and Voice buttons */}
      {hasEnhancements && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
          {/* AI Enhancement button */}
          {aiEnhancement?.enabled && (
            <button
              type="button"
              onClick={handleEnhancement}
              disabled={isEnhancing || !value.trim()}
              className={cn(
                'p-1 rounded text-gray-400 hover:text-blue-500 disabled:opacity-50',
                'transition-colors duration-200'
              )}
              title="Enhance text with AI"
              aria-label="Enhance text with AI"
            >
              {isEnhancing ? <LoadingIcon /> : <SparklesIcon />}
            </button>
          )}
          
          {/* Voice dictation button */}
          {voiceDictation?.enabled && isVoiceRecognitionSupported() && (
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={cn(
                'p-1 rounded transition-colors duration-200',
                isListening 
                  ? 'text-red-500 animate-pulse' 
                  : 'text-gray-400 hover:text-blue-500'
              )}
              title={isListening ? 'Stop dictation' : 'Start voice dictation'}
              aria-label={isListening ? 'Stop dictation' : 'Start voice dictation'}
            >
              <MicrophoneIcon />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

interface CheckboxProps extends FormComponentProps {
  checked: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  className = "",
  'aria-label': ariaLabel,
  disabled = false
}) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className={`h-4 w-4 text-blue-600 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      aria-label={ariaLabel}
      disabled={disabled}
    />
  );
};

interface TextareaProps extends FormComponentProps {
  rows?: number;
}

export const Textarea: React.FC<TextareaProps> = ({
  value = '',
  onChange,
  placeholder,
  rows = 3,
  className = "",
  'aria-label': ariaLabel,
  disabled = false,
  required = false,
  aiEnhancement,
  voiceDictation,
  onTextEnhanced,
  onVoiceStart,
  onVoiceEnd,
  onVoiceError,
  ...props
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceRecognition, setVoiceRecognition] = useState<VoiceRecognition | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Initialize voice recognition
  useEffect(() => {
    if (voiceDictation?.enabled && isVoiceRecognitionSupported()) {
      const recognition = createVoiceRecognition({
        language: voiceDictation.language || 'en-US',
        continuous: voiceDictation.continuous ?? true,
        interimResults: voiceDictation.interimResults ?? true,
        onResult: (transcript, isFinal) => {
          if (isFinal) {
            // Append final result to existing text
            const newText = value + (value ? ' ' : '') + transcript;
            onChange?.(newText);
            setInterimTranscript('');
          } else {
            // Show interim results
            setInterimTranscript(transcript);
          }
        },
        onStart: () => {
          setIsListening(true);
          onVoiceStart?.();
        },
        onEnd: () => {
          setIsListening(false);
          setInterimTranscript('');
          onVoiceEnd?.();
        },
        onError: (error) => {
          setIsListening(false);
          setInterimTranscript('');
          onVoiceError?.(error);
        }
      });
      setVoiceRecognition(recognition);
    }
  }, [voiceDictation, value, onChange, onVoiceStart, onVoiceEnd, onVoiceError]);
  
  const handleEnhancement = useCallback(async () => {
    if (!value.trim() || !aiEnhancement?.enabled) return;
    
    setIsEnhancing(true);
    try {
      const enhancedText = await enhanceTextWithAI(value, {
        type: aiEnhancement.type || 'grammar',
        customPrompt: aiEnhancement.customPrompt
      });
      
      if (enhancedText !== value) {
        onChange?.(enhancedText);
        onTextEnhanced?.(value, enhancedText);
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setIsEnhancing(false);
    }
  }, [value, aiEnhancement, onChange, onTextEnhanced]);
  
  const handleVoiceToggle = useCallback(() => {
    if (!voiceRecognition) return;
    voiceRecognition.toggle();
  }, [voiceRecognition]);
  
  const handleBlur = useCallback(async () => {
    if (aiEnhancement?.autoEnhance && value.trim()) {
      await handleEnhancement();
    }
  }, [aiEnhancement?.autoEnhance, value, handleEnhancement]);
  
  const displayValue = value + (isListening && interimTranscript ? ' ' + interimTranscript : '');
  const hasEnhancements = aiEnhancement?.enabled || voiceDictation?.enabled;
  
  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={displayValue}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          'block w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md',
          'bg-white dark:bg-slate-800 text-gray-900 dark:text-white',
          'placeholder-gray-500 dark:placeholder-slate-400',
          'focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed resize-vertical',
          hasEnhancements && 'pb-12', // Add space for buttons
          className
        )}
        aria-label={ariaLabel}
        disabled={disabled}
        required={required}
        {...props}
      />
      
      {/* Enhancement and Voice controls */}
      {hasEnhancements && (
        <div className="absolute bottom-2 right-2 flex space-x-2">
          {/* AI Enhancement button */}
          {aiEnhancement?.enabled && (
            <button
              type="button"
              onClick={handleEnhancement}
              disabled={isEnhancing || !value.trim()}
              className={cn(
                'p-2 rounded-md text-gray-400 hover:text-blue-500 disabled:opacity-50',
                'bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600',
                'transition-colors duration-200 shadow-sm'
              )}
              title={`Enhance text with AI (${aiEnhancement.type || 'grammar'})`}
              aria-label="Enhance text with AI"
            >
              {isEnhancing ? <LoadingIcon /> : <SparklesIcon />}
            </button>
          )}
          
          {/* Voice dictation button */}
          {voiceDictation?.enabled && isVoiceRecognitionSupported() && (
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={cn(
                'p-2 rounded-md transition-colors duration-200 shadow-sm',
                'bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600',
                isListening 
                  ? 'text-red-500 border-red-300 dark:border-red-600 animate-pulse' 
                  : 'text-gray-400 hover:text-blue-500'
              )}
              title={isListening ? 'Stop dictation' : 'Start voice dictation'}
              aria-label={isListening ? 'Stop dictation' : 'Start voice dictation'}
            >
              <MicrophoneIcon />
            </button>
          )}
        </div>
      )}
      
      {/* Voice listening indicator */}
      {isListening && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded-md flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>Listening...</span>
        </div>
      )}
      
      {/* Interim transcript indicator */}
      {interimTranscript && (
        <div className="absolute bottom-14 right-2 max-w-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-md">
          <span className="opacity-70">"{interimTranscript}"</span>
        </div>
      )}
    </div>
  );
};
