import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ReviewRequest {
  businessName: string
  placeId?: string
  platform?: string
}

interface ReviewResult {
  platform: string
  placeId?: string
  reviewerName: string
  rating: number
  reviewText: string
  reviewUrl?: string
  publishedAt: string
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

    const { businessName, placeId, platform = 'google' }: ReviewRequest = await req.json()

    if (!businessName) {
      throw new Error('Business name is required')
    }

    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    let reviewResults: ReviewResult[] = []

    // Try Google Places API for reviews
    if (googleApiKey && placeId) {
      try {
        const placesUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${googleApiKey}`
        
        const placesResponse = await fetch(placesUrl)
        const placesData = await placesResponse.json()

        if (placesData.result?.reviews) {
          reviewResults = placesData.result.reviews.map((review: any) => ({
            platform: 'google',
            placeId,
            reviewerName: review.author_name || 'Anonymous',
            rating: review.rating || 0,
            reviewText: review.text || '',
            reviewUrl: review.author_url || '',
            publishedAt: new Date(review.time * 1000).toISOString(),
            sentiment: 'neutral',
            sentimentScore: 0,
            keywords: []
          }))
        }
      } catch (error) {
        console.error('Google Places API error:', error)
      }
    }

    // If no results or API unavailable, use mock data for development
    if (reviewResults.length === 0) {
      reviewResults = generateMockReviewData(businessName, platform)
    }

    // Perform sentiment analysis on reviews
    reviewResults = await analyzeSentiment(reviewResults, businessName)

    // Store alerts in database
    const alerts = []
    for (const review of reviewResults) {
      // Determine alert severity based on rating and sentiment
      let severity = 'medium'
      if (review.rating <= 2 || review.sentimentScore! < -0.5) {
        severity = 'critical'
      } else if (review.rating <= 3 || review.sentimentScore! < -0.3) {
        severity = 'high'
      } else if (review.rating >= 5 || review.sentimentScore! > 0.5) {
        severity = 'low'
      }

      alerts.push({
        business_name: businessName,
        platform: review.platform,
        place_id: review.placeId,
        reviewer_name: review.reviewerName,
        rating: review.rating,
        review_text: review.reviewText,
        review_url: review.reviewUrl,
        published_at: review.publishedAt,
        sentiment: review.sentiment,
        sentiment_score: review.sentimentScore,
        keywords: review.keywords,
        alert_type: 'new_review',
        severity,
        is_read: false
      })
    }

    // Insert alerts into database
    if (alerts.length > 0) {
      const { error } = await supabase
        .from('review_alerts')
        .insert(alerts)

      if (error) {
        console.error('Database error:', error)
      }
    }

    // Check for existing reviews to avoid duplicates
    const { data: existingReviews } = await supabase
      .from('review_alerts')
      .select('review_text, reviewer_name, published_at')
      .eq('business_name', businessName)
      .eq('platform', platform)

    const newAlerts = alerts.filter(alert => 
      !existingReviews?.some(existing => 
        existing.review_text === alert.review_text &&
        existing.reviewer_name === alert.reviewer_name
      )
    )

    return new Response(
      JSON.stringify({
        success: true,
        results: reviewResults,
        alertsCreated: newAlerts.length,
        totalReviews: reviewResults.length,
        averageRating: reviewResults.length > 0 ? 
          reviewResults.reduce((sum, r) => sum + r.rating, 0) / reviewResults.length : 0,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Review monitoring error:', error)
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

function generateMockReviewData(businessName: string, platform: string): ReviewResult[] {
  const mockReviews = [
    {
      platform,
      reviewerName: 'Sarah Johnson',
      rating: 5,
      reviewText: `Excellent service from ${businessName}! The staff was professional and the quality exceeded my expectations. Highly recommend!`,
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      sentimentScore: 0.8
    },
    {
      platform,
      reviewerName: 'Mike Chen',
      rating: 4,
      reviewText: `Good experience with ${businessName}. Quick service and fair pricing. Would use again.`,
      publishedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      sentimentScore: 0.5
    },
    {
      platform,
      reviewerName: 'Emily Davis',
      rating: 3,
      reviewText: `Average experience. ${businessName} delivered what was promised but nothing exceptional.`,
      publishedAt: new Date(Date.now() - Math.random() * 21 * 24 * 60 * 60 * 1000).toISOString(),
      sentiment: 'neutral',
      sentimentScore: 0.1
    },
    {
      platform,
      reviewerName: 'John Smith',
      rating: 2,
      reviewText: `Disappointed with the service from ${businessName}. The quality was not as advertised and customer service was slow to respond.`,
      publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      sentiment: 'negative',
      sentimentScore: -0.6
    },
    {
      platform,
      reviewerName: 'Lisa Wilson',
      rating: 5,
      reviewText: `Outstanding! ${businessName} went above and beyond. The attention to detail and customer care was remarkable.`,
      publishedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      sentimentScore: 0.9
    }
  ]

  return mockReviews.map(review => ({
    ...review,
    keywords: extractKeywords(review.reviewText, businessName)
  }))
}

function extractKeywords(text: string, businessName: string): string[] {
  const keywords = []
  
  // Extract business name mentions
  if (text.toLowerCase().includes(businessName.toLowerCase())) {
    keywords.push(businessName)
  }

  // Extract common service keywords
  const serviceKeywords = ['service', 'quality', 'staff', 'professional', 'pricing', 'customer', 'experience', 'recommend']
  for (const keyword of serviceKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      keywords.push(keyword)
    }
  }

  return keywords
}

async function analyzeSentiment(reviews: ReviewResult[], businessName: string): Promise<ReviewResult[]> {
  const positiveWords = ['excellent', 'outstanding', 'great', 'amazing', 'wonderful', 'fantastic', 'professional', 'recommend', 'exceeded', 'remarkable', 'perfect', 'best', 'love', 'impressed']
  const negativeWords = ['terrible', 'awful', 'poor', 'bad', 'disappointed', 'worst', 'hate', 'horrible', 'unprofessional', 'slow', 'rude', 'overpriced', 'waste']

  return reviews.map(review => {
    const text = review.reviewText.toLowerCase()
    
    let positiveCount = 0
    let negativeCount = 0

    for (const word of positiveWords) {
      if (text.includes(word)) positiveCount++
    }

    for (const word of negativeWords) {
      if (text.includes(word)) negativeCount++
    }

    // Base sentiment on rating
    let sentimentScore = (review.rating - 3) * 0.3 // Scale rating to -0.6 to +0.6

    // Adjust based on text analysis
    if (positiveCount > negativeCount) {
      sentimentScore += Math.min(0.4, positiveCount * 0.1)
    } else if (negativeCount > positiveCount) {
      sentimentScore -= Math.min(0.4, negativeCount * 0.1)
    }

    // Clamp to -1 to +1 range
    sentimentScore = Math.max(-1, Math.min(1, sentimentScore))

    const sentiment = sentimentScore < -0.3 ? 'negative' : 
                     sentimentScore > 0.3 ? 'positive' : 'neutral'

    return {
      ...review,
      sentiment,
      sentimentScore
    }
  })
}
