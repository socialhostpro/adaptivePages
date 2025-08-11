import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LoginRequest {
  email: string
  password: string
  action: 'login' | 'signup'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { email, password, action }: LoginRequest = await req.json()

    if (!email || !password || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, action' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let result
    let error

    if (action === 'login') {
      // Handle login
      const { data, error: authError } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      })
      result = data
      error = authError
    } else if (action === 'signup') {
      // Handle signup
      const { data, error: authError } = await supabaseClient.auth.signUp({
        email,
        password
      })
      result = data
      error = authError
    }

    if (error) {
      console.error('Auth error:', error)
      return new Response(
        JSON.stringify({ 
          error: error.message,
          code: error.name || 'AUTH_ERROR'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For signup, check if user exists but is not confirmed
    if (action === 'signup' && result.user && result.user.identities && result.user.identities.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "This email is already registered but not confirmed. We've sent you another confirmation link. Please check your email.",
          user: result.user,
          session: result.session
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For successful signup
    if (action === 'signup' && result.user) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Signup successful! Please check your email for a confirmation link to complete your registration.',
          user: result.user,
          session: result.session
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For successful login
    return new Response(
      JSON.stringify({ 
        success: true,
        user: result.user,
        session: result.session
      }),
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
