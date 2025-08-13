# Deploy Business Monitoring Edge Functions
# This script deploys all the monitoring-related Edge Functions to Supabase

Write-Host "🚀 Deploying Business Monitoring Edge Functions..." -ForegroundColor Blue

# Function to deploy with error handling
function Deploy-Function {
    param([string]$FunctionName)
    
    Write-Host "📦 Deploying $FunctionName..." -ForegroundColor Yellow
    
    $result = & supabase functions deploy $FunctionName
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully deployed $FunctionName" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to deploy $FunctionName" -ForegroundColor Red
        exit 1
    }
}

# Check if Supabase CLI is installed
try {
    $null = Get-Command supabase -ErrorAction Stop
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Supabase
$loginCheck = & supabase projects list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Supabase. Please run:" -ForegroundColor Red
    Write-Host "   supabase login" -ForegroundColor Yellow
    exit 1
}

# Deploy all monitoring functions
Deploy-Function "news-monitoring"
Deploy-Function "review-monitoring"
Deploy-Function "trends-monitoring"

Write-Host ""
Write-Host "🎉 All monitoring Edge Functions deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Available endpoints:" -ForegroundColor Cyan
Write-Host "   • News Monitoring: /functions/v1/news-monitoring"
Write-Host "   • Review Monitoring: /functions/v1/review-monitoring"
Write-Host "   • Trends Monitoring: /functions/v1/trends-monitoring"
Write-Host ""
Write-Host "🔧 Required Environment Variables:" -ForegroundColor Cyan
Write-Host "   • NEWS_API_KEY - For news monitoring"
Write-Host "   • GOOGLE_PLACES_API_KEY - For review monitoring"
Write-Host "   • GOOGLE_TRENDS_API_KEY - For trends monitoring (optional)"
Write-Host ""
Write-Host "💡 Usage from frontend:" -ForegroundColor Cyan
Write-Host "   const response = await fetch('/functions/v1/news-monitoring', {"
Write-Host "     method: 'POST',"
Write-Host "     headers: { 'Content-Type': 'application/json' },"
Write-Host "     body: JSON.stringify({ businessName: 'Your Business' })"
Write-Host "   })"
Write-Host ""
Write-Host "✨ Setup complete! Your business monitoring system is ready to use." -ForegroundColor Green
