# Quick Login Test

## Test Login Credentials
Try logging in with:
- **Email**: test@example.com  
- **Password**: password123

Or check browser console for any authentication errors.

## Port Information
App is currently running on: http://localhost:5175

## CORS Configuration Needed
Add these URLs to your Supabase CORS settings:
- http://localhost:5173
- http://localhost:5174  
- http://localhost:5175
- http://127.0.0.1:5173
- http://127.0.0.1:5174
- http://127.0.0.1:5175

## Steps to Fix CORS:
1. Go to https://supabase.com/dashboard/project/rxkywcylrtoirshfqqpd/settings/api
2. Scroll to "CORS Origins"
3. Add the localhost URLs above
4. Save changes
5. Try logging in again

## Common Issues:
- **CORS errors**: Need to add localhost:5175 to Supabase
- **Invalid credentials**: Create a new account or use existing ones
- **Email not confirmed**: Check email for confirmation link
