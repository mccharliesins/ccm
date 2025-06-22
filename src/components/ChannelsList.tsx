"use client";

import React from "react";
import { YouTubeChannel } from "@/lib/youtube";
import Image from "next/image";

interface ChannelsListProps {
  channels: YouTubeChannel[];
}

export default function ChannelsList({ channels }: ChannelsListProps) {
  // Format subscriber count with commas and abbreviate if large
  const formatSubscriberCount = (count: string) => {
    const num = parseInt(count, 10);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  if (channels.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 dark:text-gray-400">
          No YouTube channels added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex space-x-4">
        {channels.map((channel) => {
          if (!channel.channelInfo) {
            return (
              <div
                key={channel.id}
                className="flex-shrink-0 w-32 bg-white dark:bg-gray-800 rounded-lg shadow p-2 text-center"
              >
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
                <p className="mt-2 text-xs text-gray-800 dark:text-gray-200 truncate">
                  Loading...
                </p>
              </div>
            );
          }

          const channelUrl = `https://www.youtube.com/channel/${channel.channelInfo.id}`;

          return (
            <a
              key={channel.id}
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-36 bg-white dark:bg-gray-800 rounded-lg shadow p-3 text-center hover:shadow-md transition-shadow"
            >
              <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto border-2 border-gray-100 dark:border-gray-700">
                <Image
                  src={
                    channel.channelInfo.thumbnails.medium ||
                    channel.channelInfo.thumbnails.default
                  }
                  alt={channel.channelInfo.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                {channel.channelInfo.title}
              </p>
              <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400">
                <span className="truncate">
                  {formatSubscriberCount(channel.channelInfo.subscriberCount)}{" "}
                  subs
                </span>
                <span className="truncate">
                  {channel.channelInfo.videoCount} videos
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
