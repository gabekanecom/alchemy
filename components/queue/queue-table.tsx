"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { X, RotateCw, Eye, AlertCircle } from "lucide-react";
import Link from "next/link";

interface QueueTableProps {
  items: any[];
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onRefresh: () => void;
}

export function QueueTable({ items, onCancel, onRetry }: QueueTableProps) {
  function getStatusBadge(status: string) {
    const variants: Record<string, string> = {
      queued: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      processing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return variants[status] || "bg-grey-700 text-grey-300 border-grey-600";
  }

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
    <Card className="bg-grey-850 border-grey-600">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-grey-700 hover:bg-grey-800/50">
              <TableHead className="text-grey-300">Platform</TableHead>
              <TableHead className="text-grey-300">Content Type</TableHead>
              <TableHead className="text-grey-300">Status</TableHead>
              <TableHead className="text-grey-300">Progress</TableHead>
              <TableHead className="text-grey-300">Created</TableHead>
              <TableHead className="text-grey-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                className="border-grey-700 hover:bg-grey-800/50 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getPlatformIcon(item.platform)}</span>
                    <span className="text-white font-medium capitalize">{item.platform}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-grey-300">{item.contentType}</span>
                </TableCell>

                <TableCell>
                  <Badge variant="outline" className={getStatusBadge(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  {item.status === "processing" && item.progress !== null ? (
                    <div className="w-full max-w-[200px]">
                      <div className="flex items-center justify-between text-xs text-grey-400 mb-1">
                        <span>Processing...</span>
                        <span>{Math.round(item.progress)}%</span>
                      </div>
                      <div className="w-full bg-grey-700 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : item.status === "completed" ? (
                    <span className="text-green-400 text-sm">Complete</span>
                  ) : item.status === "failed" ? (
                    <div className="flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Error</span>
                    </div>
                  ) : (
                    <span className="text-grey-400 text-sm">Waiting...</span>
                  )}
                </TableCell>

                <TableCell>
                  <span className="text-grey-400 text-sm">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {item.status === "completed" && item.generatedContentId && (
                      <Link href={`/content/${item.generatedContentId}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-grey-600 hover:border-gold-500"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}

                    {item.status === "failed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRetry(item.id)}
                        className="border-grey-600 hover:border-green-500"
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                    )}

                    {(item.status === "queued" || item.status === "processing") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCancel(item.id)}
                        className="border-grey-600 hover:border-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {items.length === 0 && (
          <div className="text-center py-12 text-grey-400">No queue items to display</div>
        )}
      </CardContent>
    </Card>
  );
}
