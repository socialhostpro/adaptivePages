/**
 * AI Agent Integration Examples
 * Demonstrates how AI agents can control tabs, modals, and track all system activity
 */
import React, { useEffect, useState } from 'react';
import { useAiAgent, AiCommands } from './useAiAgent';
import { ApiControlProvider } from './ApiController';
import { Button } from './ButtonComponents';
import { cn } from './utils';

// Simple Card component for demo
const Card = ({ title, children, className, ...props }: any) => (
  <div className={cn('bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6', className)} {...props}>
    {title && <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>}
    {children}
  </div>
);

// Example AI Agent Component
export const AiAgentDemo: React.FC = () => {
  const aiAgent = useAiAgent({
    agentId: 'demo-agent',
    capabilities: ['modal_control', 'tab_navigation', 'data_tracking', 'pattern_analysis'],
    autoTrack: true,
    vectorStorage: true
  });

  const [agentStatus, setAgentStatus] = useState<'idle' | 'thinking' | 'executing'>('idle');
  const [lastCommand, setLastCommand] = useState<string>('');
  const [systemContext, setSystemContext] = useState<any>(null);

  // Get system context on mount
  useEffect(() => {
    setSystemContext(aiAgent.getSystemContext());
  }, []);

  // Example: AI Agent automatically responding to user patterns
  useEffect(() => {
    const interval = setInterval(async () => {
      if (agentStatus === 'idle') {
        await analyzeAndSuggest();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [agentStatus]);

  /**
   * AI Agent analyzes user behavior and makes suggestions
   */
  const analyzeAndSuggest = async () => {
    setAgentStatus('thinking');
    
    try {
      // Analyze user patterns
      const patterns = await aiAgent.analyzeUserPatterns();
      
      // Get recent activity
      const recentActivity = await aiAgent.executeCommand(
        AiCommands.searchActivity(undefined, 10)
      );

      if (recentActivity.success && recentActivity.data?.length > 0) {
        const activity = recentActivity.data;
        
        // Example AI logic: If user has been creating many cases, suggest templates
        const recentCaseCreation = activity.filter((a: any) => 
          a.action === 'create_case' || a.component?.includes('case')
        );

        if (recentCaseCreation.length >= 3) {
          await suggestCaseTemplate();
        }

        // Example: If user keeps switching between tabs, suggest pinning
        const tabSwitches = activity.filter((a: any) => a.type === 'tab_change');
        if (tabSwitches.length >= 5) {
          await suggestTabPinning();
        }
      }

    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAgentStatus('idle');
    }
  };

  /**
   * AI suggests case template based on user behavior
   */
  const suggestCaseTemplate = async () => {
    setAgentStatus('executing');
    setLastCommand('Suggesting case template based on recent activity');

    const result = await aiAgent.executeCommand(
      AiCommands.openModal('suggestion-modal', {
        type: 'suggestion',
        title: 'AI Suggestion: Case Template',
        message: 'I noticed you\'ve been creating several cases recently. Would you like me to create a template to speed up the process?',
        actions: ['create_template', 'dismiss', 'remind_later']
      })
    );

    console.log('Case template suggestion result:', result);
  };

  /**
   * AI suggests tab pinning for frequently used tabs
   */
  const suggestTabPinning = async () => {
    setAgentStatus('executing');
    setLastCommand('Suggesting tab pinning for frequently accessed features');

    const result = await aiAgent.executeCommand(
      AiCommands.openModal('tab-suggestion-modal', {
        type: 'suggestion',
        title: 'AI Suggestion: Pin Frequently Used Tabs',
        message: 'You seem to switch between certain tabs frequently. Would you like me to pin them for easier access?',
        actions: ['pin_tabs', 'dismiss', 'show_usage_stats']
      })
    );

    console.log('Tab pinning suggestion result:', result);
  };

  /**
   * Example AI commands that can be triggered
   */
  const demonstrateAiCommands = async () => {
    setAgentStatus('executing');

    // Sequence of AI commands
    const commands = [
      // 1. Open a case management modal
      AiCommands.openModal('create-case-modal', {
        prefill: {
          title: 'AI Generated Case',
          priority: 'medium',
          description: 'This case was created by AI based on system analysis'
        }
      }),

      // 2. Wait a moment then switch to analytics tab
      AiCommands.switchTab('analytics-tab', '/analytics'),

      // 3. Update system state with AI insights
      AiCommands.updateData('ai-insights', {
        lastAnalysis: new Date().toISOString(),
        patterns: ['high_case_creation', 'frequent_tab_switching'],
        suggestions: ['case_templates', 'tab_pinning']
      }),

      // 4. Search for similar patterns in vector database
      AiCommands.searchVectors('case creation patterns', 'user_activity', 5)
    ];

    try {
      setLastCommand('Executing sequence of AI commands...');
      const results = await aiAgent.executeBulkCommands(commands);
      
      console.log('AI command sequence results:', results);
      setLastCommand(`Successfully executed ${results.length} commands`);
      
    } catch (error) {
      console.error('AI command sequence failed:', error);
      setLastCommand('Command sequence failed');
    } finally {
      setAgentStatus('idle');
    }
  };

  /**
   * Simulate AI learning from user interaction
   */
  const simulateAiLearning = async () => {
    setAgentStatus('thinking');
    setLastCommand('Learning from user interactions...');

    try {
      // Get all user activity
      const activityResult = await aiAgent.executeCommand(
        AiCommands.searchActivity(undefined, 100)
      );

      if (activityResult.success) {
        const activities = activityResult.data;
        
        // AI learning simulation: identify workflow patterns
        const workflows = identifyWorkflowPatterns(activities);
        
        // Store learned patterns in vector database
        for (const workflow of workflows) {
          await aiAgent.apiController.storeInVector(
            `Workflow pattern: ${workflow.name} - ${workflow.description}`,
            'ai_interaction',
            {
              type: 'learned_pattern',
              workflow: workflow,
              confidence: workflow.confidence,
              occurrences: workflow.occurrences
            }
          );
        }

        setLastCommand(`Learned ${workflows.length} workflow patterns`);
      }

    } catch (error) {
      console.error('AI learning failed:', error);
      setLastCommand('Learning process failed');
    } finally {
      setAgentStatus('idle');
    }
  };

  /**
   * Helper function to identify workflow patterns
   */
  const identifyWorkflowPatterns = (activities: any[]) => {
    const patterns = [];

    // Pattern 1: Case creation workflow
    const caseCreationPattern = activities.filter(a => 
      a.action.includes('case') || a.component?.includes('case')
    );
    
    if (caseCreationPattern.length >= 3) {
      patterns.push({
        name: 'Case Creation Workflow',
        description: 'User frequently creates cases following a specific pattern',
        confidence: 0.85,
        occurrences: caseCreationPattern.length,
        steps: caseCreationPattern.map(a => a.action)
      });
    }

    // Pattern 2: Dashboard review workflow
    const dashboardPattern = activities.filter(a => 
      a.route?.includes('dashboard') || a.action.includes('dashboard')
    );
    
    if (dashboardPattern.length >= 2) {
      patterns.push({
        name: 'Dashboard Review Workflow',
        description: 'User regularly reviews dashboard metrics',
        confidence: 0.75,
        occurrences: dashboardPattern.length,
        steps: dashboardPattern.map(a => a.action)
      });
    }

    return patterns;
  };

  return (
    <div className="ai-agent-demo p-6 space-y-6">
      <Card title="AI Agent Control Demo" className="mb-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className={cn(
              'w-3 h-3 rounded-full',
              agentStatus === 'idle' && 'bg-green-500',
              agentStatus === 'thinking' && 'bg-yellow-500 animate-pulse',
              agentStatus === 'executing' && 'bg-blue-500 animate-pulse'
            )} />
            <span className="text-sm font-medium">
              Agent Status: {agentStatus.charAt(0).toUpperCase() + agentStatus.slice(1)}
            </span>
          </div>

          {lastCommand && (
            <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Last Command: {lastCommand}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={demonstrateAiCommands}
              disabled={agentStatus !== 'idle'}
              variant="primary"
              className="w-full"
            >
              Execute AI Commands
            </Button>

            <Button
              onClick={simulateAiLearning}
              disabled={agentStatus !== 'idle'}
              variant="outline"
              className="w-full"
            >
              Simulate AI Learning
            </Button>

            <Button
              onClick={analyzeAndSuggest}
              disabled={agentStatus !== 'idle'}
              variant="ghost"
              className="w-full"
            >
              Analyze & Suggest
            </Button>
          </div>
        </div>
      </Card>

      {/* Command History */}
      <Card title="AI Command History" className="mb-6">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {aiAgent.commandHistory.slice(0, 10).map((entry, index) => (
            <div key={index} className="border-l-2 border-blue-500 pl-3 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">
                    {entry.command.type} - {entry.command.action}
                  </p>
                  <p className="text-xs text-gray-500">
                    Target: {entry.command.target || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    'text-xs px-2 py-1 rounded',
                    entry.response.success 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  )}>
                    {entry.response.success ? 'Success' : 'Failed'}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {entry.response.executionTime}ms
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Context */}
      <Card title="System Context for AI" className="mb-6">
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-xs">
          <pre>{JSON.stringify(systemContext, null, 2)}</pre>
        </div>
      </Card>

      {/* API Examples */}
      <Card title="API Integration Examples">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">REST API Commands</h4>
            <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-lg space-y-2">
              <code className="block text-sm">POST /api/control/modal/create-case-modal/open</code>
              <code className="block text-sm">POST /api/control/tab/analytics-tab/switch</code>
              <code className="block text-sm">GET /api/activity/user?limit=100</code>
              <code className="block text-sm">POST /api/vector/search</code>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Vector Database Integration</h4>
            <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                All user activities, AI interactions, and system states are automatically
                stored in vector database for AI learning and context retrieval.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * Example Provider Setup
 */
export const AiAgentDemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Example user and company data
  const mockUser = {
    id: 'user_123',
    role: 'admin',
    permissions: ['read', 'write', 'delete'],
    preferences: {
      theme: 'dark',
      notifications: true,
      aiAssistance: true
    }
  };

  const mockCompanyId = 'company_456';

  return (
    <ApiControlProvider initialUser={mockUser} companyId={mockCompanyId}>
      {children}
      <AiAgentDemo />
    </ApiControlProvider>
  );
};

/**
 * Example AI Integration Script for External AI Agents
 */
export const ExternalAiIntegration = `
// Example JavaScript for external AI agents (like GPT, Claude, etc.)

// 1. Initialize connection to your application
const apiBase = 'https://your-app.com/api';
const authToken = 'your-auth-token';

// 2. AI Agent function to control modals
async function aiOpenModal(modalId, config = {}) {
  const response = await fetch(\`\${apiBase}/control/modal/\${modalId}/open\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${authToken}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(config)
  });
  return response.json();
}

// 3. AI Agent function to search user activity
async function aiSearchActivity(query, limit = 10) {
  const response = await fetch(\`\${apiBase}/vector/search\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${authToken}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, type: 'user_activity', limit })
  });
  return response.json();
}

// 4. AI Agent workflow automation
async function aiAutomateWorkflow(userInput) {
  // Analyze user intent
  if (userInput.includes('create case')) {
    return await aiOpenModal('create-case-modal', {
      prefill: extractCaseData(userInput)
    });
  }
  
  if (userInput.includes('show analytics')) {
    return await aiSwitchTab('analytics-tab');
  }
  
  // Search for relevant information
  const searchResults = await aiSearchActivity(userInput);
  return { action: 'search', results: searchResults };
}

// 5. Example usage
aiAutomateWorkflow("Create a new high priority case for login issues");
`;

export default AiAgentDemo;
