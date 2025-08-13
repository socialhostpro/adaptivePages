/**
 * AI Agent Hook - Client-side interface for AI control
 * Provides easy-to-use methods for AI agents to control the application
 */
import { useCallback, useEffect, useState } from 'react';
import { useApiController } from './ApiController';

export interface AiAgentConfig {
  agentId: string;
  capabilities: string[];
  autoTrack?: boolean;
  vectorStorage?: boolean;
}

export interface AiCommand {
  type: 'modal' | 'tab' | 'navigation' | 'data' | 'search' | 'workflow';
  action: string;
  target?: string;
  params?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface AiResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
  executionTime?: number;
}

/**
 * Hook for AI Agent Integration
 */
export function useAiAgent(config: AiAgentConfig) {
  const { state, apiController } = useApiController();
  const [commandHistory, setCommandHistory] = useState<Array<{
    command: AiCommand;
    response: AiResponse;
    timestamp: Date;
  }>>([]);

  // Auto-track all user interactions if enabled
  useEffect(() => {
    if (config.autoTrack) {
      // Set up observers for automatic activity tracking
      setupActivityObservers();
    }
  }, [config.autoTrack]);

  /**
   * Execute AI Command
   */
  const executeCommand = useCallback(async (command: AiCommand): Promise<AiResponse> => {
    const startTime = Date.now();
    
    try {
      let result: any;
      
      switch (command.type) {
        case 'modal':
          result = await handleModalCommand(command);
          break;
        case 'tab':
          result = await handleTabCommand(command);
          break;
        case 'navigation':
          result = await handleNavigationCommand(command);
          break;
        case 'data':
          result = await handleDataCommand(command);
          break;
        case 'search':
          result = await handleSearchCommand(command);
          break;
        case 'workflow':
          result = await handleWorkflowCommand(command);
          break;
        default:
          throw new Error(`Unknown command type: ${command.type}`);
      }

      const response: AiResponse = {
        success: true,
        data: result,
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };

      // Record the interaction
      await apiController.recordAiInteraction(
        'control',
        JSON.stringify(command),
        JSON.stringify(response),
        [{
          type: command.action as any,
          target: command.target || '',
          payload: command.params,
          executed: true,
          result
        }]
      );

      // Update command history
      setCommandHistory(prev => [
        { command, response, timestamp: new Date() },
        ...prev.slice(0, 99) // Keep last 100 commands
      ]);

      return response;

    } catch (error) {
      const response: AiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        executionTime: Date.now() - startTime
      };

      // Record failed interaction
      await apiController.recordAiInteraction(
        'control',
        JSON.stringify(command),
        JSON.stringify(response),
        [{
          type: command.action as any,
          target: command.target || '',
          payload: command.params,
          executed: false,
          result: error
        }]
      );

      setCommandHistory(prev => [
        { command, response, timestamp: new Date() },
        ...prev.slice(0, 99)
      ]);

      return response;
    }
  }, [apiController]);

  /**
   * Modal Command Handlers
   */
  const handleModalCommand = async (command: AiCommand) => {
    switch (command.action) {
      case 'open':
        return await apiController.openModal(command.target!, command.params);
      case 'close':
        return await apiController.closeModal(command.target!);
      default:
        throw new Error(`Unknown modal action: ${command.action}`);
    }
  };

  /**
   * Tab Command Handlers
   */
  const handleTabCommand = async (command: AiCommand) => {
    switch (command.action) {
      case 'switch':
        return await apiController.switchTab(command.target!, command.params?.route);
      default:
        throw new Error(`Unknown tab action: ${command.action}`);
    }
  };

  /**
   * Navigation Command Handlers
   */
  const handleNavigationCommand = async (command: AiCommand) => {
    switch (command.action) {
      case 'navigate':
        return await apiController.navigate(command.target!);
      default:
        throw new Error(`Unknown navigation action: ${command.action}`);
    }
  };

  /**
   * Data Command Handlers
   */
  const handleDataCommand = async (command: AiCommand) => {
    switch (command.action) {
      case 'update':
        return await apiController.updateSystemState(command.target!, command.params?.value);
      case 'get':
        return state.systemState[command.target!];
      case 'getAll':
        return state.systemState;
      default:
        throw new Error(`Unknown data action: ${command.action}`);
    }
  };

  /**
   * Search Command Handlers
   */
  const handleSearchCommand = async (command: AiCommand) => {
    switch (command.action) {
      case 'vector':
        return await apiController.searchVectors(
          command.params?.query,
          command.params?.type,
          command.params?.limit
        );
      case 'activity':
        return apiController.getUserActivity(
          command.params?.userId,
          command.params?.limit
        );
      default:
        throw new Error(`Unknown search action: ${command.action}`);
    }
  };

  /**
   * Workflow Command Handlers
   */
  const handleWorkflowCommand = async (command: AiCommand) => {
    switch (command.action) {
      case 'trigger':
        // Implement workflow triggering logic
        return { workflowId: command.target, status: 'triggered' };
      default:
        throw new Error(`Unknown workflow action: ${command.action}`);
    }
  };

  /**
   * Setup Activity Observers
   */
  const setupActivityObservers = () => {
    // Observe DOM mutations for UI interactions
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Track modal additions/removals
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.matches('[role="dialog"]') || element.classList.contains('modal')) {
                trackModalOpen(element);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Track clicks for automatic learning
    document.addEventListener('click', (event) => {
      const target = event.target as Element;
      if (target.matches('button, [role="button"], a[href]')) {
        trackButtonClick(target);
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      trackFormSubmission(form);
    });
  };

  const trackModalOpen = (element: Element) => {
    const modalId = element.id || element.className;
    apiController.recordAiInteraction(
      'automation',
      `Modal opened: ${modalId}`,
      'Auto-tracked modal opening',
      []
    );
  };

  const trackButtonClick = (element: Element) => {
    const buttonText = element.textContent?.trim();
    const buttonId = element.id || element.className;
    apiController.recordAiInteraction(
      'automation',
      `Button clicked: ${buttonText} (${buttonId})`,
      'Auto-tracked button interaction',
      []
    );
  };

  const trackFormSubmission = (form: HTMLFormElement) => {
    const formId = form.id || form.className;
    const formData = new FormData(form);
    const data: Record<string, any> = {};
    
    formData.forEach((value, key) => {
      data[key] = value;
    });

    apiController.recordAiInteraction(
      'automation',
      `Form submitted: ${formId}`,
      `Form data: ${JSON.stringify(data)}`,
      []
    );
  };

  /**
   * Get System Context for AI
   */
  const getSystemContext = useCallback(() => {
    return {
      currentState: state,
      recentActivity: state.userActivity.slice(0, 20),
      activeModals: state.activeModals,
      activeTabs: state.activeTabs,
      currentRoute: state.currentRoute,
      userContext: state.aiContext.currentUser,
      companyContext: state.aiContext.companyContext,
      sessionInfo: state.aiContext.sessionContext
    };
  }, [state]);

  /**
   * Bulk Command Execution
   */
  const executeBulkCommands = useCallback(async (commands: AiCommand[]): Promise<AiResponse[]> => {
    const results: AiResponse[] = [];
    
    for (const command of commands) {
      const result = await executeCommand(command);
      results.push(result);
      
      // Add small delay between commands to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }, [executeCommand]);

  /**
   * Learn from User Patterns
   */
  const analyzeUserPatterns = useCallback(async () => {
    const recentActivity = state.userActivity.slice(0, 100);
    
    // Analyze patterns (this would be enhanced with ML algorithms)
    const patterns = {
      mostUsedFeatures: getMostUsedFeatures(recentActivity),
      timePatterns: getTimePatterns(recentActivity),
      workflowPatterns: getWorkflowPatterns(recentActivity),
      errorPatterns: getErrorPatterns(recentActivity)
    };

    // Store patterns in vector database for AI learning
    await apiController.storeInVector(
      JSON.stringify(patterns),
      'user_activity',
      { 
        type: 'pattern_analysis',
        userId: state.aiContext.currentUser.id,
        analysisDate: new Date().toISOString()
      }
    );

    return patterns;
  }, [state.userActivity, state.aiContext.currentUser.id, apiController]);

  /**
   * Helper functions for pattern analysis
   */
  const getMostUsedFeatures = (activities: any[]) => {
    const featureCounts: Record<string, number> = {};
    activities.forEach(activity => {
      const feature = activity.component || activity.route || activity.action;
      if (feature) {
        featureCounts[feature] = (featureCounts[feature] || 0) + 1;
      }
    });
    
    return Object.entries(featureCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  };

  const getTimePatterns = (activities: any[]) => {
    const hourCounts: Record<number, number> = {};
    activities.forEach(activity => {
      const hour = new Date(activity.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    return hourCounts;
  };

  const getWorkflowPatterns = (activities: any[]) => {
    // Analyze sequences of actions to identify workflows
    const sequences: string[][] = [];
    let currentSequence: string[] = [];
    
    activities.forEach((activity, index) => {
      currentSequence.push(activity.action);
      
      // End sequence on navigation or after 10 actions
      if (activity.type === 'navigation' || currentSequence.length >= 10) {
        if (currentSequence.length > 2) {
          sequences.push([...currentSequence]);
        }
        currentSequence = [];
      }
    });
    
    return sequences.slice(0, 5);
  };

  const getErrorPatterns = (activities: any[]) => {
    return activities
      .filter(activity => activity.type === 'system_event' && activity.data?.error)
      .slice(0, 10);
  };

  return {
    // Core functionality
    executeCommand,
    executeBulkCommands,
    
    // Context and state
    getSystemContext,
    commandHistory,
    
    // Learning and analysis
    analyzeUserPatterns,
    
    // Direct access to API controller
    apiController,
    
    // Configuration
    config
  };
}

/**
 * Pre-built AI Agent Commands
 */
export const AiCommands = {
  // Modal commands
  openModal: (modalId: string, config?: any): AiCommand => ({
    type: 'modal',
    action: 'open',
    target: modalId,
    params: config
  }),
  
  closeModal: (modalId: string): AiCommand => ({
    type: 'modal',
    action: 'close',
    target: modalId
  }),
  
  // Tab commands
  switchTab: (tabId: string, route?: string): AiCommand => ({
    type: 'tab',
    action: 'switch',
    target: tabId,
    params: { route }
  }),
  
  // Navigation commands
  navigate: (route: string): AiCommand => ({
    type: 'navigation',
    action: 'navigate',
    target: route
  }),
  
  // Data commands
  updateData: (key: string, value: any): AiCommand => ({
    type: 'data',
    action: 'update',
    target: key,
    params: { value }
  }),
  
  getData: (key: string): AiCommand => ({
    type: 'data',
    action: 'get',
    target: key
  }),
  
  // Search commands
  searchVectors: (query: string, type?: string, limit?: number): AiCommand => ({
    type: 'search',
    action: 'vector',
    params: { query, type, limit }
  }),
  
  searchActivity: (userId?: string, limit?: number): AiCommand => ({
    type: 'search',
    action: 'activity',
    params: { userId, limit }
  })
};

export default useAiAgent;
