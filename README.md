# EventSync — Event Operations & Vendor Management Platform

<div align="center">

![EventSync Banner](https://img.shields.io/badge/EventSync-Event%20Operations%20ERP-4f46e5?style=for-the-badge)

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe)](https://stripe.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=flat-square&logo=socket.io)](https://socket.io/)

**A full-stack Event Operations ERP with 3-role RBAC, real-time messaging, Stripe milestone payments, and GST invoice generation.**

[🌐 Live Demo](https://eventsync-8oyc.onrender.com) · [📁 GitHub](https://github.com/AmanBhaskar16/EventSync)

</div>

---

## Demo Accounts

| Role     | Email               | Password   |
|----------|---------------------|------------|
| Customer | customer@demo.com   | Demo@1234  |
| Vendor   | vendor@demo.com     | Demo@1234  |
| Admin    | admin@demo.com      | Demo@1234  |

---

## Features

### 🎯 Customer Portal
- Browse and filter KYC-verified vendors across 17 categories
- Create events and send booking inquiries
- Review and negotiate quotes with counter-offer support
- 3-milestone Stripe payments (30% / 40% / 30%) with sequential unlocking
- Download GST-compliant PDF invoices
- Real-time messaging with vendors
- Leave reviews and raise disputes

### 🏢 Vendor Portal
- Manage incoming bookings and send quotes
- Inventory management with reservation tracking
- Staff management and assignment
- Service & package listing with add-ons
- Portfolio image upload via Cloudinary
- KYC document submission
- Finances dashboard with commission breakdown
- Real-time notifications

### 🛡️ Admin Panel
- KYC review queue — approve/reject vendor applications
- Dispute resolution system
- Platform-wide analytics (GMV, bookings, revenue)
- Vendor payout management with 12% commission deduction
- All vendors overview with status tracking

### ⚡ Platform Features
- Real-time messaging with Socket.io + typing indicators
- Presence-aware notifications (no alerts when recipient is in chat)
- Notification bell with unread count
- Cloudinary image uploads (avatar, portfolio, KYC)
- GST-compliant PDF invoice generation
- 100/100 Lighthouse Performance score

---

## Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Framework    | Next.js 16.2 (App Router, Turbopack)            |
| Language     | TypeScript 5                                    |
| Styling      | Tailwind CSS v4, shadcn/ui                      |
| Auth         | NextAuth v5 (JWT strategy)                      |
| Database     | PostgreSQL (Neon) + Prisma ORM                  |
| Payments     | Stripe (PaymentIntents, 3-milestone schedule)   |
| Real-time    | Socket.io (custom Node.js server)               |
| File Upload  | Cloudinary                                      |
| PDF          | @react-pdf/renderer                             |
| Email        | Resend                                          |
| Deployment   | Render (full-stack + Socket.io)                 |

---

## Architecture

```
EventSync/
├── server.js                    # Custom Next.js + Socket.io server
├── prisma/
│   └── schema.prisma            # 18 models, 8 enums
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login, Register
│   │   ├── (dashboard)/
│   │   │   ├── customer/        # Customer portal pages
│   │   │   ├── vendor/          # Vendor portal pages
│   │   │   └── admin/           # Admin panel pages
│   │   ├── api/                 # API routes
│   │   └── vendors/             # Public vendor profiles
│   ├── components/
│   │   ├── shared/              # Navbar, NotificationBell, StarRating
│   │   ├── bookings/            # QuoteBuilder, MessageThread
│   │   ├── payments/            # PaymentMilestoneCard
│   │   └── upload/              # AvatarUpload, PortfolioUpload, KYCUpload
│   ├── hooks/
│   │   └── use-socket.ts        # Singleton Socket.io hook
│   ├── lib/
│   │   ├── auth/                # NextAuth config
│   │   ├── db/                  # Prisma client
│   │   ├── email/               # Resend templates + sender
│   │   └── notifications.ts     # Real-time notification helper
│   └── types/                   # TypeScript declarations
```

---

## Payment Flow

```
Customer accepts quote
        ↓
3 Payment rows created (30% / 40% / 30%)
        ↓
BOOKING_CONFIRMATION  →  Always unlocked  →  Pay ✓
        ↓
PRE_EVENT             →  Unlocks 7 days before event
        ↓
POST_EVENT            →  Unlocks after event date
        ↓
All 3 PAID → Booking COMPLETED → Review unlocked
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or [Neon.tech](https://neon.tech) free tier)
- Stripe account
- Cloudinary account

### Installation

```bash
# Clone the repo
git clone https://github.com/AmanBhaskar16/EventSync.git
cd EventSync

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Fill in your credentials (see Environment Variables section)

# Push database schema
npx prisma db push
npx prisma generate

# Seed demo accounts
npx tsx prisma/seed.ts

# Run with Socket.io (recommended)
npm run dev:rt

# Or run without Socket.io
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Auth
AUTH_SECRET=your_32_char_secret
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Email (optional in dev)
RESEND_API_KEY=re_...
ADMIN_EMAIL=admin@yourdomain.com
```

### Scripts

```bash
npm run dev        # Next.js only (no Socket.io)
npm run dev:rt     # Next.js + Socket.io (recommended)
npm run build      # Production build
npm run start      # Production server
```

---

## Database Schema

**18 Models:** User, Customer, Vendor, Admin, Event, Booking, Payment, Quote, Message, Dispute, Review, InventoryItem, InventoryReservation, VendorService, ServiceAddon, StaffMember, StaffAssignment, Notification

**8 Enums:** Role, KYCStatus, VendorCategory, EventType, BookingStatus, PaymentStatus, PaymentMilestone, DisputeStatus

---

## Deployment

Deployed on **Render** with **Neon** PostgreSQL:

```bash
# Build command
npm install && npx prisma generate && npm run build

# Start command
node server.js
```

**Environment Variables required on Render:**
- All variables from `.env.local`
- `AUTH_TRUST_HOST=true`
- `NODE_ENV=production`

---

## Performance

| Metric          | Score |
|----------------|-------|
| Performance     | 100   |
| Accessibility   | 94    |
| Best Practices  | 100   |
| SEO             | 82    |

*Lighthouse scores on production build*

---

## Author

**Aman Bhaskar**
- GitHub: [@AmanBhaskar16](https://github.com/AmanBhaskar16)
- LinkedIn: [aman-bhaskar](https://linkedin.com/in/aman-bhaskar-1086a9269/)
- LeetCode: [Aman_Bhaskar16](https://leetcode.com/u/Aman_Bhaskar16/)

---

<div align="center">
  Built with ❤️ for India's event industry
</div>
