-- Database Schema for AI Control System and Vector Tracking
-- Run this in your Supabase SQL editor

-- Activity Logs Table - Tracks all user interactions
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    type TEXT NOT NULL CHECK (type IN (
        'navigation', 'modal_open', 'modal_close', 'tab_change', 
        'form_submit', 'button_click', 'search', 'data_view', 
        'api_call', 'ai_interaction', 'voice_dictation', 'system_event'
    )),
    action TEXT NOT NULL,
    component TEXT,
    route TEXT,
    data JSONB,
    metadata JSONB DEFAULT '{}',
    vector_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Sessions Table - Tracks active user sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    active BOOLEAN DEFAULT TRUE,
    device_info JSONB DEFAULT '{}',
    state JSONB DEFAULT '{}',
    activity_count INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Interactions Table - Tracks all AI agent interactions
CREATE TABLE IF NOT EXISTS ai_interactions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    session_id TEXT REFERENCES user_sessions(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    type TEXT NOT NULL CHECK (type IN ('control', 'query', 'suggestion', 'automation')),
    input TEXT NOT NULL,
    output TEXT NOT NULL,
    actions JSONB DEFAULT '[]',
    vector_references TEXT[] DEFAULT '{}',
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector References Table - Metadata for vector database entries
CREATE TABLE IF NOT EXISTS vector_references (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'user_activity', 'company_knowledge', 'system_state', 'ai_interaction',
        'form_data', 'search_query', 'document', 'conversation'
    )),
    content_preview TEXT, -- First 200 chars for quick reference
    metadata JSONB DEFAULT '{}',
    embedding_model TEXT DEFAULT 'text-embedding-ada-002',
    token_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System State Table - Current system state for AI context
CREATE TABLE IF NOT EXISTS system_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    type TEXT DEFAULT 'user_defined',
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, key)
);

-- AI Learning Data Table - Store patterns for AI improvement
CREATE TABLE IF NOT EXISTS ai_learning_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    pattern_type TEXT NOT NULL, -- 'user_behavior', 'successful_workflow', 'error_pattern'
    pattern_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    occurrence_count INTEGER DEFAULT 1,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    effectiveness_rating DECIMAL(3,2), -- How effective this pattern is
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge Base Table - Company-specific knowledge for AI
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'general', -- 'process', 'policy', 'faq', 'procedure'
    tags TEXT[] DEFAULT '{}',
    category TEXT,
    priority INTEGER DEFAULT 5, -- 1-10 scale
    vector_id TEXT,
    last_updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_timestamp ON activity_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_company_timestamp ON activity_logs(company_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_vector_id ON activity_logs(vector_id) WHERE vector_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_sessions_company ON user_sessions(company_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_timestamp ON ai_interactions(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON ai_interactions(type);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_session ON ai_interactions(session_id);

CREATE INDEX IF NOT EXISTS idx_vector_references_company_type ON vector_references(company_id, type);
CREATE INDEX IF NOT EXISTS idx_vector_references_user ON vector_references(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_state_company_key ON system_state(company_id, key);
CREATE INDEX IF NOT EXISTS idx_system_state_expires ON system_state(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_learning_company_type ON ai_learning_data(company_id, pattern_type);
CREATE INDEX IF NOT EXISTS idx_ai_learning_confidence ON ai_learning_data(confidence_score DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_company_category ON knowledge_base(company_id, category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON knowledge_base USING GIN(tags);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
CREATE TRIGGER update_activity_logs_updated_at BEFORE UPDATE ON activity_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vector_references_updated_at BEFORE UPDATE ON vector_references
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_state_updated_at BEFORE UPDATE ON system_state
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_learning_data_updated_at BEFORE UPDATE ON ai_learning_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically end user sessions after inactivity
CREATE OR REPLACE FUNCTION end_inactive_sessions()
RETURNS void AS $$
BEGIN
    UPDATE user_sessions 
    SET active = FALSE, end_time = NOW()
    WHERE active = TRUE 
    AND last_activity < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to clean old activity logs (keep last 90 days by default)
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM activity_logs 
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(
    p_user_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    activity_type TEXT,
    count BIGINT,
    last_occurrence TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.type as activity_type,
        COUNT(*) as count,
        MAX(al.timestamp) as last_occurrence
    FROM activity_logs al
    WHERE al.user_id = p_user_id
    AND al.timestamp BETWEEN p_start_date AND p_end_date
    GROUP BY al.type
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get company activity insights
CREATE OR REPLACE FUNCTION get_company_activity_insights(
    p_company_id UUID,
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    metric TEXT,
    value NUMERIC,
    change_percent NUMERIC
) AS $$
DECLARE
    current_period_start TIMESTAMPTZ := NOW() - (p_days || ' days')::INTERVAL;
    previous_period_start TIMESTAMPTZ := NOW() - (p_days * 2 || ' days')::INTERVAL;
    previous_period_end TIMESTAMPTZ := NOW() - (p_days || ' days')::INTERVAL;
BEGIN
    RETURN QUERY
    WITH current_stats AS (
        SELECT COUNT(*) as current_activity
        FROM activity_logs
        WHERE company_id = p_company_id
        AND timestamp >= current_period_start
    ),
    previous_stats AS (
        SELECT COUNT(*) as previous_activity
        FROM activity_logs
        WHERE company_id = p_company_id
        AND timestamp BETWEEN previous_period_start AND previous_period_end
    )
    SELECT 
        'total_activity'::TEXT as metric,
        cs.current_activity::NUMERIC as value,
        CASE 
            WHEN ps.previous_activity > 0 THEN 
                ROUND(((cs.current_activity - ps.previous_activity)::NUMERIC / ps.previous_activity) * 100, 2)
            ELSE 0
        END as change_percent
    FROM current_stats cs, previous_stats ps;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vector_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Policies for activity_logs
CREATE POLICY "Users can view their own activity logs" ON activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs" ON activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for ai_interactions
CREATE POLICY "Users can view their own AI interactions" ON ai_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI interactions" ON ai_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for vector_references
CREATE POLICY "Users can view their company's vectors" ON vector_references
    FOR SELECT USING (company_id IN (
        SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
    ));

-- Policies for system_state
CREATE POLICY "Users can view their company's system state" ON system_state
    FOR SELECT USING (company_id IN (
        SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
    ));

-- Policies for knowledge_base
CREATE POLICY "Users can view their company's knowledge base" ON knowledge_base
    FOR SELECT USING (company_id IN (
        SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
    ));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
