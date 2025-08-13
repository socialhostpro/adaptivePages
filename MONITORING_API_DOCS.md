# Business Monitoring & Alerting API Documentation

## Overview

The Business Monitoring & Alerting system provides real-time monitoring for:
- **News mentions** - Track when your business appears in news articles
- **Customer reviews** - Monitor new reviews across Google, Yelp, Facebook, etc.
- **Search trends** - Watch for changes in search volume for your keywords
- **Social media mentions** - Track mentions across social platforms
- **Reputation scoring** - Calculate overall reputation based on sentiment analysis

## Required APIs and Setup

### 1. Google APIs
```bash
# Required Google APIs to enable in Google Cloud Console:
- Google Places API (for reviews)
- Google News API (for news monitoring)
- Google Trends API (unofficial - use SerpApi or TrendScope)
```

### 2. News APIs
```bash
# News monitoring services:
- NewsAPI.org (newsapi.org) - Primary news source
- Bing News API - Alternative news source
- Alternative: SerpApi for Google News
```

### 3. Social Media APIs
```bash
# Social media monitoring:
- Twitter API v2 (for tweets and mentions)
- Facebook Graph API (for page mentions)
- Instagram Graph API (for post mentions)
- LinkedIn API (for professional mentions)
```

### 4. Environment Variables
```bash
# Add these to your Supabase Edge Functions environment:
NEWS_API_KEY=your_newsapi_key
GOOGLE_PLACES_API_KEY=your_google_places_key
GOOGLE_TRENDS_API_KEY=your_trends_key
TWITTER_BEARER_TOKEN=your_twitter_token
FACEBOOK_ACCESS_TOKEN=your_facebook_token
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Edge Functions API Reference

### 1. News Monitoring

**Endpoint:** `POST /functions/v1/news-monitoring`

**Request Body:**
```json
{
  "businessName": "Your Business Name",
  "keywords": ["keyword1", "keyword2"],
  "language": "en",
  "country": "us",
  "timeRange": "7d"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "title": "News article title",
      "description": "Article description",
      "url": "https://example.com/article",
      "publishedAt": "2024-01-15T10:30:00Z",
      "source": "News Source",
      "sentiment": "positive",
      "sentimentScore": 0.7,
      "keywords": ["business", "keyword"]
    }
  ],
  "alertsCreated": 3,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Review Monitoring

**Endpoint:** `POST /functions/v1/review-monitoring`

**Request Body:**
```json
{
  "businessName": "Your Business Name",
  "placeId": "ChIJ...", // Google Place ID (optional)
  "platform": "google"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "platform": "google",
      "placeId": "ChIJ...",
      "reviewerName": "John Doe",
      "rating": 5,
      "reviewText": "Great service!",
      "reviewUrl": "https://...",
      "publishedAt": "2024-01-15T10:30:00Z",
      "sentiment": "positive",
      "sentimentScore": 0.8
    }
  ],
  "alertsCreated": 2,
  "totalReviews": 5,
  "averageRating": 4.2
}
```

### 3. Trends Monitoring

**Endpoint:** `POST /functions/v1/trends-monitoring`

**Request Body:**
```json
{
  "businessName": "Your Business Name",
  "keywords": ["keyword1", "keyword2"],
  "geo": "US",
  "timeRange": "7d"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "keyword": "your business",
      "trendType": "rising",
      "searchVolume": 1500,
      "previousVolume": 1000,
      "percentageChange": 50.0,
      "relatedQueries": ["related query 1", "related query 2"],
      "geoData": [
        {"location": "California", "value": 85},
        {"location": "New York", "value": 72}
      ],
      "timeRange": "7d"
    }
  ],
  "alertsCreated": 1,
  "significantChanges": 1
}
```

## Database Schema

### Main Tables

1. **alert_settings** - User preferences for monitoring
2. **news_alerts** - News mentions and articles
3. **review_alerts** - Customer reviews from all platforms
4. **trend_alerts** - Search trend changes
5. **social_mention_alerts** - Social media mentions
6. **competitor_alerts** - Competitor activity
7. **reputation_history** - Daily reputation scores
8. **monitoring_jobs** - Background job status

### Key Relationships

```sql
-- Get all alerts for a business
SELECT * FROM (
  SELECT 'news' as type, created_at, severity, is_read FROM news_alerts WHERE business_name = ?
  UNION ALL
  SELECT 'review' as type, created_at, severity, is_read FROM review_alerts WHERE business_name = ?
  UNION ALL
  SELECT 'trend' as type, created_at, severity, is_read FROM trend_alerts WHERE business_name = ?
  UNION ALL
  SELECT 'social' as type, created_at, severity, is_read FROM social_mention_alerts WHERE business_name = ?
) alerts ORDER BY created_at DESC;
```

## Frontend Integration

### 1. React Components

```jsx
import { MonitoringDashboard } from './components/MonitoringDashboard';
import { businessMonitoringService } from './services/businessMonitoringService';

// In your component
const [showMonitoring, setShowMonitoring] = useState(false);

// Display monitoring dashboard
{showMonitoring && (
  <MonitoringDashboard
    businessName="Your Business"
    onClose={() => setShowMonitoring(false)}
  />
)}
```

### 2. Service Usage

```javascript
// Start monitoring
await businessMonitoringService.startMonitoring('Business Name', {
  enableNewsAlerts: true,
  enableReviewAlerts: true,
  enableTrendAlerts: true,
  minReviewRating: 3,
  notificationFrequency: 'immediate'
});

// Get alerts
const newsAlerts = await businessMonitoringService.getNewsAlerts('Business Name');
const reviewAlerts = await businessMonitoringService.getReviewAlerts('Business Name');

// Get monitoring dashboard
const dashboard = await businessMonitoringService.getMonitoringDashboard('Business Name');
```

## Automation & Scheduling

### 1. Set up monitoring jobs

```sql
-- Create monitoring job for hourly news checks
INSERT INTO monitoring_jobs (business_name, job_type, run_frequency, config)
VALUES ('Your Business', 'news', 'hourly', '{"keywords": ["business", "industry"]}');
```

### 2. Cron Job Integration

```bash
# Set up cron job to trigger monitoring
# Add to crontab (run every hour):
0 * * * * curl -X POST https://your-project.supabase.co/functions/v1/news-monitoring \
  -H "Content-Type: application/json" \
  -d '{"businessName": "Your Business"}'
```

## Alert Severity Levels

- **Critical**: Negative sentiment < -0.5, Reviews ≤ 2 stars
- **High**: Negative sentiment < -0.3, Reviews ≤ 3 stars  
- **Medium**: Neutral sentiment or moderate changes
- **Low**: Positive sentiment > 0.5, Reviews ≥ 5 stars

## Sentiment Analysis

### Scoring System
- **Range**: -1.0 to +1.0
- **Positive**: > 0.3
- **Neutral**: -0.3 to 0.3
- **Negative**: < -0.3

### Keywords Used
```javascript
// Positive indicators
['excellent', 'outstanding', 'great', 'amazing', 'wonderful', 'fantastic', 'professional', 'recommend']

// Negative indicators  
['terrible', 'awful', 'poor', 'bad', 'disappointed', 'worst', 'hate', 'horrible', 'unprofessional']
```

## Deployment Commands

```bash
# Deploy all monitoring functions
./deploy-monitoring.sh

# Or individually:
supabase functions deploy news-monitoring
supabase functions deploy review-monitoring
supabase functions deploy trends-monitoring

# Set environment variables
supabase secrets set NEWS_API_KEY=your_key
supabase secrets set GOOGLE_PLACES_API_KEY=your_key
```

## Testing

### 1. Test News Monitoring
```bash
curl -X POST https://your-project.supabase.co/functions/v1/news-monitoring \
  -H "Content-Type: application/json" \
  -d '{"businessName": "Test Business", "keywords": ["test"]}'
```

### 2. Test Review Monitoring
```bash
curl -X POST https://your-project.supabase.co/functions/v1/review-monitoring \
  -H "Content-Type: application/json" \
  -d '{"businessName": "Test Business", "platform": "google"}'
```

## Troubleshooting

### Common Issues

1. **API Rate Limits**
   - Implement exponential backoff
   - Cache results to reduce API calls
   - Use multiple API keys if needed

2. **Database Connection Errors**
   - Check Supabase service role key
   - Verify Row Level Security policies
   - Ensure proper user authentication

3. **Missing Alerts**
   - Check monitoring job status
   - Verify alert severity thresholds
   - Review keyword matching logic

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('monitoring-debug', 'true');

// Check monitoring job status
const jobs = await supabase
  .from('monitoring_jobs')
  .select('*')
  .eq('business_name', 'Your Business');
```

## Performance Optimization

### 1. Caching Strategy
- Cache API responses for 15 minutes
- Store processed alerts in database
- Use incremental updates for trends

### 2. Background Processing
- Process sentiment analysis asynchronously
- Batch database operations
- Use Supabase Realtime for live updates

### 3. Monitoring Metrics
- Track API response times
- Monitor database query performance
- Set up alerts for system failures

## Security Considerations

1. **API Key Management**
   - Store in Supabase secrets
   - Rotate keys regularly
   - Monitor usage quotas

2. **Data Privacy**
   - Anonymize personal data in logs
   - Comply with GDPR/CCPA requirements
   - Implement data retention policies

3. **Access Control**
   - Use Row Level Security
   - Limit function permissions
   - Audit access logs

## Scaling Considerations

- **High Volume**: Use message queues for processing
- **Multi-tenant**: Partition data by user/business
- **Global**: Use edge functions for regional processing
- **Real-time**: Implement WebSocket connections for live updates
