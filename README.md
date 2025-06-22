# Creator Climb

A Next.js application designed to help content creators focus and discover trending ideas for their YouTube channels.

## 🚀 Features

- **Authentication System**: Local storage-based user management with signup, login, and session persistence
- **YouTube Channel Management**: Add and track multiple YouTube channels
- **Content Ideas Generation**: Get AI-powered content suggestions tailored to your niche
- **Related Channels Analysis**: Discover similar channels for collaboration opportunities
- **Performance Analytics**: Track video performance and audience engagement
- **Responsive Design**: Optimized for both desktop and mobile devices

## 📋 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with auth provider
│   ├── page.tsx             # Landing page with hero section
│   ├── dashboard/           # Main dashboard
│   ├── content-ideas/       # Content ideas page
│   ├── login/ & signup/     # Authentication pages
│   └── settings/            # User settings
├── components/              # Reusable React components
│   ├── Header.tsx           # Navigation header
│   ├── ChannelCard.tsx      # YouTube channel display card
│   ├── ChannelsList.tsx     # List of user's channels
│   ├── RecentVideos.tsx     # Recent videos component
│   └── ContentIdeas.tsx     # Content idea generation
└── lib/                     # Utility libraries
    ├── auth.tsx             # Authentication context and hooks
    ├── youtube.tsx          # YouTube channel management
    └── youtube-api.ts       # YouTube API integration
```

## 🛠️ Technology Stack

- **Framework**: Next.js 15.3.4 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Authentication**: Local storage-based auth
- **API Integration**: YouTube Data API v3
- **Deployment**: Vercel-ready

## 🚦 Getting Started

### Prerequisites

- Node.js 18.x or higher
- YouTube Data API key

### Installation

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
   Create a `.env.local` file in the root directory with:

   ```
   NEXT_PUBLIC_YOUTUBE_API_KEY=YOUR_API_KEY
   ```

   Replace `YOUR_API_KEY` with your YouTube Data API key from the [Google Cloud Console](https://console.cloud.google.com/).

4. Run the development server

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔑 Environment Variables

- `NEXT_PUBLIC_YOUTUBE_API_KEY`: YouTube Data API key for fetching channel information

## 🧩 Core Features

### Authentication System

- Local storage-based user management
- User registration and login
- Persistent sessions
- Context-based auth state management

### YouTube Integration

- Channel information fetching
- Video data retrieval
- Related channels discovery
- Content idea generation
- Video performance analytics

### Dashboard

- Overview of user's channels
- Recent videos display
- Related channels analysis
- Tabbed navigation interface

### Content Ideas Generation

- AI-powered content suggestions
- Trending topic analysis
- Viral potential scoring
- Keyword optimization

## 🚢 Deployment

This project is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set up the required environment variables
3. Deploy with a single click

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [YouTube Data API Documentation](https://developers.google.com/youtube/v3/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
