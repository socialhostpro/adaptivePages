# Business Monitoring & Alerting Database Schema

## Tables for Real-time Business Monitoring

```sql
-- Alert settings and configuration
CREATE TABLE IF NOT EXISTS alert_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Alert toggles
    enable_news_alerts BOOLEAN DEFAULT true,
    enable_review_alerts BOOLEAN DEFAULT true,
    enable_trend_alerts BOOLEAN DEFAULT true,
    enable_social_alerts BOOLEAN DEFAULT true,
    enable_competitor_alerts BOOLEAN DEFAULT false,
    
    -- Thresholds
    min_review_rating INTEGER DEFAULT 3,
    min_sentiment_score DECIMAL(3,2) DEFAULT -0.3,
    min_trend_change DECIMAL(5,2) DEFAULT 50.0,
    min_influence_level TEXT DEFAULT 'medium',
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    webhook_url TEXT,
    notification_frequency TEXT DEFAULT 'immediate',
    
    -- Keywords
    brand_keywords JSONB DEFAULT '[]',
    competitor_keywords JSONB DEFAULT '[]',
    industry_keywords JSONB DEFAULT '[]',
    exclude_keywords JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(business_name, user_id)
);

-- News alerts and mentions
CREATE TABLE IF NOT EXISTS news_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    source TEXT,
    
    -- Sentiment analysis
    sentiment TEXT DEFAULT 'neutral',
    sentiment_score DECIMAL(3,2) DEFAULT 0,
    keywords JSONB DEFAULT '[]',
    
    -- Alert classification
    alert_type TEXT DEFAULT 'news_mention',
    severity TEXT DEFAULT 'medium',
    is_read BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Review alerts from all platforms
CREATE TABLE IF NOT EXISTS review_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    platform TEXT NOT NULL, -- google, yelp, facebook, etc.
    place_id TEXT, -- Google Place ID
    reviewer_name TEXT,
    rating INTEGER,
    review_text TEXT,
    review_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Sentiment analysis
    sentiment TEXT DEFAULT 'neutral',
    sentiment_score DECIMAL(3,2) DEFAULT 0,
    keywords JSONB DEFAULT '[]',
    
    -- Response tracking
    is_response BOOLEAN DEFAULT false,
    response_text TEXT,
    response_date TIMESTAMP WITH TIME ZONE,
    
    -- Alert classification
    alert_type TEXT DEFAULT 'new_review',
    severity TEXT DEFAULT 'medium',
    is_read BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Google Trends alerts
CREATE TABLE IF NOT EXISTS trend_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    keyword TEXT NOT NULL,
    trend_type TEXT DEFAULT 'rising',
    search_volume INTEGER DEFAULT 0,
    previous_volume INTEGER DEFAULT 0,
    percentage_change DECIMAL(5,2) DEFAULT 0,
    related_queries JSONB DEFAULT '[]',
    geo_data JSONB DEFAULT '[]',
    time_range TEXT DEFAULT '7d',
    
    -- Alert classification
    alert_type TEXT DEFAULT 'trend_spike',
    severity TEXT DEFAULT 'medium',
    is_read BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Social media mentions
CREATE TABLE IF NOT EXISTS social_mention_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    platform TEXT NOT NULL,
    mention_text TEXT NOT NULL,
    author_username TEXT,
    author_followers INTEGER DEFAULT 0,
    post_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Engagement metrics
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    
    -- Sentiment and influence
    sentiment TEXT DEFAULT 'neutral',
    sentiment_score DECIMAL(3,2) DEFAULT 0,
    influence TEXT DEFAULT 'low',
    
    -- Alert classification
    alert_type TEXT DEFAULT 'social_mention',
    severity TEXT DEFAULT 'medium',
    is_read BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Competitor alerts
CREATE TABLE IF NOT EXISTS competitor_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    competitor_name TEXT NOT NULL,
    alert_content TEXT NOT NULL,
    alert_type TEXT DEFAULT 'competitor_news',
    source TEXT,
    source_url TEXT,
    impact TEXT DEFAULT 'neutral',
    
    action_required BOOLEAN DEFAULT false,
    recommendations JSONB DEFAULT '[]',
    
    -- Alert classification
    severity TEXT DEFAULT 'medium',
    is_read BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Reputation tracking over time
CREATE TABLE IF NOT EXISTS reputation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    overall_score INTEGER DEFAULT 50, -- 0-100
    news_sentiment DECIMAL(3,2) DEFAULT 0,
    review_sentiment DECIMAL(3,2) DEFAULT 0,
    social_sentiment DECIMAL(3,2) DEFAULT 0,
    
    total_mentions INTEGER DEFAULT 0,
    positive_mentions INTEGER DEFAULT 0,
    negative_mentions INTEGER DEFAULT 0,
    neutral_mentions INTEGER DEFAULT 0,
    
    date_recorded DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Monitoring jobs and status
CREATE TABLE IF NOT EXISTS monitoring_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    job_type TEXT NOT NULL, -- news, reviews, trends, social
    status TEXT DEFAULT 'active', -- active, paused, stopped
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    run_frequency TEXT DEFAULT 'hourly',
    
    -- Job configuration
    config JSONB DEFAULT '{}',
    
    -- Performance metrics
    total_runs INTEGER DEFAULT 0,
    successful_runs INTEGER DEFAULT 0,
    failed_runs INTEGER DEFAULT 0,
    avg_execution_time INTEGER DEFAULT 0, -- milliseconds
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_alerts_business ON news_alerts(business_name);
CREATE INDEX IF NOT EXISTS idx_news_alerts_severity ON news_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_news_alerts_unread ON news_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_news_alerts_date ON news_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_review_alerts_business ON review_alerts(business_name);
CREATE INDEX IF NOT EXISTS idx_review_alerts_platform ON review_alerts(platform);
CREATE INDEX IF NOT EXISTS idx_review_alerts_rating ON review_alerts(rating);
CREATE INDEX IF NOT EXISTS idx_review_alerts_severity ON review_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_review_alerts_unread ON review_alerts(is_read);

CREATE INDEX IF NOT EXISTS idx_trend_alerts_business ON trend_alerts(business_name);
CREATE INDEX IF NOT EXISTS idx_trend_alerts_keyword ON trend_alerts(keyword);
CREATE INDEX IF NOT EXISTS idx_trend_alerts_severity ON trend_alerts(severity);

CREATE INDEX IF NOT EXISTS idx_social_alerts_business ON social_mention_alerts(business_name);
CREATE INDEX IF NOT EXISTS idx_social_alerts_platform ON social_mention_alerts(platform);
CREATE INDEX IF NOT EXISTS idx_social_alerts_influence ON social_mention_alerts(influence);
CREATE INDEX IF NOT EXISTS idx_social_alerts_severity ON social_mention_alerts(severity);

CREATE INDEX IF NOT EXISTS idx_competitor_alerts_business ON competitor_alerts(business_name);
CREATE INDEX IF NOT EXISTS idx_competitor_alerts_competitor ON competitor_alerts(competitor_name);

CREATE INDEX IF NOT EXISTS idx_reputation_history_business ON reputation_history(business_name);
CREATE INDEX IF NOT EXISTS idx_reputation_history_date ON reputation_history(date_recorded);

CREATE INDEX IF NOT EXISTS idx_monitoring_jobs_business ON monitoring_jobs(business_name);
CREATE INDEX IF NOT EXISTS idx_monitoring_jobs_type ON monitoring_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_monitoring_jobs_status ON monitoring_jobs(status);

-- Create views for dashboard queries
CREATE OR REPLACE VIEW alert_summary AS
SELECT 
    business_name,
    user_id,
    COUNT(*) as total_alerts,
    COUNT(CASE WHEN is_read = false THEN 1 END) as unread_alerts,
    COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_alerts,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as alerts_last_24h,
    MAX(created_at) as last_alert_time
FROM (
    SELECT business_name, user_id, is_read, severity, created_at FROM news_alerts
    UNION ALL
    SELECT business_name, user_id, is_read, severity, created_at FROM review_alerts
    UNION ALL
    SELECT business_name, user_id, is_read, severity, created_at FROM trend_alerts
    UNION ALL
    SELECT business_name, user_id, is_read, severity, created_at FROM social_mention_alerts
    UNION ALL
    SELECT business_name, user_id, is_read, severity, created_at FROM competitor_alerts
) all_alerts
GROUP BY business_name, user_id;

CREATE OR REPLACE VIEW reputation_summary AS
SELECT 
    r.business_name,
    r.user_id,
    r.overall_score,
    r.news_sentiment,
    r.review_sentiment,
    r.social_sentiment,
    r.total_mentions,
    r.positive_mentions,
    r.negative_mentions,
    r.date_recorded,
    
    -- Calculate trends
    LAG(r.overall_score) OVER (PARTITION BY r.business_name ORDER BY r.date_recorded) as previous_score,
    r.overall_score - LAG(r.overall_score) OVER (PARTITION BY r.business_name ORDER BY r.date_recorded) as score_change
    
FROM reputation_history r
WHERE r.date_recorded >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY r.business_name, r.date_recorded DESC;

-- Functions for automated monitoring
CREATE OR REPLACE FUNCTION calculate_reputation_score(
    p_business_name TEXT,
    p_user_id UUID
) RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER := 50; -- Base score
    v_review_avg DECIMAL;
    v_sentiment_avg DECIMAL;
    v_mention_ratio DECIMAL;
BEGIN
    -- Calculate average review rating (Google Reviews)
    SELECT AVG(rating) INTO v_review_avg
    FROM review_alerts
    WHERE business_name = p_business_name 
    AND user_id = p_user_id
    AND platform = 'google'
    AND created_at >= NOW() - INTERVAL '30 days';
    
    -- Calculate average sentiment across all sources
    SELECT AVG(sentiment_score) INTO v_sentiment_avg
    FROM (
        SELECT sentiment_score FROM news_alerts WHERE business_name = p_business_name AND user_id = p_user_id AND created_at >= NOW() - INTERVAL '30 days'
        UNION ALL
        SELECT sentiment_score FROM review_alerts WHERE business_name = p_business_name AND user_id = p_user_id AND created_at >= NOW() - INTERVAL '30 days'
        UNION ALL
        SELECT sentiment_score FROM social_mention_alerts WHERE business_name = p_business_name AND user_id = p_user_id AND created_at >= NOW() - INTERVAL '30 days'
    ) all_sentiment;
    
    -- Apply review rating factor (0-30 points)
    IF v_review_avg IS NOT NULL THEN
        v_score := v_score + ((v_review_avg - 3) * 10); -- 3 is neutral, each star = 10 points
    END IF;
    
    -- Apply sentiment factor (-20 to +20 points)
    IF v_sentiment_avg IS NOT NULL THEN
        v_score := v_score + (v_sentiment_avg * 20);
    END IF;
    
    -- Ensure score stays within bounds
    v_score := GREATEST(0, LEAST(100, v_score));
    
    RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update reputation history daily
CREATE OR REPLACE FUNCTION update_daily_reputation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO reputation_history (
        business_name,
        user_id,
        overall_score,
        news_sentiment,
        review_sentiment,
        social_sentiment,
        total_mentions,
        positive_mentions,
        negative_mentions
    )
    SELECT 
        NEW.business_name,
        NEW.user_id,
        calculate_reputation_score(NEW.business_name, NEW.user_id),
        COALESCE((SELECT AVG(sentiment_score) FROM news_alerts WHERE business_name = NEW.business_name AND user_id = NEW.user_id AND created_at >= CURRENT_DATE), 0),
        COALESCE((SELECT AVG(sentiment_score) FROM review_alerts WHERE business_name = NEW.business_name AND user_id = NEW.user_id AND created_at >= CURRENT_DATE), 0),
        COALESCE((SELECT AVG(sentiment_score) FROM social_mention_alerts WHERE business_name = NEW.business_name AND user_id = NEW.user_id AND created_at >= CURRENT_DATE), 0),
        (SELECT COUNT(*) FROM (
            SELECT 1 FROM news_alerts WHERE business_name = NEW.business_name AND user_id = NEW.user_id AND created_at >= CURRENT_DATE
            UNION ALL
            SELECT 1 FROM review_alerts WHERE business_name = NEW.business_name AND user_id = NEW.user_id AND created_at >= CURRENT_DATE
            UNION ALL
            SELECT 1 FROM social_mention_alerts WHERE business_name = NEW.business_name AND user_id = NEW.user_id AND created_at >= CURRENT_DATE
        ) all_mentions),
        (SELECT COUNT(*) FROM (
            SELECT 1 FROM news_alerts WHERE business_name = NEW.business_name AND user_id = NEW.user_id AND created_at >= CURRENT_DATE AND sentiment = 'positive'
            UNION ALL
            SELECT 1 FROM review_alerts WHERE business_name = NEW.business_name AND user_id = NEW.user_id AND created_at >= CURRENT_DATE AND sentiment = 'positive'
            UNION ALL
            SELECT 1 FROM social_mention_alerts WHERE business_name = NEW.business_name AND user_id = NEW.user_id AND created_at >= CURRENT_DATE AND sentiment = 'positive'
        ) positive_mentions),
        (SELECT COUNT(*) FROM (
            SELECT 1 FROM news_alerts WHERE business_name = NEW.business_name AND user_id = NEW.user_id AND created_at >= CURRENT_DATE AND sentiment = 'negative'
            UNION ALL
            SELECT 1 FROM review_alerts WHERE business_name = NEW.business_name AND user_id = NEW.user_id AND created_at >= CURRENT_DATE AND sentiment = 'negative'
            UNION ALL
            SELECT 1 FROM social_mention_alerts WHERE business_name = NEW.business_name AND user_id = NEW.user_id AND created_at >= CURRENT_DATE AND sentiment = 'negative'
        ) negative_mentions)
    ON CONFLICT (business_name, user_id, date_recorded) 
    DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        news_sentiment = EXCLUDED.news_sentiment,
        review_sentiment = EXCLUDED.review_sentiment,
        social_sentiment = EXCLUDED.social_sentiment,
        total_mentions = EXCLUDED.total_mentions,
        positive_mentions = EXCLUDED.positive_mentions,
        negative_mentions = EXCLUDED.negative_mentions;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_mention_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own alert settings" ON alert_settings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own news alerts" ON news_alerts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own review alerts" ON review_alerts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own trend alerts" ON trend_alerts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own social alerts" ON social_mention_alerts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own competitor alerts" ON competitor_alerts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own reputation history" ON reputation_history
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own monitoring jobs" ON monitoring_jobs
    FOR ALL USING (auth.uid() = user_id);
```
