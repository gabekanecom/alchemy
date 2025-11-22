# Alchemy by Arkane

**AI-Powered Content Creation Platform**

Streamline your marketing content creation with multi-brand AI automation.

---

## 🚀 Project Status

**Phase 1: Project Foundation** ✅ In Progress

See [DEVELOPMENT_ROADMAP.md](../DEVELOPMENT_ROADMAP.md) for full roadmap.

---

## 🛠 Tech Stack

### Core
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui

### Database & Backend
- **Database:** PostgreSQL 15 (Supabase)
- **ORM:** Prisma
- **Auth:** Supabase Auth
- **Cache/Queue:** Redis + BullMQ
- **Storage:** Supabase Storage

### AI & Integrations
- **Primary AI:** Claude (Anthropic Sonnet 4.5)
- **Secondary AI:** OpenAI GPT-4
- **Image Generation:** DALL-E 3
- **Web Scraping:** Firecrawl
- **Research:** Reddit API, YouTube API

---

## 📋 Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 8+
- Docker Desktop
- Git

---

## 🏃 Getting Started

### 1. Clone and Install

```bash
cd alchemy-platform
pnpm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your API keys.

### 3. Start Docker Services (Coming in Phase 1, Day 2)

```bash
docker-compose up -d
```

### 4. Run Database Migrations (Coming in Phase 1, Day 2)

```bash
pnpm prisma migrate dev
pnpm prisma generate
```

### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
alchemy-platform/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes group
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── brands/           # Brand management
│   ├── ideas/            # Ideas discovery
│   ├── content/          # Content queue
│   └── shared/           # Shared components
├── lib/                   # Business logic
│   ├── ai/               # AI integrations
│   ├── scrapers/         # Web scrapers
│   ├── generators/       # Content generators
│   ├── publishers/       # Publishing services
│   ├── db/               # Database utilities
│   ├── queues/           # Job queues
│   └── utils/            # Helper functions
├── prisma/                # Database schema
├── workers/               # Background workers
├── types/                 # TypeScript types
├── hooks/                 # React hooks
└── scripts/               # Utility scripts
```

---

## 🧪 Development Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm type-check       # TypeScript type checking

# Database
pnpm prisma studio    # Open Prisma Studio GUI
pnpm prisma migrate dev    # Create migration
pnpm prisma generate  # Generate Prisma Client
```

---

## 🎨 Design System

Alchemy uses a custom design system with:
- **Dark Theme:** Mystical/luxury aesthetic
- **Accent Colors:** Gold (#D4AF37 palette)
- **Typography:** Inter (body), Satoshi (headings), JetBrains Mono (code)
- **Effects:** Gold glow shadows, shimmer animations

See [ALCHEMY_DESIGN_SYSTEM.md](../ALCHEMY_DESIGN_SYSTEM.md) for details.

---

## 📖 Documentation

- [Development Roadmap](../DEVELOPMENT_ROADMAP.md)
- [Design System](../ALCHEMY_DESIGN_SYSTEM.md)
- [Multi-Brand Architecture](../MULTI_BRAND_ARCHITECTURE.md)
- [AI Content Platform Setup](../AI_CONTENT_PLATFORM_SETUP.md)
- [HighLevel Integration Guide](../HIGHLEVEL_THRIVECART_INTEGRATION_GUIDE.md)

---

## 🗓 Development Timeline

- **Week 1:** Project foundation, database, authentication
- **Week 2-3:** API layer, AI integration, external integrations
- **Week 4:** Publishing & media generation
- **Week 5:** UI foundation & design system
- **Week 6:** Core pages & features
- **Week 7:** Testing, optimization, launch

**Estimated Completion:** 6-7 weeks

---

## 📝 License

MIT

---

## 👤 Author

**Arkane**

Built with ⚗️ by Alchemy
