# Simple CORS Test
$url = "https://rxkywcylrtoirshfqqpd.supabase.co/rest/v1/"
Write-Host "Testing CORS for: $url"

try {
    $response = Invoke-WebRequest -Uri $url -Method OPTIONS
    Write-Host "Response received - CORS might be working"
    $response.Headers
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Message -match "CORS") {
        Write-Host "CORS issue detected!"
        Write-Host "Add http://localhost:5175 to Supabase CORS origins"
    }
}
