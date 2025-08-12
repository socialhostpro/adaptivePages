#!/bin/bash

# AdaptivePages Custom Domain Setup Script
# This script helps set up custom domains for Cloud Run services

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

echo -e "${BLUE}🚀 AdaptivePages Custom Domain Setup${NC}"
echo "=================================="

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

# Check if domain is provided
if [ -z "$1" ]; then
    print_error "Please provide a domain name"
    echo "Usage: ./setup-custom-domain.sh your-domain.com"
    exit 1
fi

DOMAIN=$1

print_info "Setting up custom domain: $DOMAIN"
print_info "Project: $PROJECT_ID"
print_info "Service: $SERVICE_NAME"
print_info "Region: $REGION"

# Step 1: Enable required APIs
print_info "Enabling required APIs..."
gcloud services enable domains.googleapis.com --project=$PROJECT_ID
gcloud services enable cloudresourcemanager.googleapis.com --project=$PROJECT_ID
print_status "APIs enabled"

# Step 2: Create domain mapping
print_info "Creating domain mapping..."
gcloud run domain-mappings create \
    --service=$SERVICE_NAME \
    --domain=$DOMAIN \
    --region=$REGION \
    --project=$PROJECT_ID

print_status "Domain mapping created"

# Step 3: Get DNS records
print_info "Getting DNS configuration..."
gcloud run domain-mappings describe $DOMAIN \
    --region=$REGION \
    --project=$PROJECT_ID

print_warning "IMPORTANT: You need to configure the following DNS records:"
echo ""
echo "1. Add the following DNS records to your domain registrar:"
echo "   - Type: A"
echo "   - Name: @ (or your domain)"
echo "   - Value: (IP address from the output above)"
echo ""
echo "2. For www subdomain (optional):"
echo "   - Type: CNAME"
echo "   - Name: www"
echo "   - Value: ghs.googlehosted.com"
echo ""

# Step 4: SSL Certificate info
print_info "SSL Certificate will be automatically provisioned by Google"
print_warning "It may take up to 24 hours for the SSL certificate to be issued"

echo ""
print_status "Custom domain setup initiated successfully!"
print_info "Check status with: gcloud run domain-mappings describe $DOMAIN --region=$REGION"
