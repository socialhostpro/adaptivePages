/**
 * REAL Google Places Business Lookup Service
 * This replaces the simulation with actual Google Places API calls
 */

interface GooglePlacesResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_phone_number?: string;
  website?: string;
  business_status: string;
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  opening_hours?: {
    weekday_text: string[];
  };
  photos?: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
    authorAttributions: Array<{
      displayName: string;
      uri?: string;
      photoUri?: string;
    }>;
  }>;
  reviews?: Array<{
    name: string;
    relativePublishTimeDescription: string;
    rating: number;
    text: {
      text: string;
      languageCode: string;
    };
    originalText: {
      text: string;
      languageCode: string;
    };
    authorAttribution: {
      displayName: string;
      uri?: string;
      photoUri?: string;
    };
    publishTime: string;
  }>;
}

interface GooglePlacesResponse {
  candidates: GooglePlacesResult[];
  status: string;
}

export interface RealBusinessSearchResult {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  businessType: string;
  rating?: number;
  reviewCount?: number;
  hours?: string[];
  verified: boolean;
  location: {
    lat: number;
    lng: number;
  };
  photos?: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
    authorAttributions: Array<{
      displayName: string;
      uri?: string;
      photoUri?: string;
    }>;
  }>;
  reviews?: Array<{
    name: string;
    relativePublishTimeDescription: string;
    rating: number;
    text: {
      text: string;
      languageCode: string;
    };
    originalText: {
      text: string;
      languageCode: string;
    };
    authorAttribution: {
      displayName: string;
      uri?: string;
      photoUri?: string;
    };
    publishTime: string;
  }>;
}

/**
 * Search for real businesses using Supabase Edge Function (bypasses CORS)
 */
export async function searchRealBusiness(
  businessName: string, 
  location: string,
  apiKey?: string // Not used - API key is stored in Supabase
): Promise<RealBusinessSearchResult[]> {
  
  try {
    const query = `${businessName} ${location}`;
    
    console.log('🔍 Searching Google Places via Supabase Edge Function for:', query);
    
    // Call Supabase Edge Function instead of direct Google API
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured. Please add VITE_SUPABASE_URL to your .env file');
    }
    
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/google-places`;
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        query: query,
        type: 'find'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Supabase Edge Function error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }
    
    const data: GooglePlacesResponse = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }
    
    if (data.status === 'ZERO_RESULTS' || !data.candidates || data.candidates.length === 0) {
      console.log('No businesses found for:', query);
      return [];
    }
    
    // Convert Google Places results to our format
    const results: RealBusinessSearchResult[] = data.candidates.map(place => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      website: place.website,
      businessType: extractBusinessType(place.types),
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      hours: place.opening_hours?.weekday_text,
      verified: place.business_status === 'OPERATIONAL',
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      photos: place.photos?.map(photo => ({
        name: photo.name,
        widthPx: photo.widthPx,
        heightPx: photo.heightPx,
        authorAttributions: photo.authorAttributions || []
      })),
      reviews: place.reviews?.map(review => ({
        name: review.name,
        relativePublishTimeDescription: review.relativePublishTimeDescription,
        rating: review.rating,
        text: review.text,
        originalText: review.originalText,
        authorAttribution: review.authorAttribution,
        publishTime: review.publishTime
      }))
    }));
    
    console.log(`✅ Found ${results.length} real businesses via Supabase Edge Function`);
    return results;
    
  } catch (error) {
    console.error('❌ Error searching Google Places via Supabase:', error);
    throw new Error(`Failed to search businesses: ${error.message}`);
  }
}

/**
 * Get detailed business information using Supabase Edge Function
 */
export async function getBusinessDetails(
  placeId: string,
  apiKey?: string // Not used - API key is stored in Supabase
): Promise<RealBusinessSearchResult | null> {
  
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured');
    }
    
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/google-places`;
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        query: placeId,
        type: 'details'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Supabase Edge Function error: ${response.status} - ${errorData.error}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status}`);
    }
    
    const place = data.result;
    
    return {
      placeId: placeId,
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      website: place.website,
      businessType: extractBusinessType(place.types),
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      hours: place.opening_hours?.weekday_text,
      verified: place.business_status === 'OPERATIONAL',
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      }
    };
    
  } catch (error) {
    console.error('❌ Error getting business details via Supabase:', error);
    return null;
  }
}

/**
 * Extract business type from Google Places types array
 */
function extractBusinessType(types: string[]): string {
  const businessTypeMap: { [key: string]: string } = {
    'restaurant': 'Restaurant',
    'food': 'Restaurant',
    'meal_takeaway': 'Restaurant',
    'lawyer': 'Law Firm',
    'legal_services': 'Legal Services', 
    'doctor': 'Medical Practice',
    'dentist': 'Dental Practice',
    'hospital': 'Healthcare',
    'pharmacy': 'Pharmacy',
    'beauty_salon': 'Beauty Salon',
    'hair_care': 'Hair Salon',
    'spa': 'Spa',
    'gym': 'Fitness Center',
    'real_estate_agency': 'Real Estate',
    'car_dealer': 'Auto Dealership',
    'car_repair': 'Auto Repair',
    'accounting': 'Accounting Firm',
    'insurance_agency': 'Insurance',
    'bank': 'Bank',
    'store': 'Retail Store',
    'clothing_store': 'Clothing Store',
    'electronics_store': 'Electronics Store',
    'home_goods_store': 'Home Goods',
    'furniture_store': 'Furniture Store',
    'jewelry_store': 'Jewelry Store',
    'shoe_store': 'Shoe Store',
    'book_store': 'Book Store',
    'florist': 'Florist',
    'pet_store': 'Pet Store',
    'hardware_store': 'Hardware Store',
    'liquor_store': 'Liquor Store',
    'convenience_store': 'Convenience Store',
    'gas_station': 'Gas Station',
    'lodging': 'Hotel',
    'travel_agency': 'Travel Agency',
    'moving_company': 'Moving Company',
    'plumber': 'Plumbing',
    'electrician': 'Electrical Services',
    'contractor': 'Contractor',
    'painter': 'Painting Services',
    'roofing_contractor': 'Roofing',
    'locksmith': 'Locksmith',
    'cleaning_service': 'Cleaning Service'
  };
  
  // Find the most specific business type
  for (const type of types) {
    if (businessTypeMap[type]) {
      return businessTypeMap[type];
    }
  }
  
  // Return the first type if no specific mapping found
  return types[0]?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Business';
}

/**
 * Generate AI-powered landing page content based on real business data
 */
export function generateBusinessLandingPageContent(business: RealBusinessSearchResult): string {
  const reviewText = business.reviews && business.reviews.length > 0 
    ? business.reviews.slice(0, 3).map(r => r.text.text).join(' ') 
    : '';
  
  const ratingText = business.rating 
    ? `with ${business.rating}/5 stars from ${business.reviewCount || 0} reviews` 
    : '';
  
  const hoursText = business.hours && business.hours.length > 0 
    ? business.hours[0] 
    : 'Mon-Fri 9AM-5PM';
  
  const websiteText = business.website 
    ? `Visit ${business.website}` 
    : '';
  
  const phoneText = business.phone 
    ? `Call ${business.phone}` 
    : '';

  return `A professional landing page for ${business.name}, a premier ${business.businessType.toLowerCase()} located at ${business.address}. 

${business.name} is highly rated ${ratingText} and serves customers with exceptional ${business.businessType.toLowerCase()} services. ${reviewText ? 'Customer reviews highlight: ' + reviewText.substring(0, 200) + '...' : ''}

Key Features:
- ${business.businessType} services at ${business.address}
- ${ratingText}
- Hours: ${hoursText}
- ${phoneText}
- ${websiteText}

This landing page should showcase our premium ${business.businessType.toLowerCase()} services, customer testimonials, and make it easy for visitors to contact us or visit our location.`;
}

/**
 * Check if Google Places API is configured (via Supabase)
 */
export function isGooglePlacesConfigured(): boolean {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

/**
 * Get the Google Places API key from environment (not needed for Supabase Edge Function)
 */
export function getGooglePlacesApiKey(): string | undefined {
  return 'configured-via-supabase'; // Placeholder since API key is stored in Supabase
}
