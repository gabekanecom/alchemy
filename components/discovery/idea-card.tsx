"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Zap,
  TrendingUp,
  Users,
  Clock,
  MoreVertical,
  Eye,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface IdeaCardProps {
  idea: {
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
  };
  onUpdate: () => void;
}

export function IdeaCard({ idea, onUpdate }: IdeaCardProps) {
  const [saving, setSaving] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  const isSaved = idea.status === "saved";

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: isSaved ? "discovered" : "saved" }),
      });
      onUpdate();
    } catch (error) {
      console.error("Failed to save idea:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDismiss() {
    setDismissing(true);
    try {
      await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dismissed" }),
      });
      onUpdate();
    } catch (error) {
      console.error("Failed to dismiss idea:", error);
    } finally {
      setDismissing(false);
    }
  }

  function getSourceIcon(source: string) {
    const icons: Record<string, string> = {
      reddit: "🔴",
      youtube: "▶️",
      twitter: "🐦",
      seo: "🔍",
      quora: "❓",
      firecrawl: "🔥",
    };
    return icons[source] || "🌐";
  }

  function getSourceColor(source: string) {
    const colors: Record<string, string> = {
      reddit: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      youtube: "bg-red-500/20 text-red-400 border-red-500/30",
      twitter: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      seo: "bg-green-500/20 text-green-400 border-green-500/30",
      quora: "bg-red-600/20 text-red-300 border-red-600/30",
      firecrawl: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
    return colors[source] || "bg-grey-700 text-grey-300 border-grey-600";
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-gold-400";
    if (score >= 40) return "text-orange-400";
    return "text-grey-400";
  }

  return (
    <Card className="bg-grey-850 border-grey-600 hover:border-gold-500/50 transition-all group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <Badge variant="outline" className={getSourceColor(idea.source)}>
            {getSourceIcon(idea.source)} {idea.source}
          </Badge>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="text-grey-400 hover:text-gold-500"
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-grey-400 hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-grey-900 border-grey-700">
                <DropdownMenuItem className="text-grey-200 hover:text-white">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDismiss}
                  disabled={dismissing}
                  className="text-grey-200 hover:text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Dismiss
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-gold-400 transition-colors">
          {idea.title}
        </h3>

        {/* Description */}
        {idea.description && (
          <p className="text-sm text-grey-300 mb-4 line-clamp-3">{idea.description}</p>
        )}

        {/* Scores */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold-500" />
            <div>
              <p className="text-xs text-grey-400">Overall</p>
              <p className={`text-lg font-bold ${getScoreColor(idea.overallScore)}`}>
                {idea.overallScore}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-xs text-grey-400">Virality</p>
              <p className={`text-lg font-bold ${getScoreColor(idea.viralityScore)}`}>
                {idea.viralityScore}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-grey-400">Relevance</p>
              <p className={`text-lg font-bold ${getScoreColor(idea.relevanceScore)}`}>
                {idea.relevanceScore}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-xs text-grey-400">Timeliness</p>
              <p className={`text-lg font-bold ${getScoreColor(idea.timelinessScore)}`}>
                {idea.timelinessScore}
              </p>
            </div>
          </div>
        </div>

        {/* Keywords */}
        {idea.keywords && idea.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {idea.keywords.slice(0, 3).map((keyword) => (
              <span
                key={keyword}
                className="text-xs px-2 py-1 rounded bg-grey-900 text-grey-300 border border-grey-700"
              >
                {keyword}
              </span>
            ))}
            {idea.keywords.length > 3 && (
              <span className="text-xs text-grey-400">+{idea.keywords.length - 3} more</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1 bg-gold-500 hover:bg-gold-600 text-black">
            <Zap className="w-4 h-4 mr-2" />
            Generate Content
          </Button>

          {idea.sourceUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(idea.sourceUrl!, "_blank")}
              className="border-grey-600 hover:border-gold-500"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-grey-500 mt-4">
          Discovered {new Date(idea.discoveredAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
