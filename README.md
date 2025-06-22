# Creator Climb

A Next.js application to help creators focus and get trending ideas.

## Features

- User authentication with local storage
- YouTube channel management
- Dashboard with analytics and content ideas
- Responsive design

## Setup

1. Clone the repository

   ```bash
   git clone https://github.com/mccharliesins/ccm.git
   cd ccm
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory with the following content:

   ```
   NEXT_PUBLIC_YOUTUBE_API_KEY=YOUR_API_KEY
   ```

   Replace `YOUR_API_KEY` with your actual YouTube Data API key. You can obtain one from the [Google Cloud Console](https://console.cloud.google.com/).

4. Run the development server

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

- `NEXT_PUBLIC_YOUTUBE_API_KEY`: YouTube Data API key for fetching channel information

## Deployment

This project is ready to be deployed on Vercel. Simply connect your GitHub repository to Vercel and it will be automatically deployed.

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [YouTube Data API](https://developers.google.com/youtube/v3) - For fetching channel information

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
