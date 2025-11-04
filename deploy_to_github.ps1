# Automated GitHub Pages Deployment Script
# This will help you deploy to GitHub Pages

$githubUsername = "LernHD"  # Detected from git config
$repoName = "property-viewing-scheduler"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub Pages Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Checking if repository exists..." -ForegroundColor Yellow
Write-Host ""

# Check if remote already exists
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "✓ Remote already configured: $existingRemote" -ForegroundColor Green
    $useExisting = $true
} else {
    Write-Host "No remote configured yet." -ForegroundColor Yellow
    $useExisting = $false
}

Write-Host ""
Write-Host "IMPORTANT: You need to create the GitHub repository first!" -ForegroundColor Red
Write-Host ""
Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name: $repoName" -ForegroundColor White
Write-Host "3. Make it PUBLIC (required for free GitHub Pages)" -ForegroundColor White
Write-Host "4. DO NOT initialize with README/gitignore/license" -ForegroundColor White
Write-Host "5. Click 'Create repository'" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Have you created the repository? (y/n)"

if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host ""
    Write-Host "Please create the repository first, then run this script again." -ForegroundColor Red
    Write-Host "Or run: git remote add origin https://github.com/$githubUsername/$repoName.git" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Step 2: Configuring remote and pushing code..." -ForegroundColor Yellow

if (-not $useExisting) {
    $remoteUrl = "https://github.com/$githubUsername/$repoName.git"
    Write-Host "Adding remote: $remoteUrl" -ForegroundColor White
    
    try {
        git remote add origin $remoteUrl
        Write-Host "✓ Remote added successfully" -ForegroundColor Green
    } catch {
        Write-Host "Remote may already exist, trying to set URL..." -ForegroundColor Yellow
        git remote set-url origin $remoteUrl
    }
}

# Ensure we're on main branch
Write-Host "Renaming branch to 'main'..." -ForegroundColor White
git branch -M main

# Push code
Write-Host ""
Write-Host "Pushing code to GitHub..." -ForegroundColor Yellow
Write-Host "This may ask for your GitHub credentials." -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ Code pushed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Step 3: Enable GitHub Pages" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Go to: https://github.com/$githubUsername/$repoName/settings/pages" -ForegroundColor White
    Write-Host "2. Under 'Source':" -ForegroundColor White
    Write-Host "   - Branch: Select 'main'" -ForegroundColor White
    Write-Host "   - Folder: Select '/ (root)'" -ForegroundColor White
    Write-Host "3. Click 'Save'" -ForegroundColor White
    Write-Host ""
    Write-Host "Your site will be live at:" -ForegroundColor Cyan
    Write-Host "  Booking: https://$githubUsername.github.io/$repoName/index.html" -ForegroundColor Green
    Write-Host "  Admin:   https://$githubUsername.github.io/$repoName/admin.html" -ForegroundColor Green
    Write-Host ""
    Write-Host "It may take 1-5 minutes for the site to go live." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After enabling Pages, open the admin panel and copy the booking link!" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Error pushing code. Possible issues:" -ForegroundColor Red
    Write-Host "  - Repository doesn't exist yet (create it first)" -ForegroundColor White
    Write-Host "  - Authentication issue (check GitHub credentials)" -ForegroundColor White
    Write-Host "  - Network issue" -ForegroundColor White
    Write-Host ""
    Write-Host "Try manually:" -ForegroundColor Yellow
    Write-Host "  git push -u origin main" -ForegroundColor White
}

