# Dryad Restoration App

A comprehensive management system for restoration companies to track jobs, customers, quotes, and more.

## Development

Once you've cloned the project and installed dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Deploying to Vercel

This app is configured for deployment on Vercel.

### Setup

1. Create an account on [Vercel](https://vercel.com) if you don't already have one
2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Log in to Vercel from the CLI:
   ```bash
   vercel login
   ```

### Environment Variables

Make sure to set up your environment variables in the Vercel dashboard. You can use `.env.example` as a reference for the required variables.

### Deployment

#### Option 1: Deploy from GitHub

1. Push your code to GitHub
2. Import your repository in the Vercel dashboard
3. Configure the project and environment variables
4. Deploy

#### Option 2: Deploy from CLI

```bash
# For a preview deployment
vercel

# For a production deployment
vercel --prod
```

The application uses `@sveltejs/adapter-vercel` for optimal deployment on the Vercel platform.

## Features

- Customer management
- Quote creation and tracking
- Job management
- Project tracking
- Responsive interface built with Tailwind CSS
