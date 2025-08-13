/**
 * Business Monitoring & Alert System
 * Real-time monitoring for news mentions, reviews, trends, and reputation management
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface NewsAlert {
  id: string;
  businessName: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number; // -1 to 1
  keywords: string[];
  alertType: 'news_mention' | 'trending_topic' | 'competitor_mention';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
}

export interface ReviewAlert {
  id: string;
  businessName: string;
  platform: 'google' | 'yelp' | 'facebook' | 'tripadvisor' | 'trustpilot';
  reviewerName: string;
  rating: number; // 1-5 stars
  reviewText: string;
  reviewUrl: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  keywords: string[];
  isResponse: boolean; // true if business responded
  responseText?: string;
  alertType: 'new_review' | 'negative_review' | 'positive_review';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
}

export interface TrendAlert {
  id: string;
  businessName: string;
  keyword: string;
  trendType: 'rising' | 'falling' | 'breakout' | 'spike';
  searchVolume: number;
  previousVolume: number;
  percentageChange: number;
  relatedQueries: string[];
  geoData: Array<{
    country: string;
    region: string;
    interest: number;
  }>;
  timeRange: string;
  alertType: 'trend_spike' | 'brand_trending' | 'competitor_trending';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
}

export interface SocialMentionAlert {
  id: string;
  businessName: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'reddit' | 'tiktok';
  mentionText: string;
  authorUsername: string;
  authorFollowers: number;
  postUrl: string;
  publishedAt: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views?: number;
  };
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  influence: 'low' | 'medium' | 'high'; // based on follower count
  alertType: 'social_mention' | 'viral_post' | 'influencer_mention';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
}

export interface CompetitorAlert {
  id: string;
  businessName: string;
  competitorName: string;
  alertContent: string;
  alertType: 'competitor_news' | 'competitor_review' | 'competitor_social' | 'market_change';
  source: string;
  sourceUrl: string;
  impact: 'positive' | 'negative' | 'neutral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  recommendations: string[];
  isRead: boolean;
  createdAt: string;
}

export interface AlertSettings {
  businessName: string;
  enableNewsAlerts: boolean;
  enableReviewAlerts: boolean;
  enableTrendAlerts: boolean;
  enableSocialAlerts: boolean;
  enableCompetitorAlerts: boolean;
  
  // Severity thresholds
  minReviewRating: number; // Alert for reviews below this rating
  minSentimentScore: number; // Alert for sentiment below this score
  minTrendChange: number; // Alert for trend changes above this percentage
  minInfluenceLevel: 'low' | 'medium' | 'high'; // Minimum influencer level to track
  
  // Notification preferences
  emailNotifications: boolean;
  smsNotifications: boolean;
  webhookUrl?: string;
  notificationFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  
  // Keywords to monitor
  brandKeywords: string[];
  competitorKeywords: string[];
  industryKeywords: string[];
  excludeKeywords: string[]; // Keywords to ignore
}

export interface MonitoringDashboard {
  businessName: string;
  totalAlerts: number;
  unreadAlerts: number;
  criticalAlerts: number;
  alerts: {
    news: NewsAlert[];
    reviews: ReviewAlert[];
    trends: TrendAlert[];
    social: SocialMentionAlert[];
    competitors: CompetitorAlert[];
  };
  reputationScore: number; // 0-100 overall reputation score
  trendingKeywords: Array<{
    keyword: string;
    volume: number;
    change: number;
  }>;
  sentimentAnalysis: {
    overall: number;
    news: number;
    reviews: number;
    social: number;
    timeframe: string;
  };
  responseMetrics: {
    averageResponseTime: number; // hours
    responseRate: number; // percentage
    totalResponses: number;
  };
}

/**
 * Business Monitoring Service
 * Handles real-time monitoring and alerting for business reputation
 */
export class BusinessMonitoringService {
  private supabaseUrl: string;
  private supabaseKey: string;
  private supabase: SupabaseClient;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  /**
   * Start monitoring for a business
   */
  async startMonitoring(businessName: string, settings: AlertSettings): Promise<void> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/start-business-monitoring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ businessName, settings })
      });

      if (!response.ok) {
        throw new Error(`Failed to start monitoring: ${response.status}`);
      }

      console.log(`✅ Started monitoring for ${businessName}`);
    } catch (error) {
      console.error('Error starting monitoring:', error);
      throw error;
    }
  }

  /**
   * Get monitoring dashboard data
   */
  async getMonitoringDashboard(businessName: string): Promise<MonitoringDashboard> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/get-monitoring-dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ businessName })
      });

      if (!response.ok) {
        throw new Error(`Failed to get dashboard: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching monitoring dashboard:', error);
      throw error;
    }
  }

  /**
   * Get all Google Reviews for a business
   */
  async getAllReviews(businessName: string, placeId?: string): Promise<ReviewAlert[]> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/get-all-reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ businessName, placeId })
      });

      if (!response.ok) {
        throw new Error(`Failed to get reviews: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  /**
   * Get Google Trends data for business keywords
   */
  async getTrendsData(keywords: string[], timeRange: string = '7d'): Promise<TrendAlert[]> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/get-trends-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ keywords, timeRange })
      });

      if (!response.ok) {
        throw new Error(`Failed to get trends: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching trends:', error);
      throw error;
    }
  }

  /**
   * Monitor news mentions
   */
  async getNewsAlerts(businessName: string, since?: string): Promise<NewsAlert[]> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/get-news-alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ businessName, since })
      });

      if (!response.ok) {
        throw new Error(`Failed to get news alerts: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching news alerts:', error);
      throw error;
    }
  }

  /**
   * Get social media mentions
   */
  async getSocialMentions(businessName: string, platforms: string[] = []): Promise<SocialMentionAlert[]> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/get-social-mentions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ businessName, platforms })
      });

      if (!response.ok) {
        throw new Error(`Failed to get social mentions: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching social mentions:', error);
      throw error;
    }
  }

  /**
   * Mark alerts as read
   */
  async markAlertsAsRead(alertIds: string[]): Promise<void> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/mark-alerts-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ alertIds })
      });

      if (!response.ok) {
        throw new Error(`Failed to mark alerts as read: ${response.status}`);
      }
    } catch (error) {
      console.error('Error marking alerts as read:', error);
      throw error;
    }
  }

  /**
   * Get alert settings for a business
   */
  async getAlertSettings(businessName: string): Promise<AlertSettings> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/get-alert-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ businessName })
      });

      if (!response.ok) {
        throw new Error(`Failed to get alert settings: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching alert settings:', error);
      throw error;
    }
  }

  /**
   * Update alert settings
   */
  async updateAlertSettings(businessName: string, settings: Partial<AlertSettings>): Promise<void> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/update-alert-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ businessName, settings })
      });

      if (!response.ok) {
        throw new Error(`Failed to update alert settings: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating alert settings:', error);
      throw error;
    }
  }

  /**
   * Perform sentiment analysis on text
   */
  async analyzeSentiment(text: string): Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; score: number }> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/analyze-sentiment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze sentiment: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw error;
    }
  }

  // Get review alerts from database
  async getReviewAlerts(businessName: string): Promise<ReviewAlert[]> {
    try {
      const { data, error } = await this.supabase
        .from('review_alerts')
        .select('*')
        .eq('business_name', businessName)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching review alerts:', error)
      return []
    }
  }

  // Get trend alerts from database
  async getTrendAlerts(businessName: string): Promise<TrendAlert[]> {
    try {
      const { data, error } = await this.supabase
        .from('trend_alerts')
        .select('*')
        .eq('business_name', businessName)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching trend alerts:', error)
      return []
    }
  }

  // Get social mention alerts from database
  async getSocialMentionAlerts(businessName: string): Promise<SocialMentionAlert[]> {
    try {
      const { data, error } = await this.supabase
        .from('social_mention_alerts')
        .select('*')
        .eq('business_name', businessName)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching social mention alerts:', error)
      return []
    }
  }

  // Get reputation history
  async getReputationHistory(businessName: string, days: number = 30): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('reputation_history')
        .select('*')
        .eq('business_name', businessName)
        .gte('date_recorded', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date_recorded', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching reputation history:', error)
      return []
    }
  }

  // Mark alert as read
  async markAlertAsRead(alertType: string, alertId: string): Promise<void> {
    try {
      const tableName = `${alertType}_alerts`
      const { error } = await this.supabase
        .from(tableName)
        .update({ is_read: true })
        .eq('id', alertId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking alert as read:', error)
      throw error
    }
  }
}

// Export singleton instance
export const businessMonitoringService = new BusinessMonitoringService();
