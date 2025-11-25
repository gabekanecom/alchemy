"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface Platform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  description: string;
}

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onSelectionChange: (platforms: string[]) => void;
}

export function PlatformSelector({
  selectedPlatforms,
  onSelectionChange,
}: PlatformSelectorProps) {
  const platforms: Platform[] = [
    {
      id: "blog",
      name: "Blog",
      icon: "📝",
      connected: true,
      description: "Publish to your blog",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: "💼",
      connected: false,
      description: "Share professional content",
    },
    {
      id: "twitter",
      name: "Twitter/X",
      icon: "🐦",
      connected: false,
      description: "Post tweets and threads",
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: "🎬",
      connected: false,
      description: "Upload video content",
    },
    {
      id: "medium",
      name: "Medium",
      icon: "✍️",
      connected: false,
      description: "Publish articles to Medium",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: "📱",
      connected: false,
      description: "Post images and carousels",
    },
  ];

  function togglePlatform(platformId: string) {
    if (selectedPlatforms.includes(platformId)) {
      onSelectionChange(selectedPlatforms.filter((id) => id !== platformId));
    } else {
      onSelectionChange([...selectedPlatforms, platformId]);
    }
  }

  function selectAll() {
    const connectedPlatformIds = platforms.filter((p) => p.connected).map((p) => p.id);
    onSelectionChange(connectedPlatformIds);
  }

  function clearAll() {
    onSelectionChange([]);
  }

  const connectedPlatforms = platforms.filter((p) => p.connected);
  const disconnectedPlatforms = platforms.filter((p) => !p.connected);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-gray-600">Select Publishing Platforms</Label>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs text-gold-500 hover:text-gold-400 transition-colors"
          >
            Select All Connected
          </button>
          <span className="text-grey-600">|</span>
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Connected Platforms */}
      {connectedPlatforms.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Connected Platforms</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {connectedPlatforms.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.id);
              return (
                <Card
                  key={platform.id}
                  className={`bg-white border p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "border-gold-500 bg-gold-500/5"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => togglePlatform(platform.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{platform.icon}</span>
                        <span className="font-medium text-gray-900">{platform.name}</span>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border border-green-200 border-green-500/30 text-xs"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{platform.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Disconnected Platforms */}
      {disconnectedPlatforms.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Not Connected</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {disconnectedPlatforms.map((platform) => (
              <Card
                key={platform.id}
                className="bg-white border-gray-300 p-4 opacity-60"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl grayscale">{platform.icon}</span>
                      <span className="font-medium text-gray-500">{platform.name}</span>
                      <Badge
                        variant="outline"
                        className="bg-grey-500/20 text-gray-500 border-gray-400/30 text-xs"
                      >
                        Not Connected
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">{platform.description}</p>
                    <button className="text-xs text-gold-500 hover:text-gold-400 mt-2">
                      Connect Platform →
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedPlatforms.length > 0 && (
        <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-lg">
          <p className="text-sm text-gold-300">
            Selected {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? "s" : ""}{" "}
            for publishing
          </p>
        </div>
      )}
    </div>
  );
}
