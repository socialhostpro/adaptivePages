import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
}

interface Database {
  public: {
    Tables: {
      pages: {
        Row: {
          id: string
          user_id: string
          name: string
          updated_at: string
          thumbnail_url: string | null
          is_published: boolean | null
          slug: string | null
          custom_domain: string | null
        }
      }
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Query pages with optimized selection and limit
    const { data: pages, error: pagesError } = await supabaseClient
      .from('pages')
      .select('id, user_id, name, updated_at, thumbnail_url, is_published, slug, custom_domain')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(50)

    if (pagesError) {
      console.error('Error fetching pages:', pagesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pages', details: pagesError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Transform to the expected format
    const managedPages = (pages || []).map(page => ({
      id: page.id,
      userId: page.user_id,
      name: page.name,
      updatedAt: page.updated_at,
      thumbnailUrl: page.thumbnail_url,
      isPublished: page.is_published || false,
      slug: page.slug,
      customDomain: page.custom_domain,
      // Default values for missing data
      data: null,
      images: null,
      generationConfig: null,
      publishedData: null,
      publishedImages: null,
      groupId: null,
      groupName: null,
      ownerContactId: null,
      ownerName: null,
    }))

    return new Response(
      JSON.stringify({ pages: managedPages, count: managedPages.length }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
