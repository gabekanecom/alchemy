"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  PlayCircle,
  StopCircle,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Terminal,
} from "lucide-react";

interface Worker {
  id: string;
  name: string;
  type: "content" | "discovery" | "research";
  status: "running" | "stopped" | "error";
  uptime: number;
  jobsProcessed: number;
  activeJobs: number;
  lastHeartbeat: string;
  memoryUsage: number;
  cpuUsage: number;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkers();
    const interval = setInterval(fetchWorkers, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchWorkers() {
    try {
      const response = await fetch("/api/workers/status");
      const data = await response.json();
      setWorkers(data.workers || []);
    } catch (error) {
      console.error("Failed to fetch workers:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleWorkerAction(workerId: string, action: "start" | "stop" | "restart") {
    try {
      await fetch("/api/workers/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, action }),
      });
      fetchWorkers();
    } catch (error) {
      console.error(`Failed to ${action} worker:`, error);
    }
  }

  function getStatusBadge(status: string) {
    const variants = {
      running: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2 },
      stopped: { color: "bg-grey-500/20 text-grey-400 border-grey-500/30", icon: StopCircle },
      error: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertCircle },
    };
    const variant = variants[status as keyof typeof variants] || variants.stopped;
    const Icon = variant.icon;

    return (
      <Badge variant="outline" className={variant.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  }

  function formatUptime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
              <Activity className="w-8 h-8 text-gold-500" />
              Worker Management
            </h1>
            <p className="text-grey-200 mt-1">Monitor and control background workers</p>
          </div>

          <Button
            onClick={fetchWorkers}
            disabled={loading}
            className="bg-gold-500 hover:bg-gold-600 text-black"
          >
            <RotateCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Workers Grid */}
        {loading && workers.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <Card
                key={worker.id}
                className={`bg-grey-850 border-grey-600 hover:border-gold-500/50 transition-all ${
                  selectedWorker === worker.id ? "ring-2 ring-gold-500" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-gold-500" />
                        {worker.name}
                      </CardTitle>
                      <p className="text-sm text-grey-400 mt-1">{worker.type} worker</p>
                    </div>
                    {getStatusBadge(worker.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-grey-900 p-3 rounded-lg">
                      <p className="text-xs text-grey-400">Uptime</p>
                      <p className="text-lg font-bold text-white">
                        {formatUptime(worker.uptime)}
                      </p>
                    </div>

                    <div className="bg-grey-900 p-3 rounded-lg">
                      <p className="text-xs text-grey-400">Jobs Processed</p>
                      <p className="text-lg font-bold text-white">{worker.jobsProcessed}</p>
                    </div>

                    <div className="bg-grey-900 p-3 rounded-lg">
                      <p className="text-xs text-grey-400">Active Jobs</p>
                      <p className="text-lg font-bold text-white">{worker.activeJobs}</p>
                    </div>

                    <div className="bg-grey-900 p-3 rounded-lg">
                      <p className="text-xs text-grey-400">Memory</p>
                      <p className="text-lg font-bold text-white">{worker.memoryUsage}MB</p>
                    </div>
                  </div>

                  {/* Resource Usage */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-grey-400 mb-1">
                        <span>CPU Usage</span>
                        <span>{worker.cpuUsage}%</span>
                      </div>
                      <div className="w-full bg-grey-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            worker.cpuUsage > 80
                              ? "bg-red-500"
                              : worker.cpuUsage > 50
                              ? "bg-orange-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${worker.cpuUsage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Last Heartbeat */}
                  <p className="text-xs text-grey-500">
                    Last heartbeat:{" "}
                    {new Date(worker.lastHeartbeat).toLocaleTimeString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-grey-700">
                    {worker.status === "running" ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWorkerAction(worker.id, "restart")}
                          className="flex-1 border-grey-600 hover:border-gold-500"
                        >
                          <RotateCw className="w-4 h-4 mr-1" />
                          Restart
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWorkerAction(worker.id, "stop")}
                          className="flex-1 border-grey-600 hover:border-red-500"
                        >
                          <StopCircle className="w-4 h-4 mr-1" />
                          Stop
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleWorkerAction(worker.id, "start")}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                      >
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && workers.length === 0 && (
          <Card className="bg-grey-850 border-grey-600">
            <CardContent className="text-center py-12">
              <Activity className="w-12 h-12 text-grey-400 mx-auto mb-4" />
              <p className="text-grey-300 mb-4">No workers found</p>
              <p className="text-sm text-grey-400">
                Workers will appear here once they are started
              </p>
            </CardContent>
          </Card>
        )}

        {/* Alert Banner */}
        {workers.some((w) => w.status === "error") && (
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-300">Workers with errors detected</p>
                  <p className="text-sm text-red-400 mt-1">
                    Some workers have encountered errors and may need attention
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
