# GrammarHero

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

AI-powered English grammar learning platform with gamification, inspired by Duolingo.

## Features

### Core Features
- **AI-Powered Grammar Check**: Claude AI analyzes your text and provides instant feedback with detailed explanations
- **Interactive Lessons**: Multiple choice, fill-in-the-blank, and sentence correction exercises
- **Gamification**: Earn XP, maintain streaks, unlock achievements, and compete on leaderboards
- **Progress Tracking**: Track your learning journey with detailed statistics and analytics
- **Subscription Plans**: Free tier with hearts system, Pro and Premium for unlimited access

### Technical Features
- **Security**: Rate limiting, input validation with Zod, CSRF protection, secure headers
- **Accessibility**: WCAG 2.1 compliant, keyboard navigation, screen reader support
- **Performance**: Optimized with prefetching, lazy loading, and Web Vitals monitoring
- **Testing**: Comprehensive test suite with Jest and React Testing Library

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (Email + Google OAuth) |
| AI | Anthropic Claude API |
| Payments | Stripe |
| State Management | Zustand |
| Animations | Framer Motion |
| Testing | Jest + React Testing Library |
| Validation | Zod |

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Supabase account
- Stripe account
- Anthropic API key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/josens83/GrammarHero.git
cd GrammarHero
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Fill in the required environment variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `NEXT_PUBLIC_URL` | Your app URL (e.g., http://localhost:3000) |

4. **Set up the database**

Run the SQL schema in your Supabase SQL editor:
```bash
# Schema located at supabase/schema.sql
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run type-check   # Run TypeScript type checking
```

## Project Structure

```
grammarhero/
├── app/                        # Next.js App Router pages
│   ├── (auth)/                 # Authentication pages
│   ├── (dashboard)/            # Dashboard pages
│   ├── (marketing)/            # Public marketing pages
│   └── api/                    # API routes
├── components/                 # React components
│   ├── ui/                     # shadcn/ui components
│   └── common/                 # Shared components
├── hooks/                      # Custom React hooks
├── lib/                        # Utility functions
│   ├── accessibility/          # Accessibility utilities
│   ├── api/                    # API utilities
│   ├── performance/            # Performance utilities
│   ├── security/               # Security utilities
│   ├── supabase/               # Supabase client
│   ├── test-utils/             # Testing utilities
│   └── validations/            # Zod schemas
├── stores/                     # Zustand stores
├── types/                      # TypeScript types
├── __tests__/                  # Test files
└── supabase/                   # Database schema
```

## Security

GrammarHero implements multiple security measures:

- **Input Validation**: All API inputs validated with Zod schemas
- **Rate Limiting**: Per-user rate limits on sensitive endpoints
- **Security Headers**: CSP, X-Frame-Options, HSTS, and more
- **Authentication**: Supabase Auth with secure session management
- **CSRF Protection**: SameSite cookies and token validation
- **Price ID Whitelist**: Only allowed Stripe price IDs accepted

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

Tests are located in the `__tests__/` directory, organized by feature:
- `__tests__/lib/validations/` - Validation schema tests
- `__tests__/lib/security/` - Security utility tests
- `__tests__/components/` - Component tests

## Accessibility

GrammarHero is designed to be accessible to all users:

- **WCAG 2.1 AA Compliant**: Follows Web Content Accessibility Guidelines
- **Keyboard Navigation**: Full keyboard support with skip links and focus trapping
- **Screen Reader Support**: ARIA labels and live regions for dynamic content
- **Reduced Motion**: Respects user's motion preferences
- **Color Contrast**: All text meets minimum contrast requirements

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Duolingo](https://www.duolingo.com/) for gamification inspiration
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Anthropic](https://www.anthropic.com/) for Claude AI
- [Supabase](https://supabase.com/) for backend infrastructure
