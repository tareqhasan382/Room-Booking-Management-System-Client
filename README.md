# Room Booking & Management System

A full-stack hotel room booking and management platform built with **Next.js 14 (App Router)**, **MongoDB** and **Stripe**. Guests can browse rooms, check live availability, book with real/sandbox payments, download PDF invoices and leave reviews — while admins manage rooms, users, bookings, billing and platform activity from a single dashboard.

## Tech Stack

- **Next.js 14.2** (App Router, Server Components, API routes)
- **MongoDB + Mongoose** (models: User, Room, Booking, Payment, Review, NightReservation, ActivityLog)
- **Stripe** payments (checkout sessions + webhooks) with a built-in sandbox card gateway for development
- **JWT** authentication (`bcryptjs` password hashing)
- **Tailwind CSS** with light/dark mode
- **TanStack Query**, **Recharts**, **react-date-range**, **PDFKit** (invoices), **Cloudinary** (room images), **Nodemailer** (email notifications)

## Features

**Guest side**
- Browse, search, filter and sort rooms; category tabs and room detail pages
- Live availability calendar with date-range picker, guests and check-in/out time selection
- Booking flow with price breakdown (taxes) and payment via Stripe or sandbox card
- My bookings — view, pay and cancel; PDF invoice download
- Reviews & ratings per room; profile management (avatar, password change)
- Theme toggle (light/dark), toast notifications, fully responsive UI

**Admin side** (`/admin`)
- Analytics dashboard (charts: revenue, occupancy, category breakdown)
- Room management (create / edit / delete with image upload)
- User management (view, change roles)
- Booking management (status updates)
- **Billing** — payments with transaction IDs, Stripe session refs, card brand/last-4, status summaries
- **Activity Logs** — paginated audit trail of platform actions (bookings, payments, rooms, users, reviews, signups)
- Auth-guarded with 401/403 for non-admins

## Demo Credentials

| Role | Email | Password |
| ---- | ----- | -------- |
| Admin | `admin@roombook.com` | `admin123` |
| User | `john@example.com` | `password123` |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in the values:

```
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/room-booking
BCRYPT_SALT_ROUNDS=10
JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRES_IN=15d
```

Optional features:

```
# Payments (leave STRIPE_SECRET_KEY unset to use the sandbox gateway)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
PAYMENT_GATEWAY=stripe

# Cloudinary (room image upload)
CLOUD_NAME=...
CLOUD_API_KEY=...
CLOUD_API_SECRET=...

# Email (Nodemailer SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=Room Booking <no-reply@roombook.com>

# App URL (used in emails / invoice links)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Seed demo data

```bash
npm run seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the app for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed demo users & data |

## Project Structure

```
src/
├── app/                  # Pages, layouts and API routes (Next.js App Router)
│   ├── api/              # Backend API routes (auth, bookings, payments, admin...)
│   └── ...
├── components/           # UI components (Navbar, Hero, AdminDashboard, ui/...)
├── Hooks/                # Client hooks (auth, theme, data fetching)
└── lib/                  # Shared logic (db, auth, payments, models, activity logs)
```
