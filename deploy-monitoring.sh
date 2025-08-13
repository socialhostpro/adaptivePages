#!/bin/bash

# Deploy Business Monitoring Edge Functions
# This script deploys all the monitoring-related Edge Functions to Supabase

echo "🚀 Deploying Business Monitoring Edge Functions..."

# Function to deploy with error handling
deploy_function() {
    local function_name=$1
    echo "📦 Deploying $function_name..."
    
    if supabase functions deploy $function_name; then
        echo "✅ Successfully deployed $function_name"
    else
        echo "❌ Failed to deploy $function_name"
        exit 1
    fi
}

# Deploy all monitoring functions
deploy_function "news-monitoring"
deploy_function "review-monitoring" 
deploy_function "trends-monitoring"

echo ""
echo "🎉 All monitoring Edge Functions deployed successfully!"
echo ""
echo "📋 Available endpoints:"
echo "   • News Monitoring: /functions/v1/news-monitoring"
echo "   • Review Monitoring: /functions/v1/review-monitoring"  
echo "   • Trends Monitoring: /functions/v1/trends-monitoring"
echo ""
echo "🔧 Required Environment Variables:"
echo "   • NEWS_API_KEY - For news monitoring"
echo "   • GOOGLE_PLACES_API_KEY - For review monitoring"
echo "   • GOOGLE_TRENDS_API_KEY - For trends monitoring (optional)"
echo ""
echo "💡 Usage from frontend:"
echo "   const response = await fetch('/functions/v1/news-monitoring', {"
echo "     method: 'POST',"
echo "     headers: { 'Content-Type': 'application/json' },"
echo "     body: JSON.stringify({ businessName: 'Your Business' })"
echo "   })"
echo ""
echo "✨ Setup complete! Your business monitoring system is ready to use."
