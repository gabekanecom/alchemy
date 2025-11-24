"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, List, LayoutGrid, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { QueueTable } from "@/components/queue/queue-table";
import { QueueKanban } from "@/components/queue/queue-kanban";
import { QueueStats } from "@/components/queue/queue-stats";
import { QueueFilters } from "@/components/queue/queue-filters";

export default function ContentQueuePage() {
  const [queueItems, setQueueItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"table" | "kanban">("table");
  const [filters, setFilters] = useState({
    status: "all",
    platform: "all",
    brandId: "all",
  });

  useEffect(() => {
    fetchQueueItems();
    // Auto-refresh every 5 seconds for real-time updates
    const interval = setInterval(fetchQueueItems, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [queueItems, filters]);

  async function fetchQueueItems() {
    try {
      const response = await fetch("/api/content/queue");
      const data = await response.json();
      setQueueItems(data.queueItems || []);
    } catch (error) {
      console.error("Failed to fetch queue items:", error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...queueItems];

    if (filters.status !== "all") {
      filtered = filtered.filter((item: any) => item.status === filters.status);
    }

    if (filters.platform !== "all") {
      filtered = filtered.filter((item: any) => item.platform === filters.platform);
    }

    if (filters.brandId !== "all") {
      filtered = filtered.filter((item: any) => item.brandId === filters.brandId);
    }

    setFilteredItems(filtered);
  }

  async function handleCancel(id: string) {
    try {
      await fetch(`/api/content/queue/${id}`, {
        method: "DELETE",
      });
      fetchQueueItems();
    } catch (error) {
      console.error("Failed to cancel job:", error);
    }
  }

  async function handleRetry(id: string) {
    try {
      await fetch(`/api/content/queue/${id}/retry`, {
        method: "POST",
      });
      fetchQueueItems();
    } catch (error) {
      console.error("Failed to retry job:", error);
    }
  }

  async function handleClearCompleted() {
    if (!confirm("Clear all completed jobs?")) return;

    try {
      await fetch("/api/content/queue/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      fetchQueueItems();
    } catch (error) {
      console.error("Failed to clear completed:", error);
    }
  }

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
              <Clock className="w-8 h-8 text-gold-500" />
              Content Queue
            </h1>
            <p className="text-grey-200 mt-1">Monitor and manage content generation jobs</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchQueueItems}
              disabled={loading}
              className="border-grey-600 hover:border-gold-500"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCompleted}
              className="border-grey-600 hover:border-gold-500"
            >
              Clear Completed
            </Button>

            <div className="flex items-center gap-1 bg-grey-850 border border-grey-600 rounded-lg p-1">
              <Button
                variant={view === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("table")}
                className="h-8"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={view === "kanban" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("kanban")}
                className="h-8"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <QueueStats items={queueItems} />

        {/* Filters */}
        <QueueFilters filters={filters} onFiltersChange={setFilters} />

        {/* Content */}
        {loading && queueItems.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="bg-grey-850 border-grey-600">
            <CardContent className="text-center py-12">
              <Clock className="w-12 h-12 text-grey-400 mx-auto mb-4" />
              <p className="text-grey-300 mb-4">
                {queueItems.length === 0
                  ? "No items in queue"
                  : "No items match your filters"}
              </p>
              {queueItems.length === 0 && (
                <Button
                  onClick={() => (window.location.href = "/ideas")}
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                >
                  View Ideas
                </Button>
              )}
            </CardContent>
          </Card>
        ) : view === "table" ? (
          <QueueTable
            items={filteredItems}
            onCancel={handleCancel}
            onRetry={handleRetry}
            onRefresh={fetchQueueItems}
          />
        ) : (
          <QueueKanban
            items={filteredItems}
            onCancel={handleCancel}
            onRetry={handleRetry}
            onRefresh={fetchQueueItems}
          />
        )}
      </div>
    </AppLayout>
  );
}
