"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Search,
  Edit,
  Trash2,
  Send,
  Loader2,
  Calendar,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface Draft {
  id: string;
  title: string;
  excerpt?: string;
  platform: string;
  wordCount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  brand: {
    id: string;
    name: string;
  };
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [filteredDrafts, setFilteredDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");

  useEffect(() => {
    fetchDrafts();
  }, []);

  useEffect(() => {
    filterDrafts();
  }, [drafts, searchQuery, filterPlatform]);

  async function fetchDrafts() {
    try {
      const response = await fetch("/api/content/drafts");
      const data = await response.json();
      setDrafts(
        data.drafts.map((draft: any) => ({
          ...draft,
          createdAt: new Date(draft.createdAt),
          updatedAt: new Date(draft.updatedAt),
        }))
      );
    } catch (error) {
      console.error("Failed to fetch drafts:", error);
    } finally {
      setLoading(false);
    }
  }

  function filterDrafts() {
    let filtered = [...drafts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (draft) =>
          draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          draft.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Platform filter
    if (filterPlatform !== "all") {
      filtered = filtered.filter((draft) => draft.platform === filterPlatform);
    }

    setFilteredDrafts(filtered);
  }

  async function handleDelete(draftId: string) {
    if (!confirm("Delete this draft? This action cannot be undone.")) return;

    try {
      await fetch(`/api/content/${draftId}`, {
        method: "DELETE",
      });
      fetchDrafts();
    } catch (error) {
      console.error("Failed to delete draft:", error);
      alert("Failed to delete draft");
    }
  }

  function getPlatformIcon(platform: string) {
    const icons: Record<string, string> = {
      blog: "📝",
      linkedin: "💼",
      twitter: "🐦",
      youtube: "🎬",
      instagram: "📱",
      medium: "✍️",
    };
    return icons[platform] || "📄";
  }

  const platforms = ["all", ...new Set(drafts.map((d) => d.platform))];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-gold-500" />
              Drafts
            </h1>
            <p className="text-gray-500 mt-1">Manage your unpublished content</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-50 border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Drafts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{drafts.length}</p>
              </div>
              <FileText className="w-8 h-8 text-gold-500" />
            </div>
          </Card>

          <Card className="bg-gray-50 border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Words Written</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {drafts.reduce((sum, d) => sum + d.wordCount, 0).toLocaleString()}
                </p>
              </div>
              <Edit className="w-8 h-8 text-purple-400" />
            </div>
          </Card>

          <Card className="bg-gray-50 border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Updated Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {
                    drafts.filter(
                      (d) =>
                        d.updatedAt.toDateString() === new Date().toDateString()
                    ).length
                  }
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-50 border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search drafts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-gray-900"
              />
            </div>

            {/* Platform Filter */}
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform === "all"
                    ? "All Platforms"
                    : platform.charAt(0).toUpperCase() + platform.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Drafts List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
          </div>
        ) : filteredDrafts.length === 0 ? (
          <Card className="bg-gray-50 border-gray-200 p-12">
            <div className="text-center">
              <FileText className="w-16 h-16 text-grey-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Drafts Found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filterPlatform !== "all"
                  ? "Try adjusting your filters"
                  : "Start creating content to see drafts here"}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredDrafts.map((draft) => (
              <Card
                key={draft.id}
                className="bg-gray-50 border-gray-200 p-6 hover:border-gold-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getPlatformIcon(draft.platform)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{draft.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="bg-grey-500/20 text-gray-500">
                            {draft.platform}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border border-blue-200">
                            {draft.brand.name}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {draft.wordCount} words
                          </span>
                        </div>
                      </div>
                    </div>

                    {draft.excerpt && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {draft.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Created {format(draft.createdAt, "MMM d, yyyy")}</span>
                      <span>•</span>
                      <span>Updated {format(draft.updatedAt, "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Link href={`/content/${draft.id}/edit`}>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/content/${draft.id}/preview`}>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(draft.id)}
                      className="gap-2 text-red-400 border-red-400/50 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
