# Simple Google Cloud Run Deployment Script for Windows
Write-Host "Deploying Adaptive Pages to Google Cloud Run..." -ForegroundColor Green

# Check if gcloud is installed
try {
    $null = Get-Command gcloud -ErrorAction Stop
} catch {
    Write-Host "ERROR: gcloud CLI not found. Please install: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}

# Check if user is logged in
$activeAccount = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
if ([string]::IsNullOrWhiteSpace($activeAccount)) {
    Write-Host "ERROR: Not logged in to gcloud. Please run: gcloud auth login" -ForegroundColor Red
    exit 1
}

# Get project ID
$projectId = gcloud config get-value project 2>$null
if ([string]::IsNullOrWhiteSpace($projectId)) {
    Write-Host "ERROR: No project set. Please run: gcloud config set project YOUR_PROJECT_ID" -ForegroundColor Red
    exit 1
}

Write-Host "Project ID: $projectId" -ForegroundColor Blue

# Build the app first
Write-Host "Building the application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Build successful!" -ForegroundColor Green

# Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy adaptive-pages `
    --source . `
    --platform managed `
    --region us-central1 `
    --allow-unauthenticated `
    --port 8080 `
    --memory 512Mi `
    --cpu 1 `
    --min-instances 0 `
    --max-instances 10

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Deployment completed!" -ForegroundColor Green
    Write-Host "Getting service URL..." -ForegroundColor Blue
    $url = gcloud run services describe adaptive-pages --region us-central1 --format 'value(status.url)' 2>$null
    Write-Host "Your app is live at: $url" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Add $url to your Supabase CORS origins"
    Write-Host "2. Visit: https://supabase.com/dashboard/project/rxkywcylrtoirshfqqpd/settings/api"
    Write-Host "3. Add the URL above to 'CORS Origins' and save"
} else {
    Write-Host "ERROR: Deployment failed!" -ForegroundColor Red
    exit 1
}
