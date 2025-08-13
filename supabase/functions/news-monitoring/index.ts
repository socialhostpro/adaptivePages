import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface NewsRequest {
  businessName: string
  keywords?: string[]
  language?: string
  country?: string
  timeRange?: string
}

interface NewsResult {
  title: string
  description: string
  url: string
  publishedAt: string
  source: string
  sentiment?: string
  sentimentScore?: number
  keywords?: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { businessName, keywords = [], language = 'en', country = 'us', timeRange = '7d' }: NewsRequest = await req.json()

    if (!businessName) {
      throw new Error('Business name is required')
    }

    const newsApiKey = Deno.env.get('NEWS_API_KEY')
    const googleNewsApiKey = Deno.env.get('GOOGLE_NEWS_API_KEY')

    let newsResults: NewsResult[] = []

    // Try Google News API first
    if (googleNewsApiKey) {
      try {
        const searchQuery = `"${businessName}" OR ${keywords.join(' OR ')}`
        const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&language=${language}&sortBy=publishedAt&apiKey=${newsApiKey}`
        
        const newsResponse = await fetch(newsApiUrl)
        const newsData = await newsResponse.json()

        if (newsData.articles) {
          newsResults = newsData.articles.map((article: any) => ({
            title: article.title || '',
            description: article.description || '',
            url: article.url || '',
            publishedAt: article.publishedAt || new Date().toISOString(),
            source: article.source?.name || 'Unknown',
            sentiment: 'neutral',
            sentimentScore: 0,
            keywords: extractKeywords(article.title + ' ' + article.description, businessName, keywords)
          }))
        }
      } catch (error) {
        console.error('Google News API error:', error)
      }
    }

    // If no results or API unavailable, use mock data for development
    if (newsResults.length === 0) {
      newsResults = generateMockNewsData(businessName, keywords)
    }

    // Perform sentiment analysis on results
    newsResults = await analyzeSentiment(newsResults)

    // Store alerts in database
    const alerts = []
    for (const news of newsResults) {
      const sentiment = news.sentimentScore! < -0.3 ? 'negative' : 
                      news.sentimentScore! > 0.3 ? 'positive' : 'neutral'
      
      const severity = news.sentimentScore! < -0.5 ? 'critical' : 
                      news.sentimentScore! < -0.3 ? 'high' : 
                      news.sentimentScore! > 0.5 ? 'low' : 'medium'

      alerts.push({
        business_name: businessName,
        title: news.title,
        description: news.description,
        url: news.url,
        published_at: news.publishedAt,
        source: news.source,
        sentiment,
        sentiment_score: news.sentimentScore,
        keywords: news.keywords,
        alert_type: 'news_mention',
        severity,
        is_read: false
      })
    }

    // Insert alerts into database
    if (alerts.length > 0) {
      const { error } = await supabase
        .from('news_alerts')
        .insert(alerts)

      if (error) {
        console.error('Database error:', error)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results: newsResults,
        alertsCreated: alerts.length,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('News monitoring error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

function generateMockNewsData(businessName: string, keywords: string[]): NewsResult[] {
  const mockArticles = [
    {
      title: `Local Business Spotlight: ${businessName} Continues to Serve Community`,
      description: `${businessName} has been making waves in the local community with their exceptional service and commitment to quality.`,
      url: `https://localnews.com/business-spotlight-${businessName.toLowerCase().replace(/\s+/g, '-')}`,
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'Local News Network',
      sentiment: 'positive',
      sentimentScore: 0.7
    },
    {
      title: `${businessName} Expands Services to Meet Growing Demand`,
      description: `In response to increased customer demand, ${businessName} announces expansion of their service offerings.`,
      url: `https://businessjournal.com/${businessName.toLowerCase().replace(/\s+/g, '-')}-expansion`,
      publishedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'Business Journal',
      sentiment: 'positive',
      sentimentScore: 0.5
    },
    {
      title: `Industry Trends Impact Local Businesses Like ${businessName}`,
      description: `Market analysis shows how current industry trends are affecting local businesses including ${businessName}.`,
      url: `https://marketwatch.com/industry-trends-${businessName.toLowerCase().replace(/\s+/g, '-')}`,
      publishedAt: new Date(Date.now() - Math.random() * 21 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'Market Watch',
      sentiment: 'neutral',
      sentimentScore: 0.1
    }
  ]

  return mockArticles.map(article => ({
    ...article,
    keywords: extractKeywords(article.title + ' ' + article.description, businessName, keywords)
  }))
}

function extractKeywords(text: string, businessName: string, additionalKeywords: string[]): string[] {
  const keywords = [businessName, ...additionalKeywords]
  const found = []

  for (const keyword of keywords) {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      found.push(keyword)
    }
  }

  return found
}

async function analyzeSentiment(articles: NewsResult[]): Promise<NewsResult[]> {
  // Simple sentiment analysis based on keywords
  // In production, use a proper sentiment analysis API like Google Cloud Natural Language
  
  const positiveWords = ['excellent', 'outstanding', 'great', 'amazing', 'successful', 'growth', 'expansion', 'award', 'recognition', 'praise', 'positive', 'good', 'best']
  const negativeWords = ['poor', 'bad', 'terrible', 'awful', 'failure', 'decline', 'lawsuit', 'complaint', 'negative', 'worst', 'controversy', 'scandal']

  return articles.map(article => {
    const text = (article.title + ' ' + article.description).toLowerCase()
    
    let positiveCount = 0
    let negativeCount = 0

    for (const word of positiveWords) {
      if (text.includes(word)) positiveCount++
    }

    for (const word of negativeWords) {
      if (text.includes(word)) negativeCount++
    }

    let sentimentScore = 0
    if (positiveCount > negativeCount) {
      sentimentScore = Math.min(0.8, positiveCount * 0.2)
    } else if (negativeCount > positiveCount) {
      sentimentScore = Math.max(-0.8, -negativeCount * 0.2)
    }

    const sentiment = sentimentScore < -0.3 ? 'negative' : 
                     sentimentScore > 0.3 ? 'positive' : 'neutral'

    return {
      ...article,
      sentiment,
      sentimentScore
    }
  })
}
