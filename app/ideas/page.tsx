"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BulkGenerateModal } from "@/components/ideas/bulk-generate-modal";
import {
  Lightbulb,
  Search,
  Plus,
  Sparkles,
  Zap,
  TrendingUp,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load filters from localStorage on mount
  const [filters, setFilters] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('alchemy_ideas_filters');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved filters:', e);
        }
      }
    }
    return {
      brand: "all",
      source: "all",
      status: "all",
      sortBy: "newest",
    };
  });

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForIdeas, setGenerateForIdeas] = useState<string[]>([]);

  useEffect(() => {
    fetchIdeas();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [ideas, filters, searchQuery]);

  // Persist filters to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('alchemy_ideas_filters', JSON.stringify(filters));
    }
  }, [filters]);

  async function fetchIdeas() {
    setLoading(true);
    try {
      const response = await fetch("/api/ideas");
      const data = await response.json();
      setIdeas(data.ideas || []);
    } catch (error) {
      console.error("Failed to fetch ideas:", error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...ideas];

    // Brand filter
    if (filters.brand !== "all") {
      filtered = filtered.filter((idea) => idea.brandId === filters.brand);
    }

    // Source filter
    if (filters.source !== "all") {
      filtered = filtered.filter((idea) => idea.source === filters.source);
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((idea) => idea.status === filters.status);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (idea) =>
          idea.title?.toLowerCase().includes(query) ||
          idea.description?.toLowerCase().includes(query) ||
          idea.keywords?.some((k: string) => k.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (filters.sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "score":
        filtered.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
        break;
      case "virality":
        filtered.sort((a, b) => (b.viralityScore || 0) - (a.viralityScore || 0));
        break;
    }

    setFilteredIdeas(filtered);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === filteredIdeas.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredIdeas.map((i) => i.id));
    }
  }

  function handleBulkGenerate() {
    setGenerateForIdeas(selectedIds);
    setShowGenerateModal(true);
  }

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selectedIds.length} ideas?`)) return;

    try {
      await Promise.all(
        selectedIds.map((id) => fetch(`/api/ideas/${id}`, { method: "DELETE" }))
      );
      fetchIdeas();
      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to delete ideas:", error);
    }
  }

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-2">
              <Lightbulb className="w-8 h-8 text-gold-500" />
              Content Ideas
            </h1>
            <p className="text-gray-700 mt-1">
              Capture, score, and transform ideas into content
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={fetchIdeas}
              variant="outline"
              size="sm"
              className="border-gray-300 hover:border-gold-500"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Link href="/discovery">
              <Button variant="outline" className="border-gray-300 hover:border-gold-500">
                <Sparkles className="w-4 h-4 mr-2" />
                Discover Ideas
              </Button>
            </Link>

            <Link href="/ideas/new">
              <Button className="bg-gold-500 hover:bg-gold-600 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Add Idea
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-gray-50 border-gray-300">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search ideas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300 text-gray-900"
                />
              </div>

              {/* Source Filter */}
              <Select
                value={filters.source}
                onValueChange={(v) => setFilters({ ...filters, source: v })}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="reddit">Reddit</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="seo">SEO</SelectItem>
                  <SelectItem value="quora">Quora</SelectItem>
                  <SelectItem value="firecrawl">Firecrawl</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters({ ...filters, status: v })}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_production">In Production</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select
                value={filters.sortBy}
                onValueChange={(v) => setFilters({ ...filters, sortBy: v })}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="score">Overall Score</SelectItem>
                  <SelectItem value="virality">Virality Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <Card className="bg-gold-500/10 border-gold-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-900 font-medium">
                  {selectedIds.length} idea{selectedIds.length !== 1 ? "s" : ""} selected
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleBulkGenerate}
                    className="bg-gold-500 hover:bg-gold-600 text-black"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Content
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleBulkDelete}
                    className="border-gray-300 hover:border-red-500"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedIds([])}
                    className="text-gray-600"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ideas List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
          </div>
        ) : filteredIdeas.length === 0 ? (
          <Card className="bg-gray-50 border-gray-300">
            <CardContent className="text-center py-12">
              <Lightbulb className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {ideas.length === 0 ? "No ideas yet" : "No ideas match your filters"}
              </p>
              {ideas.length === 0 && (
                <div className="flex gap-3 justify-center">
                  <Link href="/discovery">
                    <Button className="bg-gold-500 hover:bg-gold-600 text-black">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Discover Ideas
                    </Button>
                  </Link>
                  <Link href="/ideas/new">
                    <Button variant="outline" className="border-gray-300 hover:border-gold-500">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Manual Idea
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Select All */}
            <div className="flex items-center gap-2 px-2">
              <Checkbox
                checked={selectedIds.length === filteredIdeas.length}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-gray-500">Select all</span>
            </div>

            {/* Ideas Cards */}
            {filteredIdeas.map((idea) => (
              <Card
                key={idea.id}
                className={`bg-gray-50 border-gray-300 hover:border-gold-500/50 transition-all ${
                  selectedIds.includes(idea.id) ? "ring-2 ring-gold-500" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <Checkbox
                        checked={selectedIds.includes(idea.id)}
                        onCheckedChange={() => toggleSelect(idea.id)}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <Link href={`/ideas/${idea.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-gold-400 transition-colors mb-2">
                          {idea.title}
                        </h3>
                      </Link>

                      {idea.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {idea.description}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="bg-white text-gray-600">
                          {idea.source || "manual"}
                        </Badge>
                        {idea.overallScore && (
                          <Badge variant="outline" className="bg-gold-500/10 text-gold-400 border-gold-500/30">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Score: {idea.overallScore}
                          </Badge>
                        )}
                      </div>

                      {/* Keywords */}
                      {idea.keywords && idea.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {idea.keywords.slice(0, 5).map((keyword: string) => (
                            <span
                              key={keyword}
                              className="text-xs px-2 py-1 rounded bg-white text-gray-500 border border-gray-200"
                            >
                              {keyword}
                            </span>
                          ))}
                          {idea.keywords.length > 5 && (
                            <span className="text-xs text-gray-400">
                              +{idea.keywords.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setGenerateForIdeas([idea.id]);
                          setShowGenerateModal(true);
                        }}
                        className="bg-gold-500 hover:bg-gold-600 text-black whitespace-nowrap"
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Generate
                      </Button>

                      <Link href={`/ideas/${idea.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-gray-300 hover:border-gold-500"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Generate Content Modal */}
      <BulkGenerateModal
        open={showGenerateModal}
        onOpenChange={setShowGenerateModal}
        ideaIds={generateForIdeas}
        onGenerated={() => {
          fetchIdeas();
          setSelectedIds([]);
        }}
      />
    </AppLayout>
  );
}
