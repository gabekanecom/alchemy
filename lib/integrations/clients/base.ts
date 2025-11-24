// Base interfaces for integration clients

export interface AIProviderClient {
  generateText(prompt: string, options?: any): Promise<AITextResponse>;
  streamText?(prompt: string, options?: any): AsyncGenerator<string>;
}

export interface AITextResponse {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason?: string;
}

export interface ImageGenerationClient {
  generateImage(prompt: string, options?: any): Promise<ImageResponse>;
}

export interface ImageResponse {
  url: string;
  revisedPrompt?: string;
  size: string;
  format?: string;
}

export interface VideoGenerationClient {
  generateVideo(prompt: string, options?: any): Promise<VideoResponse>;
  checkStatus(taskId: string): Promise<VideoStatus>;
}

export interface VideoResponse {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  url?: string;
  duration?: number;
}

export interface VideoStatus {
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  url?: string;
  error?: string;
}

export interface PublishingClient {
  publish(content: PublishContent): Promise<PublishResponse>;
  update(postId: string, content: Partial<PublishContent>): Promise<PublishResponse>;
  delete(postId: string): Promise<void>;
  getStatus(postId: string): Promise<PublishStatus>;
}

export interface PublishContent {
  title?: string;
  body: string;
  excerpt?: string;
  status?: "draft" | "publish" | "scheduled";
  categories?: string[];
  tags?: string[];
  featuredImage?: string;
  scheduledFor?: Date;
  metadata?: Record<string, any>;
}

export interface PublishResponse {
  postId: string;
  url?: string;
  status: string;
}

export interface PublishStatus {
  postId: string;
  status: string;
  url?: string;
  publishedAt?: Date;
}
