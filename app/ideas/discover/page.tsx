"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/layout/app-layout";
import { useBrand } from "@/lib/contexts/brand-context";

export default function DiscoverIdeasPage() {
  const { activeBrand } = useBrand();
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);

  useEffect(() => {
    if (activeBrand) {
      fetchStats();
    }
  }, [activeBrand]);

  const fetchStats = async () => {
    if (!activeBrand) return;

    try {
      const response = await fetch(`/api/discovery/stats?brandId=${activeBrand.id}`);
      const data = await response.json();
      setStats(data);

      if (data.recentRuns && data.recentRuns.length > 0) {
        const lastRunDate = new Date(data.recentRuns[0].startedAt);
        setLastRun(lastRunDate.toLocaleString());
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const runDiscovery = async (source: string) => {
    if (!activeBrand || isRunning) return;

    setIsRunning(true);

    try {
      const response = await fetch("/api/discovery/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: activeBrand.id, source }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Discovery complete! Found ${data.ideasFound} ideas, saved ${data.ideasSaved}.`);
        fetchStats();
      } else {
        alert(`Discovery failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Discovery failed:", error);
      alert("Discovery failed. Check console for details.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <AppLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Discover Ideas</h1>
              <p className="mt-1 text-sm text-gray-600">
                Research trending topics and viral content across platforms
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/ideas">
                <Button variant="outline">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Ideas
                </Button>
              </Link>
            </div>
          </div>

          {/* Research Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Upload Ideas */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-3xl">📤</div>
                  <Badge variant="secondary">Quick</Badge>
                </div>
                <CardTitle className="mt-4">Upload Ideas</CardTitle>
                <CardDescription>
                  Import your own list of content ideas for AI vetting and scoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/ideas/upload">
                  <Button className="w-full">Upload Ideas</Button>
                </Link>
                <p className="text-xs text-gray-500 mt-3">
                  Supports: CSV, TXT, JSON, or paste directly
                </p>
              </CardContent>
            </Card>

            {/* Reddit Trends */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-3xl">🔴</div>
                  <Badge className="bg-orange-100 text-orange-800">Reddit</Badge>
                </div>
                <CardTitle className="mt-4">Reddit Trending</CardTitle>
                <CardDescription>
                  Discover viral discussions and trending topics from relevant subreddits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runDiscovery("reddit")}
                  disabled={isRunning}
                  className="w-full"
                >
                  {isRunning ? "Running..." : "Run Discovery"}
                </Button>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Last scan:</span>
                    <span className="font-medium">{lastRun || "Never"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Ideas found:</span>
                    <span className="font-medium">{stats?.bySource?.reddit || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* YouTube Trends */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-3xl">▶️</div>
                  <Badge className="bg-red-100 text-red-800">YouTube</Badge>
                </div>
                <CardTitle className="mt-4">YouTube Viral</CardTitle>
                <CardDescription>
                  Find viral videos and analyze what makes them successful
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runDiscovery("youtube")}
                  disabled={isRunning}
                  className="w-full"
                >
                  {isRunning ? "Running..." : "Run Discovery"}
                </Button>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Last scan:</span>
                    <span className="font-medium">{lastRun || "Never"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Videos analyzed:</span>
                    <span className="font-medium">{stats?.bySource?.youtube || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Twitter/X Trends */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-3xl">🐦</div>
                  <Badge className="bg-blue-100 text-blue-800">Twitter</Badge>
                </div>
                <CardTitle className="mt-4">Twitter/X Trends</CardTitle>
                <CardDescription>
                  Track trending topics, hashtags, and viral threads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runDiscovery("twitter")}
                  disabled={isRunning}
                  className="w-full"
                >
                  {isRunning ? "Running..." : "Run Discovery"}
                </Button>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Last scan:</span>
                    <span className="font-medium">{lastRun || "Never"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Trends found:</span>
                    <span className="font-medium">{stats?.bySource?.twitter || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keyword Research */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-3xl">🔍</div>
                  <Badge className="bg-green-100 text-green-800">SEO</Badge>
                </div>
                <CardTitle className="mt-4">Keyword Research</CardTitle>
                <CardDescription>
                  Discover high-volume, low-competition keywords in your niche
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runDiscovery("seo")}
                  disabled={isRunning}
                  className="w-full"
                >
                  {isRunning ? "Running..." : "Run Discovery"}
                </Button>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Last scan:</span>
                    <span className="font-medium">{lastRun || "Never"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Keywords found:</span>
                    <span className="font-medium">{stats?.bySource?.seo || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quora Questions */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-3xl">❓</div>
                  <Badge className="bg-purple-100 text-purple-800">Quora</Badge>
                </div>
                <CardTitle className="mt-4">Quora Questions</CardTitle>
                <CardDescription>
                  Find trending questions and hot topics from Quora discussions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runDiscovery("quora")}
                  disabled={isRunning}
                  className="w-full"
                >
                  {isRunning ? "Running..." : "Run Discovery"}
                </Button>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Last scan:</span>
                    <span className="font-medium">{lastRun || "Never"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Questions found:</span>
                    <span className="font-medium">{stats?.bySource?.quora || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Web Scraping */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-3xl">🔥</div>
                  <Badge className="bg-orange-100 text-orange-800">Firecrawl</Badge>
                </div>
                <CardTitle className="mt-4">Web Scraping</CardTitle>
                <CardDescription>
                  Scrape competitor blogs, news sites, and industry publications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => runDiscovery("firecrawl")}
                  disabled={isRunning}
                  className="w-full"
                >
                  {isRunning ? "Running..." : "Run Discovery"}
                </Button>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Last scan:</span>
                    <span className="font-medium">{lastRun || "Never"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Articles found:</span>
                    <span className="font-medium">{stats?.bySource?.firecrawl || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Research</CardTitle>
              <CardDescription>
                Enter a topic or question to instantly research and generate ideas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g., 'AI productivity tools for developers' or 'How to improve React performance'"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <Button>
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Research
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                AI will analyze the topic, find trending content, and suggest high-potential ideas
              </p>
            </CardContent>
          </Card>

          {/* Recent Discoveries */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Discoveries</h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No discoveries yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start researching trending topics or upload your own ideas
                  </p>
                  <div className="mt-6 flex gap-3 justify-center">
                    <Link href="/ideas/upload">
                      <Button>Upload Ideas</Button>
                    </Link>
                    <Button variant="outline">Start Research</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
