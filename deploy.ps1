# PowerShell script to help deploy to GitHub Pages
# Run this after creating your GitHub repository

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub Pages Deployment Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$githubUsername = Read-Host "Enter your GitHub username"
$repoName = Read-Host "Enter repository name (default: property-viewing-scheduler)" 

if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "property-viewing-scheduler"
}

Write-Host ""
Write-Host "Step 1: Creating GitHub repository..." -ForegroundColor Yellow
Write-Host "Please create a new repository on GitHub:" -ForegroundColor Yellow
Write-Host "  1. Go to: https://github.com/new" -ForegroundColor White
Write-Host "  2. Repository name: $repoName" -ForegroundColor White
Write-Host "  3. Make it PUBLIC (required for free GitHub Pages)" -ForegroundColor White
Write-Host "  4. DO NOT initialize with README/gitignore" -ForegroundColor White
Write-Host "  5. Click 'Create repository'" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Have you created the repository? (y/n)"

if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "Please create the repository first, then run this script again." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Step 2: Adding remote and pushing code..." -ForegroundColor Yellow

$remoteUrl = "https://github.com/$githubUsername/$repoName.git"

try {
    git remote add origin $remoteUrl
    Write-Host "✓ Remote added" -ForegroundColor Green
} catch {
    Write-Host "Remote may already exist, continuing..." -ForegroundColor Yellow
}

git branch -M main
Write-Host "✓ Branch renamed to main" -ForegroundColor Green

Write-Host ""
Write-Host "Pushing code to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Code pushed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Step 3: Enable GitHub Pages" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://github.com/$githubUsername/$repoName/settings/pages" -ForegroundColor White
    Write-Host "  2. Source: Select 'main' branch, '/ (root)' folder" -ForegroundColor White
    Write-Host "  3. Click 'Save'" -ForegroundColor White
    Write-Host ""
    Write-Host "Your site will be live at:" -ForegroundColor Cyan
    Write-Host "  Booking: https://$githubUsername.github.io/$repoName/index.html" -ForegroundColor Green
    Write-Host "  Admin:   https://$githubUsername.github.io/$repoName/admin.html" -ForegroundColor Green
    Write-Host ""
    Write-Host "It may take 1-5 minutes for the site to go live." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Error pushing code. Please check:" -ForegroundColor Red
    Write-Host "  1. Repository exists on GitHub" -ForegroundColor White
    Write-Host "  2. You have access to push" -ForegroundColor White
    Write-Host "  3. You're authenticated with GitHub" -ForegroundColor White
}

