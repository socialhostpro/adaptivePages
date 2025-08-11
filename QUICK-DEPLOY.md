# 🚀 QUICK DEPLOYMENT TO GOOGLE CLOUD RUN

## ✅ **Build Status: SUCCESS** 
Your app builds successfully and is ready for deployment!

## 🎯 **SIMPLE 3-STEP DEPLOYMENT:**

### **Step 1: Install Google Cloud CLI**
Download: https://cloud.google.com/sdk/docs/install

### **Step 2: Setup & Login**
```powershell
# Login to Google Cloud
gcloud auth login

# Set your project (create one if needed at console.cloud.google.com)
gcloud config set project YOUR_PROJECT_ID

# Enable required services
gcloud services enable run.googleapis.com
```

### **Step 3: Deploy (Run this in PowerShell)**
```powershell
# Navigate to your project folder
cd "Z:\geminiCliApps\81025v2-adaptivepages"

# Run the deployment script
.\deploy.ps1
```

## 🎉 **That's It!**

The script will:
1. ✅ Build your app for production
2. ✅ Create a Docker container 
3. ✅ Deploy to Google Cloud Run
4. ✅ Give you a live URL

## 📝 **After Deployment:**
1. **Copy the URL** you get (like `https://adaptive-pages-xxxxx-uc.a.run.app`)
2. **Add it to Supabase CORS**: 
   - Go to: https://supabase.com/dashboard/project/rxkywcylrtoirshfqqpd/settings/api
   - Add your new URL to "CORS Origins"
   - Save

## 💰 **Cost:** 
- **Free tier**: 2 million requests/month
- **After that**: ~$0.0000004 per request (very cheap!)

## 🔧 **Files Created:**
- `Dockerfile` - Container configuration
- `nginx.conf` - Web server setup  
- `deploy.ps1` - One-click deployment script
- `.env.production` - Production environment variables

**Your app is production-ready! Just run the 3 steps above.**
