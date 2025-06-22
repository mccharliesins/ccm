"use client";

import { YouTubeChannelInfo, YouTubeVideoInfo } from "./youtube-api";

// Define YouTube channel type
export type YouTubeChannel = {
  id: string;
  url: string;
  addedAt: string;
  channelInfo?: YouTubeChannelInfo;
};

// Function to get all channels
export function getChannels(): YouTubeChannel[] {
  if (typeof window === "undefined") {
    return [];
  }

  const channelsJson = localStorage.getItem("youtube_channels") || "[]";
  try {
    return JSON.parse(channelsJson);
  } catch (error) {
    console.error("Failed to parse YouTube channels from localStorage", error);
    return [];
  }
}

// Function to add a channel
export function addChannel(
  url: string,
  channelInfo?: YouTubeChannelInfo
): YouTubeChannel {
  const channels = getChannels();

  // Basic URL validation
  if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
    throw new Error("Invalid YouTube URL");
  }

  // Create new channel
  const newChannel: YouTubeChannel = {
    id: Date.now().toString(),
    url,
    addedAt: new Date().toISOString(),
    channelInfo,
  };

  // Add to channels array
  channels.push(newChannel);
  localStorage.setItem("youtube_channels", JSON.stringify(channels));

  return newChannel;
}

// Function to update a channel
export function updateChannel(
  id: string,
  updates: Partial<YouTubeChannel>
): YouTubeChannel | null {
  const channels = getChannels();
  const index = channels.findIndex((channel) => channel.id === id);

  if (index === -1) {
    return null;
  }

  // Update channel
  const updatedChannel = {
    ...channels[index],
    ...updates,
  };

  channels[index] = updatedChannel;
  localStorage.setItem("youtube_channels", JSON.stringify(channels));

  return updatedChannel;
}

// Function to remove a channel
export function removeChannel(id: string): void {
  const channels = getChannels();
  const updatedChannels = channels.filter((channel) => channel.id !== id);
  localStorage.setItem("youtube_channels", JSON.stringify(updatedChannels));
}

// Function to store channel videos in localStorage
export function storeChannelVideos(
  channelId: string,
  videos: YouTubeVideoInfo[]
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Store with timestamp for cache invalidation
    const videoData = {
      videos,
      timestamp: Date.now(),
      channelId,
    };

    localStorage.setItem(
      `youtube_videos_${channelId}`,
      JSON.stringify(videoData)
    );
  } catch (error) {
    console.error("Failed to store channel videos in localStorage", error);
  }
}

// Function to get channel videos from localStorage
export function getChannelVideos(
  channelId: string
): { videos: YouTubeVideoInfo[]; timestamp: number } | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const videoDataJson = localStorage.getItem(`youtube_videos_${channelId}`);
    if (!videoDataJson) return null;

    return JSON.parse(videoDataJson);
  } catch (error) {
    console.error("Failed to get channel videos from localStorage", error);
    return null;
  }
}

// Function to get all stored videos across channels
export function getAllVideos(): YouTubeVideoInfo[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const channels = getChannels();
    let allVideos: YouTubeVideoInfo[] = [];

    channels.forEach((channel) => {
      if (channel.channelInfo?.id) {
        const videoData = getChannelVideos(channel.channelInfo.id);
        if (videoData) {
          allVideos = [...allVideos, ...videoData.videos];
        }
      }
    });

    // Sort by publish date (newest first)
    return allVideos.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch (error) {
    console.error("Failed to get all videos from localStorage", error);
    return [];
  }
}

// Check if videos need to be refreshed (older than 1 hour)
export function shouldRefreshVideos(channelId: string): boolean {
  const videoData = getChannelVideos(channelId);
  if (!videoData) return true;

  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
  return Date.now() - videoData.timestamp > oneHour;
}
