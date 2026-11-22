# Habit Tracker - Deployment Guide

## Quick Deploy to Vercel (Recommended - 5 minutes)

### Option 1: Vercel CLI (Fastest)
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Option 2: GitHub + Vercel Dashboard
1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit: Habit Tracker with NextAuth"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/habit-tracker.git
git push -u origin main
```

2. Go to https://vercel.com/new
3. Import your repository
4. Add Environment Variables:
   - `NEXTAUTH_SECRET` = your-secret-key (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` = https://your-app.vercel.app (after first deploy, update this)
5. Deploy

## Environment Variables for Production
```env
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

## What This Project Demonstrates
- **Next.js 14 App Router** with TypeScript
- **NextAuth.js** for authentication (Credentials provider)
- **Server Components** + Client Components
- **Tailwind CSS** for styling
- **React Hooks** (useState, useSession)
- **RESTful API routes** (NextAuth endpoint)

## Resume Bullet Points
- Built a full-stack habit tracking app with Next.js 14, TypeScript, and NextAuth.js
- Implemented authentication flow with secure session management
- Created responsive UI with Tailwind CSS featuring streak tracking
- Deployed to Vercel with CI/CD pipeline
- Used Server Components for optimal performance and SEO

## Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js (Credentials provider)
- **Deployment**: Vercel
- **Package Manager**: npm