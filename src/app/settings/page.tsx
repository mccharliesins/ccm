"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  addChannel,
  getChannels,
  removeChannel,
  updateChannel,
  YouTubeChannel,
} from "@/lib/youtube";
import { fetchChannelInfo } from "@/lib/youtube-api";
import ChannelCard from "@/components/ChannelCard";

export default function Settings() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load channels on mount
  useEffect(() => {
    if (!user) return;

    const storedChannels = getChannels();
    setChannels(storedChannels);

    // Fetch channel info for channels that don't have it
    const fetchMissingChannelInfo = async () => {
      setIsLoading(true);
      const updatedChannels = [...storedChannels];
      let hasUpdates = false;

      console.log(
        "Fetching missing channel info for",
        updatedChannels.length,
        "channels"
      );

      for (let i = 0; i < updatedChannels.length; i++) {
        if (!updatedChannels[i].channelInfo) {
          try {
            console.log(
              `Fetching info for channel ${i + 1}:`,
              updatedChannels[i].url
            );
            const channelInfo = await fetchChannelInfo(updatedChannels[i].url);

            if (channelInfo) {
              console.log(
                "Successfully fetched channel info:",
                channelInfo.title
              );
              updatedChannels[i] =
                updateChannel(updatedChannels[i].id, { channelInfo }) ||
                updatedChannels[i];
              hasUpdates = true;
            } else {
              console.error(
                `No channel info returned for ${updatedChannels[i].url}`
              );
            }
          } catch (err) {
            console.error(
              `Error fetching info for channel ${updatedChannels[i].url}:`,
              err
            );
          }
        } else {
          console.log(
            `Channel ${i + 1} already has info:`,
            updatedChannels[i].channelInfo?.title
          );
        }
      }

      if (hasUpdates) {
        console.log("Updating channels with new info");
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

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      // Validate URL
      if (
        !youtubeUrl.includes("youtube.com") &&
        !youtubeUrl.includes("youtu.be")
      ) {
        setError("Please enter a valid YouTube URL");
        setIsSubmitting(false);
        return;
      }

      // Fetch channel info
      const channelInfo = await fetchChannelInfo(youtubeUrl);

      if (!channelInfo) {
        setError(
          "Could not fetch channel information. Please check the URL and try again."
        );
        setIsSubmitting(false);
        return;
      }

      // Add channel with info
      const newChannel = addChannel(youtubeUrl, channelInfo);

      // Update state
      setChannels([...channels, newChannel]);
      setYoutubeUrl("");
      setSuccess("YouTube channel added successfully");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveChannel = (id: string) => {
    try {
      removeChannel(id);
      setChannels(channels.filter((channel) => channel.id !== id));
      setSuccess("YouTube channel removed successfully");
    } catch (err) {
      setError("Failed to remove channel");
      console.error(err);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated and not loading, don't render the settings content
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          YouTube Channel Management
        </h2>
        <p className="text-gray-600 mb-6">
          Add your YouTube channel to track performance and get personalized
          content ideas.
        </p>

        <form onSubmit={handleAddChannel} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label
                htmlFor="youtube-url"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                YouTube Channel URL
              </label>
              <input
                type="text"
                id="youtube-url"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="https://youtube.com/channel/..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 h-10"
              >
                {isSubmitting ? "Adding..." : "Add Channel"}
              </button>
            </div>
          </div>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
        </form>

        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">
            Your Channels
          </h3>
          {channels.length === 0 ? (
            <p className="text-gray-500 text-sm">No channels added yet</p>
          ) : (
            <div className="space-y-4">
              {channels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onRemove={handleRemoveChannel}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
