/**
 * Utility functions for shared components
 */
import React from 'react';
import { colors, baseComponentClasses, ColorVariant } from './themes';

/**
 * Combines CSS class names, filtering out falsy values
 */
export function cn(...classes: (string | undefined | null | false | Record<string, boolean>)[]): string {
  return classes
    .map(cls => {
      if (typeof cls === 'string') return cls;
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls)
          .filter(([_, value]) => value)
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * Gets the appropriate CSS classes for a color variant
 */
export function getVariantClasses(variant: ColorVariant = 'primary', isDark = false): string {
  const theme = isDark ? colors.dark : colors.light;
  
  switch (variant) {
    case 'primary':
      return `bg-${theme.primary} hover:bg-${theme.primaryHover} text-white`;
    case 'secondary':
      return `bg-${theme.secondary} hover:bg-${theme.secondaryHover} text-white`;
    case 'success':
      return `bg-${theme.success} hover:bg-${theme.successHover} text-white`;
    case 'warning':
      return `bg-${theme.warning} hover:bg-${theme.warningHover} text-white`;
    case 'danger':
      return `bg-${theme.danger} hover:bg-${theme.dangerHover} text-white`;
    default:
      return `bg-${theme.primary} hover:bg-${theme.primaryHover} text-white`;
  }
}

/**
 * Gets outline variant classes for buttons
 */
export function getOutlineVariantClasses(variant: ColorVariant = 'primary', isDark = false): string {
  const theme = isDark ? colors.dark : colors.light;
  
  switch (variant) {
    case 'primary':
      return `border-${theme.primary} text-${theme.primary} hover:bg-${theme.primary} hover:text-white`;
    case 'secondary':
      return `border-${theme.secondary} text-${theme.secondary} hover:bg-${theme.secondary} hover:text-white`;
    case 'success':
      return `border-${theme.success} text-${theme.success} hover:bg-${theme.success} hover:text-white`;
    case 'warning':
      return `border-${theme.warning} text-${theme.warning} hover:bg-${theme.warning} hover:text-white`;
    case 'danger':
      return `border-${theme.danger} text-${theme.danger} hover:bg-${theme.danger} hover:text-white`;
    default:
      return `border-${theme.primary} text-${theme.primary} hover:bg-${theme.primary} hover:text-white`;
  }
}

/**
 * Gets ghost variant classes for buttons
 */
export function getGhostVariantClasses(variant: ColorVariant = 'primary', isDark = false): string {
  const theme = isDark ? colors.dark : colors.light;
  
  switch (variant) {
    case 'primary':
      return `text-${theme.primary} hover:bg-${theme.primary} hover:bg-opacity-10`;
    case 'secondary':
      return `text-${theme.secondary} hover:bg-${theme.secondary} hover:bg-opacity-10`;
    case 'success':
      return `text-${theme.success} hover:bg-${theme.success} hover:bg-opacity-10`;
    case 'warning':
      return `text-${theme.warning} hover:bg-${theme.warning} hover:bg-opacity-10`;
    case 'danger':
      return `text-${theme.danger} hover:bg-${theme.danger} hover:bg-opacity-10`;
    default:
      return `text-${theme.primary} hover:bg-${theme.primary} hover:bg-opacity-10`;
  }
}

/**
 * Gets focus ring classes for a variant
 */
export function getFocusRingClasses(variant: ColorVariant = 'primary'): string {
  return baseComponentClasses.focusRing[variant];
}

/**
 * Gets size classes for buttons
 */
export function getButtonSizeClasses(size: 'xs' | 'sm' | 'md' | 'lg' = 'md'): string {
  switch (size) {
    case 'xs':
      return 'px-2 py-1 text-xs';
    case 'sm':
      return 'px-3 py-1.5 text-sm';
    case 'md':
      return 'px-4 py-2 text-sm';
    case 'lg':
      return 'px-6 py-3 text-base';
    default:
      return 'px-4 py-2 text-sm';
  }
}

/**
 * Checks if dark mode is enabled based on theme preference
 */
export function isDarkMode(theme?: 'light' | 'dark' | 'auto'): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  
  // Auto mode - check system preference or localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  return false;
}

/**
 * Generates unique ID for components
 */
export function generateId(prefix = 'component'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function for search inputs and other frequent events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Merge refs utility for forwarding refs
 */
export function mergeRefs<T = any>(
  ...refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

/**
 * AI Text Enhancement Utilities
 */
export interface AIEnhancementOptions {
  type: 'grammar' | 'professional' | 'casual' | 'technical' | 'legal' | 'custom';
  customPrompt?: string;
}

export async function enhanceTextWithAI(
  text: string, 
  options: AIEnhancementOptions
): Promise<string> {
  if (!text.trim()) return text;
  
  const prompts = {
    grammar: 'Fix grammar and spelling errors in the following text while maintaining the original meaning and tone:',
    professional: 'Rewrite the following text in a professional, business-appropriate tone:',
    casual: 'Rewrite the following text in a casual, friendly tone:',
    technical: 'Rewrite the following text in a clear, technical style appropriate for documentation:',
    legal: 'Rewrite the following text in appropriate legal language and terminology:',
    custom: options.customPrompt || 'Improve the following text:'
  };
  
  const prompt = `${prompts[options.type]}\n\n"${text}"\n\nEnhanced text:`;
  
  try {
    // This would integrate with your AI service (Gemini API)
    // For now, returning a placeholder response
    const response = await fetch('/api/ai/enhance-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        text,
        type: options.type
      })
    });
    
    if (!response.ok) {
      throw new Error('AI enhancement failed');
    }
    
    const result = await response.json();
    return result.enhancedText || text;
  } catch (error) {
    console.error('AI enhancement error:', error);
    return text; // Return original text if enhancement fails
  }
}

/**
 * Voice Dictation Utilities
 */
export interface VoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export class VoiceRecognition {
  private recognition: any;
  private isListening = false;
  
  constructor(options: VoiceRecognitionOptions = {}) {
    if (!this.isSupported()) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configure recognition
    this.recognition.continuous = options.continuous ?? true;
    this.recognition.interimResults = options.interimResults ?? true;
    this.recognition.lang = options.language || 'en-US';
    
    // Event listeners
    this.recognition.onstart = () => {
      this.isListening = true;
      options.onStart?.();
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      options.onEnd?.();
    };
    
    this.recognition.onresult = (event: any) => {
      let transcript = '';
      let isFinal = false;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        transcript += result[0].transcript;
        if (result.isFinal) {
          isFinal = true;
        }
      }
      
      options.onResult?.(transcript, isFinal);
    };
    
    this.recognition.onerror = (event: any) => {
      options.onError?.(event.error);
    };
  }
  
  isSupported(): boolean {
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  }
  
  start(): void {
    if (!this.recognition || this.isListening) return;
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting voice recognition:', error);
    }
  }
  
  stop(): void {
    if (!this.recognition || !this.isListening) return;
    
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }
  
  toggle(): void {
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
  }
  
  getIsListening(): boolean {
    return this.isListening;
  }
}

/**
 * Create voice recognition instance with default settings
 */
export function createVoiceRecognition(options: VoiceRecognitionOptions = {}): VoiceRecognition {
  return new VoiceRecognition(options);
}

/**
 * Check if voice recognition is supported
 */
export function isVoiceRecognitionSupported(): boolean {
  return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
}
