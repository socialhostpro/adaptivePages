/**
 * Enhanced Form Components Demo
 * Showcases AI enhancement and voice dictation features
 */
import React, { useState } from 'react';
import { Input, Textarea } from './index';

export const EnhancedFormDemo: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [enhancement, setEnhancement] = useState<'grammar' | 'professional' | 'casual' | 'technical' | 'legal'>('grammar');
  const [notifications, setNotifications] = useState<string[]>([]);

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  const handleTextEnhanced = (original: string, enhanced: string) => {
    addNotification(`Text enhanced from "${original.substring(0, 30)}..." to "${enhanced.substring(0, 30)}..."`);
  };

  const handleVoiceStart = () => {
    addNotification('Voice dictation started');
  };

  const handleVoiceEnd = () => {
    addNotification('Voice dictation stopped');
  };

  const handleVoiceError = (error: string) => {
    addNotification(`Voice error: ${error}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 bg-white dark:bg-slate-900 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Enhanced Form Components Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Experience AI-powered text enhancement and voice dictation in form fields.
        </p>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md"
            >
              <p className="text-blue-800 dark:text-blue-200 text-sm">{notification}</p>
            </div>
          ))}
        </div>
      )}

      {/* Enhancement Type Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          AI Enhancement Type
        </label>
        <select
          value={enhancement}
          onChange={(e) => setEnhancement(e.target.value as any)}
          className="block w-48 px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          aria-label="Select AI enhancement type"
        >
          <option value="grammar">Grammar & Spelling</option>
          <option value="professional">Professional Tone</option>
          <option value="casual">Casual Tone</option>
          <option value="technical">Technical Writing</option>
          <option value="legal">Legal Language</option>
        </select>
      </div>

      {/* Enhanced Input Field */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Enhanced Input Field
        </h2>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Subject (with AI Enhancement & Voice)
          </label>
          <Input
            value={inputValue}
            onChange={setInputValue}
            placeholder="Type or speak your email subject..."
            aiEnhancement={{
              enabled: true,
              type: enhancement,
              autoEnhance: false // Manual enhancement via button
            }}
            voiceDictation={{
              enabled: true,
              language: 'en-US',
              continuous: false,
              interimResults: true
            }}
            onTextEnhanced={handleTextEnhanced}
            onVoiceStart={handleVoiceStart}
            onVoiceEnd={handleVoiceEnd}
            onVoiceError={handleVoiceError}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ✨ Click the sparkles icon to enhance text • 🎤 Click the microphone to start voice dictation
          </p>
        </div>
      </div>

      {/* Enhanced Textarea */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Enhanced Textarea
        </h2>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Document Content (with AI Enhancement & Voice)
          </label>
          <Textarea
            value={textareaValue}
            onChange={setTextareaValue}
            placeholder="Type or dictate your document content here..."
            rows={8}
            aiEnhancement={{
              enabled: true,
              type: enhancement,
              autoEnhance: false // Manual enhancement via button
            }}
            voiceDictation={{
              enabled: true,
              language: 'en-US',
              continuous: true, // Continuous for longer dictation
              interimResults: true
            }}
            onTextEnhanced={handleTextEnhanced}
            onVoiceStart={handleVoiceStart}
            onVoiceEnd={handleVoiceEnd}
            onVoiceError={handleVoiceError}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ✨ AI enhancement • 🎤 Voice dictation • Real-time transcription preview
          </p>
        </div>
      </div>

      {/* Auto-Enhancement Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Auto-Enhancement on Blur
        </h2>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Quick Note (Auto-Enhanced)
          </label>
          <Input
            value=""
            onChange={() => {}}
            placeholder="Type something with errors and click away..."
            aiEnhancement={{
              enabled: true,
              type: 'grammar',
              autoEnhance: true // Auto-enhance when field loses focus
            }}
            onTextEnhanced={handleTextEnhanced}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Text will be automatically enhanced when you click away from the field
          </p>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🤖 AI Enhancement Features
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Grammar and spelling correction</li>
            <li>• Professional tone adjustment</li>
            <li>• Casual/formal tone conversion</li>
            <li>• Technical writing optimization</li>
            <li>• Legal language formatting</li>
            <li>• Custom prompts support</li>
            <li>• Auto-enhance on blur option</li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🎤 Voice Dictation Features
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Real-time speech recognition</li>
            <li>• Multiple language support</li>
            <li>• Continuous or single-phrase modes</li>
            <li>• Interim results preview</li>
            <li>• Visual listening indicators</li>
            <li>• Error handling and feedback</li>
            <li>• Seamless text appending</li>
          </ul>
        </div>
      </div>

      {/* Browser Support Notice */}
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Browser Support</h4>
        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
          Voice dictation requires a modern browser with Web Speech API support (Chrome, Edge, Safari). 
          AI enhancement requires server-side integration with your AI service.
        </p>
      </div>
    </div>
  );
};

export default EnhancedFormDemo;
