# Quick Setup Script for Git and Deployment

# This script helps you quickly setup Git and prepare for deployment
# Run each section step by step

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Performance Dashboard Setup Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
$projectPath = "c:\Users\HP\OneDrive\Desktop\Projects\Flam_assignment\performance-dashboard"
Set-Location $projectPath

Write-Host "Current directory: $projectPath" -ForegroundColor Green
Write-Host ""

# Step 1: Check if Git is initialized
Write-Host "Step 1: Checking Git status..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✓ Git already initialized" -ForegroundColor Green
} else {
    Write-Host "× Git not initialized" -ForegroundColor Red
    $initGit = Read-Host "Initialize Git repository? (y/n)"
    if ($initGit -eq "y") {
        git init
        Write-Host "✓ Git initialized" -ForegroundColor Green
    }
}
Write-Host ""

# Step 2: Check build status
Write-Host "Step 2: Testing build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful" -ForegroundColor Green
} else {
    Write-Host "× Build failed - please fix errors first" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Add files to Git
Write-Host "Step 3: Adding files to Git..." -ForegroundColor Yellow
git add .
Write-Host "✓ Files added" -ForegroundColor Green
Write-Host ""

# Step 4: Create initial commit
Write-Host "Step 4: Creating commit..." -ForegroundColor Yellow
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Initial commit: Performance Dashboard with Next.js 14"
}
git commit -m "$commitMessage"
Write-Host "✓ Commit created" -ForegroundColor Green
Write-Host ""

# Step 5: Check GitHub remote
Write-Host "Step 5: GitHub setup..." -ForegroundColor Yellow
$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl) {
    Write-Host "✓ GitHub remote already configured: $remoteUrl" -ForegroundColor Green
} else {
    Write-Host "× No GitHub remote found" -ForegroundColor Red
    Write-Host "To add remote:" -ForegroundColor Cyan
    Write-Host "  1. Create repository on GitHub: https://github.com/new" -ForegroundColor Cyan
    Write-Host "  2. Run: git remote add origin https://github.com/USERNAME/performance-dashboard.git" -ForegroundColor Cyan
    Write-Host "  3. Run: git push -u origin main" -ForegroundColor Cyan
}
Write-Host ""

# Step 6: Display next steps
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Create GitHub repository:" -ForegroundColor Yellow
Write-Host "   https://github.com/new" -ForegroundColor White
Write-Host ""
Write-Host "2. Add remote and push:" -ForegroundColor Yellow
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/performance-dashboard.git" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "3. Deploy to Vercel:" -ForegroundColor Yellow
Write-Host "   npm install -g vercel" -ForegroundColor White
Write-Host "   vercel login" -ForegroundColor White
Write-Host "   vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "4. Test deployment:" -ForegroundColor Yellow
Write-Host "   Open the Vercel URL in your browser" -ForegroundColor White
Write-Host "   Navigate to /dashboard" -ForegroundColor White
Write-Host "   Verify 60 FPS performance" -ForegroundColor White
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "  - DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host "  - SUBMISSION_CHECKLIST.md" -ForegroundColor White
Write-Host "==================================" -ForegroundColor Cyan
