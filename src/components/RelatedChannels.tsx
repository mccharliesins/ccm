"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
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
  const [showRawData, setShowRawData] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState<string>("");
  const [parsedPerplexityData, setParsedPerplexityData] = useState<
    PerplexityChannelData[]
  >([]);

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

        // Set mock raw API response for demo purposes
        const mockRawResponse = `
Rank,Channel Name,Niche/Category,Similarity Score (0-10),Notes on similarity and differences
1,Gaming Enthusiast,Gaming & Let's Plays,8.5,"Strong match in gaming niche with similar focus on strategy games and RPGs. Creates similar tutorial and walkthrough content."
2,Tech Reviews Pro,Tech Reviews,7.2,"Similar presentation style and production value. Covers overlapping tech topics but with more focus on hardware reviews."
3,Creative Tutorials,Design & Creative Skills,6.8,"Similar tutorial format and teaching style. Different niche but comparable audience demographics and engagement patterns."
4,Digital Marketing Mastery,Digital Marketing,5.9,"Complementary content that appeals to similar business-oriented audience. Different primary topics but similar presentation style."
        `;

        setRawApiResponse(mockRawResponse);

        // Parse the mock data
        const parsedData = parsePerplexityData(mockRawResponse);
        setParsedPerplexityData(parsedData);

        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setDebugInfo("");
        setRawApiResponse("");
        setParsedPerplexityData([]);

        console.log("Fetching related channels for:", selectedChannelId);

        // Find related channels using the updated API
        const result = await findRelatedChannels(selectedChannelId);
        console.log("Related channels result:", result);

        if (result.channels.length === 0) {
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

        // Set the raw API response
        setRawApiResponse(result.rawResponse);

        // Parse the raw response
        const parsedData = parsePerplexityData(result.rawResponse);
        setParsedPerplexityData(parsedData);

        // Set the related channels directly
        console.log("Setting related channels:", result.channels);
        setRelatedChannels(result.channels);

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

  // Toggle raw data display
  const toggleRawData = () => {
    setShowRawData((prev) => !prev);
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

  // Component to display Perplexity data in a table format
  const PerplexityDataTable = ({ data }: { data: PerplexityChannelData[] }) => {
    if (!data || data.length === 0) return null;

    return (
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
                Channel Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Niche/Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Similarity Score
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
            {data.map((channel, index) => (
              <tr
                key={index}
                className={
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-700"
                    : "bg-gray-50 dark:bg-gray-800"
                }
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                  {channel.rank}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {channel.channelName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {channel.niche}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(10)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.round(channel.similarityScore)
                              ? "text-primary fill-current"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1">
                        {channel.similarityScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                  <div className="max-w-xs md:max-w-md lg:max-w-lg">
                    <p className="line-clamp-3">{channel.notes}</p>
                    {channel.notes && channel.notes.length > 150 && (
                      <button
                        className="text-xs text-primary hover:underline mt-1"
                        onClick={() => alert(channel.notes)}
                      >
                        Read more
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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

      {showRawData && rawApiResponse && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Raw API Response
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <pre className="whitespace-pre-wrap text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-96">
              {rawApiResponse}
            </pre>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            This is the raw CSV data returned by the Perplexity API.
          </p>
        </div>
      )}

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
      ) : parsedPerplexityData.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
            Similar Channels {useMockData && "(Demo Data)"}
          </h3>
          <PerplexityDataTable data={parsedPerplexityData} />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              No similar channels found. Try selecting a different channel or
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
      )}
    </div>
  );
}
