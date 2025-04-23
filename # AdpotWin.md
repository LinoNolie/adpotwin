# AdpotWin

A Windows adpot helper project.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the project:
```bash
npm start
```

## Build

To build the project:
```bash
npm run build
```

## Build Configuration

1. Add TypeScript configuration:
```bash
npm install --save-dev typescript @types/node
npx tsc --init
```

2. Create/update scripts in package.json:
```json
{
  "scripts": {
    "build": "tsc && next build",
    "type-check": "tsc --noEmit",
    "dev": "next dev",
    "start": "next start"
  }
}
```

3. Verify your tsconfig.json has:
```json
{
  "compilerOptions": {
    "strict": true,
    "allowJs": true,
    "checkJs": true,
    "noEmit": true,
    "jsx": "preserve",
    "moduleResolution": "node"
  }
}
```

## Command Prompt Setup

1. Always run commands from project root:
```bash
# Navigate to project directory
cd C:\Users\User\Desktop\adpotwin

# Verify you're in the right place
dir
# Should show:
#   package.json
#   next.config.js
#   pages/
#   etc...
```

All commands in this documentation should be run from:
```
C:\Users\User\Desktop\adpotwin>
```

## Git Deployment

1. Stage all changes:
```bash
git add .
```

2. Create a commit:
```bash
git commit -m "Setup Next.js with TypeScript configuration"
```

3. Push to GitHub:
```bash
git push origin main
```

If push is rejected, first fetch and merge remote changes:
```bash
git fetch origin
git pull --rebase origin main
```

If there are conflicts, resolve them and then:
```bash
git add .
git rebase --continue
```

Finally, push your changes:
```bash
git push origin main
```

Alternative (if rebase is problematic):
```bash
git fetch origin
git merge origin/main
git push origin main
```

If this is your first push, you might need to:
```bash
git branch -M main
git remote add origin https://github.com/LinoNoLie/adpotwin.git
git push -u origin main
```

## Git Conflict Resolution

1. If you encounter merge conflicts:
```bash
# Check status of conflicts
git status

# If things get messy, abort rebase
git rebase --abort

# Reset to clean state
git reset --hard HEAD

# Get latest changes
git fetch origin
git reset --hard origin/main

# Add your new changes
git add .
git commit -m "Your commit message"
git push origin main
```

## Git Repository Cleanup

1. Initialize and setup repository:
```bash
# Initialize git if needed
git init

# Create .gitignore first
echo node_modules/ > .gitignore
echo .next/ >> .gitignore
echo dist/ >> .gitignore

# Initial commit with .gitignore
git add .gitignore
git commit -m "Add .gitignore"

# Add remaining files
git add .
git commit -m "Initial commit"

# Set main branch and origin
git branch -M main
git remote add origin https://github.com/linonolie/adpotwin.git

# Force push to main
git push -f origin main
```

2. Cleanup if directories exist:
```bash
# Safe cleanup for Windows - only removes if exists
if exist node_modules\ rd /s /q node_modules
if exist .next\ rd /s /q .next

# Clear git cache
git rm -r --cached .
git clean -fdx

# Re-add everything except ignored files
git add .
git commit -m "Clean repository and remove node_modules"
```

3. Force push clean repository:
```bash
# Create new clean branch
git checkout --orphan clean_branch

# Move all changes to new branch
git add .
git commit -m "Clean start without node_modules"

# Replace main branch
git branch -D main
git branch -m main
git push -f origin main

# Verify clean push
git status
```

4. Reinstall dependencies:
```bash
npm install
```

## Vercel Deployment

1. Configure build settings in Vercel:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

2. Add Build Environment Variables:
   - `NODE_ENV`: `production`
   - `NEXT_TELEMETRY_DISABLED`: `1`

3. If build fails:
   - Check Vercel logs for specific type errors
   - Run `npm run type-check` locally to find issues
   - Fix any TypeScript errors in your code

## Vercel Deployment Steps

1. Login to Vercel:
   - Go to vercel.com/login
   - Sign in with GitHub

2. Import Repository:
   - Click "Add New Project" button (top-right corner)
   - Under "Import Git Repository", find and select "LinoNoLie/adpotwin"

3. Configure Project (on the import page):
   - In the "Configure Project" screen:
     - Project Name: leave as "adpotwin"
     - Framework Preset: should auto-detect "Next.js"
     - Root Directory: leave as "./" (default)
   - Expand "Build and Output Settings":
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm install`
   - Leave "Environment Variables" empty
   - Click "Deploy" button at the bottom

4. After Deploy:
   - Wait for "Congratulations!" screen
   - Click "Continue to Dashboard"
   - Your site will be at adpotwin.vercel.app

## Vercel Deployment Status

1. Current Deployment:
   - Status: Ready
   - Environment: Production
   - Source: main (76d8bf6)
   - Duration: 3s

2. Active Domains:
   - Primary: adpotwin.vercel.app
   - Preview: adpotwin-git-main-linonolies-projects.vercel.app
   - Branch: adpotwin-5zgxnup53-linonolies-projects.vercel.app

3. Next Steps:
   - Verify primary domain works: https://adpotwin.vercel.app
   - Configure custom domain www.adpot.win in Vercel:
     1. Go to Project Settings > Domains
     2. Add Domain: www.adpot.win
     3. Follow Vercel's DNS configuration instructions

Note: Your deployment is successful. Now we can proceed with custom domain setup.

## GitHub Configuration

1. Verify your GitHub connection:
```bash
git remote -v
```

2. Ensure your repository is up to date:
```bash
git fetch origin
git status
```

3. If needed, pull latest changes:
```bash
git pull origin main
```

## Domain Configuration (Porkbun)

1. Login to Porkbun dashboard at https://porkbun.com/account/login
2. After purchasing the domain www.adpot.win, go to "Account" > "Domains"
3. Click on "adpot.win" in your domain list
4. Navigate to "DNS Records" tab
5. Before adding DNS records, you'll need your server IP which comes from:
   - Recommended: Use Vercel (Free tier):
     1. Sign up at vercel.com
     2. Connect your GitHub repository
     3. Deploy automatically
     4. Use the provided domain (*.vercel.app) or add your custom domain
   
   - Alternative options:
     - Netlify (Free tier): Similar to Vercel, great for static sites
     - Railway.app ($5-10/month): Good for full-stack Node.js apps
     - DigitalOcean App Platform ($5/month): Managed hosting solution
     - Heroku ($5/month): Classic choice for Node.js apps
6. Configure DNS records:
   ```
   Type    Host    TTL     Value
   A       @       600     <your-server-ip>
   CNAME   www     600     @
   ```
7. Wait for DNS propagation (up to 48 hours)

Note: The server IP is NOT provided by Porkbun - they only manage the DNS records. You need to have your website hosted somewhere first to get the IP address.

## Porkbun DNS Configuration Steps

1. In Porkbun's "Manage DNS Records" page:

2. Delete any existing A or CNAME records for clean setup

3. Add these records exactly (click "Add Record" for each):

First Record:
```
Record Type: A
Name: @ (or leave blank)
Answer: 76.76.21.21
TTL: 600
```

Second Record:
```
Record Type: CNAME
Name: www
Answer: adpotwin.vercel.app.
TTL: 600
```

Important Notes:
- Make sure to include the trailing dot (.) in the CNAME Answer
- Don't change any other DNS records
- Click "Save" after adding each record

4. Verify the records match exactly:
   - A record points to Vercel's IP (76.76.21.21)
   - CNAME record points to your Vercel app (adpotwin.vercel.app.)
   - Both TTLs are set to 600

## DNS Verification Steps

1. Current Status Check:
```bash
# Check these URLs in your browser:
1. adpotwin.vercel.app    - Should show your site
2. www.adpot.win          - Should redirect to Vercel (might take up to 24h)
3. adpot.win              - Should redirect to Vercel (might take up to 24h)

# If www.adpot.win shows "Domain Not Found":
1. DNS propagation is still in progress
2. Wait up to 24 hours
3. You can check propagation at: https://www.whatsmydns.net/#A/adpot.win
```

## Connecting Vercel, GitHub, and Porkbun

1. Vercel Deployment URL:
```
Current URL: adpotwin.vercel.app
Target URL: www.adpot.win
```

2. Connect Vercel to GitHub:
```bash
# In Vercel Dashboard:
1. Go to Project Settings
2. Select "Git" tab
3. Click "Connect to GitHub"
4. Select repository "adpotwin"
5. Enable "Auto Deploy"
```

3. Get Vercel Domain Settings:
```bash
# In Vercel Dashboard:
1. Go to Project Settings > Domains
2. Note down the following:
   - Nameservers provided by Vercel
   - Or the A/CNAME records if using DNS records
```

4. Configure Porkbun DNS:
```bash
# Login to Porkbun and:
1. Go to adpot.win domain settings
2. Click "Edit DNS Records"
3. Add these records:
   Type    Name    TTL     Value
   A       @       600     76.76.21.21    # Vercel's IP
   CNAME   www     600     adpotwin.vercel.app
```

5. Verify Domain in Vercel:
```bash
# In Vercel Dashboard:
1. Go to Settings > Domains
2. Add "www.adpot.win"
3. Wait for verification (up to 24 hours)
4. Status should show "Valid Configuration"
```

Note: Use Vercel's assigned IP/CNAME values, not the example ones shown above.

## Handling Large Repositories

1. Configure Git for large files:
```bash
git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 1000
git config --global http.lowSpeedTime 300
```

2. Clean repository:
```bash
# Remove git history
git checkout --orphan temp_branch
git add .
git commit -m "Fresh start with clean history"

# Delete old branch and rename temp
git branch -D main
git branch -m main

# Force push with longer timeout
git push -f --verbose --progress origin main
```

Note: If push still fails, try pushing in chunks or use GitHub CLI.

## Git Push Recovery Steps

1. Clean and reinitialize:
```bash
# Remove git tracking
rd /s /q .git

# Initialize fresh repository
git init
git add .
git commit -m "Fresh start"

# Set branch and remote
git branch -M main
git remote add origin https://github.com/LinoNoLie/adpotwin.git

# Force push
git push -f origin main
```

If you get authentication errors:
```bash
# Configure git credentials
git config --global user.name "LinoNoLie"
git config --global user.email "your-email@example.com"
```

## Quick Force Push Steps

1. Add current changes:
```bash
# Stage and commit changes
git add .
git commit -m "Update Next.js configuration"

# Force push
git push -f origin main
```

Note: Only use force push if you're sure you want to override the remote repository.

## Local Development Workflow

1. Daily development cycle:
```bash
# Start local development server
npm run dev   # Site will be at http://localhost:3000

# Make changes to your code and test locally
# When ready to deploy:
git add .
git commit -m "Description of your changes"
git push origin main   # Vercel will auto-deploy
```

2. What happens after push:
- GitHub stores your code
- Vercel automatically builds and deploys from GitHub
- Changes appear on:
  1. adpotwin.vercel.app
  2. www.adpot.win 

3. No need to touch Porkbun again unless:
- Changing domain settings
- Adding new domains
- DNS configuration issues

## Git Push Rejection Fix

1. First, fetch and merge remote changes:
```bash
git fetch origin main
git pull origin main
```

2. If there are conflicts, resolve them and:
```bash
git add .
git commit -m "Merge remote changes"
```

3. Then push your changes:
```bash
git push origin main
```

Alternative if pull fails:
```bash
git pull --rebase origin main
git push origin main
```

## Deployment Configuration

1. GitHub Pages Deployment:
```bash
npm run export  # Creates 'out' directory for GitHub Pages
```

2. Vercel Deployment Settings:
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

Note: The site is available at:
- GitHub Pages: https://linonolie.github.io/adpotwin/
- Vercel: https://adpotwin.vercel.app (when fixed)
- Custom Domain: www.adpot.win (when DNS propagates)

## GitHub Pages Directory Structure

Required structure for GitHub Pages deployment:
```
out/                    # Root directory for GitHub Pages
├── .nojekyll          # Tells GitHub Pages not to use Jekyll
├── index.html         # Entry point (redirects to /adpotwin/)
├── _next/             # Next.js assets
│   └── static/        # Static assets
│       ├── chunks/    # JavaScript bundles
│       ├── css/       # Stylesheets
│       └── media/     # Images, fonts
└── adpotwin/         # Your app's base path
    └── index.html    # Your app's main page
```

To generate this structure:
1. First create these files:
   - /out/.nojekyll (empty file)
   - /out/index.html (redirect to /adpotwin/)
   - /out/adpotwin/index.html (your app)

2. Build will generate:
   - _next/static/chunks/ (JS files)
   - _next/static/css/ (styles)
   - _next/static/media/ (assets)

Note: The build process will populate static directories automatically.
