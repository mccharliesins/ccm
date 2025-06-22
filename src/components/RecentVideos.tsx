"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  YouTubeVideoInfo,
  formatDuration,
  formatViewCount,
} from "@/lib/youtube-api";
import {
  getAllVideos,
  getChannels,
  shouldRefreshVideos,
  storeChannelVideos,
} from "@/lib/youtube";
import { fetchChannelVideos } from "@/lib/youtube-api";

type SortOption = "newest" | "views";
type FilterOption = "all" | string; // "all" or channelId
type DateRangeOption =
  | "all"
  | "week"
  | "month"
  | "3months"
  | "6months"
  | "year"
  | "custom";

export default function RecentVideos() {
  const [videos, setVideos] = useState<YouTubeVideoInfo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<YouTubeVideoInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [dateRange, setDateRange] = useState<DateRangeOption>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [channels, setChannels] = useState<{ id: string; title: string }[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Calculate default date for custom date picker (30 days ago)
  useEffect(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    setCustomStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  // Load videos from API or localStorage
  useEffect(() => {
    async function loadVideos() {
      try {
        setIsLoading(true);
        const channels = getChannels();

        // Build channels list for filter dropdown
        const channelsList = channels
          .filter((channel) => channel.channelInfo?.id)
          .map((channel) => ({
            id: channel.channelInfo!.id,
            title: channel.channelInfo!.title,
          }));
        setChannels(channelsList);

        // Check if we need to fetch fresh video data
        let needsFetch = false;
        for (const channel of channels) {
          if (
            channel.channelInfo?.id &&
            shouldRefreshVideos(channel.channelInfo.id)
          ) {
            needsFetch = true;
            break;
          }
        }

        // If we have cached videos and don't need to refresh, use the cache
        if (!needsFetch) {
          const allVideos = getAllVideos();
          if (allVideos.length > 0) {
            setVideos(allVideos);
            setIsLoading(false);
            return;
          }
        }

        // Otherwise, fetch fresh data
        let allFetchedVideos: YouTubeVideoInfo[] = [];

        for (const channel of channels) {
          if (channel.channelInfo?.uploadsPlaylistId) {
            const channelVideos = await fetchChannelVideos(
              channel.channelInfo.uploadsPlaylistId
            );
            if (channelVideos.length > 0 && channel.channelInfo.id) {
              // Store in localStorage
              storeChannelVideos(channel.channelInfo.id, channelVideos);
              allFetchedVideos = [...allFetchedVideos, ...channelVideos];
            }
          }
        }

        setVideos(allFetchedVideos);
      } catch (err) {
        console.error("Error loading videos:", err);
        setError("Failed to load videos. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadVideos();
  }, []);

  // Get start date based on selected date range
  const getStartDate = useCallback((): Date => {
    const now = new Date();

    switch (dateRange) {
      case "week":
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return weekAgo;
      case "month":
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return monthAgo;
      case "3months":
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        return threeMonthsAgo;
      case "6months":
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        return sixMonthsAgo;
      case "year":
        const yearAgo = new Date();
        yearAgo.setFullYear(now.getFullYear() - 1);
        return yearAgo;
      case "custom":
        return new Date(customStartDate);
      default:
        // For "all", return a date far in the past
        return new Date(0);
    }
  }, [dateRange, customStartDate]);

  // Apply sorting and filtering when videos, sortBy, or filterBy changes
  useEffect(() => {
    if (videos.length === 0) return;

    // First apply channel filter
    let result = [...videos];

    if (filterBy !== "all") {
      result = result.filter((video) => video.channelId === filterBy);
    }

    // Apply date range filter
    if (dateRange !== "all") {
      const startDate = getStartDate();
      const now = new Date();

      result = result.filter((video) => {
        const publishDate = new Date(video.publishedAt);
        return publishDate >= startDate && publishDate <= now;
      });
    }

    // Then apply sorting
    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } else if (sortBy === "views") {
      result.sort((a, b) => parseInt(b.viewCount) - parseInt(a.viewCount));
    }

    // Limit to 50 videos
    setFilteredVideos(result.slice(0, 50));
  }, [videos, sortBy, filterBy, dateRange, customStartDate, getStartDate]);

  // Handle date range change
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as DateRangeOption;
    setDateRange(value);
    setShowCustomDatePicker(value === "custom");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div
          className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2"
          style={{ borderColor: "var(--primary)" }}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No videos found. Add YouTube channels in the settings to see their
          latest uploads.
        </p>
      </div>
    );
  }

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 md:mb-0">
          Last 50 Uploads
        </h3>

        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <span>Filters</span>
          <svg
            className={`ml-2 w-4 h-4 transition-transform ${
              showFilters ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Filter Controls Container - Updated for better layout */}
      <div className={`mb-6 ${showFilters ? "block" : "hidden md:block"}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* Channel Filter */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Channel
            </label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              style={
                {
                  "--ring-primary": "var(--primary)",
                  "--border-primary": "var(--primary)",
                } as React.CSSProperties
              }
            >
              <option value="all">All Channels</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.title}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Filter */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="block w-full pl-3 pr-10 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              style={
                {
                  "--ring-primary": "var(--primary)",
                  "--border-primary": "var(--primary)",
                } as React.CSSProperties
              }
            >
              <option value="newest">Newest First</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Time Period
            </label>
            <select
              value={dateRange}
              onChange={handleDateRangeChange}
              className="block w-full pl-3 pr-10 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              style={
                {
                  "--ring-primary": "var(--primary)",
                  "--border-primary": "var(--primary)",
                } as React.CSSProperties
              }
            >
              <option value="all">All Time</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Picker - Full width when visible */}
        {showCustomDatePicker && (
          <div className="flex flex-wrap items-center gap-3 mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <label
              htmlFor="startDate"
              className="whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              From:
            </label>
            <input
              id="startDate"
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="flex-grow min-w-[200px] pl-3 pr-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              style={
                {
                  "--ring-primary": "var(--primary)",
                  "--border-primary": "var(--primary)",
                } as React.CSSProperties
              }
            />
            <span className="whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-400">
              to Today
            </span>
          </div>
        )}
      </div>

      {filteredVideos.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No videos match your filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Thumbnail with duration */}
              <div className="relative">
                <div className="aspect-video w-full">
                  <Image
                    src={video.thumbnails.medium.url}
                    alt={video.title}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-t-lg"
                  />
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded">
                  {formatDuration(video.duration)}
                </div>
              </div>

              {/* Video info */}
              <div className="p-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                  {video.title}
                </h4>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <div>{formatViewCount(video.viewCount)}</div>
                  <div>{formatDate(video.publishedAt)}</div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[60%]">
                    {video.channelTitle}
                  </span>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    {parseInt(video.likeCount).toLocaleString()}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
