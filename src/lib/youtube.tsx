"use client";

import React from "react";

// Define YouTube channel type
export type YouTubeChannel = {
  id: string;
  url: string;
  addedAt: string;
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
export function addChannel(url: string): YouTubeChannel {
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
  };

  // Add to channels array
  channels.push(newChannel);
  localStorage.setItem("youtube_channels", JSON.stringify(channels));

  return newChannel;
}

// Function to remove a channel
export function removeChannel(id: string): void {
  const channels = getChannels();
  const updatedChannels = channels.filter((channel) => channel.id !== id);
  localStorage.setItem("youtube_channels", JSON.stringify(updatedChannels));
}
