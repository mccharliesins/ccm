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
  uploadsPlaylistId: string;
};

export type YouTubeVideoThumbnail = {
  url: string;
  width: number;
  height: number;
};

export type YouTubeVideoInfo = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  thumbnails: {
    default: YouTubeVideoThumbnail;
    medium: YouTubeVideoThumbnail;
    high: YouTubeVideoThumbnail;
    standard?: YouTubeVideoThumbnail;
    maxres?: YouTubeVideoThumbnail;
  };
  duration: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  tags?: string[];
};

// Define types for YouTube API responses
interface YouTubePlaylistItem {
  contentDetails: {
    videoId: string;
  };
}

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    tags?: string[];
    thumbnails: {
      default: YouTubeVideoThumbnail;
      medium: YouTubeVideoThumbnail;
      high: YouTubeVideoThumbnail;
      standard?: YouTubeVideoThumbnail;
      maxres?: YouTubeVideoThumbnail;
    };
  };
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

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
  if (handleMatch) return '@' + handleMatch[1];

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
  if (identifier.length === 24 && !identifier.includes(' ')) {
    return 'id';
  }
  
  return 'username';
}

/**
 * Fetch channel information from YouTube API
 * 
 * API Documentation:
 * Endpoint: GET https://www.googleapis.com/youtube/v3/channels
 * Parameters:
 *   - part=snippet,contentDetails,statistics,brandingSettings
 *   - id={channel_id} OR forHandle={@channel_handle} OR forUsername={username}
 *   - key={API_KEY}
 * Quota Cost: 1 unit per request
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
      // Make sure handle has @ prefix
      if (!identifier.startsWith('@')) {
        identifier = '@' + identifier;
      }
      apiUrl += `&forHandle=${identifier}`;
    } else {
      apiUrl += `&forUsername=${identifier}`;
    }
    
    apiUrl += `&key=${API_KEY}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API error:', errorData);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.error('No channel found with the provided identifier');
      return null;
    }
    
    const channel = data.items[0];
    
    // Extract the data according to the API documentation
    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      customUrl: channel.snippet.customUrl || '',
      thumbnails: {
        default: channel.snippet.thumbnails.default?.url || '',
        medium: channel.snippet.thumbnails.medium?.url || '',
        high: channel.snippet.thumbnails.high?.url || '',
      },
      subscriberCount: channel.statistics.subscriberCount || '0',
      videoCount: channel.statistics.videoCount || '0',
      viewCount: channel.statistics.viewCount || '0',
      bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl || '',
      uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads || '',
    };
  } catch (error) {
    console.error('Error fetching channel info:', error);
    return null;
  }
}

/**
 * Fetch videos from a channel's uploads playlist
 * 
 * API Documentation:
 * Step 1: GET https://www.googleapis.com/youtube/v3/playlistItems
 * Parameters:
 *   - part=snippet,contentDetails
 *   - playlistId={uploadsPlaylistId}
 *   - maxResults=50
 *   - key={API_KEY}
 * 
 * Step 2: GET https://www.googleapis.com/youtube/v3/videos
 * Parameters:
 *   - part=snippet,statistics,contentDetails
 *   - id={comma_separated_video_ids}
 *   - key={API_KEY}
 * 
 * Quota Cost: 1 unit for playlistItems + 1 unit for videos = 2 units per request
 */
export async function fetchChannelVideos(uploadsPlaylistId: string): Promise<YouTubeVideoInfo[]> {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.error('YouTube API key is not available. Please set NEXT_PUBLIC_YOUTUBE_API_KEY in your environment variables.');
      return [];
    }

    // Step 1: Get video IDs from the uploads playlist
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${API_KEY}`;
    const playlistResponse = await fetch(playlistUrl);
    
    if (!playlistResponse.ok) {
      const errorData = await playlistResponse.json();
      console.error('YouTube API error (playlistItems):', errorData);
      return [];
    }
    
    const playlistData = await playlistResponse.json();
    
    if (!playlistData.items || playlistData.items.length === 0) {
      console.error('No videos found in the uploads playlist');
      return [];
    }
    
    // Extract video IDs from playlist items
    const videoIds = playlistData.items.map((item: YouTubePlaylistItem) => item.contentDetails.videoId);
    
    // Step 2: Get detailed video information
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}&key=${API_KEY}`;
    const videosResponse = await fetch(videosUrl);
    
    if (!videosResponse.ok) {
      const errorData = await videosResponse.json();
      console.error('YouTube API error (videos):', errorData);
      return [];
    }
    
    const videosData = await videosResponse.json();
    
    if (!videosData.items || videosData.items.length === 0) {
      console.error('No video details found');
      return [];
    }
    
    // Format the video data
    return videosData.items.map((video: YouTubeVideo) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      publishedAt: video.snippet.publishedAt,
      channelId: video.snippet.channelId,
      channelTitle: video.snippet.channelTitle,
      thumbnails: {
        default: video.snippet.thumbnails.default,
        medium: video.snippet.thumbnails.medium,
        high: video.snippet.thumbnails.high,
        standard: video.snippet.thumbnails.standard,
        maxres: video.snippet.thumbnails.maxres,
      },
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount || '0',
      likeCount: video.statistics.likeCount || '0',
      commentCount: video.statistics.commentCount || '0',
      tags: video.snippet.tags,
    }));
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    return [];
  }
}

/**
 * Format ISO 8601 duration to human-readable format
 * Example: PT1H30M15S -> 1:30:15
 */
export function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Format view count to human-readable format
 * Example: 1000000 -> 1M
 */
export function formatViewCount(viewCount: string): string {
  const count = parseInt(viewCount);
  if (isNaN(count)) return '0 views';
  
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`;
  } else {
    return `${count} views`;
  }
} 