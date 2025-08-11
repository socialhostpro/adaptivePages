# CORS Test Script for Supabase
# Run this script to test if CORS is properly configured

$supabaseUrl = "https://rxkywcylrtoirshfqqpd.supabase.co"
$testEndpoint = "$supabaseUrl/rest/v1/"

Write-Host "🧪 Testing CORS configuration for: $supabaseUrl" -ForegroundColor Cyan
Write-Host ""

# Test with different origins
$origins = @(
    "http://localhost:5173",
    "http://localhost:5174", 
    "http://localhost:5175",
    "http://127.0.0.1:5175"
)

foreach ($origin in $origins) {
    Write-Host "Testing origin: $origin" -ForegroundColor Yellow
    
    try {
        $headers = @{
            "Origin" = $origin
            "Access-Control-Request-Method" = "GET"
            "Access-Control-Request-Headers" = "authorization, x-client-info, apikey, content-type"
        }
        
        $response = Invoke-WebRequest -Uri $testEndpoint -Method OPTIONS -Headers $headers -ErrorAction Stop
        
        if ($response.Headers["Access-Control-Allow-Origin"]) {
            Write-Host "✅ CORS configured for $origin" -ForegroundColor Green
            Write-Host "   Allowed Origin: $($response.Headers['Access-Control-Allow-Origin'])" -ForegroundColor Gray
        } else {
            Write-Host "❌ CORS not configured for $origin" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Error testing $origin : $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "📋 To fix CORS issues:" -ForegroundColor Cyan
Write-Host "1. Go to: https://supabase.com/dashboard/project/rxkywcylrtoirshfqqpd/settings/api"
Write-Host "2. Add the failing origins to CORS Origins section"
Write-Host "3. Save and wait a few minutes"
Write-Host ""
