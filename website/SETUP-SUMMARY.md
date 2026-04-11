# Deployment Configuration Summary

## Changes Made

### 1. Environment-Based Configuration

**File**: `docusaurus.config.ts`
- Updated `baseUrl` to use environment-based configuration
- Local development: uses `/` for localhost
- Production: uses `/al-copilot-skills-site/` for GitHub Pages

### 2. Enhanced NPM Scripts

**File**: `package.json`
New scripts added:
- `build:prod` - Build with production environment settings
- `serve:prod` - Test production build locally
- `deploy:local` - Manual deployment to gh-pages (emergency use)

**Dependencies**:
- Added `cross-env` for cross-platform environment variable handling

### 3. GitHub Actions Workflow

**File**: `.github/workflows/deploy.yml`
Features:
- ✅ Automatic deployment on push to `main` branch
- ✅ Manual workflow dispatch with optional tag selection
- ✅ Proper GitHub Pages permissions and concurrency control
- ✅ Node.js 20 with npm caching for faster builds
- ✅ Production build with correct environment variables

### 4. Documentation

**File**: `DEPLOYMENT.md`
Comprehensive guide covering:
- Local development setup
- Production deployment procedures
- Three rollback methods:
  1. Deploy previous tags (recommended)
  2. Git revert strategy
  3. Emergency gh-pages reset
- Release management with semantic versioning
- Troubleshooting guide
- Best practices

**File**: `README.md`
Enhanced with:
- Quick start guide
- Available scripts reference
- Project structure overview
- Technology stack
- Links to resources
- GitHub Actions badge

**File**: `.env.example`
Template for optional environment configuration

## How It Works

### Local Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (uses baseUrl: '/')
npm start
# → Opens http://localhost:3000

# 3. Test production build locally (uses baseUrl: '/al-copilot-skills-site/')
npm run serve:prod
# → Opens http://localhost:3000/al-copilot-skills-site/
```

### Production Deployment Workflow

```
┌─────────────────────────────────────────────────────────┐
│ Developer pushes to main branch                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ GitHub Actions: Deploy Workflow Triggered               │
│  1. Checkout code                                        │
│  2. Setup Node.js 20 with npm cache                      │
│  3. Install dependencies (npm ci)                        │
│  4. Build with NODE_ENV=production                       │
│  5. Upload build artifact                                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ GitHub Pages: Deploy Job                                │
│  - Deploy to github-pages environment                    │
│  - Site URL: https://fernandoartalf.github.io/...       │
└─────────────────────────────────────────────────────────┘
```

### Rollback Workflow

#### Option 1: Tag-Based Rollback (Recommended)

```
┌─────────────────────────────────────────────────────────┐
│ Developer identifies issue with current deployment       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ Go to GitHub Actions → Deploy workflow                  │
│  1. Click "Run workflow"                                 │
│  2. Enter previous tag (e.g., v1.0.0)                    │
│  3. Click "Run workflow"                                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ Workflow checks out tag and deploys that version        │
│ Site is now running the previous stable version         │
└─────────────────────────────────────────────────────────┘
```

## Configuration Details

### Environment Variables

| Variable | Local Dev | Production | Set By |
|----------|-----------|------------|--------|
| `NODE_ENV` | `development` | `production` | npm scripts |
| `baseUrl` | `/` | `/al-copilot-skills-site/` | config logic |

### Branch Strategy

- `main` - Production branch (auto-deploys)
- `feature/*` - Feature branches (no deployment)
- `gh-pages` - Deployment target (managed by workflow)

### Tagging Strategy

Use semantic versioning for releases:

```bash
# Major release (breaking changes)
git tag -a v2.0.0 -m "Major redesign with new structure"

# Minor release (new skills added)
git tag -a v1.1.0 -m "Added 5 new AL skills"

# Patch release (bug fixes)
git tag -a v1.0.1 -m "Fixed broken links and typos"

# Push tags
git push origin --tags
```

## Testing Checklist

Before deploying to production:

- [ ] Run `npm run build:prod` locally - no errors
- [ ] Run `npm run serve:prod` - verify site works with production baseUrl
- [ ] Check all navigation links work
- [ ] Verify search functionality
- [ ] Test on mobile viewport
- [ ] Review broken link warnings (acceptable if intentional)

## Monitoring

After deployment:

1. **Check workflow status**: [Actions tab](https://github.com/fernandoartalf/al-copilot-skills-site/actions)
2. **Verify deployment**: Visit https://fernandoartalf.github.io/al-copilot-skills-site/
3. **Check console**: Open browser DevTools for any errors
4. **Test key pages**: Navigate through main documentation sections

## Emergency Contacts

If issues arise:

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
2. Review recent commits: `git log --oneline -10`
3. Check GitHub Actions logs for error details
4. Use rollback procedures documented above

## Next Steps

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Ensure source is set to "GitHub Actions"

2. **First Deployment**:
   - Merge changes to `main` branch
   - Monitor Actions tab for deployment status
   - Verify site is live after 2-5 minutes

3. **Create First Release Tag**:
   ```bash
   git tag -a v1.0.0 -m "Initial release"
   git push origin v1.0.0
   ```

## Benefits

✅ **Separation of Concerns**: Local uses `baseUrl: '/'`, production uses correct path
✅ **Automated Deployment**: Push to main = automatic deployment
✅ **Rollback Safety**: Deploy any previous tag with one click
✅ **Testing**: Can test production build locally before deploying
✅ **Version Control**: Semantic versioning with git tags
✅ **Documentation**: Complete guides for development and operations
✅ **Monitoring**: GitHub Actions provides deployment history and logs
