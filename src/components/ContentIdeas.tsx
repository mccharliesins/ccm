"use client";

import React, { useState, useEffect } from "react";
import { RelatedChannel, ContentIdea, generateContentIdeas } from "@/lib/youtube-api";
import { getChannels } from "@/lib/youtube";

export default function ContentIdeas() {
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [userChannels, setUserChannels] = useState<
    { id: string; title: string }[]
  >([]);
  const [relatedChannels, setRelatedChannels] = useState<RelatedChannel[]>([]);
  const [numIdeas, setNumIdeas] = useState(5);

  // Load user channels
  useEffect(() => {
    const channels = getChannels();
    
    const channelOptions = channels
      .filter((channel) => channel.channelInfo?.id)
      .map((channel) => ({
        id: channel.channelInfo!.id,
        title: channel.channelInfo!.title,
      }));

    setUserChannels(channelOptions);

    // Auto-select first channel if available
    if (channelOptions.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channelOptions[0].id);
    }
  }, [selectedChannelId]);

  // Load related channels from localStorage when a channel is selected
  useEffect(() => {
    if (selectedChannelId) {
      try {
        const storedChannels = localStorage.getItem(`relatedChannels_${selectedChannelId}`);
        if (storedChannels) {
          setRelatedChannels(JSON.parse(storedChannels));
        }
      } catch (error) {
        console.error("Error loading related channels from localStorage:", error);
      }
    }
  }, [selectedChannelId]);

  const generateIdeas = async () => {
    if (!selectedChannelId) {
      setError("Please select a channel first");
      return;
    }

    if (relatedChannels.length === 0) {
      setError("No related channels found. Please find related channels first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const ideas = await generateContentIdeas(
        relatedChannels,
        selectedChannelId,
        numIdeas
      );
      
      setContentIdeas(ideas);
      
      if (ideas.length === 0) {
        setError("Could not generate content ideas. Try again later.");
      }
    } catch (error) {
      console.error("Error generating content ideas:", error);
      setError("Failed to generate content ideas. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (userChannels.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          No YouTube channels found. Add channels in the settings to generate content ideas.
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Generate Content Ideas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label
              htmlFor="channelSelect"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Select your channel:
            </label>
            <select
              id="channelSelect"
              value={selectedChannelId}
              onChange={(e) => setSelectedChannelId(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              style={{
                "--ring-primary": "var(--primary)",
                "--border-primary": "var(--primary)",
              } as React.CSSProperties}
            >
              {userChannels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label
              htmlFor="numIdeas"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Number of ideas to generate:
            </label>
            <select
              id="numIdeas"
              value={numIdeas}
              onChange={(e) => setNumIdeas(parseInt(e.target.value))}
              className="block w-full pl-3 pr-10 py-2 text-base text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              style={{
                "--ring-primary": "var(--primary)",
                "--border-primary": "var(--primary)",
              } as React.CSSProperties}
            >
              <option value={3}>3 ideas</option>
              <option value={5}>5 ideas</option>
              <option value={10}>10 ideas</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={generateIdeas}
            disabled={isLoading || relatedChannels.length === 0}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              isLoading || relatedChannels.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Generating...
              </>
            ) : (
              "Generate Content Ideas"
            )}
          </button>
        </div>
        
        {relatedChannels.length === 0 && (
          <div className="mt-4 text-center">
            <p className="text-amber-600 dark:text-amber-400">
              You need to find related channels first before generating content ideas.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center px-3 py-1.5 mt-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Find Related Channels
            </a>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {contentIdeas.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
            Content Ideas
          </h3>
          
          <div className="space-y-8">
            {contentIdeas.map((idea, index) => (
              <div 
                key={index} 
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
              >
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {idea.title}
                </h4>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {idea.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags:
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {idea.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Keywords:
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {idea.targetKeywords.map((keyword, keywordIndex) => (
                        <span
                          key={keywordIndex}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Thumbnail Ideas:
                    </h5>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                      {idea.thumbnailIdeas.map((thumbIdea, thumbIndex) => (
                        <li key={thumbIndex}>{thumbIdea}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estimated View Potential:
                    </h5>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        idea.estimatedViews === "high"
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                          : idea.estimatedViews === "medium"
                          ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                          : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                      }`}
                    >
                      {idea.estimatedViews.charAt(0).toUpperCase() + idea.estimatedViews.slice(1)}
                    </span>
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
