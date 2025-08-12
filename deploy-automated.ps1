# AdaptivePages Automated Deployment Script (PowerShell)
# Builds and deploys the application to Google Cloud Run

param(
    [string]$ProjectId = "imaginecapitalai",
    [string]$ServiceName = "adaptive-pages",
    [string]$Region = "us-central1",
    [string]$Repository = "adaptivepages",
    [string]$ImageName = "app"
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

Write-Host "🚀 AdaptivePages Deployment Pipeline" -ForegroundColor Blue
Write-Host "====================================" -ForegroundColor Blue

# Step 1: Clean and build
Write-Info "Building application..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed"
    exit 1
}
Write-Status "Build completed"

# Step 2: Build and push Docker image
$Timestamp = Get-Date -Format "yyyyMMddHHmmss"
$ImageTag = "us-central1-docker.pkg.dev/$ProjectId/$Repository/$ImageName`:$Timestamp"
$LatestTag = "us-central1-docker.pkg.dev/$ProjectId/$Repository/$ImageName`:latest"

Write-Info "Building and pushing Docker image..."
Write-Info "Image tag: $ImageTag"

gcloud builds submit --tag $ImageTag --tag $LatestTag
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker build failed"
    exit 1
}

Write-Status "Docker image built and pushed"

# Step 3: Deploy to Cloud Run
Write-Info "Deploying to Cloud Run..."

gcloud run deploy $ServiceName `
    --image $LatestTag `
    --region $Region `
    --platform managed `
    --allow-unauthenticated `
    --project $ProjectId `
    --memory 1Gi `
    --cpu 1 `
    --concurrency 100 `
    --max-instances 10 `
    --set-env-vars="NODE_ENV=production" `
    --port 8080

if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment failed"
    exit 1
}

Write-Status "Deployment completed successfully!"

# Step 4: Get service URL
$ServiceUrl = gcloud run services describe $ServiceName --region=$Region --format="value(status.url)"
Write-Info "Service URL: $ServiceUrl"

# Step 5: Test deployment
Write-Info "Testing deployment..."
try {
    $Response = Invoke-WebRequest -Uri $ServiceUrl -Method GET -TimeoutSec 30
    if ($Response.StatusCode -eq 200) {
        Write-Status "Deployment test passed (HTTP $($Response.StatusCode))"
    } else {
        Write-Warning "Deployment test returned HTTP $($Response.StatusCode)"
    }
} catch {
    Write-Warning "Deployment test failed: $($_.Exception.Message)"
}

Write-Host ""
Write-Status "🎉 Deployment pipeline completed!"
Write-Host "================================================" -ForegroundColor Blue
Write-Host "Service URL: $ServiceUrl" -ForegroundColor Blue
Write-Host "Image: $LatestTag" -ForegroundColor Blue
Write-Host "Region: $Region" -ForegroundColor Blue
Write-Host "================================================" -ForegroundColor Blue
