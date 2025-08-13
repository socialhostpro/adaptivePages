/**
 * API Routes for AI Control System
 * Server-side endpoints for AI agents to control the application
 */

// Example Express.js routes (adapt for your backend framework)

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Vector database client (example with Pinecone)
// import { PineconeClient } from '@pinecone-database/pinecone';
// const pinecone = new PineconeClient();

/**
 * Modal Control Routes
 */
router.post('/control/modal/:modalId/open', async (req, res) => {
  try {
    const { modalId } = req.params;
    const config = req.body;
    const userId = req.user?.id; // From auth middleware
    
    // Log activity to database
    await logActivity({
      userId,
      type: 'modal_open',
      action: 'open_modal',
      component: modalId,
      data: config
    });

    // Store in vector for AI learning
    await storeInVector(
      `User opened modal: ${modalId} with config: ${JSON.stringify(config)}`,
      'user_activity',
      { modalId, config, userId }
    );

    res.json({ success: true, modalId, config });
  } catch (error) {
    console.error('Modal open error:', error);
    res.status(500).json({ error: 'Failed to open modal' });
  }
});

router.post('/control/modal/:modalId/close', async (req, res) => {
  try {
    const { modalId } = req.params;
    const userId = req.user?.id;
    
    await logActivity({
      userId,
      type: 'modal_close',
      action: 'close_modal',
      component: modalId
    });

    await storeInVector(
      `User closed modal: ${modalId}`,
      'user_activity',
      { modalId, userId }
    );

    res.json({ success: true, modalId });
  } catch (error) {
    console.error('Modal close error:', error);
    res.status(500).json({ error: 'Failed to close modal' });
  }
});

/**
 * Tab Control Routes
 */
router.post('/control/tab/:tabId/switch', async (req, res) => {
  try {
    const { tabId } = req.params;
    const { route } = req.body;
    const userId = req.user?.id;
    
    await logActivity({
      userId,
      type: 'tab_change',
      action: 'switch_tab',
      component: tabId,
      route
    });

    await storeInVector(
      `User switched to tab: ${tabId}${route ? ` with route: ${route}` : ''}`,
      'user_activity',
      { tabId, route, userId }
    );

    res.json({ success: true, tabId, route });
  } catch (error) {
    console.error('Tab switch error:', error);
    res.status(500).json({ error: 'Failed to switch tab' });
  }
});

/**
 * Navigation Routes
 */
router.post('/control/navigate', async (req, res) => {
  try {
    const { route } = req.body;
    const userId = req.user?.id;
    
    await logActivity({
      userId,
      type: 'navigation',
      action: 'navigate',
      route
    });

    await storeInVector(
      `User navigated to: ${route}`,
      'user_activity',
      { route, userId }
    );

    res.json({ success: true, route });
  } catch (error) {
    console.error('Navigation error:', error);
    res.status(500).json({ error: 'Failed to navigate' });
  }
});

/**
 * State Management Routes
 */
router.get('/control/state', async (req, res) => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.companyId;
    
    // Get current user session state
    const { data: sessionData } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .single();

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(100);

    // Get company context
    const { data: companyData } = await supabase
      .from('companies')
      .select('*, settings')
      .eq('id', companyId)
      .single();

    res.json({
      success: true,
      state: {
        session: sessionData,
        recentActivity,
        company: companyData,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get state error:', error);
    res.status(500).json({ error: 'Failed to get state' });
  }
});

router.put('/control/state/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const userId = req.user?.id;
    
    // Update user session state
    await supabase
      .from('user_sessions')
      .update({ 
        state: { [key]: value },
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('active', true);

    await logActivity({
      userId,
      type: 'system_event',
      action: 'update_state',
      data: { key, value }
    });

    res.json({ success: true, key, value });
  } catch (error) {
    console.error('Update state error:', error);
    res.status(500).json({ error: 'Failed to update state' });
  }
});

/**
 * Activity Tracking Routes
 */
router.get('/activity/user/:userId?', async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const { data: activities } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    res.json({ success: true, activities });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ error: 'Failed to get user activity' });
  }
});

router.get('/activity/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    // Verify user has access to company data
    if (req.user?.companyId !== companyId) {
      return res.status(403).json({ error: 'Unauthorized access to company data' });
    }

    const { data: activities } = await supabase
      .from('activity_logs')
      .select('*, users(name, email)')
      .eq('company_id', companyId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    res.json({ success: true, activities });
  } catch (error) {
    console.error('Get company activity error:', error);
    res.status(500).json({ error: 'Failed to get company activity' });
  }
});

/**
 * Vector Database Routes
 */
router.post('/vector/search', async (req, res) => {
  try {
    const { query, type, limit = 10 } = req.body;
    const userId = req.user?.id;
    const companyId = req.user?.companyId;
    
    // Implement vector similarity search
    // Example with a generic vector DB API
    const searchResults = await searchVectorDatabase({
      query,
      type,
      limit,
      filters: {
        userId,
        companyId
      }
    });

    // Log the search for AI learning
    await logActivity({
      userId,
      type: 'search',
      action: 'vector_search',
      data: { query, type, resultsCount: searchResults.length }
    });

    res.json({ success: true, results: searchResults });
  } catch (error) {
    console.error('Vector search error:', error);
    res.status(500).json({ error: 'Failed to search vectors' });
  }
});

router.post('/vector/store', async (req, res) => {
  try {
    const { content, type, metadata } = req.body;
    const userId = req.user?.id;
    const companyId = req.user?.companyId;
    
    const vectorId = `vec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store in vector database
    await storeInVectorDatabase({
      id: vectorId,
      content,
      type,
      metadata: {
        ...metadata,
        userId,
        companyId,
        timestamp: new Date().toISOString()
      }
    });

    // Also store metadata in Supabase for querying
    await supabase
      .from('vector_references')
      .insert({
        id: vectorId,
        user_id: userId,
        company_id: companyId,
        type,
        content_preview: content.substring(0, 200),
        metadata,
        created_at: new Date().toISOString()
      });

    res.json({ success: true, vectorId });
  } catch (error) {
    console.error('Vector store error:', error);
    res.status(500).json({ error: 'Failed to store vector' });
  }
});

/**
 * AI Interaction Routes
 */
router.post('/ai/interaction', async (req, res) => {
  try {
    const interaction = req.body;
    const userId = req.user?.id;
    const companyId = req.user?.companyId;
    
    const interactionId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store AI interaction
    await supabase
      .from('ai_interactions')
      .insert({
        id: interactionId,
        user_id: userId,
        company_id: companyId,
        type: interaction.type,
        input: interaction.input,
        output: interaction.output,
        actions: interaction.actions,
        created_at: new Date().toISOString()
      });

    // Store in vector for future AI learning
    await storeInVector(
      `AI Interaction: ${interaction.input} -> ${interaction.output}`,
      'ai_interaction',
      { type: interaction.type, actions: interaction.actions }
    );

    res.json({ success: true, interactionId });
  } catch (error) {
    console.error('AI interaction error:', error);
    res.status(500).json({ error: 'Failed to record AI interaction' });
  }
});

router.get('/ai/history/:sessionId?', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const limit = parseInt(req.query.limit as string) || 50;
    const userId = req.user?.id;
    
    let query = supabase
      .from('ai_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data: interactions } = await query;

    res.json({ success: true, interactions });
  } catch (error) {
    console.error('Get AI history error:', error);
    res.status(500).json({ error: 'Failed to get AI history' });
  }
});

/**
 * Helper Functions
 */
async function logActivity(activity: any) {
  try {
    await supabase
      .from('activity_logs')
      .insert({
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...activity,
        timestamp: new Date().toISOString(),
        metadata: {
          ip: activity.ip,
          userAgent: activity.userAgent,
          device: activity.device
        }
      });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

async function storeInVector(content: string, type: string, metadata: any) {
  try {
    // This is a placeholder - implement based on your vector database
    // Examples: Pinecone, Weaviate, Qdrant, etc.
    
    // Example with a generic vector API
    const vectorId = `vec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate embedding (use OpenAI, Cohere, or other embedding service)
    const embedding = await generateEmbedding(content);
    
    // Store in vector database
    await storeInVectorDatabase({
      id: vectorId,
      content,
      type,
      metadata,
      embedding
    });
    
    return vectorId;
  } catch (error) {
    console.error('Failed to store in vector:', error);
    return null;
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  // Implement embedding generation
  // Example with OpenAI
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002'
      })
    });
    
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    return [];
  }
}

async function storeInVectorDatabase(data: any) {
  // Implement based on your vector database
  // This is a placeholder implementation
  console.log('Storing in vector database:', data);
}

async function searchVectorDatabase(params: any) {
  // Implement based on your vector database
  // This is a placeholder implementation
  console.log('Searching vector database:', params);
  return [];
}

export default router;
