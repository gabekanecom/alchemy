"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ExternalLink, RefreshCw, Eye } from "lucide-react";
import { format } from "date-fns";

interface PublishHistory {
  id: string;
  contentTitle: string;
  platform: string;
  status: "published" | "failed";
  publishedAt?: Date;
  error?: string;
  externalUrl?: string;
}

export function PublishHistory() {
  const [history, setHistory] = useState<PublishHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "failed">("all");

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    try {
      const response = await fetch("/api/publish/history");
      const data = await response.json();
      setHistory(
        data.history.map((item: any) => ({
          ...item,
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch publish history:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRetry(historyId: string) {
    if (!confirm("Retry publishing this content?")) return;

    try {
      await fetch("/api/publish/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historyId }),
      });
      alert("Retry queued successfully");
      fetchHistory();
    } catch (error) {
      console.error("Failed to retry:", error);
      alert("Failed to queue retry");
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

  const filteredHistory =
    filter === "all" ? history : history.filter((item) => item.status === filter);

  const publishedCount = history.filter((h) => h.status === "published").length;
  const failedCount = history.filter((h) => h.status === "failed").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Publishing History</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchHistory}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card
          className={`bg-white border p-3 cursor-pointer transition-colors ${
            filter === "all" ? "border-gold-500" : "border-gray-300 hover:border-gray-400"
          }`}
          onClick={() => setFilter("all")}
        >
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-bold text-gray-900">{history.length}</p>
        </Card>

        <Card
          className={`bg-white border p-3 cursor-pointer transition-colors ${
            filter === "published"
              ? "border-green-500"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onClick={() => setFilter("published")}
        >
          <p className="text-xs text-gray-500">Published</p>
          <p className="text-xl font-bold text-green-400">{publishedCount}</p>
        </Card>

        <Card
          className={`bg-white border p-3 cursor-pointer transition-colors ${
            filter === "failed" ? "border-red-500" : "border-gray-300 hover:border-gray-400"
          }`}
          onClick={() => setFilter("failed")}
        >
          <p className="text-xs text-gray-500">Failed</p>
          <p className="text-xl font-bold text-red-400">{failedCount}</p>
        </Card>
      </div>

      {/* History List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <Card className="bg-white border-gray-300 p-6">
            <p className="text-sm text-gray-500 text-center">
              {filter === "all"
                ? "No publishing history yet"
                : `No ${filter} publications`}
            </p>
          </Card>
        ) : (
          filteredHistory.map((item) => (
            <Card
              key={item.id}
              className="bg-white border-gray-300 p-4 hover:border-gold-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getPlatformIcon(item.platform)}</span>
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                      {item.contentTitle}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs bg-grey-500/20 text-gray-500">
                      {item.platform}
                    </Badge>
                    {item.status === "published" ? (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-50 text-green-700 border border-green-200 border-green-500/30"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Published
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs bg-red-50 text-red-700 border border-red-200 border-red-500/30"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </div>

                  {item.publishedAt && (
                    <p className="text-xs text-gray-400">
                      {format(item.publishedAt, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  )}

                  {item.error && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                      {item.error}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  {item.status === "published" && item.externalUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(item.externalUrl, "_blank")}
                      className="gap-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View
                    </Button>
                  )}
                  {item.status === "failed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRetry(item.id)}
                      className="gap-2 text-gold-400 border-gold-400/50"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
