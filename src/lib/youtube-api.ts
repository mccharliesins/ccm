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

// Add new types and functions for related channels

export type RelatedChannel = {
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
  matchFrequency: number;
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
 *   - maxResults=20
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
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=20&key=${API_KEY}`;
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

/**
 * Get top videos from a channel by view count
 * 
 * API Documentation:
 * Endpoint: GET https://www.googleapis.com/youtube/v3/search
 * Parameters:
 *   - part=snippet
 *   - channelId={channelId}
 *   - type=video
 *   - order=viewCount
 *   - maxResults=10
 *   - key={API_KEY}
 * 
 * Quota Cost: 100 units per request
 */
export async function getTopChannelVideos(channelId: string, maxResults: number = 10): Promise<string[]> {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.error('YouTube API key is not available. Please set NEXT_PUBLIC_YOUTUBE_API_KEY in your environment variables.');
      return [];
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=viewCount&maxResults=${maxResults}&key=${API_KEY}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API error (search):', errorData);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.error('No videos found for channel');
      return [];
    }
    
    // Extract video IDs
    return data.items.map((item: {id: {videoId: string}}) => item.id.videoId);
  } catch (error) {
    console.error('Error fetching top channel videos:', error);
    return [];
  }
}

/**
 * Extract keywords from video titles, descriptions, and tags
 * @param videos Array of video information
 * @returns Array of extracted keywords
 */
export async function extractKeywordsFromVideos(videos: {
  title: string;
  description: string;
  tags?: string[];
}[]): Promise<string[]> {
  try {
    const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key is not available');
      
      // Fallback: Extract basic keywords from video data
      const allKeywords = new Set<string>();
      
      videos.forEach(video => {
        // Add tags if available
        if (video.tags) {
          video.tags.forEach(tag => allKeywords.add(tag));
        }
        
        // Extract words from title (simple approach)
        const titleWords = video.title
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3);
        
        titleWords.forEach(word => allKeywords.add(word));
      });
      
      return Array.from(allKeywords).slice(0, 10);
    }

    // Prepare the prompt for Gemini
    const videoData = videos.map((video, i) => `
Video ${i + 1}:
Title: ${video.title}
Description: ${video.description?.substring(0, 200)}${video.description?.length > 200 ? '...' : ''}
Tags: ${video.tags ? video.tags.join(', ') : 'None'}
`).join('\n');

    const prompt = `
I need to extract 10 highly relevant search queries for finding YouTube videos similar to these:

${videoData}

Based on these videos, provide 10 specific search queries that would find similar content on YouTube.
Each query should be 2-5 words long and focused on the topics, niches, or specific content types shown in these videos.

Format your response as a comma-separated list of queries only, like this:
query one, query two, query three, etc.

Only include the comma-separated list in your response, nothing else.
`;

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return [];
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text.trim();
    
    // Split by commas and trim each keyword
    const keywords = content.split(',').map((keyword: string) => keyword.trim());
    
    return keywords;
  } catch (error) {
    console.error('Error extracting keywords:', error);
    return [];
  }
}

/**
 * Search for videos by keyword and collect channel information
 */
export async function searchVideosByKeyword(keyword: string, maxResults: number = 20): Promise<{channelId: string, channelTitle: string}[]> {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.error('YouTube API key is not available');
      return [];
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&maxResults=${maxResults}&key=${API_KEY}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API error (search by keyword):', errorData);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.log(`No videos found for keyword: ${keyword}`);
      return [];
    }
    
    // Extract channel IDs and titles
    return data.items.map((item: {snippet: {channelId: string, channelTitle: string}}) => ({
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle
      }));
  } catch (error) {
    console.error(`Error searching videos by keyword "${keyword}":`, error);
    return [];
  }
}

/**
 * Find related channels based on a seed channel using the new approach
 * 
 * @param channelId The ID of the channel to find related channels for
 * @param minSubscribers Minimum subscriber count for filtering (default: 10,000)
 * @param maxSubscribers Maximum subscriber count for filtering (default: 500,000)
 * @returns Array of related channels with detailed information
 */
export async function findRelatedChannels(
  channelId: string, 
  minSubscribers: number = 10000,
  maxSubscribers: number = 500000
): Promise<RelatedChannel[]> {
  try {
    console.log("Starting findRelatedChannels for channelId:", channelId);
    
    // Step 1: Get top videos from the seed channel
    console.log("Step 1: Getting top videos from seed channel");
    const topVideoIds = await getTopChannelVideos(channelId, 20);
    console.log(`Found ${topVideoIds.length} top videos`);
    
    if (topVideoIds.length === 0) {
      console.log("No top videos found, returning empty array");
      return [];
    }
    
    // Step 1.1: Get detailed information for these videos
    console.log("Step 1.1: Getting detailed information for top videos");
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${topVideoIds.join(',')}&key=${API_KEY}`;
    const videosResponse = await fetch(videosUrl);
    
    if (!videosResponse.ok) {
      const errorData = await videosResponse.json();
      console.error('YouTube API error (videos):', errorData);
      return [];
    }
    
    const videosData = await videosResponse.json();
    
    if (!videosData.items || videosData.items.length === 0) {
      console.log("No video details found");
      return [];
    }
    
    // Extract video information for keyword generation
    const videoInfo = videosData.items.map((video: {
      snippet: {
        title: string;
        description: string;
        tags?: string[];
      }
            }) => ({
      title: video.snippet.title,
      description: video.snippet.description,
      tags: video.snippet.tags
    }));
    
    // Step 1.2: Extract keywords from videos
    console.log("Step 1.2: Extracting keywords from videos");
    const keywords = await extractKeywordsFromVideos(videoInfo);
    console.log(`Generated ${keywords.length} keywords:`, keywords);
    
    if (keywords.length === 0) {
      console.log("No keywords generated, returning empty array");
    return [];
    }
    
    // Step 2: Search videos by topic keywords and collect channels
    console.log("Step 2: Searching videos by topic keywords");
    const channelFrequencyMap: Record<string, { count: number, title: string }> = {};
    
    // Limit to 5 keywords to reduce API calls
    const keywordsToUse = keywords.slice(0, 5);
    
    for (const keyword of keywordsToUse) {
      console.log(`Searching for keyword: ${keyword}`);
      const channels = await searchVideosByKeyword(keyword, 20);
      
      // Update frequency map
      channels.forEach(channel => {
        // Skip the seed channel
        if (channel.channelId === channelId) return;
        
        if (channelFrequencyMap[channel.channelId]) {
          channelFrequencyMap[channel.channelId].count += 1;
        } else {
          channelFrequencyMap[channel.channelId] = {
        count: 1, 
        title: channel.channelTitle 
      };
        }
    });
    }
    
    // Step 3: Rank and deduplicate channels
    console.log("Step 3: Ranking and deduplicating channels");
    const rankedChannels = Object.entries(channelFrequencyMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20) // Take top 20 channels
      .map(([id, info]) => ({
        id,
        title: info.title,
        matchFrequency: info.count
      }));
    
    console.log(`Found ${rankedChannels.length} ranked channels`);
    
    if (rankedChannels.length === 0) {
      console.log("No ranked channels found, returning empty array");
      return [];
    }
    
    // Step 4: Fetch metadata for top channels
    console.log("Step 4: Fetching metadata for top channels");
    const channelIds = rankedChannels.map(channel => channel.id);
    const channelsInfo = await getChannelsInfo(channelIds);
    
    // Merge frequency data with channel info and filter by subscriber count
    const result = channelsInfo
      .map(channel => {
        const rankInfo = rankedChannels.find(rank => rank.id === channel.id);
        return {
      ...channel,
          matchFrequency: rankInfo?.matchFrequency || 0
        };
      })
      .filter(channel => {
        const subCount = parseInt(channel.subscriberCount, 10);
        return subCount >= minSubscribers && subCount <= maxSubscribers;
      })
      .sort((a, b) => b.matchFrequency - a.matchFrequency);
    
    console.log(`Final result: ${result.length} channels after filtering`);
    return result;
  } catch (error) {
    console.error('Error finding related channels:', error);
    return [];
  }
}

/**
 * Get channel information for a list of channel IDs
 * 
 * API Documentation:
 * Endpoint: GET https://www.googleapis.com/youtube/v3/channels
 * Parameters:
 *   - part=snippet,statistics
 *   - id={comma_separated_channel_ids}
 *   - key={API_KEY}
 * 
 * Quota Cost: 1 unit per request
 */
export async function getChannelsInfo(channelIds: string[]): Promise<RelatedChannel[]> {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.error('YouTube API key is not available. Please set NEXT_PUBLIC_YOUTUBE_API_KEY in your environment variables.');
      return [];
    }

    // Remove duplicates and limit to 20
    const uniqueIds = [...new Set(channelIds)].slice(0, 20);
    
    if (uniqueIds.length === 0) {
      return [];
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${uniqueIds.join(',')}&key=${API_KEY}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API error (channels):', errorData);
      return [];
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.error('No channel information found');
      return [];
    }
    
    // Format channel data
    return data.items.map((channel: {
      id: string;
      snippet: {
        title: string;
        description: string;
        customUrl?: string;
        thumbnails: {
          default?: { url: string };
          medium?: { url: string };
          high?: { url: string };
        };
      };
      statistics: {
        subscriberCount?: string;
        videoCount?: string;
        viewCount?: string;
      };
    }) => ({
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
      matchFrequency: 0, // Will be updated later
    }));
  } catch (error) {
    console.error('Error fetching channels info:', error);
    return [];
  }
}

/**
 * Generate mock related channels data for testing and fallback
 */
export function getMockRelatedChannels(): RelatedChannel[] {
  return [
    {
      id: "mock-channel-1",
      title: "Gaming Enthusiast",
      description: "I create gaming content focused on strategy games and RPGs. Join me for walkthroughs, tips, and gaming news!",
      customUrl: "gamingenthusiast",
      thumbnails: {
        default: "https://via.placeholder.com/88",
        medium: "https://via.placeholder.com/240",
        high: "https://via.placeholder.com/800"
      },
      subscriberCount: "1250000",
      videoCount: "342",
      viewCount: "75000000",
      matchFrequency: 5
    },
    {
      id: "mock-channel-2",
      title: "Tech Reviews Pro",
      description: "The latest tech reviews, unboxings, and comparisons. I help you make informed decisions about your tech purchases.",
      customUrl: "techreviewspro",
      thumbnails: {
        default: "https://via.placeholder.com/88",
        medium: "https://via.placeholder.com/240",
        high: "https://via.placeholder.com/800"
      },
      subscriberCount: "3500000",
      videoCount: "512",
      viewCount: "245000000",
      matchFrequency: 4
    },
    {
      id: "mock-channel-3",
      title: "Creative Tutorials",
      description: "Learn creative skills from an experienced designer. Tutorials on graphic design, illustration, and digital art.",
      customUrl: "creativetutorials",
      thumbnails: {
        default: "https://via.placeholder.com/88",
        medium: "https://via.placeholder.com/240",
        high: "https://via.placeholder.com/800"
      },
      subscriberCount: "780000",
      videoCount: "215",
      viewCount: "35000000",
      matchFrequency: 3
    }
  ];
} 