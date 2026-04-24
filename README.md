# ⚡ QuoteForge

> Proposals that close. Built with React + Vite, Node + Express, Supabase, and Resend.

---

## Project Structure

```
quoteforge/
├── frontend/          # React + Vite + Tailwind
│   └── src/
│       ├── pages/         # Route-level components
│       ├── components/    # Reusable UI components
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Supabase client, utils
│       └── store/         # Zustand state stores
├── backend/           # Node + Express API
│   ├── routes/        # quotes, email, profiles
│   ├── middleware/    # auth, error handler
│   └── lib/           # Supabase admin, Resend
└── supabase/
    └── migrations/    # SQL schema files
```

---

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the **SQL Editor**
3. Copy your **Project URL**, **anon key**, and **service role key** from Project Settings → API

### 2. Resend

1. Create an account at [resend.com](https://resend.com)
2. Add and verify your sending domain
3. Create an API key

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

### 4. Backend

```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, RESEND_API_KEY
npm install
npm run dev
```

### 5. Run both together (from root)

```bash
npm install        # installs concurrently
npm run dev        # starts frontend (5173) + backend (4000)
```

---

## Auth Flow

| Route | Description |
|---|---|
| `/signup` | Create account → confirmation email sent |
| `/login` | Sign in with email + password |
| `/forgot-password` | Request password reset email |
| `/auth/callback` | Supabase email confirmation redirect |
| `/dashboard` | Protected — redirects to `/login` if not authed |

---

## API Endpoints

All routes require `Authorization: Bearer <supabase_access_token>`.

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/profiles/me` | Get own profile |
| PATCH | `/api/profiles/me` | Update profile |
| GET | `/api/quotes` | List quotes (`?status=&search=`) |
| GET | `/api/quotes/:id` | Get quote + line items |
| POST | `/api/quotes` | Create quote |
| PATCH | `/api/quotes/:id` | Update quote |
| DELETE | `/api/quotes/:id` | Delete quote |
| POST | `/api/email/send-quote` | Email quote to client |

---

## Database Schema

```
profiles       — user profile (auto-created on signup)
quotes         — quote records with status tracking
line_items     — line items belonging to a quote
quote_views    — client view tracking (no auth required to insert)
```

RLS is enabled on all tables. Users can only access their own data.

---

## Next Steps

- [ ] Quote builder UI (line items editor)
- [ ] Public quote view page (`/quotes/:id/view`) for clients
- [ ] PDF export (Puppeteer or react-pdf)
- [ ] Quote accept/decline flow
- [ ] Dashboard analytics (sent, viewed, accepted rates)
- [ ] Stripe integration for deposits
