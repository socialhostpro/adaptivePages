# Deploy to Cloud Run with all environment variables (SECURE VERSION)
# This script ensures all environment variables are properly configured using substitution variables

Write-Host "Deploying AdaptivePages to Cloud Run with secure environment variables..." -ForegroundColor Green

# Check if GEMINI_API_KEY environment variable is set
$geminiKey = $env:GEMINI_API_KEY
if ([string]::IsNullOrWhiteSpace($geminiKey)) {
    Write-Host "ERROR: GEMINI_API_KEY environment variable is not set!" -ForegroundColor Red
    Write-Host "Please set the GEMINI_API_KEY environment variable before running this script." -ForegroundColor Yellow
    exit 1
}

Write-Host "GEMINI_API_KEY found (length: $($geminiKey.Length))" -ForegroundColor Green

# Build and deploy using Cloud Build with substitution variables
Write-Host "Building and deploying with secure environment variables..." -ForegroundColor Yellow
gcloud builds submit --config cloudbuild.yaml --substitutions "_GEMINI_API_KEY=$geminiKey,_SUPABASE_URL=https://rxkywcylrtoirshfqqpd.supabase.co,_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a3l3Y3lscnRvaXJzaGZxcXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MjQ5ODYsImV4cCI6MjA2ODEwMDk4Nn0.M79J1j4-bpKpqlCLmHylOX64vbudaBwrBD6-e1fQ18M"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful!" -ForegroundColor Green
    Write-Host "Your application should now be available with all environment variables configured securely." -ForegroundColor Cyan
    
    # Get the service URL
    Write-Host "Getting service URL..." -ForegroundColor Yellow
    $serviceUrl = gcloud run services describe adaptive-pages --region=us-central1 --format="value(status.url)"
    Write-Host "Service URL: $serviceUrl" -ForegroundColor Cyan
} else {
    Write-Host "Deployment failed!" -ForegroundColor Red
    Write-Host "Please check the build logs above for errors." -ForegroundColor Yellow
}
