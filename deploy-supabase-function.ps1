# Supabase Edge Function Deployment Script
# This script sets up and deploys the Google Places proxy function

Write-Host "🚀 Setting up Supabase Edge Function for Google Places API" -ForegroundColor Green

# Step 1: Install Supabase CLI
Write-Host "📦 Installing Supabase CLI..." -ForegroundColor Yellow
if (-not (Get-Command "supabase" -ErrorAction SilentlyContinue)) {
    # Install via Scoop (recommended for Windows)
    if (Get-Command "scoop" -ErrorAction SilentlyContinue) {
        scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
        scoop install supabase
    } else {
        Write-Host "❌ Scoop not found. Please install Supabase CLI manually:" -ForegroundColor Red
        Write-Host "   Visit: https://supabase.com/docs/guides/cli/getting-started" -ForegroundColor White
        Write-Host "   Or install Scoop first: https://scoop.sh/" -ForegroundColor White
        exit 1
    }
}

# Step 2: Login to Supabase
Write-Host "🔐 Logging into Supabase..." -ForegroundColor Yellow
Write-Host "   This will open your browser for authentication" -ForegroundColor Gray
supabase login

# Step 3: Link to your project
Write-Host "🔗 Linking to your Supabase project..." -ForegroundColor Yellow
Write-Host "   Use your project reference from the Supabase dashboard" -ForegroundColor Gray
$projectRef = Read-Host "Enter your Supabase project reference (e.g., abcdefghijklmnop)"
supabase link --project-ref $projectRef

# Step 4: Set up environment variables for the Edge Function
Write-Host "🔧 Setting up environment variables..." -ForegroundColor Yellow
Write-Host "   Adding your Google Places API key to Supabase secrets" -ForegroundColor Gray

# Read the API key from .env.local
$envFile = ".\.env.local"
if (Test-Path $envFile) {
    $apiKey = (Get-Content $envFile | Select-String "VITE_GOOGLE_PLACES_API_KEY=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
    if ($apiKey) {
        Write-Host "   Found API key in .env.local" -ForegroundColor Green
        supabase secrets set GOOGLE_PLACES_API_KEY=$apiKey
    } else {
        Write-Host "   ⚠️ No API key found in .env.local" -ForegroundColor Yellow
        $manualApiKey = Read-Host "Enter your Google Places API key"
        supabase secrets set GOOGLE_PLACES_API_KEY=$manualApiKey
    }
} else {
    Write-Host "   ⚠️ .env.local not found" -ForegroundColor Yellow
    $manualApiKey = Read-Host "Enter your Google Places API key"
    supabase secrets set GOOGLE_PLACES_API_KEY=$manualApiKey
}

# Step 5: Deploy the Edge Function
Write-Host "🚀 Deploying Google Places Edge Function..." -ForegroundColor Yellow
supabase functions deploy google-places

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Your Google Places proxy is now live at:" -ForegroundColor Cyan
Write-Host "   https://[your-project-ref].supabase.co/functions/v1/google-places" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Restart your development server to test real business data:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
