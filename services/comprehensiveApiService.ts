/**
 * Comprehensive Google & Social Media API Integration Service
 * Fetches data from multiple sources for complete business intelligence
 */

// Google Services Interfaces
export interface GoogleSearchConsoleData {
  property: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  topPages: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  devicePerformance: {
    mobile: { clicks: number; impressions: number; ctr: number };
    desktop: { clicks: number; impressions: number; ctr: number };
    tablet: { clicks: number; impressions: number; ctr: number };
  };
}

export interface GoogleAnalyticsData {
  property: string;
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{
    page: string;
    pageviews: number;
    uniquePageviews: number;
    avgTimeOnPage: number;
    bounceRate: number;
  }>;
  trafficSources: Array<{
    source: string;
    medium: string;
    sessions: number;
    users: number;
    conversionRate: number;
  }>;
  demographics: {
    age: Array<{ range: string; percentage: number }>;
    gender: Array<{ gender: string; percentage: number }>;
    interests: Array<{ category: string; percentage: number }>;
  };
  geo: Array<{
    country: string;
    sessions: number;
    users: number;
  }>;
}

export interface GoogleAdsData {
  account: string;
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    budget: number;
    clicks: number;
    impressions: number;
    cost: number;
    ctr: number;
    avgCpc: number;
    conversions: number;
    conversionRate: number;
  }>;
  keywords: Array<{
    keyword: string;
    matchType: string;
    clicks: number;
    impressions: number;
    cost: number;
    ctr: number;
    avgCpc: number;
    qualityScore: number;
    searchVolume: number;
    competition: string;
  }>;
  adGroups: Array<{
    id: string;
    name: string;
    campaignId: string;
    clicks: number;
    impressions: number;
    cost: number;
    ctr: number;
  }>;
}

export interface GoogleNewsData {
  articles: Array<{
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    source: {
      id: string;
      name: string;
    };
    relevanceScore: number;
  }>;
  trends: Array<{
    keyword: string;
    volume: number;
    growth: number;
    relatedQueries: string[];
  }>;
}

export interface KeywordPlannerData {
  keywords: Array<{
    keyword: string;
    avgMonthlySearches: number;
    competition: 'LOW' | 'MEDIUM' | 'HIGH';
    competitionIndex: number;
    lowTopOfPageBid: number;
    highTopOfPageBid: number;
    relatedKeywords: string[];
    seasonality: Array<{
      month: string;
      relativeVolume: number;
    }>;
  }>;
  keywordIdeas: Array<{
    keyword: string;
    searchVolume: number;
    competition: string;
    suggestedBid: number;
  }>;
}

// Social Media Interfaces
export interface SocialMediaData {
  facebook?: {
    pageId: string;
    name: string;
    followers: number;
    likes: number;
    engagement: number;
    posts: Array<{
      id: string;
      message: string;
      createdTime: string;
      likes: number;
      comments: number;
      shares: number;
      reach: number;
      engagement: number;
    }>;
    insights: {
      pageViews: number;
      pageEngagement: number;
      postEngagement: number;
      videoViews: number;
    };
  };
  instagram?: {
    userId: string;
    username: string;
    followers: number;
    following: number;
    posts: Array<{
      id: string;
      caption: string;
      mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
      mediaUrl: string;
      timestamp: string;
      likesCount: number;
      commentsCount: number;
    }>;
    insights: {
      reach: number;
      impressions: number;
      engagement: number;
    };
  };
  twitter?: {
    userId: string;
    username: string;
    followers: number;
    following: number;
    tweets: Array<{
      id: string;
      text: string;
      createdAt: string;
      retweetCount: number;
      likeCount: number;
      replyCount: number;
      quoteCount: number;
    }>;
    metrics: {
      impressions: number;
      engagement: number;
      profileVisits: number;
    };
  };
  linkedin?: {
    companyId: string;
    name: string;
    followers: number;
    posts: Array<{
      id: string;
      text: string;
      createdAt: string;
      likes: number;
      comments: number;
      shares: number;
      views: number;
    }>;
    insights: {
      pageViews: number;
      uniqueVisitors: number;
      engagement: number;
    };
  };
}

export interface BusinessMediaData {
  photos: Array<{
    id: string;
    url: string;
    thumbnail: string;
    width: number;
    height: number;
    caption?: string;
    tags: string[];
    source: 'google_places' | 'social_media' | 'website';
    uploadedAt: string;
  }>;
  videos: Array<{
    id: string;
    url: string;
    thumbnail: string;
    duration: number;
    title?: string;
    description?: string;
    source: 'youtube' | 'social_media' | 'website';
    uploadedAt: string;
  }>;
  logos: Array<{
    url: string;
    format: 'png' | 'svg' | 'jpg';
    size: 'small' | 'medium' | 'large';
    source: string;
  }>;
}

export interface CompetitorAnalysisData {
  competitors: Array<{
    domain: string;
    name: string;
    estimatedTraffic: number;
    topKeywords: string[];
    backlinks: number;
    domainRating: number;
    socialMedia: {
      facebook?: { followers: number; engagement: number };
      instagram?: { followers: number; engagement: number };
      twitter?: { followers: number; engagement: number };
      linkedin?: { followers: number; engagement: number };
    };
  }>;
}

export interface ComprehensiveBusinessData {
  businessInfo: {
    name: string;
    domain: string;
    industry: string;
    location: string;
    lastUpdated: string;
  };
  googleSearchConsole?: GoogleSearchConsoleData;
  googleAnalytics?: GoogleAnalyticsData;
  googleAds?: GoogleAdsData;
  googleNews?: GoogleNewsData;
  keywordPlanner?: KeywordPlannerData;
  socialMedia?: SocialMediaData;
  media?: BusinessMediaData;
  competitors?: CompetitorAnalysisData;
}

/**
 * Main service class for fetching comprehensive business intelligence data
 */
export class ComprehensiveApiService {
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  }

  /**
   * Fetch comprehensive business data from all available sources
   */
  async fetchAllBusinessData(businessName: string, domain?: string): Promise<ComprehensiveBusinessData> {
    console.log('🚀 Starting comprehensive business data collection for:', businessName);

    const results: ComprehensiveBusinessData = {
      businessInfo: {
        name: businessName,
        domain: domain || '',
        industry: 'Unknown',
        location: 'Unknown',
        lastUpdated: new Date().toISOString()
      }
    };

    try {
      // Fetch data from all sources in parallel
      const [
        searchConsoleData,
        analyticsData,
        adsData,
        newsData,
        keywordData,
        socialData,
        mediaData,
        competitorData
      ] = await Promise.allSettled([
        this.fetchSearchConsoleData(domain),
        this.fetchAnalyticsData(domain),
        this.fetchGoogleAdsData(businessName),
        this.fetchGoogleNewsData(businessName),
        this.fetchKeywordPlannerData(businessName),
        this.fetchSocialMediaData(businessName),
        this.fetchBusinessMedia(businessName),
        this.fetchCompetitorAnalysis(businessName, domain)
      ]);

      // Process results
      if (searchConsoleData.status === 'fulfilled') {
        results.googleSearchConsole = searchConsoleData.value;
      }
      if (analyticsData.status === 'fulfilled') {
        results.googleAnalytics = analyticsData.value;
      }
      if (adsData.status === 'fulfilled') {
        results.googleAds = adsData.value;
      }
      if (newsData.status === 'fulfilled') {
        results.googleNews = newsData.value;
      }
      if (keywordData.status === 'fulfilled') {
        results.keywordPlanner = keywordData.value;
      }
      if (socialData.status === 'fulfilled') {
        results.socialMedia = socialData.value;
      }
      if (mediaData.status === 'fulfilled') {
        results.media = mediaData.value;
      }
      if (competitorData.status === 'fulfilled') {
        results.competitors = competitorData.value;
      }

      // Save to database
      await this.saveToDatabase(results);

      console.log('✅ Comprehensive business data collection completed');
      return results;

    } catch (error) {
      console.error('❌ Error fetching comprehensive business data:', error);
      throw error;
    }
  }

  /**
   * Fetch Google Search Console data
   */
  private async fetchSearchConsoleData(domain?: string): Promise<GoogleSearchConsoleData | null> {
    if (!domain) return null;

    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/google-search-console`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ domain })
      });

      if (!response.ok) {
        throw new Error(`Search Console API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Search Console fetch error:', error);
      return null;
    }
  }

  /**
   * Fetch Google Analytics data
   */
  private async fetchAnalyticsData(domain?: string): Promise<GoogleAnalyticsData | null> {
    if (!domain) return null;

    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/google-analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ domain })
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Analytics fetch error:', error);
      return null;
    }
  }

  /**
   * Fetch Google Ads data
   */
  private async fetchGoogleAdsData(businessName: string): Promise<GoogleAdsData | null> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/google-ads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ businessName })
      });

      if (!response.ok) {
        throw new Error(`Google Ads API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Google Ads fetch error:', error);
      return null;
    }
  }

  /**
   * Fetch Google News data
   */
  private async fetchGoogleNewsData(businessName: string): Promise<GoogleNewsData | null> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/google-news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ query: businessName })
      });

      if (!response.ok) {
        throw new Error(`Google News API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Google News fetch error:', error);
      return null;
    }
  }

  /**
   * Fetch Keyword Planner data
   */
  private async fetchKeywordPlannerData(businessName: string): Promise<KeywordPlannerData | null> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/keyword-planner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ keywords: [businessName] })
      });

      if (!response.ok) {
        throw new Error(`Keyword Planner API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Keyword Planner fetch error:', error);
      return null;
    }
  }

  /**
   * Fetch social media data
   */
  private async fetchSocialMediaData(businessName: string): Promise<SocialMediaData | null> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/social-media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ businessName })
      });

      if (!response.ok) {
        throw new Error(`Social Media API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Social Media fetch error:', error);
      return null;
    }
  }

  /**
   * Fetch business media (photos, videos, logos)
   */
  private async fetchBusinessMedia(businessName: string): Promise<BusinessMediaData | null> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/business-media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ businessName })
      });

      if (!response.ok) {
        throw new Error(`Business Media API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Business Media fetch error:', error);
      return null;
    }
  }

  /**
   * Fetch competitor analysis data
   */
  private async fetchCompetitorAnalysis(businessName: string, domain?: string): Promise<CompetitorAnalysisData | null> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/competitor-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ businessName, domain })
      });

      if (!response.ok) {
        throw new Error(`Competitor Analysis API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Competitor Analysis fetch error:', error);
      return null;
    }
  }

  /**
   * Save comprehensive data to Supabase database
   */
  private async saveToDatabase(data: ComprehensiveBusinessData): Promise<void> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/save-business-intelligence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Database save error: ${response.status}`);
      }

      console.log('✅ Business intelligence data saved to database');
    } catch (error) {
      console.error('❌ Error saving to database:', error);
      // Don't throw - allow the function to continue even if database save fails
    }
  }

  /**
   * Get cached data from database
   */
  async getCachedBusinessData(businessName: string): Promise<ComprehensiveBusinessData | null> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/get-business-intelligence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ businessName })
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cached data:', error);
      return null;
    }
  }
}

// Export singleton instance
export const comprehensiveApiService = new ComprehensiveApiService();
