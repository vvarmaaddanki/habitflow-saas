# HabitFlow — Full-Stack Habit Tracker SaaS

[![Demo](https://img.shields.io/badge/Demo-Live-brightgreen?style=for-the-badge)](https://habitflow.vercel.app)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://habitflow.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A production-ready SaaS habit tracking application built with Next.js 14 and TypeScript. Features interactive analytics, gamification elements, and a modern responsive UI.

## Live Links

- **Live Application**: https://habitflow.vercel.app
- **GitHub Repository**: https://github.com/vvarmaaddanki/habit-flow-tracker
- **Vercel Dashboard**: https://vercel.com/dashboard
- **API Documentation**: [Swagger/OpenAPI](https://github.com/vvarmaaddanki/habit-flow-tracker/blob/main/docs/API.md)

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-blue?style=for-the-badge&logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11-black?style=for-the-badge&logo=framer)
![Recharts](https://img.shields.io/badge/Recharts-2.x-ea2b2b?style=for-the-badge)
![NextAuth.js](https://img.shields.io/badge/NextAuth.js-Development-yellow?style=for-the-badge&logo=next-auth)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-white?style=for-the-badge&logo=vercel)

## Features

### 🌟 Gamification System
- **10 Unlockable Achievements** - Track progress and earn rewards
- **4-Step Onboarding Flow** - Personalized habit setup journey
- **12 Pre-built Habit Templates** - Categories like Fitness, Learning, Productivity

### 📊 Interactive Analytics
- **3 Chart Types** - Area, Pie, and Bar charts for habit visualization
- **Real-time Productivity Visualization** - Understand your patterns
- **Habit Completion Dashboard** - Monitor streaks and consistency

### ⚙️ Technical Highlights
- **Server/Client Components** - Optimized rendering performance
- **JWT Authentication** - Secure session management via NextAuth.js Credentials Provider
- **Dynamic Routing** - React Router-like navigation with nested layouts
- **Form State Management** - Responsive form handling with validation
- **Dark/Light Mode** - Theme toggle with system preference detection

### 💾 Persistence & Performance
- **localStorage Integration** - Habit data, completions, and settings persistence
- **Edge Caching Protection** - Optimized for Vercel Edge Network
- **CI/CD Pipeline** - Automated deployments via GitHub Actions

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm/yarn/pnpm
- GitHub account (for authentication)

### Installation

```bash
git clone https://github.com/vvarmaaddanki/habit-flow-tracker.git
cd habit-flow-tracker
npm install
```

### Environment Variables

```bash
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
habit-tracker/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard view
│   └── habits/            # Habit management routes
├── components/             # Reusable UI components
├── lib/                   # Utility functions and helpers
├── models/                # Data models
├── public/                # Static assets
├── styles/                # Global styles
└── types/                 # TypeScript type definitions
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/habits` | GET/POST | Fetch/create habits |
| `/api/habits/[id]` | GET/PUT/DELETE | Habit CRUD operations |
| `/api/completions` | POST | Record habit completions |
| `/api/stats` | GET | Fetch user statistics |

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

```yaml
# .github/workflows/deploy.yml
- On push to main → Automated build and deployment to Vercel
- Pre-deployment testing with Jest
- Lighthouse performance audits
```

## Testing

```bash
npm run test        # Run test suite
npm run test:watch  # Watch mode
npm run test:coverage # Coverage report
```

## Deploy

The application is currently deployed on Vercel with automated CI/CD:

1. Fork the repository
2. Connect to Vercel
3. Configure environment variables
4. Deploy automatically on push

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` file for more information.

## Contact

**Venkatesh Varma Addanki**
- GitHub: [@vvarmaaddanki](https://github.com/vvarmaaddanki)
- LinkedIn: [linkedin.com/in/vvarmaaddanki](https://linkedin.com/in/vvarmaaddanki)
- Email: varmakbm9@gmail.com

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Vercel Deployment Guide](https://vercel.com/docs)

---
*This project is part of my full-stack portfolio. View my other projects [here](https://github.com/vvarmaaddanki).*
