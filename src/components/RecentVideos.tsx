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

    // Limit to 20 videos
    setFilteredVideos(result.slice(0, 20));
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500">
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
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2 md:mb-0">
          Last 20 Uploads
        </h3>

        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
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

        {/* Desktop Filters */}
        <div
          className={`${
            showFilters
              ? "flex bg-gray-50 p-2 rounded-lg border border-gray-200"
              : "hidden"
          } md:flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-2 md:mt-0 md:bg-gray-50 md:p-2 md:rounded-lg md:border md:border-gray-200`}
        >
          {/* Channel Filter */}
          <div className="relative">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md bg-white"
            >
              <option value="all">All Channels</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.title}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="views">Most Views</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={handleDateRangeChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md bg-white"
            >
              <option value="all">All Time</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Picker */}
          {showCustomDatePicker && (
            <div className="relative">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md bg-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVideos.map((video) => (
          <a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-video bg-gray-100">
              {/* Thumbnail */}
              <Image
                src={
                  video.thumbnails.maxres?.url ||
                  video.thumbnails.standard?.url ||
                  video.thumbnails.high.url
                }
                alt={video.title}
                fill
                style={{ objectFit: "cover" }}
              />
              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                {formatDuration(video.duration)}
              </div>
            </div>
            <div className="p-3 flex-grow flex flex-col">
              <h4 className="font-medium text-sm line-clamp-2 mb-1 text-gray-900">
                {video.title}
              </h4>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-gray-500">
                  {formatDate(video.publishedAt)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatViewCount(video.viewCount)}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
