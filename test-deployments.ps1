#!/usr/bin/env pwsh
# ESRC Cameroon - Deployment Health Check Script
# Tests both backend and frontend deployments

param(
    [string]$BackendUrl = "",
    [string]$FrontendUrl = ""
)

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     ESRC CAMEROON - DEPLOYMENT HEALTH CHECK               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if (-not $BackendUrl) {
    Write-Host "📝 Backend URL not provided." -ForegroundColor Yellow
    Write-Host "   Get it from: https://railway.com/project/55897222-08c9-4bdf-b448-96891aa7a2df" -ForegroundColor Gray
    Write-Host ""
    $BackendUrl = Read-Host "Enter Backend URL (or press Enter to skip)"
}

if (-not $FrontendUrl) {
    Write-Host "📝 Frontend URL not provided." -ForegroundColor Yellow
    Write-Host "   Get it from: https://railway.com/project/c9001937-e50a-462d-ab9f-0993781b3d2d" -ForegroundColor Gray
    Write-Host ""
    $FrontendUrl = Read-Host "Enter Frontend URL (or press Enter to skip)"
}

Write-Host ""
Write-Host "🔍 Testing Deployments..." -ForegroundColor Cyan
Write-Host ""

# Test Backend
if ($BackendUrl) {
    Write-Host "Backend Service:" -ForegroundColor Yellow
    
    try {
        # Test health endpoint
        $HealthUrl = "$BackendUrl/health"
        Write-Host "  → Testing $HealthUrl" -ForegroundColor Gray
        
        $Response = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        
        if ($Response.StatusCode -eq 200) {
            Write-Host "    ✅ Health Check: 200 OK" -ForegroundColor Green
            
            try {
                $Health = $Response.Content | ConvertFrom-Json
                Write-Host "    ✅ Status: $($Health.status)" -ForegroundColor Green
                Write-Host "    ✅ Uptime: $($Health.uptime) seconds" -ForegroundColor Green
            } catch {
                Write-Host "    ⚠️  Could not parse health response" -ForegroundColor Yellow
            }
        } else {
            Write-Host "    ❌ Status Code: $($Response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "    ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    💡 Tip: Backend might still be starting. Wait 2-3 minutes and try again." -ForegroundColor Yellow
    }
    
    # Test API endpoint
    try {
        Write-Host ""
        Write-Host "  → Testing $BackendUrl/courses" -ForegroundColor Gray
        
        $ApiResponse = Invoke-WebRequest -Uri "$BackendUrl/courses" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        
        if ($ApiResponse.StatusCode -eq 200) {
            Write-Host "    ✅ API Response: 200 OK" -ForegroundColor Green
        }
    } catch {
        Write-Host "    ⚠️  API Test: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Backend URL skipped" -ForegroundColor Gray
}

Write-Host ""

# Test Frontend
if ($FrontendUrl) {
    Write-Host "Frontend Service:" -ForegroundColor Yellow
    
    try {
        Write-Host "  → Testing $FrontendUrl" -ForegroundColor Gray
        
        $FrontendResponse = Invoke-WebRequest -Uri $FrontendUrl -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        
        if ($FrontendResponse.StatusCode -eq 200) {
            Write-Host "    ✅ Frontend: 200 OK" -ForegroundColor Green
            
            # Check for Next.js indicators
            if ($FrontendResponse.Content -match "Next\.js|__NEXT") {
                Write-Host "    ✅ Next.js Detected" -ForegroundColor Green
            }
            
            if ($FrontendResponse.Content -match "<title>.*</title>") {
                $Title = [regex]::Match($FrontendResponse.Content, "<title>(.*?)</title>").Groups[1].Value
                Write-Host "    ✅ Title: $Title" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "    ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    💡 Tip: Frontend might still be building. Wait 2-3 minutes and try again." -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Frontend URL skipped" -ForegroundColor Gray
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host ""

if ($BackendUrl) {
    Write-Host "Backend:"
    Write-Host "  • URL: $BackendUrl" -ForegroundColor Blue
    Write-Host "  • Dashboard: https://railway.com/project/55897222-08c9-4bdf-b448-96891aa7a2df" -ForegroundColor Blue
}

if ($FrontendUrl) {
    Write-Host "Frontend:"
    Write-Host "  • URL: $FrontendUrl" -ForegroundColor Blue
    Write-Host "  • Dashboard: https://railway.com/project/c9001937-e50a-462d-ab9f-0993781b3d2d" -ForegroundColor Blue
}

Write-Host ""
Write-Host "🔗 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Copy your backend URL" -ForegroundColor Yellow
Write-Host "  2. Update frontend NESTJS_URL environment variable" -ForegroundColor Yellow
Write-Host "  3. Redeploy frontend" -ForegroundColor Yellow
Write-Host "  4. Test login on frontend" -ForegroundColor Yellow
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  • DEPLOYMENT_COMPLETE.md - Full guide" -ForegroundColor Gray
Write-Host "  • BACKEND_HEALTH_CHECK.md - Backend troubleshooting" -ForegroundColor Gray
Write-Host "  • QUICK_REFERENCE.txt - Quick lookup" -ForegroundColor Gray
Write-Host ""
