#!/bin/bash

# Simple Google Cloud Run Deployment Script
echo "🚀 Deploying Adaptive Pages to Google Cloud Run..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not logged in to gcloud. Please run: gcloud auth login"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No project set. Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Project ID: $PROJECT_ID"

# Build the app first
echo "🔨 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
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

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Getting service URL..."
    URL=$(gcloud run services describe adaptive-pages --region us-central1 --format 'value(status.url)')
    echo "🎉 Your app is live at: $URL"
    echo ""
    echo "📝 Next steps:"
    echo "1. Add $URL to your Supabase CORS origins"
    echo "2. Visit: https://supabase.com/dashboard/project/rxkywcylrtoirshfqqpd/settings/api"
    echo "3. Add the URL above to 'CORS Origins' and save"
else
    echo "❌ Deployment failed!"
    exit 1
fi
