import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, type = 'find' } = await req.json()
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Places API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let googleUrl: string
    
    if (type === 'find') {
      // Use Places API (New) - Text Search endpoint
      googleUrl = `https://places.googleapis.com/v1/places:searchText?key=${apiKey}`
    } else if (type === 'details') {
      // Place Details using new API
      googleUrl = `https://places.googleapis.com/v1/places/${encodeURIComponent(query)}?fields=id,displayName,formattedAddress,nationalPhoneNumber,websiteUri,businessStatus,rating,userRatingCount,types,regularOpeningHours,location&key=${apiKey}`
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid type. Use "find" or "details"' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`🔍 Making Google Places API call: ${type} for "${query}"`)
    
    let response: Response
    
    if (type === 'find') {
      // Use POST for text search with new API
      response = await fetch(googleUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.websiteUri,places.businessStatus,places.rating,places.userRatingCount,places.types,places.regularOpeningHours,places.photos,places.reviews'
        },
        body: JSON.stringify({
          textQuery: query,
          maxResultCount: 5
        })
      })
    } else {
      // Use GET for place details
      response = await fetch(googleUrl)
    }
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ Google Places API error:', data)
      return new Response(
        JSON.stringify({ error: 'Google Places API request failed', details: data }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`✅ Google Places API success`)
    
    // Convert new API format to legacy format for compatibility
    if (type === 'find' && data.places) {
      const convertedData = {
        candidates: data.places.map((place: any) => ({
          place_id: place.id,
          name: place.displayName?.text || place.name,
          formatted_address: place.formattedAddress,
          geometry: {
            location: {
              lat: place.location?.latitude || 0,
              lng: place.location?.longitude || 0
            }
          },
          formatted_phone_number: place.nationalPhoneNumber,
          website: place.websiteUri,
          business_status: place.businessStatus === 'OPERATIONAL' ? 'OPERATIONAL' : 'CLOSED',
          rating: place.rating,
          user_ratings_total: place.userRatingCount,
          types: place.types || [],
          opening_hours: place.regularOpeningHours ? {
            weekday_text: place.regularOpeningHours.weekdayDescriptions || []
          } : undefined
        })),
        status: 'OK'
      }
      
      return new Response(
        JSON.stringify(convertedData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
