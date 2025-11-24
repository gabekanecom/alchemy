"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Play,
  Filter,
  TrendingUp,
  Clock,
  Sparkles,
  BookmarkPlus,
  Zap,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react";
import { IdeaCard } from "@/components/discovery/idea-card";
import { DiscoveryControls } from "@/components/discovery/discovery-controls";
import { DiscoveryStats } from "@/components/discovery/discovery-stats";

interface DiscoveredIdea {
  id: string;
  title: string;
  description: string | null;
  source: string;
  sourceUrl: string | null;
  discoveredAt: string;
  overallScore: number;
  viralityScore: number;
  relevanceScore: number;
  competitionScore: number;
  timelinessScore: number;
  keywords: string[];
  status: string;
  sourceMetadata: any;
}

export default function DiscoveryPage() {
  const [ideas, setIdeas] = useState<DiscoveredIdea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<DiscoveredIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("score");
  const [searchQuery, setSearchQuery] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    fetchDiscoveredIdeas();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [ideas, selectedSource, selectedStatus, sortBy, searchQuery, minScore]);

  async function fetchDiscoveredIdeas() {
    setLoading(true);
    try {
      const response = await fetch("/api/ideas?source=discovered&limit=100");
      const data = await response.json();
      setIdeas(data.ideas || []);
    } catch (error) {
      console.error("Failed to fetch discovered ideas:", error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...ideas];

    // Filter by source
    if (selectedSource !== "all") {
      filtered = filtered.filter((idea) => idea.source === selectedSource);
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((idea) => idea.status === selectedStatus);
    }

    // Filter by minimum score
    if (minScore > 0) {
      filtered = filtered.filter((idea) => idea.overallScore >= minScore);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (idea) =>
          idea.title.toLowerCase().includes(query) ||
          idea.description?.toLowerCase().includes(query) ||
          idea.keywords.some((k) => k.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case "score":
        filtered.sort((a, b) => b.overallScore - a.overallScore);
        break;
      case "virality":
        filtered.sort((a, b) => b.viralityScore - a.viralityScore);
        break;
      case "recent":
        filtered.sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime());
        break;
      case "relevance":
        filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
    }

    setFilteredIdeas(filtered);
  }

  const sources = [
    { value: "all", label: "All Sources", icon: "🌐" },
    { value: "reddit", label: "Reddit", icon: "🔴" },
    { value: "youtube", label: "YouTube", icon: "▶️" },
    { value: "twitter", label: "Twitter/X", icon: "🐦" },
    { value: "seo", label: "SEO/Keywords", icon: "🔍" },
    { value: "quora", label: "Quora", icon: "❓" },
    { value: "firecrawl", label: "Web Scraping", icon: "🔥" },
  ];

  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "discovered", label: "Just Discovered" },
    { value: "saved", label: "Saved" },
    { value: "in_production", label: "In Production" },
    { value: "published", label: "Published" },
    { value: "dismissed", label: "Dismissed" },
  ];

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-gold-500" />
              Idea Discovery
            </h1>
            <p className="text-grey-200 mt-1">
              AI-powered content discovery from trending sources
            </p>
          </div>

          <DiscoveryControls onDiscoveryComplete={fetchDiscoveredIdeas} />
        </div>

        {/* Stats */}
        <DiscoveryStats ideas={ideas} />

        {/* Filters Bar */}
        <Card className="bg-grey-850 border-grey-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-grey-300 hover:text-white"
              >
                {showFilters ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-grey-400" />
                    <Input
                      placeholder="Search ideas, keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-grey-900 border-grey-600 text-white"
                    />
                  </div>
                </div>

                {/* Source Filter */}
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger className="bg-grey-900 border-grey-600 text-white">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.icon} {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-grey-900 border-grey-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-grey-900 border-grey-600 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Overall Score</SelectItem>
                    <SelectItem value="virality">Virality Score</SelectItem>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                  </SelectContent>
                </Select>

                {/* Min Score Slider */}
                <div className="md:col-span-2">
                  <label className="text-sm text-grey-300 mb-2 block">
                    Minimum Score: {minScore}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minScore}
                    onChange={(e) => setMinScore(parseInt(e.target.value))}
                    className="w-full h-2 bg-grey-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Results Count */}
                <div className="md:col-span-2 flex items-end">
                  <p className="text-sm text-grey-300">
                    Showing <strong className="text-white">{filteredIdeas.length}</strong> of{" "}
                    <strong className="text-white">{ideas.length}</strong> ideas
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ideas Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-gold-500" />
          </div>
        ) : filteredIdeas.length === 0 ? (
          <Card className="bg-grey-850 border-grey-600">
            <CardContent className="text-center py-12">
              <Sparkles className="w-12 h-12 text-grey-400 mx-auto mb-4" />
              <p className="text-grey-300 mb-4">
                {ideas.length === 0
                  ? "No ideas discovered yet"
                  : "No ideas match your filters"}
              </p>
              {ideas.length === 0 && (
                <DiscoveryControls onDiscoveryComplete={fetchDiscoveredIdeas} />
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} onUpdate={fetchDiscoveredIdeas} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
