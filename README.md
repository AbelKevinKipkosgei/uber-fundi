# UberFundi

## Overview

UberFundi is a full-stack web platform that connects customers with
skilled local service providers. The platform combines provider
discovery with community interaction, allowing users to browse
professionals, view profiles, read reviews, publish posts, comment,
reply, receive notifications, and build trust before hiring.

## Problem Statement

Finding trustworthy artisans and service providers is often difficult.
People rely on referrals or social media, making it hard to compare
professionals, evaluate credibility, or discover nearby experts.

UberFundi addresses these challenges by providing: - Centralized
provider profiles - Community-driven reviews and ratings - Posts and
discussions - Notifications for user engagement - Secure
authentication - Modern responsive experience

## Solution

UberFundi enables customers to: - Discover providers - View detailed
profiles - Read ratings and reviews - Interact through posts and
comments - Like content - Receive notifications - Leave reviews after
interacting

Providers can: - Create and manage professional profiles - Publish
updates - Engage with potential customers - Build reputation through
ratings and reviews

## Features

### Authentication

- Clerk authentication
- Secure sign up/sign in
- Protected routes
- User identity management

### Provider Profiles

- Public provider pages
- Skills and service information
- Profile photos
- Availability
- Ratings
- Posts

### Community Feed

- Create posts
- Browse provider posts
- Image support
- Engagement through likes and comments

### Comment System

- Nested replies
- Reply mentions
- Pagination
- Comment deletion
- Like comments and replies

### Ratings & Reviews

- Five-star rating system
- Written reviews
- Average rating calculation
- Prevent self-reviews

### Notifications

- New comments
- New replies
- New ratings
- Navigation links to activity

### User Experience

- Responsive design
- Loading skeletons
- Form validation
- Optimistic UI updates
- Cursor pagination

## Technology Stack

### Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

### Backend

- Next.js Route Handlers
- Prisma ORM
- PostgreSQL (Neon)

### Authentication Stack

- Clerk

### Validation

- Zod

### UI

- Lucide React icons

### Database

- Prisma ORM
- Neon PostgreSQL

## Main Libraries

- next
- react
- typescript
- @clerk/nextjs
- @prisma/client
- prisma
- zod
- lucide-react
- tailwindcss

## Database Overview

Core entities include: - Providers - Posts - Comments - Replies -
Comment Likes - Post Likes - Reviews - Notifications

## Project Structure

- `app/` -- Pages and API routes
- `components/` -- Reusable UI components
- `lib/` -- Utilities, validation, helpers
- `prisma/` -- Database schema
- `public/` -- Static assets

## Running Locally

``` bash
git clone <repository>
cd project
npm install
```

Create `.env.local` with the required credentials.

Run:

``` bash
npx prisma generate
npm run dev
```

## Environment Variables

Typical variables include: - Clerk publishable key - Clerk secret key -
Database URL - Direct database URL - Cloudinary credentials (if
configured)

## Future Improvements

- Booking system
- Payments
- Maps integration
- Provider verification
- AI recommendations
- Real-time chat
- Admin dashboard
- Analytics

## Author

Developed by **Abel Kevin Kipkosgei** as a modern full-stack portfolio
project showcasing Next.js, TypeScript, Clerk authentication, Prisma
ORM, PostgreSQL, and responsive UI development.
