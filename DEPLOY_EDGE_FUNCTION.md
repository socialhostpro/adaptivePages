# 🚀 Deploy Google Places Edge Function to Supabase

## Quick Fix for CORS Issue

The business lookup is failing due to CORS (Cross-Origin Resource Sharing) restrictions. Google Places API can't be called directly from the browser. We need to deploy a Supabase Edge Function to act as a proxy.

## 📋 Manual Deployment Steps

### 1. Install Supabase CLI

**Option A: Using Scoop (Recommended for Windows)**
```powershell
# Install Scoop if you don't have it
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Option B: Direct Download**
- Go to: https://github.com/supabase/cli/releases
- Download the Windows binary
- Add to your PATH

### 2. Login and Link Project

```powershell
# Login to Supabase (opens browser)
supabase login

# Link to your project (get project ref from Supabase dashboard)
supabase link --project-ref rxkywcylrtoirshfqqpd
```

### 3. Set Google Places API Key

```powershell
# Set your API key as a Supabase secret
supabase secrets set GOOGLE_PLACES_API_KEY=AIzaSyAsiCxFefECTlJag_1mSfflJuIw35PqZLU
```

### 4. Deploy the Edge Function

```powershell
# Deploy the google-places function
supabase functions deploy google-places
```

## 🎯 Expected Result

After deployment, you should see:
- ✅ Function deployed successfully
- ✅ Available at: `https://rxkywcylrtoirshfqqpd.supabase.co/functions/v1/google-places`
- ✅ Business search will use real Google Places data
- ✅ No more CORS errors

## 🔧 Alternative: Use Automated Script

```powershell
# Run the automated deployment script
.\deploy-supabase-function.ps1
```

## 🧪 Testing

1. Restart your dev server: `npm run dev`
2. Open the generation wizard
3. Search for "Starbucks 90210"
4. Look for ✅ **Real Data** badge
5. Should see actual business addresses instead of "123 Main St"

## ❌ Troubleshooting

**CLI not found?**
- Make sure Supabase CLI is installed and in PATH
- Try restarting PowerShell after installation

**Login fails?**
- Check your internet connection
- Make sure you have a Supabase account

**Link fails?**
- Verify your project reference is correct
- Check you have admin access to the project

**Deploy fails?**
- Ensure you're in the project root directory
- Check the function code exists in `supabase/functions/google-places/`

---

**After successful deployment, business search will show real Google Places data! 🎉**
