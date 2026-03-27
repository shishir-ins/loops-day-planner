# 🚀 GitHub Pages Deployment Guide

## Quick Deployment Steps

### 1. Push to GitHub
```bash
# If you haven't set up remote yet
git remote add origin https://github.com/[YOUR_USERNAME]/loops-day-planner.git

# Push to GitHub
git push -u origin main
```

### 2. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under "Build and deployment", set:
   - Source: **GitHub Actions**
5. Click **Save**

### 3. Automatic Deployment
- GitHub Actions will automatically build and deploy your site
- Your site will be available at: `https://[YOUR_USERNAME].github.io/loops-day-planner/`

### 4. Access Your Live Site
- **User Page**: `https://[YOUR_USERNAME].github.io/loops-day-planner/`
- **Admin Panel**: `https://[YOUR_USERNAME].github.io/loops-day-planner/admin`
- **Daily Planner**: `https://[YOUR_USERNAME].github.io/loops-day-planner/planner`

## 📱 Access Credentials
- **User Passcode**: `iloveyou`
- **Admin Passcode**: `loopsadmin`

## 🔧 Manual Deployment (Alternative)

If GitHub Actions doesn't work, you can deploy manually:

```bash
# Build the project
npm run build

# Create gh-pages branch
git checkout --orphan gh-pages

# Copy dist files
cp -r dist/* .

# Add and push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

Then in GitHub Settings → Pages, select:
- Source: **Deploy from a branch**
- Branch: **gh-pages**
- Folder: **/(root)**

## 🌐 Custom Domain (Optional)

To use a custom domain:
1. Go to repository Settings → Pages
2. Add your custom domain
3. Configure DNS records as instructed by GitHub

## 📊 Deployment Status

After pushing to GitHub, check:
1. **Actions** tab to see build progress
2. **Settings → Pages** to see deployment status
3. **Environments** to check if deployment succeeded

## 🐛 Troubleshooting

### Build Fails
- Check if all dependencies are installed
- Verify environment variables are set
- Check Actions tab for error logs

### 404 Errors
- Ensure base path in `vite.config.ts` matches your repo name
- Check GitHub Pages settings
- Verify the build completed successfully

### Styles Not Loading
- Check if CSS files are in the dist folder
- Verify base path configuration
- Check browser console for errors

---

**Your website is ready to deploy! 🎉**
