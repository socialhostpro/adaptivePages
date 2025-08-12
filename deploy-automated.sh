#!/bin/bash

# AdaptivePages Automated Deployment Script
# Builds and deploys the application to Google Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${PROJECT_ID:-"imaginecapitalai"}
SERVICE_NAME=${SERVICE_NAME:-"adaptive-pages"}
REGION=${REGION:-"us-central1"}
REPOSITORY=${REPOSITORY:-"adaptivepages"}
IMAGE_NAME=${IMAGE_NAME:-"app"}

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo -e "${BLUE}🚀 AdaptivePages Deployment Pipeline${NC}"
echo "===================================="

# Step 1: Clean and build
print_info "Building application..."
npm run build
print_status "Build completed"

# Step 2: Build and push Docker image
TIMESTAMP=$(date +%Y%m%d%H%M%S)
IMAGE_TAG="us-central1-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$IMAGE_NAME:$TIMESTAMP"
LATEST_TAG="us-central1-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$IMAGE_NAME:latest"

print_info "Building and pushing Docker image..."
print_info "Image tag: $IMAGE_TAG"

gcloud builds submit --tag $IMAGE_TAG --tag $LATEST_TAG

print_status "Docker image built and pushed"

# Step 3: Deploy to Cloud Run
print_info "Deploying to Cloud Run..."

gcloud run deploy $SERVICE_NAME \
    --image $LATEST_TAG \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --project $PROJECT_ID \
    --memory 1Gi \
    --cpu 1 \
    --concurrency 100 \
    --max-instances 10 \
    --set-env-vars="NODE_ENV=production" \
    --port 8080

print_status "Deployment completed successfully!"

# Step 4: Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
print_info "Service URL: $SERVICE_URL"

# Step 5: Test deployment
print_info "Testing deployment..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $SERVICE_URL)
if [ $HTTP_STATUS -eq 200 ]; then
    print_status "Deployment test passed (HTTP $HTTP_STATUS)"
else
    print_warning "Deployment test returned HTTP $HTTP_STATUS"
fi

echo ""
print_status "🎉 Deployment pipeline completed!"
echo "================================================"
echo "Service URL: $SERVICE_URL"
echo "Image: $LATEST_TAG"
echo "Region: $REGION"
echo "================================================"
