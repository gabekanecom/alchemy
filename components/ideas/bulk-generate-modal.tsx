"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Zap, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

interface BulkGenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ideaIds: string[];
  onGenerated?: () => void;
}

interface GenerationJob {
  ideaId: string;
  ideaTitle: string;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

export function BulkGenerateModal({
  open,
  onOpenChange,
  ideaIds,
  onGenerated,
}: BulkGenerateModalProps) {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState("article");
  const [platform, setPlatform] = useState("blog");
  const [generateImages, setGenerateImages] = useState(false);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (open && ideaIds.length > 0) {
      fetchIdeas();
    }
  }, [open, ideaIds]);

  async function fetchIdeas() {
    setLoading(true);
    try {
      const responses = await Promise.all(
        ideaIds.map((id) => fetch(`/api/ideas/${id}`))
      );
      const data = await Promise.all(responses.map((r) => r.json()));
      setIdeas(data.map((d) => d.idea));
    } catch (error) {
      console.error("Failed to fetch ideas:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);

    // Initialize jobs
    const initialJobs: GenerationJob[] = ideas.map((idea) => ({
      ideaId: idea.id,
      ideaTitle: idea.title,
      status: "pending",
    }));
    setJobs(initialJobs);

    // Process each idea sequentially
    for (let i = 0; i < ideas.length; i++) {
      const idea = ideas[i];

      // Update status to processing
      setJobs((prev) =>
        prev.map((job) =>
          job.ideaId === idea.id ? { ...job, status: "processing" } : job
        )
      );

      try {
        // Generate content
        const response = await fetch("/api/content/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ideaId: idea.id,
            contentType,
            platform,
            generateImages,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate content: ${response.statusText}`);
        }

        // Update status to completed
        setJobs((prev) =>
          prev.map((job) =>
            job.ideaId === idea.id ? { ...job, status: "completed" } : job
          )
        );
      } catch (error) {
        console.error(`Failed to generate content for idea ${idea.id}:`, error);

        // Update status to failed
        setJobs((prev) =>
          prev.map((job) =>
            job.ideaId === idea.id
              ? {
                  ...job,
                  status: "failed",
                  error: error instanceof Error ? error.message : "Unknown error",
                }
              : job
          )
        );
      }
    }

    setGenerating(false);

    // Notify parent
    if (onGenerated) {
      onGenerated();
    }
  }

  function getStatusIcon(status: GenerationJob["status"]) {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-gray-500" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  }

  function getStatusColor(status: GenerationJob["status"]) {
    switch (status) {
      case "pending":
        return "bg-grey-500/20 text-gray-500";
      case "processing":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "completed":
        return "bg-green-50 text-green-700 border border-green-200";
      case "failed":
        return "bg-red-50 text-red-700 border border-red-200";
    }
  }

  const allCompleted = jobs.length > 0 && jobs.every((j) => j.status === "completed");
  const hasFailures = jobs.some((j) => j.status === "failed");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display flex items-center gap-2">
            <Zap className="w-6 h-6 text-gold-500" />
            Generate Content from Ideas
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {ideaIds.length === 1
              ? "Generate content from 1 idea"
              : `Generate content from ${ideaIds.length} ideas`}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Settings */}
            {jobs.length === 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Content Type */}
                  <div>
                    <Label className="text-gray-600 mb-2 block">Content Type</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="blog">Blog Post</SelectItem>
                        <SelectItem value="social">Social Post</SelectItem>
                        <SelectItem value="video_script">Video Script</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Platform */}
                  <div>
                    <Label className="text-gray-600 mb-2 block">Platform</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blog">Blog</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Generate Images Option */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="generateImages"
                    checked={generateImages}
                    onCheckedChange={(checked) => setGenerateImages(checked as boolean)}
                  />
                  <Label htmlFor="generateImages" className="text-gray-600 cursor-pointer">
                    Generate images for content
                  </Label>
                </div>

                {/* Ideas Preview */}
                <div>
                  <Label className="text-gray-600 mb-2 block">
                    Ideas to Generate ({ideas.length})
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 border border-gray-300 rounded-lg p-3">
                    {ideas.map((idea) => (
                      <div
                        key={idea.id}
                        className="text-sm text-gray-600 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-gold-500" />
                        {idea.title}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full bg-gold-500 hover:bg-gold-600 text-black"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Generate {ideas.length} {ideas.length === 1 ? "Content" : "Contents"}
                </Button>
              </>
            )}

            {/* Progress */}
            {jobs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-600">Generation Progress</Label>
                  <div className="text-sm text-gray-500">
                    {jobs.filter((j) => j.status === "completed").length} / {jobs.length}{" "}
                    completed
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {jobs.map((job) => (
                    <div
                      key={job.ideaId}
                      className="bg-gray-50 border border-gray-300 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(job.status)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {job.ideaTitle}
                          </p>
                          {job.error && (
                            <p className="text-xs text-red-400 mt-1">{job.error}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                {(allCompleted || hasFailures) && !generating && (
                  <div className="space-y-3">
                    {allCompleted && (
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-sm text-green-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          All content generated successfully!
                        </p>
                      </div>
                    )}
                    {hasFailures && (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-300 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          {jobs.filter((j) => j.status === "failed").length} content
                          generation(s) failed
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={() => {
                        onOpenChange(false);
                        setJobs([]);
                      }}
                      className="w-full bg-gray-200 hover:bg-grey-600 text-gray-900"
                    >
                      Close
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
