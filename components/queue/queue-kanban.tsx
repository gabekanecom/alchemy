"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, RotateCw, Eye, Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

interface QueueKanbanProps {
  items: any[];
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onRefresh: () => void;
}

export function QueueKanban({ items, onCancel, onRetry }: QueueKanbanProps) {
  const columns = [
    { id: "queued", title: "Queued", icon: Clock, color: "blue" },
    { id: "processing", title: "Processing", icon: Loader2, color: "purple" },
    { id: "completed", title: "Completed", icon: CheckCircle2, color: "green" },
    { id: "failed", title: "Failed", icon: XCircle, color: "red" },
  ];

  function getPlatformIcon(platform: string) {
    const icons: Record<string, string> = {
      blog: "📝",
      youtube: "🎬",
      linkedin: "💼",
      twitter: "🐦",
      email: "📧",
    };
    return icons[platform] || "📄";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => {
        const columnItems = items.filter((item) => item.status === column.id);
        const Icon = column.icon;

        return (
          <div key={column.id} className="space-y-3">
            {/* Column Header */}
            <Card className={`bg-${column.color}-500/10 border-${column.color}-500/30`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 text-${column.color}-500 ${column.id === 'processing' ? 'animate-spin' : ''}`} />
                    <span className="text-white">{column.title}</span>
                  </div>
                  <Badge variant="outline" className={`bg-${column.color}-500/20 text-${column.color}-400 border-${column.color}-500/30`}>
                    {columnItems.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Column Items */}
            <div className="space-y-2 min-h-[400px]">
              {columnItems.map((item) => (
                <Card
                  key={item.id}
                  className="bg-grey-850 border-grey-600 hover:border-gold-500/50 transition-all cursor-pointer"
                >
                  <CardContent className="p-4">
                    {/* Platform & Type */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getPlatformIcon(item.platform)}</span>
                        <div>
                          <p className="text-sm font-medium text-white capitalize">
                            {item.platform}
                          </p>
                          <p className="text-xs text-grey-400">{item.contentType}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar (for processing) */}
                    {item.status === "processing" && item.progress !== null && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-grey-400 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(item.progress)}%</span>
                        </div>
                        <div className="w-full bg-grey-700 rounded-full h-1.5">
                          <div
                            className="bg-purple-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Message (for failed) */}
                    {item.status === "failed" && item.errorMessage && (
                      <div className="mb-3">
                        <p className="text-xs text-red-400 line-clamp-2">{item.errorMessage}</p>
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-grey-500 mb-3">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {item.status === "completed" && item.generatedContentId && (
                        <Link href={`/content/${item.generatedContentId}`} className="flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-grey-600 hover:border-gold-500"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </Link>
                      )}

                      {item.status === "failed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRetry(item.id)}
                          className="flex-1 border-grey-600 hover:border-green-500"
                        >
                          <RotateCw className="w-3 h-3 mr-1" />
                          Retry
                        </Button>
                      )}

                      {(item.status === "queued" || item.status === "processing") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCancel(item.id)}
                          className="flex-1 border-grey-600 hover:border-red-500"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {columnItems.length === 0 && (
                <div className="flex items-center justify-center h-32 text-grey-500 text-sm border-2 border-dashed border-grey-700 rounded-lg">
                  No items
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
