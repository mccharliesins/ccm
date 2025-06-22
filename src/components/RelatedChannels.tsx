"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  RelatedChannel,
  findRelatedChannels,
  getMockRelatedChannels,
} from "@/lib/youtube-api";
import { getChannels } from "@/lib/youtube";

export default function RelatedChannels() {
  const [relatedChannels, setRelatedChannels] = useState<RelatedChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [userChannels, setUserChannels] = useState<
    { id: string; title: string }[]
  >([]);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [useMockData, setUseMockData] = useState(false);

  // Load user channels
  useEffect(() => {
    const channels = getChannels();
    console.log("Available channels:", channels);

    const channelOptions = channels
      .filter((channel) => channel.channelInfo?.id)
      .map((channel) => ({
        id: channel.channelInfo!.id,
        title: channel.channelInfo!.title,
      }));

    console.log("Channel options:", channelOptions);
    setUserChannels(channelOptions);

    // Auto-select first channel if available
    if (channelOptions.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channelOptions[0].id);
      console.log("Auto-selected channel ID:", channelOptions[0].id);
    }
  }, [selectedChannelId]);

  // Fetch related channels when a channel is selected
  useEffect(() => {
    async function fetchRelatedChannels() {
      if (!selectedChannelId) {
        console.log("No channel selected, skipping fetch");
        return;
      }

      // If using mock data, load that instead
      if (useMockData) {
        console.log("Using mock data instead of API call");
        setRelatedChannels(getMockRelatedChannels());
        setIsLoading(false);
        setError(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setDebugInfo("");

        console.log("Fetching related channels for:", selectedChannelId);

        // Find related channels
        const channels = await findRelatedChannels(selectedChannelId);
        console.log("Related channels result:", channels);

        if (channels.length === 0) {
          setRelatedChannels([]);
          setError(
            "No related channels found. Try adding more videos to your channel or select a different channel."
          );
          setDebugInfo(
            "API returned zero channels. This could be due to API quotas, invalid channel ID, or no related content found."
          );
          setIsLoading(false);
          return;
        }

        // Set the related channels directly
        console.log("Setting related channels:", channels);
        setRelatedChannels(channels);
      } catch (err) {
        console.error("Error fetching related channels:", err);
        setError("Failed to fetch related channels. Please try again later.");
        setDebugInfo("Error fetching related channels: " + JSON.stringify(err));
      } finally {
        setIsLoading(false);
      }
    }

    fetchRelatedChannels();
  }, [selectedChannelId, userChannels, useMockData]);

  // Toggle mock data
  const toggleMockData = () => {
    setUseMockData((prev) => !prev);
    setIsLoading(true);
  };

  // Format subscriber count
  const formatSubscriberCount = (count: string) => {
    const num = parseInt(count, 10);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  if (userChannels.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          No YouTube channels found. Add channels in the settings to discover
          related channels.
        </p>
        <a
          href="/settings"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Channels
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-grow">
              <label
                htmlFor="channelSelect"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Select a channel to find similar creators:
              </label>
              <select
                id="channelSelect"
                value={selectedChannelId}
                onChange={(e) => setSelectedChannelId(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                style={
                  {
                    "--ring-primary": "var(--primary)",
                    "--border-primary": "var(--primary)",
                  } as React.CSSProperties
                }
              >
                {userChannels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={toggleMockData}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md ${
                  useMockData
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
                style={useMockData ? { backgroundColor: "var(--primary)" } : {}}
              >
                {useMockData ? "Using Demo Data" : "Use Demo Data"}
              </button>
            </div>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            How It Works
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            We analyze your channel&apos;s top-performing videos to extract
            keywords and topics. Then we search for videos with similar content
            and identify channels that frequently appear across these searches.
            The more times a channel appears in different topic searches, the
            higher its match score.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
            style={{ borderColor: "var(--primary)" }}
          ></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsLoading(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>

              {!useMockData && (
                <button
                  onClick={toggleMockData}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Use Demo Data
                </button>
              )}
            </div>
          </div>

          {debugInfo && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-auto">
              <p className="text-gray-700 dark:text-gray-300">Debug Info:</p>
              <pre className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                {debugInfo}
              </pre>
            </div>
          )}
        </div>
      ) : relatedChannels.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              No related channels found. Try selecting a different channel or
              use demo data.
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => setIsLoading(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>

              {!useMockData && (
                <button
                  onClick={toggleMockData}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Use Demo Data
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
            Related Channels {useMockData && "(Demo Data)"}
          </h3>

          <div className="space-y-6">
            {relatedChannels.map((channel) => (
              <div
                key={channel.id}
                className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden">
                    <Image
                      src={
                        channel.thumbnails.medium || channel.thumbnails.default
                      }
                      alt={channel.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      <a
                        href={`https://www.youtube.com/channel/${channel.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                        style={
                          {
                            "--text-primary": "var(--primary)",
                          } as React.CSSProperties
                        }
                      >
                        {channel.title}
                      </a>
                    </h4>

                    <div className="flex items-center mt-2 md:mt-0">
                      <div className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {channel.matchFrequency} Matches
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                    {channel.description || "No description available."}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                      </svg>
                      {formatSubscriberCount(channel.subscriberCount)}{" "}
                      subscribers
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
                      </svg>
                      {channel.videoCount} videos
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      {parseInt(channel.viewCount).toLocaleString()} views
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
