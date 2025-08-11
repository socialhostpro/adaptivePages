# 🚀 Google Cloud Run Deployment Guide

## Prerequisites
1. **Google Cloud Account** with billing enabled
2. **Google Cloud CLI** installed: https://cloud.google.com/sdk/docs/install
3. **Docker** installed: https://www.docker.com/get-started

## Setup Steps

### 1. **Google Cloud Setup**
```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID (replace with your actual project ID)
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. **Build and Test Locally**
```bash
# Build the production version
npm run build

# Test the Docker build locally (optional)
docker build -t adaptive-pages-local .
docker run -p 8080:8080 adaptive-pages-local
```

### 3. **Deploy to Cloud Run**

**Option A: Using gcloud CLI (Recommended)**
```bash
# Deploy directly (replace YOUR_PROJECT_ID)
gcloud run deploy adaptive-pages \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

**Option B: Using Cloud Build**
```bash
# Submit build using cloudbuild.yaml
gcloud builds submit --config cloudbuild.yaml
```

### 4. **Update CORS Settings**
After deployment, you'll get a URL like: `https://adaptive-pages-xxxxx-uc.a.run.app`

**Add this URL to your Supabase CORS settings:**
1. Go to: https://supabase.com/dashboard/project/rxkywcylrtoirshfqqpd/settings/api
2. Add your Cloud Run URL to "CORS Origins"
3. Save settings

### 5. **Environment Variables (Production)**
Your app will use `.env.production` for production builds. Make sure it contains:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` 
- `VITE_GEMINI_API_KEY`

## Custom Domain (Optional)
To use your own domain:
```bash
# Map your domain to the service
gcloud run domain-mappings create \
  --service adaptive-pages \
  --domain yourdomain.com \
  --region us-central1
```

## Monitoring
- **Cloud Run Console**: https://console.cloud.google.com/run
- **Logs**: `gcloud run logs tail adaptive-pages --region us-central1`
- **Metrics**: Available in the Cloud Run console

## Costs
- **Cloud Run**: Pay per request (very cheap for most apps)
- **Container Registry**: Storage costs for your Docker image
- **Estimated**: $5-20/month for moderate traffic

## Troubleshooting
- **Build fails**: Check Dockerfile and package.json
- **App won't load**: Check nginx.conf and port 8080
- **API errors**: Verify environment variables and CORS settings
- **Logs**: Use `gcloud run logs tail adaptive-pages --region us-central1`

## Quick Commands
```bash
# Check service status
gcloud run services list

# Get service URL
gcloud run services describe adaptive-pages --region us-central1 --format 'value(status.url)'

# View logs
gcloud run logs tail adaptive-pages --region us-central1

# Delete service
gcloud run services delete adaptive-pages --region us-central1
```
