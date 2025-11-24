"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Play, Loader2, Sparkles, Settings } from "lucide-react";

interface DiscoveryControlsProps {
  onDiscoveryComplete: () => void;
}

export function DiscoveryControls({ onDiscoveryComplete }: DiscoveryControlsProps) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([
    "reddit",
    "youtube",
    "twitter",
  ]);

  const sources = [
    { id: "reddit", name: "Reddit", icon: "🔴", description: "Trending posts from subreddits" },
    { id: "youtube", name: "YouTube", icon: "▶️", description: "Trending videos" },
    { id: "twitter", name: "Twitter/X", icon: "🐦", description: "Trending tweets" },
    { id: "seo", name: "SEO Keywords", icon: "🔍", description: "Keyword opportunities" },
    { id: "quora", name: "Quora", icon: "❓", description: "Popular questions" },
    { id: "firecrawl", name: "Web Scraping", icon: "🔥", description: "Competitor content" },
  ];

  function toggleSource(sourceId: string) {
    setSelectedSources((prev) =>
      prev.includes(sourceId) ? prev.filter((s) => s !== sourceId) : [...prev, sourceId]
    );
  }

  async function runDiscovery() {
    setRunning(true);
    try {
      for (const source of selectedSources) {
        await fetch("/api/discovery/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source }),
        });
      }

      // Wait a bit for processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      onDiscoveryComplete();
      setOpen(false);
    } catch (error) {
      console.error("Discovery failed:", error);
      alert("Discovery failed. Please try again.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gold-500 hover:bg-gold-600 text-black">
          <Play className="w-4 h-4 mr-2" />
          Run Discovery
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-grey-900 border-grey-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold-500" />
            Run Content Discovery
          </DialogTitle>
          <DialogDescription className="text-grey-300">
            Select sources to scan for trending content ideas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Source Selection */}
          <div>
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Select Discovery Sources
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sources.map((source) => {
                const isSelected = selectedSources.includes(source.id);
                return (
                  <div
                    key={source.id}
                    onClick={() => toggleSource(source.id)}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-all
                      ${
                        isSelected
                          ? "border-gold-500 bg-gold-500/10"
                          : "border-grey-700 hover:border-grey-600"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox checked={isSelected} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{source.icon}</span>
                          <h4 className="font-medium text-white">{source.name}</h4>
                        </div>
                        <p className="text-xs text-grey-400">{source.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              <strong>Note:</strong> Discovery runs in the background. You'll be notified when new
              ideas are found. This usually takes 1-3 minutes per source.
            </p>
          </div>

          {/* Selection Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-grey-300">
              {selectedSources.length} source{selectedSources.length !== 1 ? "s" : ""} selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-grey-600 hover:border-grey-500"
              >
                Cancel
              </Button>
              <Button
                onClick={runDiscovery}
                disabled={running || selectedSources.length === 0}
                className="bg-gold-500 hover:bg-gold-600 text-black"
              >
                {running ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Discovery...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Discovery
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
