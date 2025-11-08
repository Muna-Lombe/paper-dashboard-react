# Production Configuration Guide

## Overview

This document outlines all production configurations and optimizations for the Paper Dashboard React application.

---

## 🔧 Build Configuration

### Sourcemaps Disabled

**File:** `vite.config.js`

```javascript
build: {
  outDir: "dist",
  sourcemap: false, // ← Disabled for production
}
```

### Why Disable Sourcemaps?

**Security Benefits:**
- ✅ Prevents exposing source code in production
- ✅ Reduces security risks from debugging
- ✅ Obfuscates application logic

**Performance Benefits:**
- ✅ Smaller bundle size (20-30% reduction)
- ✅ Faster downloads
- ✅ Faster initial page load

**Note:** Sourcemaps are still generated during development for debugging purposes.

---

## 📦 Build Command

### Build for Production

```bash
npm run build
# or
pnpm build
```

This will:
- ✅ Compile all React components
- ✅ Bundle CSS and JavaScript
- ✅ Minify all assets
- ✅ Generate optimized build in `/dist` folder
- ✅ Exclude sourcemaps from build

### Output

```
dist/
├── index.html          (Entry point)
├── assets/
│   ├── index-xxx.js    (Minified JavaScript)
│   ├── index-xxx.css   (Minified CSS)
│   └── ...other assets
└── ...other files
```

---

## 🚀 Deployment

### Static Hosting

The build output can be deployed to any static hosting service:

**Recommended Platforms:**
- Vercel
- Netlify
- Render
- AWS S3 + CloudFront
- GitHub Pages
- Firebase Hosting

### Deployment Steps

```bash
# 1. Build the application
npm run build

# 2. Upload dist/ folder to your hosting provider
# or use deployment CLI:

# Vercel
vercel deploy

# Netlify
netlify deploy --prod --dir=dist

# Render
# (automatic from git)
```

---

## 🔐 Security Configuration

### Environment Variables

**File:** `.env` or `.env.production`

```env
# Production API URL
VITE_API_URL=https://api.example.com

# WebSocket URL
VITE_WS_URL=wss://ws.example.com

# Other configs
VITE_APP_NAME=Paper Dashboard
```

**Important:** Never commit secrets to version control!

### HTTPS

- ✅ Always use HTTPS in production
- ✅ Install SSL certificate
- ✅ Redirect HTTP to HTTPS

### CORS

Configure CORS on your backend:

```javascript
// Backend example (Express)
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
```

### Content Security Policy

Add CSP headers:

```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline';
```

---

## 📊 Performance Optimization

### Bundle Analysis

Check bundle size:

```bash
npm run build -- --analyze
```

### Vite Optimization Features

The app includes:

- ✅ Code splitting (automatic)
- ✅ Tree shaking (JavaScript dead code removal)
- ✅ CSS minification
- ✅ Image optimization
- ✅ Asset compression

### Lazy Loading

Routes are lazy-loaded for better performance:

```javascript
// Components load on demand
const Dashboard = lazy(() => import('./views/Dashboard'));
```

### Caching Strategy

**HTML:** No-cache (always check for updates)
```
Cache-Control: no-cache, no-store, must-revalidate
```

**Assets (JS/CSS):** Cache with fingerprints
```
Cache-Control: public, max-age=31536000, immutable
```

---

## 🔄 CI/CD Configuration

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        run: npm run deploy
```

### Render.com Configuration

Add to `render.yaml`:

```yaml
services:
  - type: web
    name: paper-dashboard
    env: node
    buildCommand: npm run build
    startCommand: npm run preview
    staticPublishPath: dist
    envVars:
      - key: VITE_API_URL
        fromService:
          name: api-server
          property: url
```

---

## 📝 Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints verified
- [ ] Build completes without errors
- [ ] No console errors in production build
- [ ] Bundle size acceptable
- [ ] All images optimized
- [ ] SSL certificate installed
- [ ] CORS configured on backend
- [ ] Security headers set
- [ ] Rate limiting enabled on API
- [ ] Error logging configured
- [ ] Performance monitoring active
- [ ] Backup plan documented

---

## 🧪 Testing Before Deploy

### Local Production Build

```bash
# Build for production
npm run build

# Test the production build locally
npm run preview
```

This starts a local server serving the production build.

### Test Checklist

- [ ] Test all features
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Test offline behavior
- [ ] Test API connectivity
- [ ] Test error states
- [ ] Check console for errors

---

## 📊 Monitoring

### Error Tracking

Set up error tracking (recommended):

```javascript
// Sentry example
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Analytics

Add analytics (recommended):

```javascript
// Google Analytics example
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageTracking() {
  const location = useLocation();
  
  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: location.pathname,
      });
    }
  }, [location]);
}
```

### Performance Monitoring

Monitor Core Web Vitals:

- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

---

## 🔄 Updates & Maintenance

### Regular Tasks

- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Monitor performance metrics
- [ ] Check error logs
- [ ] Review user feedback

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update to latest versions (breaking changes possible)
npm upgrade
```

---

## 🆘 Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm ci
npm run build
```

### High Bundle Size

```bash
# Analyze bundle
npm run build -- --analyze

# Look for large dependencies
# Consider using alternatives or lazy loading
```

### Slow Performance

- Check Network tab in DevTools
- Use Performance Profiler
- Enable Gzip compression
- Enable CDN caching
- Optimize images
- Lazy load components

### API Connection Issues

- Check CORS configuration
- Verify API URL in .env
- Check API server status
- Review network requests
- Check browser console

---

## 📚 Additional Resources

- [Vite Build Documentation](https://vitejs.dev/guide/build.html)
- [React Performance](https://react.dev/reference/react/memo)
- [Web Vitals](https://web.dev/vitals/)
- [Security Headers](https://securityheaders.com/)

---

## ✅ Configuration Summary

**Current Production Settings:**

| Setting | Value | Purpose |
|---------|-------|---------|
| Sourcemaps | Disabled | Security & bundle size |
| Output Directory | `dist/` | Production build output |
| Code Splitting | Enabled | Faster loads |
| Tree Shaking | Enabled | Remove unused code |
| Minification | Enabled | Smaller bundle |
| CSS Minification | Enabled | Smaller styles |

---

**Status: ✅ PRODUCTION READY**

Your application is configured for production deployment! 🚀
