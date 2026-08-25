#!/bin/bash
# Vercel Deploy Script
# This fixes the projectSettings issue by using Vercel's API directly

VERCEL_TOKEN="$VERCEL_TOKEN"
PROJECT_ID="prj_f9v5ZXtydjhjxiBGFfaR5ZBNVyri"
ORG_ID="team_chl4MsDhj6ItfW7EiFqURfKY"

echo "Updating Vercel project settings..."

curl -X PATCH "https://api.vercel.com/v9/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "buildCommand": "pnpm build",
    "installCommand": "pnpm install",
    "outputDirectory": ".next",
    "nodeVersion": "24.x"
  }'

echo "Deploying to Vercel..."
vercel deploy --prod
