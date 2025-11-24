"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Calendar as CalendarIcon, ExternalLink, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Integration {
  id: string;
  displayName: string;
  provider: string;
  category: string;
  enabled: boolean;
  capabilities: string[];
}

interface PublishModalProps {
  open: boolean;
  onClose: () => void;
  contentId: string;
  contentTitle: string;
}

export function PublishModal({ open, onClose, contentId, contentTitle }: PublishModalProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<string>("");
  const [scheduledFor, setScheduledFor] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);
  const [result, setResult] = useState<{ success: boolean; url?: string; message: string } | null>(null);

  useEffect(() => {
    if (open) {
      fetchIntegrations();
      setResult(null);
      setScheduledFor("");
    }
  }, [open]);

  async function fetchIntegrations() {
    setLoadingIntegrations(true);
    try {
      const response = await fetch("/api/integrations?category=publishing");
      const data = await response.json();
      const publishingIntegrations = (data.integrations || []).filter(
        (int: Integration) => int.enabled && int.capabilities.includes("publishing")
      );
      setIntegrations(publishingIntegrations);

      // Auto-select default integration
      const defaultInt = publishingIntegrations.find((int: Integration) => int.isDefault);
      if (defaultInt) {
        setSelectedIntegration(defaultInt.id);
      } else if (publishingIntegrations.length > 0) {
        setSelectedIntegration(publishingIntegrations[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
    } finally {
      setLoadingIntegrations(false);
    }
  }

  async function handlePublish() {
    if (!selectedIntegration) {
      alert("Please select a publishing integration");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/content/${contentId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          integrationId: selectedIntegration,
          scheduledFor: scheduledFor || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          url: data.platformUrl,
          message: data.message || (scheduledFor ? "Content scheduled successfully" : "Content published successfully"),
        });
      } else {
        setResult({
          success: false,
          message: data.error || "Publishing failed",
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to publish content",
      });
    } finally {
      setLoading(false);
    }
  }

  const selectedInt = integrations.find((int) => int.id === selectedIntegration);
  const isScheduled = scheduledFor && new Date(scheduledFor) > new Date();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-grey-900 border-grey-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Publish Content</DialogTitle>
          <DialogDescription className="text-grey-300">
            {contentTitle}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 py-4">
            {result.success ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-400">Success!</p>
                    <p className="text-sm text-grey-300 mt-1">{result.message}</p>
                    {result.url && (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-gold-500 hover:text-gold-400 mt-2"
                      >
                        View on platform
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="font-medium text-red-400">Publishing Failed</p>
                <p className="text-sm text-grey-300 mt-1">{result.message}</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} className="border-grey-600">
                Close
              </Button>
              {!result.success && (
                <Button
                  onClick={() => {
                    setResult(null);
                    handlePublish();
                  }}
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Select Integration */}
            <div className="space-y-2">
              <Label htmlFor="integration" className="text-sm font-medium text-white">
                Publishing Platform
              </Label>
              {loadingIntegrations ? (
                <div className="text-sm text-grey-400">Loading integrations...</div>
              ) : integrations.length === 0 ? (
                <div className="text-sm text-grey-400">
                  No publishing integrations configured.{" "}
                  <a href="/settings/integrations" className="text-gold-500 hover:underline">
                    Set one up
                  </a>
                </div>
              ) : (
                <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
                  <SelectTrigger className="bg-grey-850 border-grey-600">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {integrations.map((integration) => (
                      <SelectItem key={integration.id} value={integration.id}>
                        <div className="flex items-center gap-2">
                          <span>{integration.displayName}</span>
                          <Badge variant="outline" className="text-xs">
                            {integration.provider}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Schedule */}
            <div className="space-y-2">
              <Label htmlFor="schedule" className="text-sm font-medium text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Schedule (Optional)
              </Label>
              <Input
                id="schedule"
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="bg-grey-850 border-grey-600"
              />
              <p className="text-xs text-grey-400">
                Leave empty to publish immediately
              </p>
            </div>

            {/* Platform Info */}
            {selectedInt && (
              <div className="bg-grey-850 rounded-lg p-3 border border-grey-700">
                <p className="text-sm text-grey-300">
                  Publishing to <span className="font-medium text-white">{selectedInt.displayName}</span>
                </p>
                <p className="text-xs text-grey-400 mt-1">
                  {isScheduled
                    ? `Content will be published on ${new Date(scheduledFor).toLocaleString()}`
                    : "Content will be published immediately"}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="border-grey-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                disabled={loading || !selectedIntegration}
                className="bg-gold-500 hover:bg-gold-600 text-black"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isScheduled ? "Scheduling..." : "Publishing..."}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {isScheduled ? "Schedule" : "Publish Now"}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
