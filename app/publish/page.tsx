"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { format, isSameDay, startOfDay } from "date-fns";
import { PublishHistory } from "@/components/publish/publish-history";

interface ScheduledPost {
  id: string;
  contentId: string;
  title: string;
  platforms: string[];
  scheduledFor: Date;
  status: "scheduled" | "publishing" | "published" | "failed";
  error?: string;
  createdAt: Date;
}

export default function PublishPage() {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"calendar" | "list" | "history">("calendar");

  useEffect(() => {
    fetchScheduledPosts();
    const interval = setInterval(fetchScheduledPosts, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  async function fetchScheduledPosts() {
    try {
      const response = await fetch("/api/publish/scheduled");
      const data = await response.json();
      setScheduledPosts(
        data.posts.map((post: any) => ({
          ...post,
          scheduledFor: new Date(post.scheduledFor),
          createdAt: new Date(post.createdAt),
        }))
      );
    } catch (error) {
      console.error("Failed to fetch scheduled posts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(postId: string) {
    if (!confirm("Cancel this scheduled post?")) return;

    try {
      await fetch(`/api/publish/scheduled/${postId}`, {
        method: "DELETE",
      });
      fetchScheduledPosts();
    } catch (error) {
      console.error("Failed to cancel post:", error);
      alert("Failed to cancel post");
    }
  }

  async function handlePublishNow(postId: string) {
    if (!confirm("Publish this content immediately?")) return;

    try {
      await fetch(`/api/publish/now`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      fetchScheduledPosts();
    } catch (error) {
      console.error("Failed to publish:", error);
      alert("Failed to publish content");
    }
  }

  function getStatusBadge(status: ScheduledPost["status"]) {
    const variants = {
      scheduled: { color: "bg-blue-50 text-blue-700 border border-blue-200", icon: Clock, label: "Scheduled" },
      publishing: {
        color: "bg-purple-50 text-purple-700 border border-purple-200",
        icon: Loader2,
        label: "Publishing",
      },
      published: {
        color: "bg-green-50 text-green-700 border border-green-200",
        icon: CheckCircle2,
        label: "Published",
      },
      failed: { color: "bg-red-50 text-red-700 border border-red-200", icon: XCircle, label: "Failed" },
    };

    const variant = variants[status];
    const Icon = variant.icon;

    return (
      <Badge variant="outline" className={variant.color}>
        <Icon className={`w-3 h-3 mr-1 ${status === "publishing" ? "animate-spin" : ""}`} />
        {variant.label}
      </Badge>
    );
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

  const postsOnSelectedDate = scheduledPosts.filter((post) =>
    isSameDay(post.scheduledFor, selectedDate)
  );

  const upcomingPosts = scheduledPosts
    .filter((post) => post.status === "scheduled" && post.scheduledFor > new Date())
    .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());

  const publishedToday = scheduledPosts.filter(
    (post) => post.status === "published" && isSameDay(post.createdAt, new Date())
  ).length;

  const failedCount = scheduledPosts.filter((post) => post.status === "failed").length;

  // Dates that have scheduled posts
  const datesWithPosts = scheduledPosts.reduce((acc, post) => {
    const dateKey = startOfDay(post.scheduledFor).toISOString();
    acc[dateKey] = (acc[dateKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Publishing Scheduler</h1>
            <p className="text-gray-500 mt-1">Manage and schedule your content publications</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={view === "calendar" ? "default" : "outline"}
              onClick={() => setView("calendar")}
              className={view === "calendar" ? "bg-gold-500 text-black" : ""}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              onClick={() => setView("list")}
              className={view === "list" ? "bg-gold-500 text-black" : ""}
            >
              List View
            </Button>
            <Button
              variant={view === "history" ? "default" : "outline"}
              onClick={() => setView("history")}
              className={view === "history" ? "bg-gold-500 text-black" : ""}
            >
              History
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-50 border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {scheduledPosts.filter((p) => p.status === "scheduled").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="bg-gray-50 border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Publishing</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {scheduledPosts.filter((p) => p.status === "publishing").length}
                </p>
              </div>
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          </Card>

          <Card className="bg-gray-50 border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Published Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{publishedToday}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </Card>

          <Card className="bg-gray-50 border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{failedCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
          </div>
        ) : view === "calendar" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="bg-gray-50 border-gray-200 p-6 lg:col-span-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border-gray-300"
                modifiers={{
                  hasPosts: (date) => {
                    const dateKey = startOfDay(date).toISOString();
                    return !!datesWithPosts[dateKey];
                  },
                }}
                modifiersStyles={{
                  hasPosts: {
                    fontWeight: "bold",
                    textDecoration: "underline",
                    color: "#F59E0B",
                  },
                }}
              />

              <div className="mt-4 text-xs text-gray-500">
                Dates with scheduled posts are highlighted in gold
              </div>
            </Card>

            {/* Posts on Selected Date */}
            <Card className="bg-gray-50 border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {format(selectedDate, "MMMM d, yyyy")}
              </h3>

              {postsOnSelectedDate.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No posts scheduled for this date
                </p>
              ) : (
                <div className="space-y-3">
                  {postsOnSelectedDate.map((post) => (
                    <Card
                      key={post.id}
                      className="bg-white border-gray-300 p-3 hover:border-gold-500/50 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {post.title}
                          </h4>
                          {getStatusBadge(post.status)}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {format(post.scheduledFor, "h:mm a")}
                        </div>

                        <div className="flex items-center gap-1 flex-wrap">
                          {post.platforms.map((platform) => (
                            <span key={platform} className="text-sm">
                              {getPlatformIcon(platform)}
                            </span>
                          ))}
                        </div>

                        {post.status === "scheduled" && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePublishNow(post.id)}
                              className="text-xs"
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Publish Now
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(post.id)}
                              className="text-xs text-red-400 border-red-400/50"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        ) : view === "list" ? (
          /* List View */
          <Card className="bg-gray-50 border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Posts</h3>

            {upcomingPosts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No upcoming scheduled posts
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingPosts.map((post) => (
                  <Card
                    key={post.id}
                    className="bg-white border-gray-300 p-4 hover:border-gold-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-base font-medium text-gray-900">{post.title}</h4>
                          {getStatusBadge(post.status)}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {format(post.scheduledFor, "MMM d, yyyy")}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(post.scheduledFor, "h:mm a")}
                          </div>
                          <div className="flex items-center gap-1">
                            {post.platforms.map((platform) => (
                              <span key={platform}>{getPlatformIcon(platform)}</span>
                            ))}
                          </div>
                        </div>

                        {post.error && (
                          <div className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded p-2">
                            {post.error}
                          </div>
                        )}
                      </div>

                      {post.status === "scheduled" && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePublishNow(post.id)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Publish Now
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(post.id)}
                            className="text-red-400 border-red-400/50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        ) : view === "history" ? (
          /* History View */
          <Card className="bg-gray-50 border-gray-200 p-6">
            <PublishHistory />
          </Card>
        ) : null}
      </div>
    </AppLayout>
  );
}
