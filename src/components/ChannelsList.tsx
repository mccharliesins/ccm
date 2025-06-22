"use client";

import React from "react";
import { YouTubeChannel } from "@/lib/youtube";
import Image from "next/image";

interface ChannelsListProps {
  channels: YouTubeChannel[];
}

export default function ChannelsList({ channels }: ChannelsListProps) {
  if (channels.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No YouTube channels added yet.</p>
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
                className="flex-shrink-0 w-32 bg-white rounded-lg shadow p-2 text-center"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto"></div>
                <p className="mt-2 text-xs text-gray-800 truncate">
                  Loading...
                </p>
              </div>
            );
          }

          return (
            <div
              key={channel.id}
              className="flex-shrink-0 w-32 bg-white rounded-lg shadow p-2 text-center"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden mx-auto">
                <Image
                  src={channel.channelInfo.thumbnails.medium}
                  alt={channel.channelInfo.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <p className="mt-2 text-xs font-medium text-gray-800 truncate">
                {channel.channelInfo.title}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {parseInt(channel.channelInfo.subscriberCount).toLocaleString()}{" "}
                subs
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
