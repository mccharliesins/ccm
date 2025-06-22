"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getChannels, updateChannel, YouTubeChannel } from "@/lib/youtube";
import { fetchChannelInfo } from "@/lib/youtube-api";
import ChannelsList from "@/components/ChannelsList";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load channels and fetch missing info
  useEffect(() => {
    if (!user) return;

    const storedChannels = getChannels();
    setChannels(storedChannels);

    // Fetch channel info for channels that don't have it
    const fetchMissingChannelInfo = async () => {
      setIsLoading(true);
      const updatedChannels = [...storedChannels];
      let hasUpdates = false;

      for (let i = 0; i < updatedChannels.length; i++) {
        if (!updatedChannels[i].channelInfo) {
          try {
            const channelInfo = await fetchChannelInfo(updatedChannels[i].url);
            if (channelInfo) {
              updatedChannels[i] =
                updateChannel(updatedChannels[i].id, { channelInfo }) ||
                updatedChannels[i];
              hasUpdates = true;
            }
          } catch (err) {
            console.error(
              `Error fetching info for channel ${updatedChannels[i].url}:`,
              err
            );
          }
        }
      }

      if (hasUpdates) {
        setChannels(updatedChannels);
      }
      setIsLoading(false);
    };

    fetchMissingChannelInfo();
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated and not loading, don't render the dashboard content
  if (!user) {
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Welcome, {user?.username}!
            </h3>
            <p className="text-gray-600">
              This is your dashboard overview. Here you can track your content
              performance, get trending ideas, and manage your YouTube channels.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-700">Content Ideas</h4>
                <p className="text-sm text-gray-600">
                  Discover trending topics for your next content.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-700">Performance</h4>
                <p className="text-sm text-gray-600">
                  Track how your content is performing.
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-700">Channels</h4>
                <p className="text-sm text-gray-600">
                  Manage your YouTube channels.
                </p>
              </div>
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Analytics
            </h3>
            <p className="text-gray-600">
              View detailed analytics for your content. This feature will be
              available soon.
            </p>
            <div className="mt-6 p-4 border border-dashed border-gray-300 rounded-lg text-center">
              <p className="text-gray-500">Analytics data will appear here</p>
            </div>
          </div>
        );
      case "ideas":
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Content Ideas
            </h3>
            <p className="text-gray-600">
              Discover trending topics and content ideas for your channel. This
              feature will be available soon.
            </p>
            <div className="mt-6 p-4 border border-dashed border-gray-300 rounded-lg text-center">
              <p className="text-gray-500">Trending ideas will appear here</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Manage your content and discover trending ideas
        </p>
      </div>

      {/* YouTube Channels Bar */}
      {channels.length > 0 && (
        <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-medium text-gray-700">
              Your YouTube Channels
            </h2>
            <Link
              href="/settings"
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              Manage Channels
            </Link>
          </div>
          <ChannelsList channels={channels} />
        </div>
      )}

      {/* Dashboard Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`${
              activeTab === "overview"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`${
              activeTab === "analytics"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("ideas")}
            className={`${
              activeTab === "ideas"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Content Ideas
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
