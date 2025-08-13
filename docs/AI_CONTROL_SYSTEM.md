# AI Control System Documentation

## Overview
The AI Control System enables AI agents to have full programmatic control over the AdaptivePages application, including:
- Opening/closing modals and tabs
- Navigation control
- Data manipulation
- Activity tracking with vector storage
- Complete system state management

## System Architecture

### Core Components

#### 1. ApiController.tsx
**Purpose**: Central control hub for AI agent interactions
**Location**: `components/CaseManager/components/shared/ApiController.tsx`

```typescript
interface ApiControllerInterface {
  openModal(modalId: string, props?: any): Promise<void>
  closeModal(modalId: string): Promise<void>
  switchTab(tabId: string): Promise<void>
  navigate(path: string): Promise<void>
  updateSystemState(updates: any): Promise<void>
  logActivity(activity: ActivityLog): Promise<void>
  storeVector(content: string, metadata: any): Promise<string>
  searchVector(query: string, filters?: any): Promise<any[]>
}
```

**Key Features**:
- React Context Provider for system-wide access
- TypeScript interfaces for type safety
- Activity logging with automatic timestamps
- Vector storage integration
- Error handling and validation

#### 2. useAiAgent.tsx
**Purpose**: Client-side React hook for AI agent operations
**Location**: `components/CaseManager/components/shared/useAiAgent.tsx`

```typescript
const { 
  executeCommand, 
  analyzePatterns, 
  bulkOperation,
  activityHistory,
  isProcessing 
} = useAiAgent();
```

**Capabilities**:
- Command execution with natural language parsing
- Pattern analysis across user behavior
- Bulk operations for multiple actions
- Real-time activity tracking
- Error recovery and retry logic

#### 3. api-routes.ts
**Purpose**: Server-side API endpoints for AI control
**Location**: `components/CaseManager/components/shared/api-routes.ts`

**Endpoints**:
- `POST /api/control/modal` - Modal control
- `POST /api/control/tab` - Tab switching
- `POST /api/control/navigate` - Navigation
- `GET /api/activity/user/:userId` - Activity history
- `POST /api/vector/store` - Vector storage
- `GET /api/vector/search` - Vector search
- `POST /api/ai/interaction` - AI interaction logging

#### 4. database-schema.sql
**Purpose**: Complete database schema for activity tracking
**Location**: `components/CaseManager/components/shared/database-schema.sql`

**Tables**:
- `activity_logs` - All user and system activities
- `user_sessions` - Session tracking and state
- `ai_interactions` - AI agent command history
- `vector_references` - Vector database links
- `system_state` - Current application state

## Implementation Guide

### Step 1: Setup API Controller

```typescript
// App.tsx or main component
import { ApiControlProvider } from './components/shared/ApiController';

function App() {
  return (
    <ApiControlProvider>
      {/* Your app components */}
    </ApiControlProvider>
  );
}
```

### Step 2: Use AI Agent Hook

```typescript
// Any component that needs AI control
import { useAiAgent } from './components/shared/useAiAgent';

function MyComponent() {
  const { executeCommand, analyzePatterns } = useAiAgent();
  
  const handleAiCommand = async () => {
    await executeCommand('open modal AddEditProductModal with productId 123');
  };
  
  return <Button onClick={handleAiCommand}>Execute AI Command</Button>;
}
```

### Step 3: Server Integration

```typescript
// server.ts or main server file
import { aiControlRoutes } from './api-routes';
app.use('/api', aiControlRoutes);
```

### Step 4: Database Setup

```sql
-- Run the database schema
\i database-schema.sql
```

## AI Agent Commands

### Modal Control
```typescript
// Open modals
await executeCommand('open modal AddEditProductModal');
await executeCommand('open modal OrderDetailModal with orderId 456');

// Close modals
await executeCommand('close modal AddEditProductModal');
await executeCommand('close all modals');
```

### Tab Management
```typescript
// Switch tabs
await executeCommand('switch to tab products');
await executeCommand('activate tab orders');
await executeCommand('show dashboard tab');
```

### Navigation
```typescript
// Navigate to pages
await executeCommand('navigate to /dashboard');
await executeCommand('go to orders page');
await executeCommand('show product management');
```

### Data Operations
```typescript
// Create data
await executeCommand('create product with name "Test Product" price 99.99');

// Update data
await executeCommand('update product 123 set price 79.99');

// Search data
const results = await executeCommand('search products by category electronics');
```

### Pattern Analysis
```typescript
// Analyze user behavior
const patterns = await analyzePatterns('user engagement');
const trends = await analyzePatterns('order patterns last 30 days');
```

## Vector Storage Integration

### Storing Activity
```typescript
// Automatic storage for all activities
await apiController.storeVector(
  'User opened product modal for item 123',
  {
    userId: 'user-456',
    action: 'modal_open',
    context: 'product_management',
    timestamp: new Date().toISOString()
  }
);
```

### Searching Activities
```typescript
// Search for similar activities
const similar = await apiController.searchVector(
  'product modal interactions',
  { userId: 'user-456' }
);
```

## Activity Tracking

### Automatic Logging
Every AI action is automatically logged:
```typescript
interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  component: string;
  details: any;
  timestamp: string;
  session_id: string;
}
```

### Manual Logging
```typescript
await apiController.logActivity({
  user_id: 'user-123',
  action_type: 'ai_command',
  component: 'ProductManagement',
  details: { command: 'open modal', target: 'AddEditProductModal' }
});
```

## Error Handling

### Command Validation
```typescript
try {
  await executeCommand('invalid command');
} catch (error) {
  console.error('Command failed:', error.message);
  // Automatic retry logic
}
```

### Fallback Strategies
- Invalid commands are logged and analyzed
- Retry mechanisms for network failures
- Graceful degradation for missing components

## Security Considerations

### Access Control
- All AI commands validate user permissions
- Session-based authentication required
- Rate limiting on API endpoints

### Data Protection
- Activity logs respect privacy settings
- Vector storage includes data classification
- Audit trails for all AI actions

## Performance Optimization

### Caching
- Frequently used commands are cached
- Vector searches use similarity thresholds
- Activity patterns are pre-computed

### Monitoring
- Command execution times tracked
- System performance metrics logged
- User experience analytics

## Integration Examples

### E-commerce Integration
```typescript
// AI can manage product catalog
await executeCommand('create product bundle from cart items');
await executeCommand('analyze customer purchase patterns');
await executeCommand('recommend products for user 123');
```

### Customer Support
```typescript
// AI can handle support tickets
await executeCommand('open ticket modal for customer 456');
await executeCommand('search knowledge base for shipping issues');
await executeCommand('escalate ticket to manager');
```

### Analytics Dashboard
```typescript
// AI can generate insights
await executeCommand('show revenue trends last quarter');
await executeCommand('analyze conversion rates by channel');
await executeCommand('export customer behavior report');
```

## Testing and Validation

### Unit Tests
```typescript
// Test AI command parsing
expect(parseCommand('open modal ProductModal')).toEqual({
  action: 'open',
  target: 'modal',
  component: 'ProductModal'
});
```

### Integration Tests
```typescript
// Test end-to-end AI workflows
await testAiWorkflow([
  'open modal AddEditProductModal',
  'create product with name "Test"',
  'close modal AddEditProductModal'
]);
```

## Deployment Considerations

### Environment Variables
```bash
VECTOR_DB_URL=your_vector_database_url
AI_AGENT_API_KEY=your_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

### Cloud Setup
- Vector database (Pinecone, Weaviate, or Chroma)
- Supabase for activity logging
- Redis for command caching
- CloudWatch for monitoring

## Future Enhancements

### Planned Features
- Voice command integration
- Natural language query processing
- Predictive user assistance
- Automated workflow suggestions
- Multi-agent collaboration

### API Extensions
- GraphQL endpoint for complex queries
- WebSocket for real-time updates
- Webhook integration for external systems
- Machine learning model integration

## Troubleshooting

### Common Issues
1. **Command not recognized**: Check command syntax and available actions
2. **Permission denied**: Verify user authentication and role permissions
3. **Vector search slow**: Review query complexity and database indexes
4. **Activity log overflow**: Implement data archiving and cleanup policies

### Debug Mode
```typescript
// Enable detailed logging
const aiAgent = useAiAgent({ debug: true });
```

### Monitoring Dashboard
Access the AI control monitoring at `/admin/ai-control` to view:
- Command execution statistics
- Error rates and patterns
- Performance metrics
- User activity heatmaps

---

This AI Control System provides a foundation for building intelligent, AI-driven user experiences while maintaining full visibility and control over all system interactions.
