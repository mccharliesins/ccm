"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { YouTubeChannel } from "@/lib/youtube";

interface ChannelCardProps {
  channel: YouTubeChannel;
  onRemove?: (id: string) => void;
}

export default function ChannelCard({ channel, onRemove }: ChannelCardProps) {
  const { channelInfo } = channel;

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

  if (!channelInfo) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="ml-3">
              <p className="font-medium text-gray-800">
                Loading channel info...
              </p>
              <p className="text-sm text-gray-500 truncate">{channel.url}</p>
            </div>
          </div>
          {onRemove && (
            <button
              onClick={() => onRemove(channel.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    );
  }

  // Create YouTube channel and uploads playlist URLs
  const channelUrl = `https://www.youtube.com/channel/${channelInfo.id}`;
  const uploadsUrl = channelInfo.uploadsPlaylistId
    ? `https://www.youtube.com/playlist?list=${channelInfo.uploadsPlaylistId}`
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 border border-gray-200">
      {/* Banner */}
      {channelInfo.bannerUrl && (
        <div className="relative w-full h-24 bg-gray-200">
          <Image
            src={channelInfo.bannerUrl}
            alt={`${channelInfo.title} banner`}
            fill
            style={{ objectFit: "cover" }}
            className="w-full"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between">
          {/* Channel Info */}
          <div className="flex">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <Image
                src={
                  channelInfo.thumbnails.medium ||
                  channelInfo.thumbnails.default
                }
                alt={channelInfo.title}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>

            <div className="ml-4">
              <h3 className="font-bold text-lg text-gray-900">
                <a
                  href={channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600"
                >
                  {channelInfo.title}
                </a>
              </h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                {channelInfo.customUrl && (
                  <span className="mr-3">@{channelInfo.customUrl}</span>
                )}
                <span className="mr-3">
                  {formatSubscriberCount(channelInfo.subscriberCount)}{" "}
                  subscribers
                </span>
                <span>{channelInfo.videoCount} videos</span>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {channelInfo.description}
              </p>

              {/* Links */}
              <div className="mt-3 flex space-x-3">
                <a
                  href={channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Visit Channel
                </a>
                {uploadsUrl && (
                  <a
                    href={uploadsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                  >
                    View Uploads
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center">
            {onRemove && (
              <button
                onClick={() => onRemove(channel.id)}
                className="text-red-600 hover:text-red-800 text-sm ml-2"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
