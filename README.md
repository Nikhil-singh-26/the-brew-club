# The Brew Club ☕

> **Good work deserves good people behind it.**  
> An independent creator support and community platform where builders, writers, and artists can showcase their work and receive direct backing from their community.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![NextAuth](https://img.shields.io/badge/NextAuth.js-v4-purple?style=flat-square&logo=auth0)](https://next-auth.js.org/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-0C2340?style=flat-square&logo=razorpay)](https://razorpay.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## 📖 Overview

**The Brew Club** is a creator-first platform built to eliminate the complexity, corporate bureaucracy, and high fees of traditional crowdfunding. It gives creators a clean, editorial, personal space to share what they are building and enables supporters to contribute directly through frictionless payments.

---

## ✨ Features

### 👤 Creator Portfolios & Personal Homepages
- **Editorial Creator Pages (`/[username]`)**: High-contrast, warm typography featuring creator bio, active roadmap, featured projects, milestones, and social links.
- **Project Showcase**: Highlight live demos, GitHub repositories, technology stacks, and completion status.
- **Narrative Storytelling**: Dedicated sections for *"About Me"*, *"What I'm Currently Building"*, and *"Why Back My Journey"*.
- **Supporter Wall**: Real-time list of community contributions with personal notes of encouragement.

### 💳 Dual Payment Architecture
- **Method 1: Razorpay Payment Link**: Direct redirection to the creator's personalized Razorpay Payment Page (e.g., `pages.razorpay.com/pl_...`).
- **Method 2: Integrated Razorpay Gateway**: Seamless in-app checkout popup utilizing server-side order generation and HMAC signature verification.
- **Real-Time Webhook Synchronization**: Dedicated webhook endpoint (`/api/webhook/razorpay`) that automatically logs external link payments and updates creator statistics.
- **Anonymous Contributions**: Supporters can choose to remain anonymous or leave their name and note.

### 🧭 Creator Discovery Directory (`/creators`)
- **Real-Time Debounced Search**: Search creators by name, username handle, tech stack, or bio.
- **Skill Filter Chips**: Filter creators by specific domains (Next.js, React, Node.js, AI, UI/UX, Python).
- **Smooth Pagination**: Infinite "View More" loading with optimized database skip/limit queries.

### 🛠️ Creator Studio & Workspace (`/dashboard`)
- **Time-Aware Dashboard**: Clean workspace with high data density inspired by Linear and Stripe.
- **Profile Completeness Tracker**: Interactive checklist guiding creators to 100% profile optimization.
- **Real-Time Analytics**: Total funds raised, supporter count, and average contribution metrics with instant Razorpay sync.
- **Bookmark & Activity Manager**: Save favorite creators and track contributions made across the platform.
- **Activity & Notification Feed**: Instant alerts when new contributions or platform events occur.
- **Secure Payment Settings**: Safe credential management (keys are encrypted and secrets are never echoed back to the browser).

### 🔐 Multi-Method Authentication
- **Email + Password**: Secure registration with `bcryptjs` password hashing and instant login.
- **OAuth Providers**: One-click authentication with GitHub and Google.
- **Session Management**: Session wrappers and route-level protections powered by NextAuth.js.

---

## 🎨 Design System

The Brew Club features a bespoke design system built from scratch with modern typography and an anti-AI aesthetic.

| Design Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Background** | `#171613` | Deep warm dark foundation |
| **Elevated Surface** | `#201F1B` | Primary containers and cards |
| **Secondary Surface** | `#282721` | Active states and hover elevations |
| **Primary Text** | `#F4F0E8` | High-contrast warm off-white |
| **Secondary Text** | `#AAA59A` | Readable secondary descriptions |
| **Muted Text** | `#77736B` | Small metadata, timestamps, and placeholders |
| **Primary Accent** | `#C96F43` | The Brew Club signature warm copper |
| **Accent Hover** | `#D98255` | Interactive button hover states |
| **Border** | `#34322C` | Crisp structural dividers and borders |
| **Success** | `#7E9B72` | Natural sage green status |
| **Error** | `#C85C52` | Muted terracotta alert |

- **Typography**: `Instrument Sans` (Headings) + `Inter` (Body).
- **Radii**: `6px` for small chips, `7px` for buttons/inputs, `10px` for cards, `12px` for modals.

---

## 🏗️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Credentials, GitHub OAuth, Google OAuth)
- **Payments**: [Razorpay Node SDK](https://razorpay.com/docs/api/) & Razorpay Checkout.js
- **Security**: `bcryptjs` for password hashing, HMAC SHA-256 for payment signature and webhook verification

---

## 📁 Project Structure

```text
the-brew-club/
├── actions/
│   └── useractions.js        # Server actions (auth, profile updates, payments, discovery)
├── app/
│   ├── [username]/           # Creator public homepage & support flow
│   ├── about/                # Platform philosophy and workflow
│   ├── api/
│   │   ├── auth/[...nextauth]/# NextAuth handler
│   │   ├── razorpay/         # Payment verification endpoint
│   │   └── webhook/razorpay/ # Webhook listener for Payment Link sync
│   ├── creators/             # Creator directory & search
│   ├── dashboard/            # Creator studio & settings
│   ├── join/                 # Registration page
│   ├── login/                # Authentication page
│   ├── globals.css           # Tailwind v4 theme & design tokens
│   ├── layout.js             # Root layout with fonts & session provider
│   ├── not-found.js          # Custom 404 page
│   └── page.js               # Editorial landing page
├── components/
│   ├── CreatorCard.js        # Creator directory card
│   ├── CreatorsList.js       # Directory grid with filter & pagination
│   ├── Dashboard.js          # Creator workspace & tabbed settings
│   ├── Footer.js             # Platform footer
│   ├── Navbar.js             # Understated navigation bar
│   ├── PaymentPage.js        # Creator public portfolio & Razorpay checkout
│   ├── SessionWrapper.js     # Client NextAuth provider
│   └── Toast.js              # Custom status notifications
├── db/
│   └── connectDb.js          # Cached MongoDB connection utility
├── models/
│   ├── Payment.js            # Payment & contribution schema
│   ├── Report.js             # Moderation report schema
│   └── User.js               # Creator & supporter profile schema
├── public/                   # Static assets & icons
├── .env.local.example        # Environment variable template
├── package.json              # Dependencies & build scripts
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have the following installed:
- **Node.js**: v18.18.0 or higher (v20+ recommended)
- **npm**: v9 or higher
- **MongoDB**: Local instance or free [MongoDB Atlas Cluster](https://www.mongodb.com/atlas)
- **Razorpay Account**: Free account on [Razorpay](https://razorpay.com/) (Test mode is fine)

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/the-brew-club.git
cd the-brew-club
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection URI
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/thebrewclub?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_32_character_secret_key
NEXTAUTH_URL=http://localhost:3000

# App Base URL
NEXT_PUBLIC_URL=http://localhost:3000

# OAuth Providers (Optional - at least one recommended)
GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret

GOOGLE_ID=your_google_oauth_client_id
GOOGLE_SECRET=your_google_oauth_client_secret

# Razorpay Platform Default (Optional / Test)
KEY_ID=rzp_test_your_key_id
KEY_SECRET=your_razorpay_key_secret

# Razorpay Webhook Secret (For Payment Link sync)
RAZORPAY_WEBHOOK_SECRET=your_webhook_signing_secret
```

> **Tip:** You can generate a random `NEXTAUTH_SECRET` in your terminal using:
> ```bash
> openssl rand -base64 32
> ```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💳 Razorpay & Webhook Setup

### Testing the Integrated Gateway:
1. Sign up or log into The Brew Club.
2. Go to **Dashboard (`/dashboard`) → Payment Settings**.
3. Choose **Razorpay Integrated Gateway** and enter your `rzp_test_...` Key ID and Secret.
4. Visit your public profile (`/[username]`) and make a test contribution.

### Testing Personalized Payment Links & Webhooks:
1. In **Dashboard → Payment Settings**, select **Razorpay Payment Link** and enter your payment link URL (e.g., `https://pages.razorpay.com/pl_example`).
2. Set up a Webhook in the **Razorpay Dashboard**:
   - **Webhook URL**: `https://your-domain.com/api/webhook/razorpay` (or your local ngrok/localtunnel URL during development)
   - **Secret**: Match the `RAZORPAY_WEBHOOK_SECRET` in your `.env.local`
   - **Active Events**: `payment.captured`, `payment_link.paid`

---

## 🛠️ Verification & Build Commands

```bash
# Run ESLint validation
npm run lint

# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/your-username/the-brew-club/issues).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  Brewed with care for independent creators everywhere ☕
</p>
