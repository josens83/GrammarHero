# GrammarHero

AI-powered English grammar learning platform with gamification.

## Features

- **AI-Powered Learning**: Claude AI provides instant feedback and personalized explanations
- **Gamification**: Earn XP, maintain streaks, unlock achievements, and compete on leaderboards
- **Interactive Lessons**: Multiple choice, fill-in-blank, and sentence correction exercises
- **Progress Tracking**: Track your learning journey with detailed statistics
- **Subscription Plans**: Free tier with hearts system, Pro and Premium for unlimited access

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email + Google OAuth)
- **AI**: Anthropic Claude API
- **Payments**: Stripe
- **State Management**: Zustand
- **Animations**: Framer Motion

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/josens83/GrammarHero.git
cd GrammarHero
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `ANTHROPIC_API_KEY` - Anthropic API key for Claude
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `NEXT_PUBLIC_URL` - Your app URL

### 4. Set up database

Run the SQL schema in your Supabase SQL editor:

```bash
# Located at supabase/schema.sql
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
grammarhero/
├── app/                    # Next.js pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Dashboard pages
│   ├── (marketing)/       # Landing, pricing pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── common/           # Shared components
├── lib/                   # Utilities
├── hooks/                 # React hooks
├── stores/               # Zustand stores
├── types/                # TypeScript types
└── supabase/             # Database schema
```

## License

MIT
