# Deploy to Cloud Run with all environment variables (SECURE VERSION)
# This script ensures all environment variables are properly configured using substitution variables

Write-Host "🚀 Deploying AdaptivePages to Cloud Run with secure environment variables..." -ForegroundColor Green

# Check if all required environment variables are set
$geminiKey = $env:GEMINI_API_KEY
$supabaseUrl = $env:SUPABASE_URL
$supabaseAnonKey = $env:SUPABASE_ANON_KEY

$missingVars = @()
if ([string]::IsNullOrWhiteSpace($geminiKey)) { $missingVars += "GEMINI_API_KEY" }
if ([string]::IsNullOrWhiteSpace($supabaseUrl)) { $missingVars += "SUPABASE_URL" }
if ([string]::IsNullOrWhiteSpace($supabaseAnonKey)) { $missingVars += "SUPABASE_ANON_KEY" }

if ($missingVars.Count -gt 0) {
    Write-Host "❌ ERROR: Missing environment variables:" -ForegroundColor Red
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor Yellow
    }
    Write-Host "`nPlease set them first:" -ForegroundColor Yellow
    Write-Host '$env:GEMINI_API_KEY="your_gemini_api_key"' -ForegroundColor White
    Write-Host '$env:SUPABASE_URL="https://your-project.supabase.co"' -ForegroundColor White
    Write-Host '$env:SUPABASE_ANON_KEY="your_supabase_anon_key"' -ForegroundColor White
    exit 1
}

Write-Host "✅ All environment variables found:" -ForegroundColor Green
Write-Host "   - GEMINI_API_KEY (length: $($geminiKey.Length))" -ForegroundColor Cyan
Write-Host "   - SUPABASE_URL: $supabaseUrl" -ForegroundColor Cyan
Write-Host "   - SUPABASE_ANON_KEY (length: $($supabaseAnonKey.Length))" -ForegroundColor Cyan

# Build and deploy using Cloud Build with substitution variables
Write-Host "`nBuilding and deploying with secure environment variables..." -ForegroundColor Yellow
gcloud builds submit --config cloudbuild.yaml --substitutions _GEMINI_API_KEY="$geminiKey",_SUPABASE_URL="$supabaseUrl",_SUPABASE_ANON_KEY="$supabaseAnonKey"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Your application should now be available with all environment variables configured securely." -ForegroundColor Cyan
    
    # Get the service URL
    Write-Host "Getting service URL..." -ForegroundColor Yellow
    $serviceUrl = gcloud run services describe adaptive-pages --region=us-central1 --format="value(status.url)"
    Write-Host "📝 Service URL: $serviceUrl" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Please check the build logs above for errors." -ForegroundColor Yellow
}
