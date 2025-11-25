// Simple in-memory queue for content generation
// In production, this should be replaced with a proper queue like Bull or BullMQ

interface QueueJob {
  id: string;
  type: string;
  data: any;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

class ContentQueue {
  private jobs: Map<string, QueueJob> = new Map();

  async add(type: string, data: any): Promise<string> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const job: QueueJob = {
      id,
      type,
      data,
      status: "pending",
      createdAt: new Date(),
    };
    this.jobs.set(id, job);
    return id;
  }

  async getJob(id: string): Promise<QueueJob | undefined> {
    return this.jobs.get(id);
  }

  async getAllJobs(): Promise<QueueJob[]> {
    return Array.from(this.jobs.values());
  }

  async updateJob(id: string, updates: Partial<QueueJob>): Promise<void> {
    const job = this.jobs.get(id);
    if (job) {
      this.jobs.set(id, { ...job, ...updates });
    }
  }

  async removeJob(id: string): Promise<void> {
    this.jobs.delete(id);
  }
}

export const contentQueue = new ContentQueue();
export const publishingQueue = new ContentQueue();
