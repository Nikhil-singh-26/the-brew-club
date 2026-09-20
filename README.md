# The Brew Club ☕

The Brew Club is a modern creator-support and crowdfunding platform built with Next.js, NextAuth, MongoDB, and Razorpay. It allows creators to build their personal page, share their creative endeavors, and receive direct monetary contributions from supporters.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: React 19, Tailwind CSS v4
- **Authentication**: NextAuth.js (GitHub, Google)
- **Database**: MongoDB with Mongoose ODM
- **Payments**: Razorpay Gateway (Direct creator credentials)

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables Configuration
Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/thebrewclub?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_SECRET=your-32-character-secret-key
NEXTAUTH_URL=http://localhost:3000

# App Base URL
NEXT_PUBLIC_URL=http://localhost:3000

# OAuth Providers (Configure at least one)
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret

```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Flows

- **Authentication**: Sign in via OAuth providers. User accounts and usernames are automatically provisioned.
- **Creator Dashboard** (`/dashboard`): Edit display name, custom username handle, avatar, cover banner, and configure Razorpay Key ID & Key Secret.
- **Public Creator Page** (`/[username]`): Display creator bio, community supporter wall, total amount raised, and direct contribution form.
- **Razorpay Integration**: Server-side order creation and HMAC signature verification on callbacks (`/api/razorpay`).
