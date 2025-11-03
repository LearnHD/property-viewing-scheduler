# GitHub Pages Setup - Step by Step

## ✅ Your Code is Ready!

Your repository has been initialized and is ready to push to GitHub.

## 📋 Next Steps:

### 1. Create GitHub Repository

1. Go to: **https://github.com/new**
2. **Repository name:** `property-viewing-scheduler` (or any name you like)
3. **Description:** `Property viewing scheduler for 12 Drake Drive`
4. **Visibility:** Make it **PUBLIC** (required for free GitHub Pages)
5. **IMPORTANT:** Do NOT check:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. Click **"Create repository"**

### 2. Push Your Code

After creating the repository, run these commands in your terminal:

```bash
cd property-viewing-scheduler

# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/property-viewing-scheduler.git

git branch -M main

git push -u origin main
```

**OR** use the PowerShell script:
```powershell
.\deploy.ps1
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** (top menu)
3. Click **"Pages"** in the left sidebar
4. Under **"Source"**:
   - **Branch:** Select `main`
   - **Folder:** Select `/ (root)`
5. Click **"Save"**

### 4. Wait for Deployment

GitHub will build your site. This usually takes **1-5 minutes**.

You'll see a message: *"Your site is live at https://YOUR_USERNAME.github.io/property-viewing-scheduler/"*

### 5. Get Your Links

After deployment, your links will be:

- **Booking Page:** `https://YOUR_USERNAME.github.io/property-viewing-scheduler/index.html`
- **Admin Panel:** `https://YOUR_USERNAME.github.io/property-viewing-scheduler/admin.html`

### 6. Copy Booking Link

1. Open your admin panel
2. Scroll to **"Share Booking Link"**
3. Click **"Copy Link"**
4. Share on Facebook, text, or email!

## 🔄 Updating Your Site

Whenever you make changes:

```bash
cd property-viewing-scheduler
git add .
git commit -m "Description of changes"
git push
```

Changes will be live in 1-5 minutes!

## ❓ Troubleshooting

**Site not loading?**
- Wait 5-10 minutes
- Check Settings → Pages is enabled
- Verify repository is public

**Changes not showing?**
- Clear browser cache (Ctrl+F5)
- Wait a few minutes for GitHub to update

**Need help?**
- See `DEPLOYMENT.md` for detailed instructions
- Check GitHub Pages docs: https://docs.github.com/en/pages

---

**Ready to deploy?** Follow steps 1-3 above! 🚀

