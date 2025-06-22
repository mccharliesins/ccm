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
  niche?: string;
  notes?: string;
};

/**
 * Extract channel ID from various YouTube URL formats
 */
export function extractChannelId(url: string): string | null {
  console.log("Extracting channel ID from URL:", url);

  // Handle direct URLs
  if (url.startsWith('@')) {
    console.log("Found handle format (direct):", url);
    return url;
  }

  // Handle channel URLs
  const channelRegex = /youtube\.com\/channel\/([^\/\?]+)/;
  const channelMatch = url.match(channelRegex);
  if (channelMatch) {
    console.log("Found channel ID format:", channelMatch[1]);
    return channelMatch[1];
  }

  // Handle user URLs
  const userRegex = /youtube\.com\/user\/([^\/\?]+)/;
  const userMatch = url.match(userRegex);
  if (userMatch) {
    console.log("Found user format:", userMatch[1]);
    return userMatch[1];
  }

  // Handle handle URLs (new @username format)
  const handleRegex = /youtube\.com\/@([^\/\?]+)/;
  const handleMatch = url.match(handleRegex);
  if (handleMatch) {
    console.log("Found handle format:", '@' + handleMatch[1]);
    return '@' + handleMatch[1];
  }

  // Handle c/ URLs
  const cRegex = /youtube\.com\/c\/([^\/\?]+)/;
  const cMatch = url.match(cRegex);
  if (cMatch) {
    console.log("Found c/ format:", cMatch[1]);
    return cMatch[1];
  }

  // Handle youtu.be short URLs
  const shortRegex = /youtu\.be\/([^\/\?]+)/;
  const shortMatch = url.match(shortRegex);
  if (shortMatch) {
    console.log("Found youtu.be format:", shortMatch[1]);
    return shortMatch[1];
  }

  // Handle full channel name as input
  if (url.includes(' ') || url.length > 30) {
    console.log("Found channel name format (not a URL):", url);
    return url;
  }

  console.log("No channel ID found in URL:", url);
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
 * Find related channels based on a seed channel using Perplexity API for analysis
 * 
 * @param channelId The ID of the channel to find related channels for
 * @returns Array of related channels with detailed information
 */
export async function findRelatedChannels(
  channelId: string
): Promise<{ channels: RelatedChannel[], rawResponse: string }> {
  try {
    console.log("Starting findRelatedChannels for channelId:", channelId);
    
    // Step 1: Get channel info for the reference channel
    const channelInfo = await getChannelInfo(channelId);
    if (!channelInfo) {
      console.error("Could not get channel info for the reference channel");
      return { channels: [], rawResponse: "" };
    }

    // Step 2: Get recent videos from the channel
    const recentVideos = await getRecentVideos(channelId, 20);
    if (recentVideos.length === 0) {
      console.error("No videos found for the reference channel");
      return { channels: [], rawResponse: "" };
    }
    
    // Extract video titles
    const videoTitles = recentVideos.map(video => video.title);
    
    // Step 3: Use Perplexity API to analyze and find similar channels
    // Get the raw response from Perplexity
    const perplexityResponse = await getRawPerplexityResponse(
      channelInfo.title,
      channelInfo.customUrl || `https://youtube.com/channel/${channelId}`,
      videoTitles
    );
    
    // For now, just return the mock data and raw response
    return { 
      channels: getMockRelatedChannels(),
      rawResponse: perplexityResponse
    };
  } catch (error) {
    console.error('Error finding related channels:', error);
    return { channels: [], rawResponse: "" };
  }
}

/**
 * Get raw response from Perplexity API without processing
 */
async function getRawPerplexityResponse(
  channelName: string,
  channelUrl: string,
  videoTitles: string[]
): Promise<string> {
  try {
    const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;
    
    if (!PERPLEXITY_API_KEY) {
      console.error('Perplexity API key is not available');
      return getMockPerplexityResponse();
    }

    // Format video titles for the prompt
    const formattedVideoTitles = videoTitles.map(title => `- ${title}`).join('\n');
    
    // Create the prompt for Perplexity
    const prompt = `
I want you to analyze and rank YouTube channels based on their similarity to a reference channel.

Input parameters:

Reference Channel Name: ${channelName}
Reference Channel URL: ${channelUrl}

Reference Channel Niche/Category: You have to determine the niche of the channel given above

Latest 10-20 Video Titles from Reference Channel:
REFERENCE_VIDEO_TITLES:
${formattedVideoTitles}

You have to find atleast 12 channels in the same niche, having the following:

For each channel in the list, analyze the following:

Content niche and category match with the reference channel

Style and tone similarity - find the style and tone first

Topics covered - fetch and properly understand the topics covered

Video format and length similarity

Engagement and depth of content relevant to the niche

Output the results as a CSV table with these columns:

Rank (by similarity score)

Channel Name

Niche/Category

Similarity Score (0-10)

Notes on similarity and differences

Make sure the output is concise, factual.

Please provide the output in CSV format.
`;

    console.log("Calling Perplexity API for similar channels analysis");
    
    try {
      // Call Perplexity API with sonar-pro model
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Perplexity API error:', errorData);
        return getMockPerplexityResponse();
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Extract the CSV data from the response
      // The response might include thinking process and other text, so we need to extract just the CSV part
      let csvContent = content;
      
      // Try to extract CSV from code blocks if present
      const csvMatch = content.match(/```(?:csv)?\s*([\s\S]*?)```/);
      if (csvMatch) {
        csvContent = csvMatch[1].trim();
      }
      
      console.log("Received CSV content from Perplexity");
      return csvContent;
    } catch (error) {
      console.error('Error calling Perplexity API:', error);
      return getMockPerplexityResponse();
    }
  } catch (error) {
    console.error('Error in getRawPerplexityResponse:', error);
    return getMockPerplexityResponse();
  }
}

/**
 * Get mock Perplexity API response for testing
 */
function getMockPerplexityResponse(): string {
  return `
Rank,Channel Name,Niche/Category,Similarity Score (0-10),Notes on similarity and differences
1,ForrestKnight,Tech/Developer Commentary,9,"Very strong match: Industry commentary, dev career advice, humor, portfolio reviews, and critical takes match Anthony Sistilli's core style and audience."
2,Joma Tech,Tech/Comedy/Industry Satire,9,"Strong overlap: Blends developer career, industry satire, and startup stories with comedic and informative commentary, similar tone and format."
3,TechLead,Tech/Industry Critique,8,"High similarity: Focuses on tech industry, FAANG, and software careers with opinionated, satirical style; longer videos and more cynical humor."
4,ThePrimeTime,Tech/Developer Life,8,"Strong overlap: Developer careers, interviewing, industry trends, humor, and critical analysis; similar video length and engagement."
5,Nick White,Tech/Dev Interviews & Commentary,7,"Good match: Focus on coding interviews, developer advice, and critique, but skews more technical and interview-oriented."
6,Clément Mihailescu,Tech/Coding Careers,7,"Developer interviews, resume advice, and industry commentary with some humor; style is slightly more educational than satirical."
7,Fireship,Tech/Trends/Quick Commentary,7,"Tech/AI/dev tools news, witty short-form commentary, and deep insight; leans more educational, but shares humor and modern topics."
8,Ben Awad,Tech/Developer Humor,7,"Developer humor, coding culture, and meme-driven skits; similar audience and tone, less focus on industry critique."
9,Marc Lou,Tech/Indie Startups/Commentary,7,"Tech/startup commentary, entrepreneurial humor, solo dev projects, and industry critique; more focused on side projects and startups."
10,Theo - t3.gg,Tech/Web Dev/Industry Takes,6,"Web dev, tech trends, developer culture; combines critique and humor, but focuses more on frameworks and technical content."
11,Jarvis Johnson,Tech/Commentary/Internet Culture,6,"Covers tech culture and industry with humor, but broader focus on pop/internet culture outside of strict developer topics."
12,Ali Spittel,Tech/Developer Advice,6,"Developer advice, career, and tech commentary; similar topics with a more educational, less satirical slant."
  `;
}

/**
 * Get channel information by ID
 */
async function getChannelInfo(channelId: string) {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.error('YouTube API key is not available');
      return null;
    }

    // Handle @username format for channel IDs
    if (channelId.startsWith('@')) {
      // Use forHandle parameter instead of id for @username format
      const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=${channelId}&key=${API_KEY}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('YouTube API error (channels):', errorData);
        return null;
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        console.error('No channel information found for handle:', channelId);
        return null;
      }
      
      // Continue with the rest of the function
      const channel = data.items[0];
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
        viewCount: channel.statistics.viewCount || '0'
      };
    }

    // Regular channel ID lookup
    const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API error (channels):', errorData);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.error('No channel information found');
      return null;
    }
    
    const channel = data.items[0];
    
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
      viewCount: channel.statistics.viewCount || '0'
    };
  } catch (error) {
    console.error('Error getting channel info:', error);
    return null;
  }
}

interface PerplexityChannel {
  rank: number;
  channelName: string;
  niche: string;
  similarityScore: number;
  notes: string;
}

/**
 * Use Perplexity API to find similar channels based on reference channel
 */
async function findSimilarChannelsWithPerplexity(
  channelName: string,
  channelUrl: string,
  videoTitles: string[]
): Promise<PerplexityChannel[]> {
  try {
    const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;
    
    if (!PERPLEXITY_API_KEY) {
      console.error('Perplexity API key is not available');
      return [];
    }
    
    // Format video titles for the prompt
    const formattedVideoTitles = videoTitles.map(title => `- ${title}`).join('\n');
    
    // Create the prompt for Perplexity
    const prompt = `
I want you to analyze and rank YouTube channels based on their similarity to a reference channel.

Input parameters:

Reference Channel Name: ${channelName}
Reference Channel URL: ${channelUrl}

Reference Channel Niche/Category: You have to determine the niche of the channel given above

Latest 10-20 Video Titles from Reference Channel:
REFERENCE_VIDEO_TITLES:
${formattedVideoTitles}

You have to find atleast 12 channels in the same niche, having the following:

For each channel in the list, analyze the following:

Content niche and category match with the reference channel

Style and tone similarity - find the style and tone first

Topics covered - fetch and properly understand the topics covered

Video format and length similarity

Engagement and depth of content relevant to the niche

Output the results as a CSV table with these columns:

Rank (by similarity score)

Channel Name

Niche/Category

Similarity Score (0-10)

Notes on similarity and differences

Make sure the output is concise, factual.

Please provide the output in CSV format.
`;

    console.log("Calling Perplexity API for similar channels analysis");
    
    // Call Perplexity API with sonar-pro model
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Perplexity API error:', errorData);
      return [];
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract the CSV data from the response
    // The response might include thinking process and other text, so we need to extract just the CSV part
    let csvContent = content;
    
    // Try to extract CSV from code blocks if present
    const csvMatch = content.match(/```(?:csv)?\s*([\s\S]*?)```/);
    if (csvMatch) {
      csvContent = csvMatch[1].trim();
    }
    
    console.log("Received CSV content:", csvContent);
    
    // Parse CSV content
    const lines = csvContent.trim().split('\n');
    
    // Skip header line if it exists
    const headerLine = lines[0].toLowerCase();
    const startIndex = headerLine.includes('rank') || 
                       headerLine.includes('channel name') || 
                       headerLine.includes('similarity score') ? 1 : 0;
    
    const channels: PerplexityChannel[] = [];
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Split by comma, but handle commas within quotes
      const parts: string[] = [];
      let currentPart = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(currentPart.trim());
          currentPart = '';
        } else {
          currentPart += char;
        }
      }
      
      // Add the last part
      parts.push(currentPart.trim());
      
      // Remove quotes from parts
      const cleanParts = parts.map(part => part.replace(/^"(.*)"$/, '$1').trim());
      
      // Expect format: Rank, Channel Name, Niche/Category, Similarity Score, Notes
      // If there's a URL column, we'll ignore it
      if (cleanParts.length >= 4) {
        let rank = parseInt(cleanParts[0]) || i;
        let channelName = cleanParts[1];
        let niche = '';
        let similarityScore = 0;
        let notes = '';
        
        // Handle different CSV formats that might be returned
        if (cleanParts.length === 4) {
          // Format: Rank, Channel Name, Niche, Score
          niche = cleanParts[2];
          similarityScore = parseFloat(cleanParts[3]) || 0;
        } else if (cleanParts.length === 5) {
          // Format: Rank, Channel Name, Niche, Score, Notes
          niche = cleanParts[2];
          similarityScore = parseFloat(cleanParts[3]) || 0;
          notes = cleanParts[4];
        } else if (cleanParts.length >= 6) {
          // Format: Rank, Channel Name, Channel URL, Niche, Score, Notes
          // We'll ignore the URL as we'll fetch it ourselves
          niche = cleanParts[3];
          similarityScore = parseFloat(cleanParts[4]) || 0;
          notes = cleanParts[5];
        }
        
        channels.push({
          rank,
          channelName,
          niche,
          similarityScore,
          notes
        });
      }
    }
    
    console.log(`Found ${channels.length} channels from Perplexity analysis`);
    return channels;
  } catch (error) {
    console.error('Error finding similar channels with Perplexity:', error);
    return [];
  }
}

/**
 * Get detailed channel information for a list of channels
 */
async function getDetailedChannelInfo(channels: PerplexityChannel[]): Promise<RelatedChannel[]> {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.error('YouTube API key is not available');
      return [];
    }

    const detailedChannels: RelatedChannel[] = [];
    
    // Process channels in batches to avoid rate limits
    for (const channel of channels) {
      try {
        console.log(`Searching for channel: ${channel.channelName}`);
        
        // Search for the channel by name
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channel.channelName)}&maxResults=5&order=viewCount&key=${API_KEY}`;
        const searchResponse = await fetch(searchUrl);
        
        if (!searchResponse.ok) {
          const errorData = await searchResponse.json();
          console.error('YouTube API error (search):', errorData);
          continue;
        }
        
        const searchData = await searchResponse.json();
        
        if (!searchData.items || searchData.items.length === 0) {
          console.log(`No channels found for name: ${channel.channelName}`);
          continue;
        }
        
        // Get the first channel from search results (most viewed/subscribed)
        const channelId = searchData.items[0].snippet.channelId;
        
        // Get detailed channel information
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`;
        const channelResponse = await fetch(channelUrl);
        
        if (!channelResponse.ok) {
          const errorData = await channelResponse.json();
          console.error('YouTube API error (channels):', errorData);
          continue;
        }
        
        const channelData = await channelResponse.json();
        
        if (!channelData.items || channelData.items.length === 0) {
          console.log(`No channel details found for ID: ${channelId}`);
          continue;
        }
        
        const channelDetails = channelData.items[0];
        
        detailedChannels.push({
          id: channelDetails.id,
          title: channelDetails.snippet.title,
          description: channelDetails.snippet.description,
          customUrl: channelDetails.snippet.customUrl || '',
          thumbnails: {
            default: channelDetails.snippet.thumbnails.default?.url || '',
            medium: channelDetails.snippet.thumbnails.medium?.url || '',
            high: channelDetails.snippet.thumbnails.high?.url || '',
          },
          subscriberCount: channelDetails.statistics.subscriberCount || '0',
          videoCount: channelDetails.statistics.videoCount || '0',
          viewCount: channelDetails.statistics.viewCount || '0',
          matchFrequency: channel.similarityScore,
          niche: channel.niche,
          notes: channel.notes
        });
        
        console.log(`Successfully added channel: ${channelDetails.snippet.title}`);
      } catch (error) {
        console.error(`Error getting details for channel "${channel.channelName}":`, error);
      }
      
      // Add a small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Sort by similarity score (descending)
    return detailedChannels.sort((a, b) => b.matchFrequency - a.matchFrequency);
  } catch (error) {
    console.error('Error getting detailed channel info:', error);
    return [];
  }
}

/**
 * Get top performing videos from a channel in the last 6 months
 * 
 * @param channelId The channel ID to get videos from
 * @param maxResults Maximum number of results to return (default: 20)
 * @returns Array of video details
 */
export async function getTopPerformingVideos(channelId: string, maxResults: number = 20): Promise<YouTubeVideoInfo[]> {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.error('YouTube API key is not available');
      return [];
    }
    
    // Calculate date 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const publishedAfter = sixMonthsAgo.toISOString();
    
    // Get top performing videos from the channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=viewCount&publishedAfter=${publishedAfter}&maxResults=${maxResults}&key=${API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error('YouTube API error (search):', errorData);
      return [];
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      console.log(`No videos found for channel ${channelId}`);
      return [];
    }
    
    // Extract video IDs
    const videoIds = searchData.items.map((item: {id: {videoId: string}}) => item.id.videoId);
    
    // Get detailed video information
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}&key=${API_KEY}`;
    const videosResponse = await fetch(videosUrl);
    
    if (!videosResponse.ok) {
      const errorData = await videosResponse.json();
      console.error('YouTube API error (videos):', errorData);
      return [];
    }
    
    const videosData = await videosResponse.json();
    
    if (!videosData.items || videosData.items.length === 0) {
      console.log(`No video details found for channel ${channelId}`);
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
    console.error(`Error getting top performing videos for channel ${channelId}:`, error);
    return [];
  }
}

/**
 * Get recent videos from a channel
 * 
 * @param channelId The channel ID to get videos from
 * @param maxResults Maximum number of results to return (default: 20)
 * @returns Array of video details
 */
export async function getRecentVideos(channelId: string, maxResults: number = 20): Promise<YouTubeVideoInfo[]> {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.error('YouTube API key is not available');
      return [];
    }
    
    // Get recent videos from the channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxResults}&key=${API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error('YouTube API error (search):', errorData);
      return [];
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      console.log(`No videos found for channel ${channelId}`);
      return [];
    }
    
    // Extract video IDs
    const videoIds = searchData.items.map((item: {id: {videoId: string}}) => item.id.videoId);
    
    // Get detailed video information
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}&key=${API_KEY}`;
    const videosResponse = await fetch(videosUrl);
    
    if (!videosResponse.ok) {
      const errorData = await videosResponse.json();
      console.error('YouTube API error (videos):', errorData);
      return [];
    }
    
    const videosData = await videosResponse.json();
    
    if (!videosData.items || videosData.items.length === 0) {
      console.log(`No video details found for channel ${channelId}`);
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
    console.error(`Error getting recent videos for channel ${channelId}:`, error);
    return [];
  }
}

export interface ContentIdea {
  title: string;
  description: string;
  tags: string[];
  estimatedViews: string;
  targetKeywords: string[];
  thumbnailIdeas: string[];
}

/**
 * Generate content ideas based on top performing videos from related channels
 * and the creator's own voice/tone
 * 
 * @param relatedChannels Array of related channels
 * @param creatorChannelId The creator's channel ID
 * @param numIdeas Number of content ideas to generate (default: 5)
 * @returns Array of content ideas
 */
export async function generateContentIdeas(
  relatedChannels: RelatedChannel[],
  creatorChannelId: string,
  numIdeas: number = 5
): Promise<ContentIdea[]> {
  try {
    const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key is not available');
      return [];
    }
    
    console.log("Generating content ideas for creator channel:", creatorChannelId);
    
    // Get top performing videos from related channels
    const topVideosPromises = relatedChannels.slice(0, 5).map(channel => 
      getTopPerformingVideos(channel.id, 5)
    );
    
    const topVideosArrays = await Promise.all(topVideosPromises);
    const topVideos = topVideosArrays.flat().sort((a, b) => 
      parseInt(b.viewCount) - parseInt(a.viewCount)
    ).slice(0, 20);
    
    console.log(`Found ${topVideos.length} top performing videos from related channels`);
    
    // Get recent videos from creator's channel
    const creatorVideos = await getRecentVideos(creatorChannelId, 20);
    console.log(`Found ${creatorVideos.length} recent videos from creator's channel`);
    
    if (topVideos.length === 0 || creatorVideos.length === 0) {
      console.error('Not enough videos to generate content ideas');
      return [];
    }
    
    // Prepare the prompt for Gemini
    const topVideosData = topVideos.map((video, i) => `
Video ${i + 1} (${formatViewCount(video.viewCount)}):
Title: ${video.title}
Description: ${video.description?.substring(0, 200)}${video.description?.length > 200 ? '...' : ''}
Tags: ${video.tags ? video.tags.join(', ') : 'None'}
`).join('\n');

    const creatorVideosData = creatorVideos.map((video, i) => `
Video ${i + 1}:
Title: ${video.title}
Description: ${video.description?.substring(0, 200)}${video.description?.length > 200 ? '...' : ''}
Tags: ${video.tags ? video.tags.join(', ') : 'None'}
`).join('\n');

    const prompt = `
You are an expert YouTube strategist.
Below are the top-performing video titles and descriptions from similar creators in this niche (last 6 months):

${topVideosData}

And here are the last 20 videos from the target creator:

${creatorVideosData}

Based on the viral topics and trends, and in the same tone and conversational style as the target creator, generate ${numIdeas} video ideas that could perform well.

For each idea, provide:
1. A catchy title that would work well for YouTube's algorithm
2. A brief description (2-3 sentences)
3. 5-7 relevant tags
4. Estimated view potential (low/medium/high)
5. 3-5 target keywords for SEO
6. 2 thumbnail ideas described in a few words

Format your response as a JSON array with the following structure:
[
  {
    "title": "Title here",
    "description": "Description here",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "estimatedViews": "high",
    "targetKeywords": ["keyword1", "keyword2", "keyword3"],
    "thumbnailIdeas": ["Thumbnail idea 1", "Thumbnail idea 2"]
  },
  ...
]

Only include the JSON array in your response, nothing else.
`;

    console.log("Calling Gemini API for content ideas");
    
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
    
    try {
      // Parse the JSON response
      const contentIdeas = JSON.parse(content) as ContentIdea[];
      return contentIdeas;
    } catch (error) {
      console.error('Error parsing content ideas JSON:', error);
      console.error('Raw content:', content);
      return [];
    }
  } catch (error) {
    console.error('Error generating content ideas:', error);
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
      matchFrequency: 8.5,
      niche: "Gaming & Let's Plays",
      notes: "Strong match in gaming niche with similar focus on strategy games and RPGs. Creates similar tutorial and walkthrough content."
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
      matchFrequency: 7.2,
      niche: "Tech Reviews",
      notes: "Similar presentation style and production value. Covers overlapping tech topics but with more focus on hardware reviews."
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
      matchFrequency: 6.8,
      niche: "Design & Creative Skills",
      notes: "Similar tutorial format and teaching style. Different niche but comparable audience demographics and engagement patterns."
    },
    {
      id: "mock-channel-4",
      title: "Digital Marketing Mastery",
      description: "Expert tips and strategies for digital marketing success. SEO, social media, content marketing, and more.",
      customUrl: "digitalmarketingmastery",
      thumbnails: {
        default: "https://via.placeholder.com/88",
        medium: "https://via.placeholder.com/240",
        high: "https://via.placeholder.com/800"
      },
      subscriberCount: "950000",
      videoCount: "328",
      viewCount: "42000000",
      matchFrequency: 5.9,
      niche: "Digital Marketing",
      notes: "Complementary content that appeals to similar business-oriented audience. Different primary topics but similar presentation style."
    }
  ];
}

// Add new interface for enhanced content ideas
export interface EnhancedContentIdea {
  title: string;
  description: string;
  viralityScore: number;
  whyToMake: string;
}

/**
 * Get channel bio (description) from YouTube API
 * 
 * @param channelId The channel ID to get bio for
 * @returns Channel description
 */
export async function getChannelBio(channelId: string): Promise<string> {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.error('YouTube API key is not available');
      return '';
    }

    // Handle @username format for channel IDs
    let apiUrl = '';
    if (channelId.startsWith('@')) {
      // Use forHandle parameter instead of id for @username format
      apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${channelId}&key=${API_KEY}`;
    } else {
      // Regular channel ID lookup
      apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`;
    }

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API error (channels):', errorData);
      return '';
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.error('No channel information found');
      return '';
    }
    
    return data.items[0].snippet.description || '';
  } catch (error) {
    console.error('Error getting channel bio:', error);
    return '';
  }
}

/**
 * Generate enhanced content ideas based on reference channel and similar channels
 * 
 * @param referenceChannelId The reference channel ID
 * @param similarChannelIds Array of similar channel IDs (up to 5)
 * @returns Array of enhanced content ideas
 */
export async function generateEnhancedContentIdeas(
  referenceChannelId: string,
  similarChannelIds: string[]
): Promise<EnhancedContentIdea[]> {
  try {
    const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;
    
    if (!PERPLEXITY_API_KEY) {
      console.error('Perplexity API key is not available');
      return [];
    }
    
    console.log("Generating enhanced content ideas for reference channel:", referenceChannelId);
    
    // Get reference channel info
    const referenceChannelInfo = await getChannelInfo(referenceChannelId);
    if (!referenceChannelInfo) {
      console.error('Could not get reference channel info');
      return [];
    }
    
    // Get reference channel bio
    const referenceChannelBio = await getChannelBio(referenceChannelId);
    
    // Get reference channel recent videos (last 15)
    const referenceVideos = await getRecentVideos(referenceChannelId, 15);
    console.log(`Found ${referenceVideos.length} recent videos from reference channel`);
    
    // Limit similar channels to 5
    const limitedSimilarChannelIds = similarChannelIds.slice(0, 5);
    
    // Get similar channels info and videos
    const similarChannelsData = [];
    for (const channelId of limitedSimilarChannelIds) {
      const channelInfo = await getChannelInfo(channelId);
      if (!channelInfo) continue;
      
      const channelBio = await getChannelBio(channelId);
      
      // Get top performing videos from similar channel
      const topVideos = await getTopPerformingVideos(channelId, 10);
      
      similarChannelsData.push({
        name: channelInfo.title,
        url: channelInfo.customUrl || `https://youtube.com/channel/${channelId}`,
        bio: channelBio,
        videos: topVideos.map(video => video.title)
      });
    }
    
    // Prepare the prompt for Perplexity
    let prompt = `
I want you to generate 10 high-potential video content ideas for a reference YouTube channel by deeply analyzing both the reference channel's recent content and the best-performing videos of its competitor channels.

Input data you will receive:

1. Reference Channel Data:  
- Name: "${referenceChannelInfo.title}"  
- URL: "${referenceChannelInfo.customUrl || `https://youtube.com/channel/${referenceChannelId}`}"  
- Bio: "${referenceChannelBio}"  
- Last 15 Video Titles:  
${referenceVideos.map(video => `  "${video.title}"`).join('\n')}

2. Competitor Channels Data (for each competitor):  
`;

    // Add similar channels data
    similarChannelsData.forEach((channel, index) => {
      prompt += `
- Name: "${channel.name}"  
- URL: "${channel.url}"  
- Bio: "${channel.bio}"  
- Best Performing 10 Video Titles:  
${channel.videos.map(title => `  "${title}"`).join('\n')}

`;
      if (index < similarChannelsData.length - 1) {
        prompt += '\n';
      }
    });

    prompt += `
Your task:

- Analyze the reference channel's niche, style, and recent video topics.  
- Analyze the competitor channels' niches, styles, and best-performing video topics.  
- Identify trending, engaging, and relevant content themes across all data.  
- Generate a list of 10 video ideas tailored specifically for the reference channel, considering its unique style and audience.  
- For each idea, provide:  
  - **title** (in a conversational, slightly sarcastic or candid tone matching the reference channel)  
  - **description** (brief, engaging, and in the reference channel's tone)  
  - **virality score** (scale 1-10, based on trendiness, audience interest, and shareability)  
  - **why to make this video** (a short rationale explaining the idea's relevance and potential impact)

Output format:

Provide the output as a CSV with the following columns, each value enclosed in double quotes for easy parsing:

"title","description","virality score","why to make this video"

Example:
"Why Finding a Dev Job in 2025 is Actually Worse Than You Think","Dive into the brutal realities of the 2025 dev job market, AI interview bots, and why your resume might be getting ghosted more than ever. Spoiler: It's not just you.","9","Addresses urgent pain points developers face in the current job market, driving high engagement."

Make sure the tone is consistent with the reference channel's style. Only include the CSV data in your response, nothing else.
`;

    console.log("Calling Perplexity API for enhanced content ideas");
    
    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Perplexity API error:', errorData);
      return [];
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      // Parse the CSV response
      const lines = content.split('\n').filter((line: string) => line.trim());
      
      // Skip header line if present
      const startIndex = lines[0].toLowerCase().includes('title') ? 1 : 0;
      
      const ideas: EnhancedContentIdea[] = [];
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        
        // Parse CSV line with proper handling of quoted fields
        const fields = parseCSVLine(line);
        
        if (fields && fields.length >= 4) {
          ideas.push({
            title: fields[0],
            description: fields[1],
            viralityScore: parseInt(fields[2]) || 0,
            whyToMake: fields[3]
          });
        }
      }
      
      return ideas;
    } catch (error) {
      console.error('Error parsing enhanced content ideas:', error);
      return [];
    }
  } catch (error) {
    console.error('Error generating enhanced content ideas:', error);
    return [];
  }
}

/**
 * Helper function to parse a CSV line with proper handling of quoted fields
 */
function parseCSVLine(line: string): string[] | null {
  try {
    const result: string[] = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      // Handle quotes
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Double quotes inside quoted field = escaped quote
          currentField += '"';
          i += 2; // Skip both quotes
          continue;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
          continue;
        }
      }
      
      // Handle commas
      if (char === ',' && !inQuotes) {
        result.push(currentField);
        currentField = '';
        i++;
        continue;
      }
      
      // Add character to current field
      currentField += char;
      i++;
    }
    
    // Add the last field
    result.push(currentField);
    
    // Clean up quotes from all fields
    return result.map(field => {
      // Remove surrounding quotes if present
      if (field.startsWith('"') && field.endsWith('"')) {
        return field.substring(1, field.length - 1).trim();
      }
      return field.trim();
    });
  } catch (error) {
    console.error("Error parsing CSV line:", error);
    return null;
  }
} 