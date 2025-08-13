/**
 * API Control System for AI Integrations
 * Enables AI agents to control tabs, modals, and track all system activity
 */
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { JsonFeatureConfig } from './JsonFeatureSystem';

export interface ApiControlState {
  activeModals: string[];
  activeTabs: string[];
  currentRoute: string;
  systemState: Record<string, any>;
  userActivity: ActivityLog[];
  aiContext: AiContext;
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  userId: string;
  sessionId: string;
  type: ActivityType;
  action: string;
  component?: string;
  route?: string;
  data?: any;
  metadata?: {
    device: string;
    browser: string;
    ip?: string;
    location?: string;
  };
  vectorId?: string; // Reference to vector storage
}

export type ActivityType = 
  | 'navigation' 
  | 'modal_open' 
  | 'modal_close'
  | 'tab_change'
  | 'form_submit'
  | 'button_click'
  | 'search'
  | 'data_view'
  | 'api_call'
  | 'ai_interaction'
  | 'voice_dictation'
  | 'system_event';

export interface AiContext {
  currentUser: {
    id: string;
    role: string;
    permissions: string[];
    preferences: Record<string, any>;
  };
  companyContext: {
    id: string;
    settings: Record<string, any>;
    knowledgeBase: VectorReference[];
  };
  sessionContext: {
    id: string;
    startTime: Date;
    activities: string[]; // Activity IDs
    aiInteractions: AiInteraction[];
  };
}

export interface VectorReference {
  id: string;
  type: 'user_activity' | 'company_knowledge' | 'system_state' | 'ai_interaction';
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
  timestamp: Date;
}

export interface AiInteraction {
  id: string;
  timestamp: Date;
  type: 'control' | 'query' | 'suggestion' | 'automation';
  input: string;
  output: string;
  actions: AiAction[];
  vectorReferences: string[];
}

export interface AiAction {
  type: 'open_modal' | 'close_modal' | 'navigate' | 'update_data' | 'trigger_workflow';
  target: string;
  payload?: any;
  executed: boolean;
  result?: any;
}

// API Control Actions
type ApiControlAction = 
  | { type: 'OPEN_MODAL'; modalId: string; config?: any }
  | { type: 'CLOSE_MODAL'; modalId: string }
  | { type: 'SWITCH_TAB'; tabId: string; route?: string }
  | { type: 'NAVIGATE'; route: string }
  | { type: 'UPDATE_STATE'; key: string; value: any }
  | { type: 'LOG_ACTIVITY'; activity: Omit<ActivityLog, 'id' | 'timestamp'> }
  | { type: 'AI_INTERACTION'; interaction: Omit<AiInteraction, 'id' | 'timestamp'> }
  | { type: 'STORE_VECTOR'; vector: Omit<VectorReference, 'id' | 'timestamp'> };

// API Control Context
const ApiControlContext = createContext<{
  state: ApiControlState;
  dispatch: React.Dispatch<ApiControlAction>;
  apiController: ApiController;
} | null>(null);

/**
 * API Controller Class - Main interface for AI integrations
 */
export class ApiController {
  private dispatch: React.Dispatch<ApiControlAction>;
  private state: ApiControlState;

  constructor(dispatch: React.Dispatch<ApiControlAction>, state: ApiControlState) {
    this.dispatch = dispatch;
    this.state = state;
  }

  // Modal Control Methods
  async openModal(modalId: string, config?: any): Promise<boolean> {
    try {
      this.dispatch({ type: 'OPEN_MODAL', modalId, config });
      this.logActivity({
        userId: this.state.aiContext.currentUser.id,
        sessionId: this.state.aiContext.sessionContext.id,
        type: 'modal_open',
        action: 'open_modal',
        component: modalId,
        data: config
      });
      return true;
    } catch (error) {
      console.error('Failed to open modal:', error);
      return false;
    }
  }

  async closeModal(modalId: string): Promise<boolean> {
    try {
      this.dispatch({ type: 'CLOSE_MODAL', modalId });
      this.logActivity({
        userId: this.state.aiContext.currentUser.id,
        sessionId: this.state.aiContext.sessionContext.id,
        type: 'modal_close',
        action: 'close_modal',
        component: modalId
      });
      return true;
    } catch (error) {
      console.error('Failed to close modal:', error);
      return false;
    }
  }

  // Tab Control Methods
  async switchTab(tabId: string, route?: string): Promise<boolean> {
    try {
      this.dispatch({ type: 'SWITCH_TAB', tabId, route });
      this.logActivity({
        userId: this.state.aiContext.currentUser.id,
        sessionId: this.state.aiContext.sessionContext.id,
        type: 'tab_change',
        action: 'switch_tab',
        component: tabId,
        route: route
      });
      return true;
    } catch (error) {
      console.error('Failed to switch tab:', error);
      return false;
    }
  }

  // Navigation Control
  async navigate(route: string): Promise<boolean> {
    try {
      this.dispatch({ type: 'NAVIGATE', route });
      this.logActivity({
        userId: this.state.aiContext.currentUser.id,
        sessionId: this.state.aiContext.sessionContext.id,
        type: 'navigation',
        action: 'navigate',
        route: route
      });
      return true;
    } catch (error) {
      console.error('Failed to navigate:', error);
      return false;
    }
  }

  // Data Management
  async updateSystemState(key: string, value: any): Promise<boolean> {
    try {
      this.dispatch({ type: 'UPDATE_STATE', key, value });
      this.logActivity({
        userId: this.state.aiContext.currentUser.id,
        sessionId: this.state.aiContext.sessionContext.id,
        type: 'system_event',
        action: 'update_state',
        data: { key, value }
      });
      return true;
    } catch (error) {
      console.error('Failed to update state:', error);
      return false;
    }
  }

  // Activity Logging
  private logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    this.dispatch({ type: 'LOG_ACTIVITY', activity });
  }

  // Vector Storage for AI Knowledge Base
  async storeInVector(content: string, type: VectorReference['type'], metadata?: Record<string, any>): Promise<string | null> {
    try {
      const vectorId = await this.generateVectorId();
      
      this.dispatch({ 
        type: 'STORE_VECTOR', 
        vector: {
          content,
          type,
          metadata: {
            ...metadata,
            userId: this.state.aiContext.currentUser.id,
            companyId: this.state.aiContext.companyContext.id
          }
        }
      });

      // Store in external vector database (implement based on your vector DB)
      await this.storeInExternalVector(vectorId, content, type, metadata);
      
      return vectorId;
    } catch (error) {
      console.error('Failed to store in vector:', error);
      return null;
    }
  }

  // AI Interaction Tracking
  async recordAiInteraction(
    type: AiInteraction['type'],
    input: string,
    output: string,
    actions: AiAction[] = []
  ): Promise<void> {
    const interaction: Omit<AiInteraction, 'id' | 'timestamp'> = {
      type,
      input,
      output,
      actions,
      vectorReferences: []
    };

    this.dispatch({ type: 'AI_INTERACTION', interaction });

    // Store interaction in vector for future reference
    await this.storeInVector(
      `AI Interaction: ${input} -> ${output}`,
      'ai_interaction',
      { type, actions }
    );
  }

  // Query System State
  getSystemState(): ApiControlState {
    return this.state;
  }

  getUserActivity(userId?: string, limit?: number): ActivityLog[] {
    const targetUserId = userId || this.state.aiContext.currentUser.id;
    return this.state.userActivity
      .filter(activity => activity.userId === targetUserId)
      .slice(0, limit || 100)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Vector Search Interface
  async searchVectors(query: string, type?: VectorReference['type'], limit = 10): Promise<VectorReference[]> {
    // Implement vector similarity search
    // This would integrate with your vector database (Pinecone, Weaviate, etc.)
    try {
      const response = await fetch('/api/vector/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          type,
          limit,
          userId: this.state.aiContext.currentUser.id,
          companyId: this.state.aiContext.companyContext.id
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Vector search failed:', error);
      return [];
    }
  }

  // Helper Methods
  private async generateVectorId(): Promise<string> {
    return `vec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async storeInExternalVector(
    id: string, 
    content: string, 
    type: VectorReference['type'], 
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await fetch('/api/vector/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          content,
          type,
          metadata: {
            ...metadata,
            userId: this.state.aiContext.currentUser.id,
            companyId: this.state.aiContext.companyContext.id,
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (error) {
      console.error('Failed to store in external vector DB:', error);
    }
  }
}

// Reducer for API Control State
function apiControlReducer(state: ApiControlState, action: ApiControlAction): ApiControlState {
  switch (action.type) {
    case 'OPEN_MODAL':
      return {
        ...state,
        activeModals: [...state.activeModals, action.modalId]
      };

    case 'CLOSE_MODAL':
      return {
        ...state,
        activeModals: state.activeModals.filter(id => id !== action.modalId)
      };

    case 'SWITCH_TAB':
      return {
        ...state,
        activeTabs: [...state.activeTabs.filter(id => id !== action.tabId), action.tabId],
        currentRoute: action.route || state.currentRoute
      };

    case 'NAVIGATE':
      return {
        ...state,
        currentRoute: action.route
      };

    case 'UPDATE_STATE':
      return {
        ...state,
        systemState: {
          ...state.systemState,
          [action.key]: action.value
        }
      };

    case 'LOG_ACTIVITY':
      const newActivity: ActivityLog = {
        ...action.activity,
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };
      
      return {
        ...state,
        userActivity: [newActivity, ...state.userActivity].slice(0, 10000) // Keep last 10k activities
      };

    case 'AI_INTERACTION':
      const newInteraction: AiInteraction = {
        ...action.interaction,
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };

      return {
        ...state,
        aiContext: {
          ...state.aiContext,
          sessionContext: {
            ...state.aiContext.sessionContext,
            aiInteractions: [newInteraction, ...state.aiContext.sessionContext.aiInteractions]
          }
        }
      };

    case 'STORE_VECTOR':
      const newVector: VectorReference = {
        ...action.vector,
        id: `vec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };

      return {
        ...state,
        aiContext: {
          ...state.aiContext,
          companyContext: {
            ...state.aiContext.companyContext,
            knowledgeBase: [newVector, ...state.aiContext.companyContext.knowledgeBase]
          }
        }
      };

    default:
      return state;
  }
}

/**
 * API Control Provider Component
 */
export const ApiControlProvider: React.FC<{
  children: React.ReactNode;
  initialUser: AiContext['currentUser'];
  companyId: string;
}> = ({ children, initialUser, companyId }) => {
  const initialState: ApiControlState = {
    activeModals: [],
    activeTabs: [],
    currentRoute: '/',
    systemState: {},
    userActivity: [],
    aiContext: {
      currentUser: initialUser,
      companyContext: {
        id: companyId,
        settings: {},
        knowledgeBase: []
      },
      sessionContext: {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        startTime: new Date(),
        activities: [],
        aiInteractions: []
      }
    }
  };

  const [state, dispatch] = useReducer(apiControlReducer, initialState);
  const apiController = new ApiController(dispatch, state);

  // Auto-save activity to vector storage
  useEffect(() => {
    const latestActivity = state.userActivity[0];
    if (latestActivity && !latestActivity.vectorId) {
      apiController.storeInVector(
        JSON.stringify(latestActivity),
        'user_activity',
        { activityType: latestActivity.type }
      );
    }
  }, [state.userActivity]);

  return (
    <ApiControlContext.Provider value={{ state, dispatch, apiController }}>
      {children}
    </ApiControlContext.Provider>
  );
};

/**
 * Hook to access API Controller
 */
export const useApiController = () => {
  const context = useContext(ApiControlContext);
  if (!context) {
    throw new Error('useApiController must be used within ApiControlProvider');
  }
  return context;
};

/**
 * REST API Endpoints for AI Integration
 */
export const API_ENDPOINTS = {
  // Modal Control
  openModal: (modalId: string, config?: any) => ({
    method: 'POST',
    url: `/api/control/modal/${modalId}/open`,
    body: config
  }),
  
  closeModal: (modalId: string) => ({
    method: 'POST',
    url: `/api/control/modal/${modalId}/close`
  }),

  // Tab Control  
  switchTab: (tabId: string, route?: string) => ({
    method: 'POST',
    url: `/api/control/tab/${tabId}/switch`,
    body: { route }
  }),

  // Navigation
  navigate: (route: string) => ({
    method: 'POST',
    url: '/api/control/navigate',
    body: { route }
  }),

  // State Management
  getState: () => ({
    method: 'GET',
    url: '/api/control/state'
  }),

  updateState: (key: string, value: any) => ({
    method: 'PUT',
    url: `/api/control/state/${key}`,
    body: { value }
  }),

  // Activity Tracking
  getUserActivity: (userId?: string, limit?: number) => ({
    method: 'GET',
    url: `/api/activity/user${userId ? `/${userId}` : ''}?limit=${limit || 100}`
  }),

  getCompanyActivity: (companyId: string, limit?: number) => ({
    method: 'GET',
    url: `/api/activity/company/${companyId}?limit=${limit || 100}`
  }),

  // Vector Operations
  searchVectors: (query: string, type?: string, limit?: number) => ({
    method: 'POST',
    url: '/api/vector/search',
    body: { query, type, limit }
  }),

  storeVector: (content: string, type: string, metadata?: any) => ({
    method: 'POST',
    url: '/api/vector/store',
    body: { content, type, metadata }
  }),

  // AI Interactions
  recordAiInteraction: (interaction: Omit<AiInteraction, 'id' | 'timestamp'>) => ({
    method: 'POST',
    url: '/api/ai/interaction',
    body: interaction
  }),

  getAiHistory: (sessionId?: string, limit?: number) => ({
    method: 'GET',
    url: `/api/ai/history${sessionId ? `/${sessionId}` : ''}?limit=${limit || 50}`
  })
};

export default ApiController;
