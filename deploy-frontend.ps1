#!/bin/pwsh
# ESRC Cameroon - Simplified Deployment Script
# This script helps deploy the frontend to Vercel

param(
    [string]$BackendUrl = "",
    [string]$Environment = "production"
)

$FrontendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "🚀 ESRC Cameroon Frontend Deployment" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Step 1: Update environment variables
Write-Host "📝 Step 1: Updating environment variables..." -ForegroundColor Yellow
if ($BackendUrl) {
    Write-Host "Backend URL: $BackendUrl" -ForegroundColor Cyan
    @"
NEXT_PUBLIC_API_URL=/api
NESTJS_URL=$BackendUrl
"@ | Out-File "$FrontendDir\.env.local" -Encoding UTF8
    Write-Host "✅ .env.local updated" -ForegroundColor Green
} else {
    Write-Host "⚠️  No backend URL provided. Using placeholder." -ForegroundColor Yellow
    Write-Host "   Update NESTJS_URL in .env.local before deployment" -ForegroundColor Yellow
}

# Step 2: Install dependencies
Write-Host ""
Write-Host "📦 Step 2: Installing dependencies..." -ForegroundColor Yellow
Push-Location $FrontendDir
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Step 3: Build
Write-Host ""
Write-Host "🔨 Step 3: Building project..." -ForegroundColor Yellow
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green

# Step 4: Deploy
Write-Host ""
Write-Host "🌐 Step 4: Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "Choose your deployment method:" -ForegroundColor Cyan
Write-Host "1. Vercel (Recommended)"
Write-Host "2. Railway"
Write-Host "3. Docker (Local testing)"
Write-Host ""

Write-Host "For Vercel deployment, run:" -ForegroundColor Green
Write-Host "  vercel deploy --prod" -ForegroundColor Cyan
Write-Host ""

Write-Host "For Railway deployment, run:" -ForegroundColor Green
Write-Host "  railway link" -ForegroundColor Cyan
Write-Host "  railway up --detach" -ForegroundColor Cyan
Write-Host ""

Write-Host "For local Docker testing, run:" -ForegroundColor Green
Write-Host "  docker build -t esrc-frontend ." -ForegroundColor Cyan
Write-Host "  docker run -p 3000:3000 esrc-frontend" -ForegroundColor Cyan
Write-Host ""

Pop-Location
Write-Host "✅ Deployment script complete!" -ForegroundColor Green
