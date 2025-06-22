import React from "react";
import ContentIdeas from "@/components/ContentIdeas";
import ClientOnly from "@/components/ClientOnly";

export default function ContentIdeasPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Content Ideas
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Generate content ideas based on trending topics from related channels
          in your niche. These ideas are tailored to match your channel's voice
          and style.
        </p>
        <ClientOnly>
          <ContentIdeas />
        </ClientOnly>
      </main>
    </div>
  );
}
