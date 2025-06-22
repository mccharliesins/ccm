# Creator Climb - Project Index

## Project Overview

**Creator Climb** is a Next.js application designed to help content creators focus and discover trending ideas. It provides tools for YouTube channel management, content idea generation, and competitor analysis.

## Technology Stack

- **Framework**: Next.js 15.3.4 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Authentication**: Local storage-based auth
- **API**: YouTube Data API v3
- **Deployment**: Vercel-ready

## Project Structure

### Root Configuration Files

```
├── package.json              # Dependencies and scripts
├── package-lock.json         # Locked dependency versions
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── eslint.config.mjs         # ESLint configuration
├── postcss.config.mjs        # PostCSS configuration
├── vercel.json               # Vercel deployment config
├── README.md                 # Project documentation
└── .gitignore                # Git ignore patterns
```

### Source Code Structure (`src/`)

```
src/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with auth provider
│   ├── page.tsx             # Landing page with hero section
│   ├── globals.css          # Global styles
│   ├── favicon.ico          # App icon
│   ├── login/               # Authentication pages
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── dashboard/           # Main dashboard
│   │   └── page.tsx
│   ├── content-ideas/       # Content ideas page
│   │   └── page.tsx
│   └── settings/            # User settings
│       └── page.tsx
├── components/              # Reusable React components
│   ├── Header.tsx           # Navigation header
│   ├── ClientOnly.tsx       # Client-side rendering wrapper
│   ├── ChannelCard.tsx      # YouTube channel display card
│   ├── ChannelsList.tsx     # List of user's channels
│   ├── RecentVideos.tsx     # Recent videos component
│   ├── RelatedChannels.tsx  # Similar channels analysis
│   └── ContentIdeas.tsx     # Content idea generation
└── lib/                     # Utility libraries
    ├── auth.tsx             # Authentication context and hooks
    ├── youtube.tsx          # YouTube channel management
    └── youtube-api.ts       # YouTube API integration
```

### Public Assets (`public/`)

```
public/
├── favicon.ico              # Site favicon
├── favicons/                # Various favicon sizes
├── file.svg                 # File icon
├── globe.svg                # Globe icon
├── next.svg                 # Next.js logo
├── vercel.svg               # Vercel logo
└── window.svg               # Window icon
```

## Core Features

### 1. Authentication System

- **File**: `src/lib/auth.tsx`
- **Features**:
  - Local storage-based user management
  - User registration and login
  - Password-protected accounts
  - Persistent sessions
  - Context-based auth state management

### 2. YouTube Integration

- **File**: `src/lib/youtube-api.ts`
- **Features**:
  - Channel information fetching
  - Video data retrieval
  - Related channels discovery
  - Content idea generation
  - Video performance analytics
  - Keyword extraction and analysis

### 3. Dashboard

- **File**: `src/app/dashboard/page.tsx`
- **Features**:
  - Overview of user's channels
  - Recent videos display
  - Related channels analysis
  - Tabbed navigation interface
  - Real-time data updates

### 4. Content Ideas Generation

- **File**: `src/app/content-ideas/page.tsx`
- **Features**:
  - AI-powered content suggestions
  - Trending topic analysis
  - Viral potential scoring
  - Keyword optimization
  - Thumbnail design ideas

### 5. Channel Management

- **File**: `src/lib/youtube.tsx`
- **Features**:
  - Add/remove YouTube channels
  - Channel data persistence
  - Channel information updates
  - Local storage management

## Component Architecture

### Header Component (`src/components/Header.tsx`)

- Responsive navigation
- Authentication state display
- Mobile menu support
- Branding and logo

### ChannelCard Component (`src/components/ChannelCard.tsx`)

- YouTube channel display
- Thumbnail and statistics
- Channel information cards
- Interactive elements

### RecentVideos Component (`src/components/RecentVideos.tsx`)

- Recent video listings
- Video performance metrics
- Thumbnail display
- Video duration and view counts

### RelatedChannels Component (`src/components/RelatedChannels.tsx`)

- Similar channel discovery
- Niche analysis
- Collaboration opportunities
- Channel comparison tools

### ContentIdeas Component (`src/components/ContentIdeas.tsx`)

- Content idea generation
- Trending topic analysis
- Viral potential assessment
- Content strategy recommendations

## API Integration

### YouTube Data API v3

- **Endpoint**: `https://www.googleapis.com/youtube/v3/`
- **Key Features**:
  - Channel information retrieval
  - Video data fetching
  - Playlist management
  - Search functionality
  - Statistics and analytics

### Environment Variables

- `NEXT_PUBLIC_YOUTUBE_API_KEY`: YouTube Data API key

## Styling and Design

### Tailwind CSS Configuration

- Custom color scheme (orange theme)
- Responsive design utilities
- Typography plugin integration

### Global Styles (`src/app/globals.css`)

- CSS custom properties
- Animation definitions
- Base styling
- Utility classes

## Development Scripts

```json
{
  "dev": "next dev",           # Development server
  "build": "next build",       # Production build
  "start": "next start",       # Production server
  "lint": "next lint"          # Code linting
}
```

## Deployment Configuration

### Vercel Configuration (`vercel.json`)

- Optimized for Vercel deployment
- Automatic builds and deployments
- Environment variable management

### Next.js Configuration (`next.config.js`)

- Image optimization for YouTube thumbnails
- Remote pattern configuration
- React strict mode enabled

## Data Flow

1. **Authentication**: User registers/logs in → Auth context updates → Local storage persistence
2. **Channel Management**: User adds YouTube channel → API fetches channel data → Local storage updates
3. **Content Analysis**: Channel data → YouTube API calls → Content ideas generation → UI display
4. **Related Channels**: Channel analysis → Similar channel discovery → Collaboration suggestions

## Security Considerations

- Local storage-based authentication (client-side only)
- YouTube API key management
- Input validation and sanitization
- CORS configuration for API calls

## Performance Optimizations

- Next.js App Router for optimal routing
- Image optimization for YouTube thumbnails
- Client-side rendering for dynamic content
- Lazy loading of components
- Efficient state management

## Browser Compatibility

- Modern browsers with ES2017+ support
- Responsive design for mobile and desktop
- Progressive enhancement approach

## Future Enhancements

- Server-side authentication with JWT
- Database integration for user data persistence
- Enhanced analytics with data visualization
- Email notifications for channel updates
- Social sharing capabilities
- Collaboration tools for creators

## Dependencies

### Production Dependencies

- `
