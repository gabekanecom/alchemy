"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface QueueStatsProps {
  items: any[];
}

export function QueueStats({ items }: QueueStatsProps) {
  const stats = {
    queued: items.filter((i) => i.status === "queued").length,
    processing: items.filter((i) => i.status === "processing").length,
    completed: items.filter((i) => i.status === "completed").length,
    failed: items.filter((i) => i.status === "failed").length,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedToday = items.filter(
    (i) => i.status === "completed" && new Date(i.updatedAt) >= today
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-300">Queued</p>
              <p className="text-2xl font-bold text-white">{stats.queued}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-purple-500/10 border-purple-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-300">Processing</p>
              <p className="text-2xl font-bold text-white">{stats.processing}</p>
            </div>
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-500/10 border-green-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-300">Completed Today</p>
              <p className="text-2xl font-bold text-white">{completedToday}</p>
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
              <p className="text-2xl font-bold text-white">{stats.failed}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
