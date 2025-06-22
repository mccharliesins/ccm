"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getChannels, updateChannel, YouTubeChannel } from "@/lib/youtube";
import { fetchChannelInfo } from "@/lib/youtube-api";
import ChannelsList from "@/components/ChannelsList";
import RecentVideos from "@/components/RecentVideos";
import RelatedChannels from "@/components/RelatedChannels";
import ContentIdeas from "@/components/ContentIdeas";

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
      <div className="flex justify-center items-center min-h-[80vh] bg-white">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderColor: "var(--primary)" }}
        ></div>
      </div>
    );
  }

  // If not authenticated  and not loading, don't render the dashboard content
  if (!user) {
    return null;
  }
  //Rendering...
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div>
            {/* Recent Videos Section */}
            <RecentVideos />
          </div>
        );
      case "related-channels":
        return <RelatedChannels />;
      case "content-ideas":
        return <ContentIdeas />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900">
            Dashboard
          </h1>
          <p className="mt-2 text-xl text-gray-500">
            Manage your content and discover trending ideas
          </p>
        </div>

        {/* YouTube Channels Bar */}
        {channels.length > 0 && (
          <div className="mb-6 bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-medium text-gray-700">
                Your YouTube Channels
              </h2>
              <Link
                href="/settings"
                className="text-xs text-orange-500 hover:text-orange-600 hover:underline transition-colors"
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
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("related-channels")}
              className={`${
                activeTab === "related-channels"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Related Channels
            </button>
            <button
              onClick={() => setActiveTab("content-ideas")}
              className={`${
                activeTab === "content-ideas"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Content Ideas
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
