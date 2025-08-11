# CORS and Data Loading Issues - Fix Guide

## Issues Identified

### 1. **CORS Error (Primary Issue)**
```
Access to fetch at 'https://rxkywcylrtoirshfqqpd.supabase.co/rest/v1/team_members...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Root Cause**: Supabase is not configured to allow requests from localhost:5173

### 2. **React DOM Multiple Roots**
```
You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before
```

**Root Cause**: Hot reloading in development creates multiple React roots

### 3. **Edge Functions Not Needed**
The edge functions are for specialized server-side operations. For basic CRUD operations, you should use Supabase's built-in REST API with proper authentication.

## Fixes Applied

### ✅ 1. Fixed React DOM Issue
Updated `src/index.tsx` to prevent multiple root creation during hot reloading.

### 🔧 2. CORS Fix Required

**Option A: Configure Supabase CORS (Recommended)**
1. Go to your Supabase Dashboard
2. Navigate to Settings → API
3. Add `http://localhost:5173` to allowed origins
4. Add `http://127.0.0.1:5173` as backup

**Option B: Update Supabase Client Configuration**
Add CORS headers to the Supabase client:

```typescript
// In services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '../supabaseCredentials';
import type { Database } from '../database.types';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }
  }
});
```

### 🔧 3. Database Permissions Fix

The CORS error suggests you might also have RLS (Row Level Security) issues. Run these in Supabase SQL Editor:

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('pages', 'team_members', 'contacts', 'products');

-- Enable RLS and add policies if missing
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Add basic read/write policies for authenticated users
CREATE POLICY "Users can manage own pages" ON pages
FOR ALL USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can manage own team_members" ON team_members  
FOR ALL USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can manage own contacts" ON contacts
FOR ALL USING (auth.uid() = owner_id::uuid);

CREATE POLICY "Users can manage own products" ON products
FOR ALL USING (auth.uid() = user_id::uuid);
```

### 🔧 4. Environment Variables (Security Improvement)

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://rxkywcylrtoirshfqqpd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a3l3Y3lscnRvaXJzaGZxcXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MjQ5ODYsImV4cCI6MjA2ODEwMDk4Nn0.M79J1j4-bpKpqlCLmHylOX64vbudaBwrBD6-e1fQ18M
```

Update `supabaseCredentials.ts`:

```typescript
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rxkywcylrtoirshfqqpd.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a3l3Y3lscnRvaXJzaGZxcXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MjQ5ODYsImV4cCI6MjA2ODEwMDk4Nn0.M79J1j4-bpKpqlCLmHylOX64vbudaBwrBD6-e1fQ18M';
```

## Immediate Action Steps

1. **Fix CORS in Supabase Dashboard** (highest priority)
2. **Check RLS policies** in Supabase SQL Editor  
3. **Restart dev server** after changes: `npm run dev`
4. **Check browser console** for the debugging logs we added

## About Edge Functions

Edge functions are for:
- Complex server-side logic
- Third-party API integrations  
- Custom authentication flows
- Data processing/transformations

For basic CRUD operations like getting pages, contacts, products - use the standard Supabase client with proper RLS policies. Edge functions add unnecessary complexity for simple database operations.

## Expected Console Output After Fixes

You should see:
```
🔄 Starting refreshAllData...
📧 User ID: 1628108f-cab1-4881-8ad2-bb4de5eba316
📞 Calling pageService.getPages...
🔍 pageService.getPages called with userId: 1628108f-cab1-4881-8ad2-bb4de5eba316
📋 Raw pages response: { data: [...], error: null }
✅ Pages found: 5
📄 Pages received: 5
```

Instead of CORS errors and failed fetches.
