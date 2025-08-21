"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  RelatedChannel,
  ContentIdea,
  EnhancedContentIdea,
  generateEnhancedContentIdeas,
  generateVideoScript,
} from "@/lib/youtube-api";
import { getChannels } from "@/lib/youtube";

export default function ContentIdeas() {
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [enhancedIdeas, setEnhancedIdeas] = useState<EnhancedContentIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [userChannels, setUserChannels] = useState<
    { id: string; title: string }[]
  >([]);
  const [scripts, setScripts] = useState<Record<number, string>>({});
  const [generatingScript, setGeneratingScript] = useState<number | null>(null);
  const [relatedChannels, setRelatedChannels] = useState<RelatedChannel[]>([]);

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
        const storedChannels = localStorage.getItem(
          `relatedChannels_${selectedChannelId}`
        );
        if (storedChannels) {
          setRelatedChannels(JSON.parse(storedChannels));
        }
      } catch (error) {
        console.error(
          "Error loading related channels from localStorage:",
          error
        );
      }
    }
  }, [selectedChannelId]);

  const generateIdeas = async () => {
    if (!selectedChannelId) {
      setError("Please select a channel first");
      return;
    }

    if (relatedChannels.length === 0) {
      setError(
        "No related channels found. Please find related channels first."
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setContentIdeas([]);
    setEnhancedIdeas([]);
    setScripts({});

    try {
      // Use the enhanced content ideas generation
      const similarChannelIds = relatedChannels
        .slice(0, 5)
        .map((channel) => channel.id);

      const ideas = await generateEnhancedContentIdeas(
        selectedChannelId,
        similarChannelIds
      );

      setEnhancedIdeas(ideas);

      if (ideas.length === 0) {
        setError("Could not generate enhanced content ideas. Try again later.");
      }
    } catch (error) {
      console.error("Error generating content ideas:", error);
      setError("Failed to generate content ideas. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate a script for a specific idea
  const handleGenerateScript = async (index: number, isEnhanced: boolean) => {
    try {
      setGeneratingScript(index);

      // Get the selected channel info
      const selectedChannel = userChannels.find(
        (channel) => channel.id === selectedChannelId
      );
      if (!selectedChannel) {
        throw new Error("Selected channel not found");
      }

      // Get the idea details
      const idea = isEnhanced ? enhancedIdeas[index] : contentIdeas[index];
      if (!idea) {
        throw new Error("Content idea not found");
      }

      // Generate the script
      const channelUrl = `https://youtube.com/channel/${selectedChannelId}`;
      const script = await generateVideoScript(
        selectedChannel.title,
        channelUrl,
        idea.title,
        isEnhanced ? idea.description : idea.description
      );

      // Store the generated script
      setScripts((prev) => ({
        ...prev,
        [index]: script,
      }));
    } catch (error) {
      console.error("Error generating script:", error);
      setError("Failed to generate script. Please try again later.");
    } finally {
      setGeneratingScript(null);
    }
  };

  if (userChannels.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-4">
          No YouTube channels found. Add channels in the settings to generate
          content ideas.
        </p>
        <a
          href="/settings"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Add Channels
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Generate Content Ideas
        </h3>

        <p className="text-gray-600 mb-6">
          Our AI-powered content generator analyzes trending topics and your
          channel's niche to suggest video ideas that resonate with your
          audience. Select your channel below and click "Generate Content Ideas"
          to get started. For best results, make sure you've found related
          channels in the "Related Channels" tab first.
        </p>

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex-grow">
              <label
                htmlFor="channel-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select your channel:
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <select
                  id="channel-select"
                  value={selectedChannelId}
                  onChange={(e) => setSelectedChannelId(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                  {userChannels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.title}
                    </option>
                  ))}
                </select>

                <button
                  onClick={generateIdeas}
                  disabled={isLoading || relatedChannels.length === 0}
                  className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    isLoading || relatedChannels.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
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
                      Generating...
                    </>
                  ) : (
                    "Generate Content Ideas"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {relatedChannels.length === 0 && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-md">
            <p className="text-sm">
              You need to find related channels first. Go to the Related
              Channels tab and click "Find Similar Channels" before generating
              content ideas.
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Content Ideas */}
      {enhancedIdeas.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Enhanced Content Ideas
          </h3>
          <p className="text-gray-600 mb-6">
            These AI-enhanced content ideas are tailored specifically to your
            channel's style and audience. Each idea includes a virality score
            and detailed explanation of why this content could perform well. You
            can also generate a complete video script for any idea with one
            click.
          </p>

          <div className="grid grid-cols-1 gap-6">
            {enhancedIdeas.map((idea, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {idea.title}
                </h4>

                <p className="text-gray-600 mb-4">{idea.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">
                      Virality Score:
                    </h5>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-orange-600 mr-2">
                        {idea.viralityScore}/10
                      </span>
                      <div className="flex">
                        {[...Array(10)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
                              i < idea.viralityScore
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">
                      Why to make this video:
                    </h5>
                    <p className="text-gray-600">{idea.whyToMake}</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleGenerateScript(index, true)}
                    disabled={generatingScript === index}
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      generatingScript === index
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600"
                    }`}
                  >
                    {generatingScript === index
                      ? "Generating Script..."
                      : "Analyse & Generate Script"}
                  </button>
                </div>

                {/* Display generated script if available */}
                {scripts[index] && (
                  <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <h5 className="text-md font-medium text-gray-900 mb-4">
                      Generated Script
                    </h5>
                    <div className="prose prose-lg max-w-none">
                      <div className="text-base text-gray-800 bg-gray-50 p-6 rounded overflow-auto max-h-[600px] font-outfit markdown-content">
                        <ReactMarkdown>{scripts[index]}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Basic Content Ideas */}
      {contentIdeas.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Content Ideas
          </h3>
          <p className="text-gray-600 mb-6">
            These content ideas are based on trending topics in your niche. Each
            suggestion includes tags, keywords, thumbnail ideas, and estimated
            view potential to help you plan your content strategy.
          </p>

          <div className="grid grid-cols-1 gap-6">
            {contentIdeas.map((idea, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {idea.title}
                </h4>

                <p className="text-gray-600 mb-4">{idea.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">
                      Tags:
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {idea.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">
                      Target Keywords:
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {idea.targetKeywords.map((keyword, keywordIndex) => (
                        <span
                          key={keywordIndex}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">
                      Thumbnail Ideas:
                    </h5>
                    <ul className="list-disc list-inside text-gray-600">
                      {idea.thumbnailIdeas.map((thumbIdea, thumbIndex) => (
                        <li key={thumbIndex}>{thumbIdea}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">
                      Estimated View Potential:
                    </h5>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        idea.estimatedViews === "high"
                          ? "bg-orange-100 text-orange-800"
                          : idea.estimatedViews === "medium"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {idea.estimatedViews.charAt(0).toUpperCase() +
                        idea.estimatedViews.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleGenerateScript(index, false)}
                    disabled={generatingScript === index}
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      generatingScript === index
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600"
                    }`}
                  >
                    {generatingScript === index
                      ? "Generating Script..."
                      : "Generate Script"}
                  </button>
                </div>

                {/* Display generated script if available */}
                {scripts[index] && (
                  <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <h5 className="text-md font-medium text-gray-900 mb-4">
                      Generated Script
                    </h5>
                    <div className="prose prose-lg max-w-none">
                      <div className="text-base text-gray-800 bg-gray-50 p-6 rounded overflow-auto max-h-[600px] font-outfit markdown-content">
                        <ReactMarkdown>{scripts[index]}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
