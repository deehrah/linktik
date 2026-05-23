# LinkTik - QR Code & Link Management Platform

> Shorten links. Generate QR codes. Sell event tickets.

A complete link management and event ticketing platform for the Nigerian market.

## 🎯 Project Overview

LinkTik is a SaaS platform that provides:

- **Link Shortening**: Convert long URLs into short, memorable links
- **QR Code Generation**: Create customizable QR codes for any URL
- **Event Ticketing**: Sell tickets online with QR code validation
- **Analytics**: Track clicks, scans, and ticket sales

### Target Market

- Nigerian businesses, marketers, and event organizers
- Mobile-first users with varying internet connectivity
- Price-sensitive market requiring affordable solutions

### Business Model

- Freemium SaaS (free tier + paid subscriptions)
- Transaction fees on ticket sales (7% + payment processing)
- Enterprise white-label solutions

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Zustand
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Deployment**: Railway / Render

### Database
- **Primary**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Hosting**: Supabase / Railway

### Third-Party Services
- **Payments**: Paystack
- **Email**: Resend / SendGrid
- **SMS**: Termii
- **Storage**: AWS S3 / Cloudinary
- **Analytics**: Mixpanel / PostHog
- **Error Tracking**: Sentry
- **CDN**: Cloudflare

## 📁 Project Structure

```
linktik/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities & helpers
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript types
│   └── public/              # Static assets
│
├── backend/                 # Express API server
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript types
│   │   └── index.ts       # Entry point
│   ├── prisma/            # Database schema & migrations
│   └── tests/             # Test files
│
├── scanner-app/            # PWA for ticket scanning
│   ├── app/               # Scanner UI
│   └── components/
│
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_SPECIFICATION.md
│   └── ...
│
└── infrastructure/         # DevOps & deployment
    └── configs/
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm/yarn
- PostgreSQL 15+
- Redis 7+
- Git

### Development Setup

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/linktik.git
cd linktik
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Start Database Services

```bash
docker-compose up -d
```

#### 4. Backend Setup

```bash
cd backend
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Backend runs on `http://localhost:5000`

#### 5. Frontend Setup

```bash
cd ../frontend
cp .env.local.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`

#### 6. Scanner App Setup

```bash
cd ../scanner-app
cp .env.local.example .env.local
npm run dev
```

Scanner runs on `http://localhost:3001`

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Scanner App**: http://localhost:3001
- **API Docs**: http://localhost:5000/api-docs

## 📖 Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System design and components
- [Database Schema](./docs/DATABASE_SCHEMA.md) - Database tables and relationships
- [API Specification](./docs/API_SPECIFICATION.md) - REST API endpoints
- [Frontend Guide](./docs/FRONTEND_GUIDE.md) - UI/UX specifications
- [Security](./docs/SECURITY.md) - Security implementation
- [Business Logic](./docs/BUSINESS_LOGIC.md) - Core algorithms
- [Deployment](./docs/DEPLOYMENT.md) - Production deployment guide

## 🎯 MVP Features (Phase 1)

### Core Features
- ✅ User authentication (signup, login, password reset)
- ✅ Link shortening with random codes
- ✅ Basic QR code generation (PNG, black/white)
- ✅ Link redirect service
- ✅ Click analytics (basic counting)
- ✅ User dashboard (view links & QR codes)

### Ticketing Features
- ✅ Create simple events (1 ticket type)
- ✅ Public event page
- ✅ Ticket purchase flow
- ✅ Paystack payment integration
- ✅ QR ticket generation & email delivery
- ✅ Basic scanner app (online validation)

### Infrastructure
- ✅ PostgreSQL database
- ✅ Redis caching
- ✅ File storage (S3/Cloudinary)
- ✅ Email service
- ✅ Basic error tracking

## 🔮 Post-MVP Features (Phase 2+)

- Custom short codes
- Link editing & expiry
- Password-protected links
- Advanced analytics (geo, devices, referrers)
- Color customization for QR codes
- Multiple ticket types per event
- Offline scanner mode
- Subscription billing
- API access
- White-label option
- Mobile apps

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report

# Frontend tests
cd frontend
npm run test
npm run test:e2e          # End-to-end tests
```

## 🤝 Contributing

### Git Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "feat: add feature"`
3. Push branch: `git push origin feature/your-feature`
4. Create Pull Request

### Commit Convention

We use Conventional Commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Testing
- `chore:` Maintenance

### Code Style

- ESLint + Prettier configured
- Run `npm run lint` before committing
- TypeScript strict mode enabled

## 📊 Performance Targets

- Link Redirect: < 100ms response time
- QR Generation: < 2s for standard size
- Ticket Purchase: < 5s end-to-end
- Scanner Validation: < 200ms (online), < 50ms (offline)
- Uptime: 99.9% availability

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

- Built for the Nigerian market
- Inspired by Eventbrite, Bitly, and local ticketing platforms
- Community feedback and contributions welcome

---

**Happy Coding! 🚀**
