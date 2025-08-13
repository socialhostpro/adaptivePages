# 🌟 Enable Real Business Data with Google Places API

Currently, the business search shows **simulated/demo data**. To get **real business information**, follow these steps:

## 🔑 Step 1: Get Google Places API Key

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**: Create a new project or select an existing one
3. **Enable APIs**: 
   - Go to "APIs & Services" → "Library"
   - Search for and enable these APIs:
     - **Places API (New)**
     - **Geocoding API** 
     - **Maps JavaScript API**

4. **Create API Key**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

5. **Secure Your API Key**:
   - Click on your API key to edit it
   - Under "Application restrictions" → "HTTP referrers (web sites)"
   - Add your domain (e.g., `yoursite.com/*`, `localhost:*`)
   - Under "API restrictions" → "Restrict key"
   - Select only the APIs you enabled above

## 🔧 Step 2: Configure Your Application

1. **Create Environment File**:
   ```bash
   # Copy the example file
   cp .env.example .env.local
   ```

2. **Add Your API Key**:
   ```bash
   # Edit .env.local and add:
   VITE_GOOGLE_PLACES_API_KEY=your_actual_api_key_here
   ```

3. **Restart Development Server**:
   ```bash
   npm run dev
   ```

## ✅ Step 3: Verify Real Data

1. **Open the generation wizard**
2. **Look for the data indicator**:
   - 🧪 **Demo Data** = Using simulated results
   - ✅ **Real Data** = Using Google Places API

3. **Search for a real business**:
   - Example: "Starbucks 90210"
   - Example: "McDonald's New York"
   - You should see actual addresses, phone numbers, and ratings!

## 💰 Pricing Information

- **Google Places API** pricing (as of 2024):
  - Find Place requests: $17 per 1,000 requests
  - Place Details: $17 per 1,000 requests
  - **Free tier**: $200 credit per month (≈11,700+ searches)

## 🔍 What Real Data Includes

With Google Places API, you get:
- ✅ **Verified business addresses**
- ✅ **Real phone numbers**
- ✅ **Actual business websites**
- ✅ **Google ratings and review counts**
- ✅ **Business hours**
- ✅ **Business types/categories**
- ✅ **Geographic coordinates**

## 🛠️ Troubleshooting

### "API key is required" Error
- Make sure your `.env.local` file exists
- Check the API key is named exactly `VITE_GOOGLE_PLACES_API_KEY`
- Restart your development server after adding the key

### "CORS" or "Forbidden" Errors
- Check your API key restrictions in Google Cloud Console
- Make sure your domain is allowed in HTTP referrer restrictions
- Verify the Places API is enabled for your project

### Still Seeing Demo Data?
- Check the browser console for API error messages
- Verify your API key has the correct permissions
- Make sure you're not hitting API quota limits

## 🚀 Ready to Go Live?

For production deployment:
1. **Set up environment variables** in your hosting platform
2. **Configure domain restrictions** for your production domain
3. **Monitor API usage** in Google Cloud Console
4. **Set up billing alerts** to avoid unexpected charges

---

**Need Help?** 
- Check the browser console for detailed error messages
- Visit Google Places API documentation: https://developers.google.com/maps/documentation/places/web-service
- Contact support if you're still having issues
