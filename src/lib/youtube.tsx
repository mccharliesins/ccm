"use client";

import React from "react";
import { YouTubeChannelInfo } from "./youtube-api";

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
