"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  addChannel,
  getChannels,
  removeChannel,
  YouTubeChannel,
} from "@/lib/youtube";

export default function Settings() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    router.push("/login");
    return null;
  }

  // Load channels on mount
  useEffect(() => {
    if (user) {
      setChannels(getChannels());
    }
  }, [user]);

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

      // Add channel
      const newChannel = addChannel(youtubeUrl);

      // Update state
      setChannels([...channels, newChannel]);
      setYoutubeUrl("");
      setSuccess("YouTube channel added successfully");
    } catch (err: any) {
      setError(err.message || "An error occurred");
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
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
          <h3 className="text-md font-medium text-gray-900 mb-2">
            Your Channels
          </h3>
          {channels.length === 0 ? (
            <p className="text-gray-500 text-sm">No channels added yet</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {channels.map((channel) => (
                <li
                  key={channel.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {channel.url}
                    </p>
                    <p className="text-xs text-gray-500">
                      Added on {new Date(channel.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveChannel(channel.id)}
                    className="ml-4 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
