// Get YouTube API key from environment variables
// In Next.js, client-side code can only access environment variables prefixed with NEXT_PUBLIC_
const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

export type YouTubeChannelInfo = {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  bannerUrl: string;
};

/**
 * Extract channel ID from various YouTube URL formats
 */
export function extractChannelId(url: string): string | null {
  // Handle channel URLs
  const channelRegex = /youtube\.com\/channel\/([^\/\?]+)/;
  const channelMatch = url.match(channelRegex);
  if (channelMatch) return channelMatch[1];

  // Handle user URLs
  const userRegex = /youtube\.com\/user\/([^\/\?]+)/;
  const userMatch = url.match(userRegex);
  if (userMatch) return userMatch[1];

  // Handle handle URLs (new @username format)
  const handleRegex = /youtube\.com\/@([^\/\?]+)/;
  const handleMatch = url.match(handleRegex);
  if (handleMatch) return handleMatch[1];

  // Handle c/ URLs
  const cRegex = /youtube\.com\/c\/([^\/\?]+)/;
  const cMatch = url.match(cRegex);
  if (cMatch) return cMatch[1];

  return null;
}

/**
 * Determine the type of identifier (id, handle, username)
 */
export function getIdentifierType(identifier: string): 'id' | 'handle' | 'username' {
  if (identifier.startsWith('@')) {
    return 'handle';
  }
  
  // This is a simplistic check - in a real app you'd want more robust validation
  if (identifier.length === 24) {
    return 'id';
  }
  
  return 'username';
}

/**
 * Fetch channel information from YouTube API
 */
export async function fetchChannelInfo(url: string): Promise<YouTubeChannelInfo | null> {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.error('YouTube API key is not available. Please set NEXT_PUBLIC_YOUTUBE_API_KEY in your environment variables.');
      return null;
    }

    let identifier = extractChannelId(url);
    if (!identifier) return null;
    
    const identifierType = getIdentifierType(identifier);
    
    // Build the API URL based on identifier type
    let apiUrl = 'https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics,brandingSettings';
    
    if (identifierType === 'id') {
      apiUrl += `&id=${identifier}`;
    } else if (identifierType === 'handle') {
      // Remove @ if present
      if (identifier.startsWith('@')) {
        identifier = identifier.substring(1);
      }
      apiUrl += `&forHandle=${identifier}`;
    } else {
      apiUrl += `&forUsername=${identifier}`;
    }
    
    apiUrl += `&key=${API_KEY}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return null;
    }
    
    const channel = data.items[0];
    
    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      customUrl: channel.snippet.customUrl || '',
      thumbnails: {
        default: channel.snippet.thumbnails.default.url,
        medium: channel.snippet.thumbnails.medium.url,
        high: channel.snippet.thumbnails.high.url,
      },
      subscriberCount: channel.statistics.subscriberCount,
      videoCount: channel.statistics.videoCount,
      viewCount: channel.statistics.viewCount,
      bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl || '',
    };
  } catch (error) {
    console.error('Error fetching channel info:', error);
    return null;
  }
} 