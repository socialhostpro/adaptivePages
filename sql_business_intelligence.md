-- Comprehensive Business Intelligence Database Schema
-- Stores data from Google APIs, Social Media APIs, and other business intelligence sources

-- Main business intelligence table
CREATE TABLE IF NOT EXISTS business_intelligence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name TEXT NOT NULL,
    domain TEXT,
    industry TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_data_refresh TIMESTAMP WITH TIME ZONE DEFAULT now(),
    data_sources JSONB DEFAULT '{}', -- Track which APIs provided data
    UNIQUE(business_name, domain)
);

-- Google Search Console data
CREATE TABLE IF NOT EXISTS search_console_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES business_intelligence(id) ON DELETE CASCADE,
    property TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0,
    position DECIMAL(5,2) DEFAULT 0,
    top_queries JSONB DEFAULT '[]',
    top_pages JSONB DEFAULT '[]',
    device_performance JSONB DEFAULT '{}',
    date_range_start DATE,
    date_range_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Google Analytics data
CREATE TABLE IF NOT EXISTS analytics_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES business_intelligence(id) ON DELETE CASCADE,
    property TEXT NOT NULL,
    sessions INTEGER DEFAULT 0,
    users INTEGER DEFAULT 0,
    pageviews INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,4) DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0,
    top_pages JSONB DEFAULT '[]',
    traffic_sources JSONB DEFAULT '[]',
    demographics JSONB DEFAULT '{}',
    geo_data JSONB DEFAULT '[]',
    date_range_start DATE,
    date_range_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Google Ads data
CREATE TABLE IF NOT EXISTS google_ads_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES business_intelligence(id) ON DELETE CASCADE,
    account_id TEXT NOT NULL,
    campaigns JSONB DEFAULT '[]',
    keywords JSONB DEFAULT '[]',
    ad_groups JSONB DEFAULT '[]',
    total_cost DECIMAL(10,2) DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    total_impressions INTEGER DEFAULT 0,
    avg_ctr DECIMAL(5,4) DEFAULT 0,
    avg_cpc DECIMAL(8,2) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    date_range_start DATE,
    date_range_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Keyword research data
CREATE TABLE IF NOT EXISTS keyword_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES business_intelligence(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    search_volume INTEGER DEFAULT 0,
    competition TEXT DEFAULT 'UNKNOWN',
    competition_index DECIMAL(3,2) DEFAULT 0,
    low_bid DECIMAL(8,2) DEFAULT 0,
    high_bid DECIMAL(8,2) DEFAULT 0,
    related_keywords JSONB DEFAULT '[]',
    seasonality JSONB DEFAULT '[]',
    source TEXT DEFAULT 'keyword_planner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Social media data
CREATE TABLE IF NOT EXISTS social_media_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES business_intelligence(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- facebook, instagram, twitter, linkedin
    account_id TEXT,
    username TEXT,
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0,
    posts JSONB DEFAULT '[]',
    insights JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Business media (photos, videos, logos)
CREATE TABLE IF NOT EXISTS business_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES business_intelligence(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL, -- photo, video, logo
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    width INTEGER,
    height INTEGER,
    duration INTEGER, -- for videos
    caption TEXT,
    tags JSONB DEFAULT '[]',
    source TEXT NOT NULL, -- google_places, social_media, website
    format TEXT, -- jpg, png, svg, mp4, etc.
    size_category TEXT, -- small, medium, large
    uploaded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- News and trends data
CREATE TABLE IF NOT EXISTS news_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES business_intelligence(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    source_name TEXT,
    source_id TEXT,
    relevance_score DECIMAL(3,2) DEFAULT 0,
    sentiment TEXT, -- positive, negative, neutral
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Competitor analysis data
CREATE TABLE IF NOT EXISTS competitor_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES business_intelligence(id) ON DELETE CASCADE,
    competitor_domain TEXT NOT NULL,
    competitor_name TEXT,
    estimated_traffic INTEGER DEFAULT 0,
    top_keywords JSONB DEFAULT '[]',
    backlinks INTEGER DEFAULT 0,
    domain_rating INTEGER DEFAULT 0,
    social_media_metrics JSONB DEFAULT '{}',
    market_share DECIMAL(5,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trends and insights
CREATE TABLE IF NOT EXISTS trend_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES business_intelligence(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    trend_volume INTEGER DEFAULT 0,
    growth_rate DECIMAL(5,2) DEFAULT 0,
    related_queries JSONB DEFAULT '[]',
    geographic_data JSONB DEFAULT '{}',
    time_series JSONB DEFAULT '[]',
    source TEXT DEFAULT 'google_trends',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SEO audit and recommendations
CREATE TABLE IF NOT EXISTS seo_audit_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES business_intelligence(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    page_title TEXT,
    meta_description TEXT,
    h1_tags JSONB DEFAULT '[]',
    keyword_density JSONB DEFAULT '{}',
    page_speed_score INTEGER DEFAULT 0,
    mobile_friendly BOOLEAN DEFAULT false,
    ssl_enabled BOOLEAN DEFAULT false,
    recommendations JSONB DEFAULT '[]',
    audit_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- API call logs and rate limiting
CREATE TABLE IF NOT EXISTS api_call_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES business_intelligence(id) ON DELETE CASCADE,
    api_service TEXT NOT NULL, -- google_places, search_console, analytics, etc.
    endpoint TEXT,
    request_data JSONB,
    response_status INTEGER,
    response_data JSONB,
    execution_time INTEGER, -- milliseconds
    rate_limit_remaining INTEGER,
    cost DECIMAL(8,4) DEFAULT 0, -- API call cost
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_intelligence_name ON business_intelligence(business_name);
CREATE INDEX IF NOT EXISTS idx_business_intelligence_domain ON business_intelligence(domain);
CREATE INDEX IF NOT EXISTS idx_search_console_business ON search_console_data(business_id);
CREATE INDEX IF NOT EXISTS idx_analytics_business ON analytics_data(business_id);
CREATE INDEX IF NOT EXISTS idx_google_ads_business ON google_ads_data(business_id);
CREATE INDEX IF NOT EXISTS idx_keyword_data_business ON keyword_data(business_id);
CREATE INDEX IF NOT EXISTS idx_keyword_data_keyword ON keyword_data(keyword);
CREATE INDEX IF NOT EXISTS idx_social_media_business ON social_media_data(business_id);
CREATE INDEX IF NOT EXISTS idx_social_media_platform ON social_media_data(platform);
CREATE INDEX IF NOT EXISTS idx_business_media_business ON business_media(business_id);
CREATE INDEX IF NOT EXISTS idx_business_media_type ON business_media(media_type);
CREATE INDEX IF NOT EXISTS idx_news_data_business ON news_data(business_id);
CREATE INDEX IF NOT EXISTS idx_competitor_data_business ON competitor_data(business_id);
CREATE INDEX IF NOT EXISTS idx_trend_data_business ON trend_data(business_id);
CREATE INDEX IF NOT EXISTS idx_seo_audit_business ON seo_audit_data(business_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_business ON api_call_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_service ON api_call_logs(api_service);

-- Create views for easy data retrieval
CREATE OR REPLACE VIEW business_intelligence_summary AS
SELECT 
    bi.id,
    bi.business_name,
    bi.domain,
    bi.industry,
    bi.location,
    bi.last_data_refresh,
    
    -- Search Console metrics
    sc.clicks as sc_clicks,
    sc.impressions as sc_impressions,
    sc.ctr as sc_ctr,
    sc.position as sc_position,
    
    -- Analytics metrics
    ga.sessions as ga_sessions,
    ga.users as ga_users,
    ga.pageviews as ga_pageviews,
    ga.bounce_rate as ga_bounce_rate,
    
    -- Ads metrics
    ads.total_cost as ads_total_cost,
    ads.total_clicks as ads_total_clicks,
    ads.conversions as ads_conversions,
    
    -- Social media summary
    (SELECT COUNT(*) FROM social_media_data WHERE business_id = bi.id) as social_platforms,
    (SELECT SUM(followers) FROM social_media_data WHERE business_id = bi.id) as total_followers,
    
    -- Media count
    (SELECT COUNT(*) FROM business_media WHERE business_id = bi.id) as media_count,
    
    -- Keyword count
    (SELECT COUNT(*) FROM keyword_data WHERE business_id = bi.id) as keyword_count
    
FROM business_intelligence bi
LEFT JOIN search_console_data sc ON bi.id = sc.business_id
LEFT JOIN analytics_data ga ON bi.id = ga.business_id
LEFT JOIN google_ads_data ads ON bi.id = ads.business_id;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update the updated_at column
CREATE TRIGGER update_business_intelligence_updated_at 
    BEFORE UPDATE ON business_intelligence 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE business_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_console_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_audit_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_call_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can access their own business intelligence data" ON business_intelligence
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access search console data" ON search_console_data
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access analytics data" ON analytics_data
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access google ads data" ON google_ads_data
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access keyword data" ON keyword_data
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access social media data" ON social_media_data
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access business media" ON business_media
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access news data" ON news_data
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access competitor data" ON competitor_data
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access trend data" ON trend_data
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access seo audit data" ON seo_audit_data
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access api call logs" ON api_call_logs
    FOR ALL USING (auth.uid() IS NOT NULL);
