import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Implement actual worker status monitoring
    // This would connect to a worker manager service or check Redis for worker heartbeats

    const mockWorkers = [
      {
        id: "content-worker-1",
        name: "Content Generator",
        type: "content",
        status: "running",
        uptime: 3600,
        jobsProcessed: 42,
        activeJobs: 2,
        lastHeartbeat: new Date().toISOString(),
        memoryUsage: 128,
        cpuUsage: 35,
      },
      {
        id: "discovery-worker-1",
        name: "Discovery Scanner",
        type: "discovery",
        status: "running",
        uptime: 7200,
        jobsProcessed: 156,
        activeJobs: 1,
        lastHeartbeat: new Date().toISOString(),
        memoryUsage: 96,
        cpuUsage: 12,
      },
      {
        id: "research-worker-1",
        name: "Research Worker",
        type: "research",
        status: "stopped",
        uptime: 0,
        jobsProcessed: 0,
        activeJobs: 0,
        lastHeartbeat: new Date(Date.now() - 600000).toISOString(),
        memoryUsage: 0,
        cpuUsage: 0,
      },
    ];

    return NextResponse.json({ workers: mockWorkers });
  } catch (error) {
    console.error("Worker status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch worker status" },
      { status: 500 }
    );
  }
}
