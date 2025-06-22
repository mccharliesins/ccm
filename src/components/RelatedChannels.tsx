"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  RelatedChannel,
  findRelatedChannels,
  getMockRelatedChannels,
} from "@/lib/youtube-api";
import { getChannels } from "@/lib/youtube";

// Interface for parsed Perplexity data
interface PerplexityChannelData {
  rank: number;
  channelName: string;
  niche: string;
  similarityScore: number;
  notes: string;
}

// Interface for YouTube channel data
interface YouTubeChannelData {
  id: string;
  title: string;
  thumbnailUrl: string;
  subscriberCount: string;
  videoCount: string;
}

export default function RelatedChannels() {
  const [relatedChannels, setRelatedChannels] = useState<RelatedChannel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [userChannels, setUserChannels] = useState<
    { id: string; title: string }[]
  >([]);
  const [useMockData, setUseMockData] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [rawResponse, setRawResponse] = useState<string>("");
  const [parsedChannels, setParsedChannels] = useState<PerplexityChannelData[]>(
    []
  );
  const [youtubeData, setYoutubeData] = useState<
    Record<string, YouTubeChannelData>
  >({});
  const [dataLoaded, setDataLoaded] = useState(false);

  // Define RGB values for primary colors
  const colorValues = {
    primary: "14, 165, 233", // sky-500
    secondary: "249, 115, 22", // orange-500
    accent: "139, 92, 246", // violet-500
  };

  // Check if data exists in localStorage for the selected channel
  const checkLocalStorageData = useCallback(() => {
    try {
      setDataLoaded(false);
      setRelatedChannels([]);
      setParsedChannels([]);
      setRawResponse("");
      setError(null);

      const storedChannels = localStorage.getItem(
        `relatedChannels_${selectedChannelId}`
      );

      if (storedChannels) {
        const parsedData = JSON.parse(storedChannels);
        setRelatedChannels(parsedData);
        setDataLoaded(true);
        console.log(
          "Loaded data from localStorage for channel:",
          selectedChannelId
        );
      } else {
        console.log("No data in localStorage for channel:", selectedChannelId);
        setDataLoaded(false);
      }
    } catch (error) {
      console.error("Error checking localStorage:", error);
      setDataLoaded(false);
    }
  }, [selectedChannelId]);

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

  // Check if data exists in localStorage when channel is selected
  useEffect(() => {
    if (selectedChannelId) {
      checkLocalStorageData();
    }
  }, [selectedChannelId, checkLocalStorageData]);

  // Fetch related channels when the process button is clicked
  const fetchRelatedChannels = async () => {
    if (!selectedChannelId) {
      setError("Please select a channel first");
      return;
    }

    // If using mock data, load that instead
    if (useMockData) {
      console.log("Using mock data instead of API call");
      setRelatedChannels(getMockRelatedChannels());
      setIsLoading(false);
      setError(null);
      setDataLoaded(true);

      // Set mock raw API response for demo purposes
      const mockRawResponse = `
Rank,Channel Name,Niche/Category,Similarity Score (0-10),Notes on similarity and differences
1,Gaming Enthusiast,Gaming & Let&apos;s Plays,8.5,&quot;Strong match in gaming niche with similar focus on strategy games and RPGs. Creates similar tutorial and walkthrough content.&quot;
2,Tech Reviews Pro,Tech Reviews,7.2,&quot;Similar presentation style and production value. Covers overlapping tech topics but with more focus on hardware reviews.&quot;
3,Creative Tutorials,Design & Creative Skills,6.8,&quot;Similar tutorial format and teaching style. Different niche but comparable audience demographics and engagement patterns.&quot;
4,Digital Marketing Mastery,Digital Marketing,5.9,&quot;Complementary content that appeals to similar business-oriented audience. Different primary topics but similar presentation style.&quot;
`;
      setRawResponse(mockRawResponse);
      setParsedChannels(parsePerplexityData(mockRawResponse));

      // Save mock data to localStorage
      try {
        localStorage.setItem(
          `relatedChannels_${selectedChannelId}`,
          JSON.stringify(getMockRelatedChannels())
        );
      } catch (err) {
        console.error("Error saving mock data to localStorage:", err);
      }

      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setRawResponse("");
      setParsedChannels([]);

      console.log("Fetching related channels for:", selectedChannelId);

      // Call the API to find related channels
      const result = await findRelatedChannels(selectedChannelId);
      console.log("Related channels result:", result);

      if (result.channels.length === 0) {
        setRelatedChannels([]);
        setError(
          "No related channels found. Try adding more videos to your channel or select a different channel."
        );
        setIsLoading(false);
        return;
      }

      // Set the raw API response
      setRawResponse(result.rawResponse);

      // Parse the raw response
      const parsed = parsePerplexityData(result.rawResponse);
      setParsedChannels(parsed);

      // Set the related channels directly
      console.log("Setting related channels:", result.channels);
      setRelatedChannels(result.channels);
      setDataLoaded(true);

      // Fetch YouTube data for each channel
      fetchYouTubeData(parsed);

      // Save to localStorage for future use
      try {
        localStorage.setItem(
          `relatedChannels_${selectedChannelId}`,
          JSON.stringify(result.channels)
        );
      } catch (err) {
        console.error("Error saving to localStorage:", err);
      }
    } catch (err) {
      console.error("Error fetching related channels:", err);
      setError("Failed to fetch related channels. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch YouTube channel data for each channel name
  const fetchYouTubeData = async (channels: PerplexityChannelData[]) => {
    const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

    if (!API_KEY) {
      console.error("YouTube API key is not available");
      return;
    }

    const channelDataMap: Record<string, YouTubeChannelData> = {};

    for (const channel of channels) {
      try {
        console.log(`Fetching YouTube data for: ${channel.channelName}`);

        // Search for the channel by name
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(
          channel.channelName
        )}&maxResults=1&key=${API_KEY}`;
        const searchResponse = await fetch(searchUrl);

        if (!searchResponse.ok) {
          const errorData = await searchResponse.json();
          console.error("YouTube API error (search):", errorData);
          continue;
        }

        const searchData = await searchResponse.json();

        if (!searchData.items || searchData.items.length === 0) {
          console.log(`No channels found for name: ${channel.channelName}`);
          continue;
        }

        // Get the channel ID from search results
        const channelId = searchData.items[0].snippet.channelId;
        const thumbnailUrl =
          searchData.items[0].snippet.thumbnails?.default?.url || "";
        const title = searchData.items[0].snippet.title;

        // Get detailed channel information
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${API_KEY}`;
        const channelResponse = await fetch(channelUrl);

        if (!channelResponse.ok) {
          const errorData = await channelResponse.json();
          console.error("YouTube API error (channels):", errorData);
          continue;
        }

        const channelData = await channelResponse.json();

        if (!channelData.items || channelData.items.length === 0) {
          console.log(`No channel details found for ID: ${channelId}`);
          continue;
        }

        const statistics = channelData.items[0].statistics;

        channelDataMap[channel.channelName] = {
          id: channelId,
          title: title,
          thumbnailUrl: thumbnailUrl,
          subscriberCount: statistics.subscriberCount || "0",
          videoCount: statistics.videoCount || "0",
        };

        console.log(`Added YouTube data for: ${channel.channelName}`);
      } catch (error) {
        console.error(
          `Error fetching YouTube data for "${channel.channelName}":`,
          error
        );
      }

      // Add a small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setYoutubeData(channelDataMap);
  };

  // Parse CSV data from Perplexity API response
  const parsePerplexityData = (csvData: string): PerplexityChannelData[] => {
    if (!csvData.trim()) return [];

    try {
      console.log("Parsing CSV data");

      // Split by lines and remove empty lines
      const lines = csvData
        .trim()
        .split("\n")
        .filter((line) => line.trim());

      // Skip header line if it exists
      const headerLine = lines[0].toLowerCase();
      const startIndex =
        headerLine.includes("rank") ||
        headerLine.includes("channel name") ||
        headerLine.includes("similarity score")
          ? 1
          : 0;

      const channels: PerplexityChannelData[] = [];

      // Process only the first 10 responses (or fewer if there aren't 10)
      const maxResponses = Math.min(10, lines.length - startIndex);
      console.log(`Processing ${maxResponses} responses from CSV data`);

      for (let i = startIndex; i < startIndex + maxResponses; i++) {
        if (i >= lines.length) break;

        const line = lines[i].trim();
        if (!line) continue;

        console.log(`Processing line ${i}:`, line);

        // Use a regex pattern to properly parse CSV with quoted elements
        // This regex matches either:
        // 1. A quoted field (which can contain commas)
        // 2. An unquoted field (which cannot contain commas)
        const result = parseCSVLine(line);

        if (result && result.length >= 4) {
          const rank = parseInt(result[0]) || i;
          const channelName = result[1];
          const niche = result[2];
          const similarityScore = parseFloat(result[3]) || 0;
          const notes = result.length >= 5 ? result[4] : "";

          channels.push({
            rank,
            channelName,
            niche,
            similarityScore,
            notes,
          });

          console.log(
            `Added channel: ${channelName}, score: ${similarityScore}`
          );
        } else {
          console.warn(
            `Line ${i} doesn't have enough columns or couldn't be parsed:`,
            line
          );
        }
      }

      console.log(`Successfully parsed ${channels.length} channels`);
      return channels;
    } catch (error) {
      console.error("Error parsing Perplexity data:", error);
      return [];
    }
  };

  // Helper function to parse a CSV line with proper handling of quoted fields
  const parseCSVLine = (line: string): string[] | null => {
    try {
      const result: string[] = [];
      let currentField = "";
      let inQuotes = false;
      let i = 0;

      // We need exactly 5 columns: Rank, Channel Name, Niche, Score, Notes
      // Where Notes is optional
      const requiredColumns = 4;
      let columnCount = 0;

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
        if (char === "," && !inQuotes) {
          result.push(currentField.trim());
          currentField = "";
          columnCount++;

          // If we have the required columns, treat the rest as the last column
          if (columnCount === requiredColumns) {
            // Add the rest of the line as the last column (notes)
            const restOfLine = line.substring(i + 1).trim();

            // If the rest starts with a quote, handle it properly
            if (restOfLine.startsWith('"') && restOfLine.endsWith('"')) {
              result.push(
                restOfLine.substring(1, restOfLine.length - 1).trim()
              );
            } else {
              result.push(restOfLine);
            }
            break;
          }

          i++;
          continue;
        }

        // Add character to current field
        currentField += char;
        i++;
      }

      // Add the last field if not already added
      if (columnCount < requiredColumns) {
        result.push(currentField.trim());
      }

      // Clean up quotes from all fields
      return result.map((field) => {
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
  };

  // Toggle mock data
  const toggleMockData = () => {
    setUseMockData((prev) => !prev);
  };

  // Toggle raw data display
  const toggleRawData = () => {
    setShowRawData((prev) => !prev);
  };

  // Format subscriber count
  const formatSubscriberCount = (count: string): string => {
    const num = parseInt(count);
    if (isNaN(num)) return "0 subscribers";

    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M subscribers`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K subscribers`;
    } else {
      return `${num} subscribers`;
    }
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
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex-grow">
              <label
                htmlFor="channelSelect"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Select a channel to find similar creators:
              </label>
              <div className="flex flex-col md:flex-row gap-4">
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

                <button
                  onClick={fetchRelatedChannels}
                  disabled={isLoading || !selectedChannelId}
                  className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    isLoading || !selectedChannelId
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : dataLoaded && relatedChannels.length > 0 ? (
                    "Refresh Data"
                  ) : (
                    "Find Similar Channels"
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
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

              <button
                onClick={toggleRawData}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md ${
                  showRawData
                    ? "bg-green-600 text-white"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                {showRawData ? "Hide Raw Data" : "Show Raw Data"}
              </button>
            </div>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            How It Works
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            We analyze your channel&apos;s content, style, and audience to find
            similar creators in your niche. Our AI examines your recent videos
            and identifies channels with matching topics, presentation style,
            and audience engagement patterns. The similarity score indicates how
            closely a channel matches yours.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : relatedChannels.length === 0 && !dataLoaded ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded relative mb-6">
          <p className="block sm:inline">
            Select a channel and click "Find Related Channels" to discover
            similar creators in your niche.
          </p>
        </div>
      ) : (
        <>
          {showRawData ? (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                Raw Perplexity Response
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                  {rawResponse || "No data available"}
                </pre>
              </div>
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Rank
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Channel
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Niche
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Similarity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {parsedChannels.map((channel) => {
                  const youtubeChannel = youtubeData[channel.channelName];

                  return (
                    <tr key={channel.rank}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {channel.rank}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center">
                          {youtubeChannel ? (
                            <>
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                <img
                                  src={youtubeChannel.thumbnailUrl}
                                  alt={`${channel.channelName} thumbnail`}
                                  className="h-10 w-10 rounded-full"
                                  onError={(e) => {
                                    // Replace with default image on error
                                    e.currentTarget.src =
                                      "https://via.placeholder.com/40";
                                  }}
                                />
                              </div>
                              <div className="flex flex-col">
                                <a
                                  href={`https://youtube.com/channel/${youtubeChannel.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {channel.channelName}
                                </a>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatSubscriberCount(
                                    youtubeChannel.subscriberCount
                                  )}{" "}
                                  &bull; {youtubeChannel.videoCount} videos
                                </div>
                              </div>
                            </>
                          ) : (
                            <span>{channel.channelName}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {channel.niche}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center">
                          <span className="mr-2">
                            {channel.similarityScore.toFixed(1)}
                          </span>
                          <div className="flex">
                            {[...Array(10)].map((_, i) => {
                              // Calculate opacity based on similarity score
                              const opacity =
                                i < Math.floor(channel.similarityScore)
                                  ? 1
                                  : i === Math.floor(channel.similarityScore)
                                  ? channel.similarityScore -
                                    Math.floor(channel.similarityScore)
                                  : 0;

                              return (
                                <svg
                                  key={i}
                                  className={`w-4 h-4`}
                                  style={{
                                    color: `rgba(${colorValues.primary}, ${opacity})`,
                                    fill: opacity > 0 ? "currentColor" : "none",
                                    stroke: "currentColor",
                                    strokeWidth: "1",
                                  }}
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        <div className="max-w-md">{channel.notes}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
