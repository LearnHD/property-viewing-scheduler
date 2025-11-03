# GitHub Pages Deployment Guide

## Step-by-Step Instructions

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository name: `property-viewing-scheduler` (or any name you prefer)
4. Description: `Property viewing scheduler for 12 Drake Drive`
5. Set to **Public** (required for free GitHub Pages)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

### Step 2: Push Your Code to GitHub

After creating the repository, GitHub will show you commands. Use these commands in your terminal:

```bash
cd property-viewing-scheduler
git remote add origin https://github.com/YOUR_USERNAME/property-viewing-scheduler.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username.**

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** (top menu)
3. Scroll down to **"Pages"** in the left sidebar
4. Under **"Source"**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **"Save"**

### Step 4: Your Site is Live!

Your site will be live at:
- **Booking Page:** `https://YOUR_USERNAME.github.io/property-viewing-scheduler/index.html`
- **Admin Panel:** `https://YOUR_USERNAME.github.io/property-viewing-scheduler/admin.html`

**Note:** It may take a few minutes for the site to go live (usually 1-5 minutes).

### Step 5: Get Your Booking Link

1. Go to your admin panel: `https://YOUR_USERNAME.github.io/property-viewing-scheduler/admin.html`
2. Scroll down to **"Share Booking Link"**
3. Click **"Copy Link"**
4. Share this link on Facebook, text messages, or email!

## Custom Domain (Optional)

If you want to use a custom domain (e.g., `bookings.yourdomain.com`):
1. In GitHub Pages settings, add your custom domain
2. Update DNS records with your domain provider
3. See [GitHub Pages custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

## Updating Your Site

Whenever you make changes:

```bash
cd property-viewing-scheduler
git add .
git commit -m "Update: description of changes"
git push
```

Changes will be live in 1-5 minutes!

## Troubleshooting

### Site not loading?
- Wait 5-10 minutes for GitHub to build
- Check repository settings → Pages to ensure it's enabled
- Verify you're using the correct URL

### Changes not showing?
- Clear your browser cache
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Wait a few minutes for GitHub to update

### Need help?
- Check GitHub Pages documentation: https://docs.github.com/en/pages
- Verify your repository is public (free tier requires public repos)

---

**Your booking link is ready to share!** 🎉

