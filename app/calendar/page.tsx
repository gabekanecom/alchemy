"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface CalendarData {
  events: Record<string, any[]>;
  queuedContent: any[];
  unpublishedContent: any[];
  summary: {
    totalScheduled: number;
    totalPublished: number;
    totalFailed: number;
    inQueue: number;
    unpublished: number;
  };
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  async function fetchCalendarData() {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await fetch(`/api/calendar?year=${year}&month=${month}`);
      const data = await response.json();
      setCalendarData(data);
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    } finally {
      setLoading(false);
    }
  }

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  function getDaysInMonth() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: Date[] = [];

    // Add days from previous month to fill first week
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add days from next month to fill last week
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }

  function getDateKey(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  function isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  function isCurrentMonth(date: Date): boolean {
    return date.getMonth() === currentDate.getMonth();
  }

  function getEventsForDate(date: Date): any[] {
    if (!calendarData) return [];
    const dateKey = getDateKey(date);
    return calendarData.events[dateKey] || [];
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "published":
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case "scheduled":
        return <Clock className="w-3 h-3 text-blue-500" />;
      case "failed":
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "published":
        return "bg-green-500/10 border-green-500/30 text-green-400";
      case "scheduled":
        return "bg-blue-500/10 border-blue-500/30 text-blue-400";
      case "failed":
        return "bg-red-500/10 border-red-500/30 text-red-400";
      default:
        return "bg-grey-500/10 border-grey-500/30 text-grey-400";
    }
  }

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const days = getDaysInMonth();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const selectedEvents = selectedDate ? (calendarData?.events[selectedDate] || []) : [];

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Content Calendar</h1>
            <p className="text-grey-200 mt-1">Plan and schedule your content publishing</p>
          </div>

          <Button
            onClick={goToToday}
            variant="outline"
            className="border-grey-600 hover:border-gold-500"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Today
          </Button>
        </div>

        {/* Summary Stats */}
        {calendarData && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-300">Scheduled</p>
                    <p className="text-2xl font-bold text-white">{calendarData.summary.totalScheduled}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-300">Published</p>
                    <p className="text-2xl font-bold text-white">{calendarData.summary.totalPublished}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-300">Failed</p>
                    <p className="text-2xl font-bold text-white">{calendarData.summary.totalFailed}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-300">In Queue</p>
                    <p className="text-2xl font-bold text-white">{calendarData.summary.inQueue}</p>
                  </div>
                  <Loader2 className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gold-500/10 border-gold-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gold-300">Unpublished</p>
                    <p className="text-2xl font-bold text-white">{calendarData.summary.unpublished}</p>
                  </div>
                  <CalendarIcon className="w-8 h-8 text-gold-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="bg-grey-850 border-grey-600">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{monthName}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={previousMonth}
                      className="border-grey-600 hover:border-gold-500"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextMonth}
                      className="border-grey-600 hover:border-gold-500"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Week day headers */}
                    <div className="grid grid-cols-7 gap-1">
                      {weekDays.map((day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-medium text-grey-400 py-2"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {days.map((date, index) => {
                        const events = getEventsForDate(date);
                        const dateKey = getDateKey(date);
                        const isTodayDate = isToday(date);
                        const isCurrentMonthDate = isCurrentMonth(date);

                        return (
                          <div
                            key={index}
                            onClick={() => setSelectedDate(dateKey)}
                            className={`
                              min-h-[80px] p-2 rounded-lg border cursor-pointer transition-all
                              ${
                                isTodayDate
                                  ? "border-gold-500 bg-gold-500/5"
                                  : selectedDate === dateKey
                                  ? "border-blue-500 bg-blue-500/5"
                                  : "border-grey-700 hover:border-grey-600"
                              }
                              ${!isCurrentMonthDate && "opacity-40"}
                            `}
                          >
                            <div className="text-sm font-medium text-white mb-1">
                              {date.getDate()}
                            </div>
                            <div className="space-y-1">
                              {events.slice(0, 2).map((event, idx) => (
                                <div
                                  key={idx}
                                  className={`text-xs px-1 py-0.5 rounded border truncate ${getStatusColor(
                                    event.status
                                  )}`}
                                >
                                  {event.title.substring(0, 15)}
                                  {event.title.length > 15 && "..."}
                                </div>
                              ))}
                              {events.length > 2 && (
                                <div className="text-xs text-grey-400 px-1">
                                  +{events.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Selected Day Events */}
          <div className="space-y-4">
            <Card className="bg-grey-850 border-grey-600">
              <CardHeader>
                <CardTitle className="text-white">
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Select a date"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEvents.length === 0 ? (
                  <p className="text-sm text-grey-400 text-center py-8">
                    No events scheduled
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border ${getStatusColor(event.status)}`}
                      >
                        <div className="flex items-start gap-2">
                          {getStatusIcon(event.status)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white text-sm truncate">
                              {event.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {event.platform}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {event.status}
                              </Badge>
                            </div>
                            {event.publishedUrl && (
                              <a
                                href={event.publishedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-gold-500 hover:text-gold-400 mt-2"
                              >
                                View
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Unpublished Content */}
            {calendarData && calendarData.unpublishedContent.length > 0 && (
              <Card className="bg-grey-850 border-grey-600">
                <CardHeader>
                  <CardTitle className="text-white text-sm">
                    Ready to Publish ({calendarData.unpublishedContent.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {calendarData.unpublishedContent.slice(0, 5).map((content) => (
                      <div
                        key={content.id}
                        className="p-2 rounded bg-grey-900 border border-grey-700 hover:border-gold-500 cursor-pointer transition-colors"
                      >
                        <p className="text-sm text-white truncate">{content.title}</p>
                        <p className="text-xs text-grey-400 mt-1">
                          {new Date(content.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
