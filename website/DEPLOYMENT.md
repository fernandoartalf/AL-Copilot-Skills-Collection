# Deployment Guide

This guide covers local development, production deployment, and rollback procedures for the AL Copilot Skills Collection website.

## Environment Configurations

The site uses environment-based configuration to handle different scenarios:

- **Local Development**: Uses `baseUrl: '/'` for running on `localhost:3000`
- **Production**: Uses `baseUrl: '/al-copilot-skills-site/'` for GitHub Pages deployment

## Local Development

### Start Development Server

```bash
npm start
```

This will:
1. Generate the contributors data
2. Start the dev server at `http://localhost:3000`
3. Enable hot-reloading for live changes

### Build Locally (Test Production Build)

Test the production build locally before deployment:

```bash
npm run serve:prod
```

This builds with production settings and serves at `http://localhost:3000/al-copilot-skills-site/`

## Production Deployment

### Automated Deployment (Recommended)

Production deployment is handled automatically via GitHub Actions:

1. **Merge to `main` branch**: Automatically triggers deployment
2. **Manual Workflow**: Go to Actions → Deploy to GitHub Pages → Run workflow

### Manual Deployment from Local

If needed, you can deploy manually from your local machine:

```bash
npm run deploy:local
```

⚠️ **Warning**: This pushes directly to `gh-pages` branch. Use automated deployment when possible.

## Rollback Procedures

### Method 1: Deploy a Previous Tag (Recommended)

1. **List available tags**:
   ```bash
   git tag -l
   ```

2. **Trigger deployment of a specific tag**:
   - Go to: [Repository Actions](https://github.com/fernandoartalf/al-copilot-skills-site/actions/workflows/deploy.yml)
   - Click "Run workflow"
   - Enter the tag name (e.g., `v1.0.0`)
   - Click "Run workflow"

### Method 2: Revert via Git

1. **Find the commit to revert to**:
   ```bash
   git log --oneline
   ```

2. **Create a revert commit**:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

3. **The automated workflow will deploy the reverted state**

### Method 3: Manual gh-pages Reset (Emergency)

⚠️ **Use only in emergencies** - this rewrites history:

1. **Checkout to a working commit on main**:
   ```bash
   git checkout <working-commit-hash>
   ```

2. **Force push build to gh-pages**:
   ```bash
   npm run build:prod
   git subtree push --prefix build origin gh-pages --force
   ```

3. **Return to main branch**:
   ```bash
   git checkout main
   ```

## Release Management

### Creating a Release Tag

Tag stable releases for easy rollback:

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag to remote
git push origin v1.0.0
```

### Semantic Versioning

Follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH` (e.g., `v1.2.3`)
- **MAJOR**: Breaking changes or major redesign
- **MINOR**: New content, new skills added
- **PATCH**: Bug fixes, typos, small improvements

## Troubleshooting

### Build Fails Locally

```bash
# Clear cache and rebuild
npm run clear
npm ci
npm run build:prod
```

### GitHub Pages Not Updating

1. Check Actions tab for deployment status
2. Verify GitHub Pages settings:
   - Settings → Pages
   - Source: GitHub Actions
3. Wait 2-5 minutes for CDN propagation

### Broken Links Warning

The build may show broken link warnings. To configure:

```typescript
// In docusaurus.config.ts
onBrokenLinks: 'warn', // or 'throw' to fail build
```

## Monitoring

- **Deployment Status**: [GitHub Actions](https://github.com/fernandoartalf/al-copilot-skills-site/actions)
- **Live Site**: https://fernandoartalf.github.io/al-copilot-skills-site/
- **Build Artifacts**: Available in Actions → Recent workflow runs

## Best Practices

1. ✅ **Always test locally** before pushing to main
2. ✅ **Tag stable releases** for easy rollback reference
3. ✅ **Use feature branches** for significant changes
4. ✅ **Monitor Actions** after deployment
5. ✅ **Keep dependencies updated** regularly
6. ❌ **Don't force push to main** branch
7. ❌ **Don't manually edit gh-pages** branch except for emergency rollback
