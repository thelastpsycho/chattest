# The Anvaya — Pre-Arrival Concierge Chat

A guest-facing web chat for The Anvaya Beach Resort Bali. Guests arrive from an email CTA and interact with a warm AI concierge to set stay preferences, select add-on services, and request room upgrades. The final request is emailed to the reservations team for follow-up.

## Tech Stack

- **Next.js 14+** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **OpenAI API** for AI chat
- **Nodemailer** for SMTP email sending
- **Vercel** for deployment

## Features

- ✅ URL parameter-based guest entry (`?name=Jane&email=jane@example.com`)
- ✅ Personalized greeting by first name
- ✅ Hybrid chat: structured flow cards + free-text AI conversation
- ✅ Stay preferences capture (bedding, dietary, occasion)
- ✅ Add-on services selection with live pricing (8 services)
- ✅ Room upgrade interest capture
- ✅ Review screen with edit capability
- ✅ Order-ready HTML email to team
- ✅ Mobile-first, accessible design
- ✅ Balinese beach luxury theme

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
SMTP_FROM=concierge@anvayabali.com

# Team inbox for guest requests
LEAD_EMAIL=reservations@anvayabali.com
```

### 2. SMTP Setup

For Gmail (recommended for testing):

1. Enable 2-Factor Authentication on your Google account
2. Generate an **App Password**:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this 16-character password in `SMTP_PASS`

For production, use a verified domain with your SMTP provider (SendGrid, Mailgun, AWS SES, etc.).

### 3. OpenAI API Key

Get your API key from [OpenAI Platform](https://platform.openai.com/):
1. Sign up / log in
2. Go to API Keys → Create new key
3. Add the key to `OPENAI_API_KEY`

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to test.

**Test URL with guest info:**
```
http://localhost:3000/?name=Jane%20Doe&email=jane@example.com
```

## Deployment (Vercel)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

**Important:** Ensure `SMTP_FROM` domain is verified by your email provider for production emails.

## Project Structure

```
app/
  layout.tsx           # Root layout with metadata
  globals.css          # Design system + theme
  page.tsx             # Main chat interface (client component)
  api/
    chat/route.ts      # OpenAI AI endpoint
    submit/route.ts    # Email submission endpoint
components/
  MessageBubble.tsx    # Chat message display
  PreferencesCard.tsx  # Stay preferences form
  ServicesCard.tsx     # Add-on services selection
  UpgradeCard.tsx      # Room upgrade selection
  ReviewCard.tsx       # Review summary
  Composer.tsx         # Free-text input
lib/
  types.ts             # TypeScript interfaces
  catalog.ts           # Services catalog + pricing logic
  money.ts             # IDR formatting utilities
  email.ts             # HTML email builder
```

## Services Catalog

All prices in IDR (net):

1. **Airport Transfer** — 300,000/car/way
2. **Daily Half Board** — 400,000/pax/day
3. **Spa Experience (60 min)** — 400,000/pax
4. **Romantic Dinner** — 1,500,000/couple
5. **Sunset Cocktails** — 200,000/hour
6. **Tours & Experiences** — Concierge to confirm
7. **Gourmet Savings Deal** — 800,000 (value 1,000,000)
8. **Cooking Class** — 400,000/pax (min 4 pax)

## Flow States

```
greeting → preferences → services → upgrade → review → submitted
```

## Design System

**The Anvaya Brand Colors (from theanvayabali.com):**
- `--anvaya-teal` `#506b7b` — primary (brand teal)
- `--anvaya-sand` `#F5F1E8` — background (warm sand)
- `--anvaya-gold` `#C9A962` — accent (gold)
- `--anvaya-charcoal` `#2C3E50` — text (charcoal)
- `--anvaya-white` `#FFFFFF` — card surface
- `--anvaya-light-gray` `#E8E4DD` — hairline dividers

**Typography:**
- **Nunito Sans** (all weights) — clean, modern sans-serif used throughout for consistency

## Acceptance Criteria

- [x] Reads `name` + `email` from URL; greets by first name; handles missing params
- [x] Preferences captured: bedding, dietary/allergy, occasion
- [x] All 8 services selectable with correct capture fields + live line totals + subtotal
- [x] Cooking Class enforces min 4 pax; transfer "Both" doubles ways
- [x] Room upgrade interest + target category captured
- [x] Free-text AI Q&A works, stays on catalog, concierge tone, never invents prices
- [x] Review screen shows everything; guest can edit before confirming
- [x] Confirm sends order-ready email (lead + subtotal + full transcript) via SMTP
- [x] Keys stay server-side; no secrets in client bundle
- [x] Mobile-first, on-brand, accessible

## Open Items

Before going live, confirm these with Andi:

1. **Exact room upgrade tiers** — Replace placeholder categories with actual Anvaya room types
2. **`LEAD_EMAIL`** — Confirm the team inbox for guest requests
3. **`FROM_EMAIL`** — Verify the sending domain with your email provider
4. **Guest CC** — Decide if confirmation email should also CC the guest

## License

Proprietary — The Anvaya Beach Resort Bali
