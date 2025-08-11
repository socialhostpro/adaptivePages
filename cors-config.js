// Manual CORS Configuration for Supabase
// This file contains the configuration needed for your Supabase project

const corsConfiguration = {
  projectRef: 'rxkywcylrtoirshfqqpd',
  allowedOrigins: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'https://adaptive-pages-546954721368.us-central1.run.app' // Your production URL
  ]
};

// Steps to configure CORS manually:
// 1. Go to: https://supabase.com/dashboard/project/rxkywcylrtoirshfqqpd/settings/api
// 2. Scroll down to "CORS Origins"
// 3. Add each URL from allowedOrigins array above
// 4. Click "Save"
// 5. Wait a few minutes for changes to propagate

console.log('CORS Configuration needed:', corsConfiguration);

export default corsConfiguration;
