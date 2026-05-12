# 🏠 PropEstate — Real Estate Platform

> Full-stack Next.js 14 real estate platform for Chandigarh/Mohali/Panchkula Tricity market.

## ✨ Features

- **Public Website** — Browse properties, filter by city/type/price, property detail page
- **Auto Lead Creation** — Buyer submits inquiry → Lead auto-created in CRM instantly
- **Seller CRM** — Manage listings, track leads, update status
- **Admin CRM** — All leads spreadsheet, assign agents, approve properties, CSV export
- **3 User Roles** — USER (buyer), SELLER, ADMIN
- **Image Upload** — Cloudinary integration (max 10 images/property)
- **JWT Auth** — Secure cookie-based authentication

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/              # Public pages (no auth needed)
│   │   ├── buy/               # Property listings with filters
│   │   ├── sell/              # Sell page / CTA
│   │   ├── contact/           # Contact form
│   │   ├── blog/              # Blog listing
│   │   └── property/[id]/     # Property detail page
│   │
│   ├── (auth)/                # Auth pages
│   │   ├── login/
│   │   └── register/
│   │
│   ├── seller/                # Seller CRM (SELLER + ADMIN only)
│   │   ├── dashboard/         # Listings + Leads management
│   │   ├── add-property/      # Add new property form
│   │   └── edit-property/[id] # Edit property
│   │
│   ├── admin/                 # Admin CRM (ADMIN only)
│   │   └── dashboard/         # Stats + All leads + Properties approval
│   │
│   ├── api/                   # API Routes (Backend)
│   │   ├── auth/              # login, register, logout, me
│   │   ├── properties/        # CRUD properties
│   │   ├── leads/             # CRUD leads
│   │   ├── inquiries/         # Submit inquiry → auto-create lead
│   │   ├── upload/            # Cloudinary image upload
│   │   └── admin/stats/       # Dashboard stats
│   │
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Homepage
│   └── globals.css            # Global styles
│
├── components/
│   ├── layout/                # Navbar, Footer
│   ├── property/              # PropertyCard, PropertyListings
│   └── forms/                 # HeroSearch, InquiryForm
│
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   ├── auth.ts                # JWT sign/verify, getCurrentUser
│   ├── cloudinary.ts          # Image upload/delete
│   └── utils.ts               # Helpers, constants
│
├── types/
│   └── index.ts               # TypeScript interfaces
│
└── middleware.ts              # Route protection
```

---

## 🚀 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env
# Edit .env with your credentials

# 3. Setup database
npx prisma generate
npx prisma migrate dev --name init

# 4. Seed admin user
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

# 5. Start dev server
npm run dev
```

Visit: http://localhost:3000

---

## 📊 Database

Tech: **PostgreSQL** (self-hosted on VPS)

Models:
- `User` — buyers, sellers, admins
- `Property` — listings with images, amenities
- `PropertyImage` — property photos (Cloudinary URLs)
- `Lead` — CRM leads with full status tracking
- `Inquiry` — buyer inquiries (auto-creates lead)
- `SavedProperty` — buyer wishlist
- `Blog` — articles

---

## 🔐 Default Credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@propestate.in | Admin@123456 |
| Seller | seller@propestate.in | Seller@123 |

**Change these in production!**

---

## 🌐 VPS Deployment

See `DEPLOYMENT.md` for complete step-by-step guide.

Quick summary:
```bash
# On VPS
git clone <repo>
cd propestate
cp .env.example .env  # fill credentials
npm install
npx prisma migrate deploy
npm run build
pm2 start ecosystem.config.js
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL (self-hosted) |
| ORM | Prisma |
| Auth | JWT (jose) + bcrypt |
| Images | Cloudinary |
| Styling | Tailwind CSS |
| Deployment | VPS + Nginx + PM2 |
