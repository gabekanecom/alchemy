"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Clock, Loader2 } from "lucide-react";

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string;
  platform: string;
}

export function PublishModal({ open, onOpenChange, contentId, platform }: PublishModalProps) {
  const [publishType, setPublishType] = useState<"now" | "schedule">("now");
  const [publishing, setPublishing] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("12:00");

  async function handlePublish() {
    setPublishing(true);
    try {
      const publishData: any = {
        contentId,
        publishNow: publishType === "now",
      };

      if (publishType === "schedule" && scheduledDate) {
        const [hours, minutes] = scheduledTime.split(":").map(Number);
        const scheduleDateTime = new Date(scheduledDate);
        scheduleDateTime.setHours(hours, minutes);
        publishData.scheduledFor = scheduleDateTime.toISOString();
      }

      await fetch(`/api/content/${contentId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(publishData),
      });

      alert(publishType === "now" ? "Content published!" : "Content scheduled!");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to publish:", error);
      alert("Failed to publish content");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-grey-900 border-grey-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display flex items-center gap-2">
            <Send className="w-6 h-6 text-gold-500" />
            Publish Content
          </DialogTitle>
          <DialogDescription className="text-grey-300">
            Choose when to publish your content to {platform}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Publish Options */}
          <RadioGroup value={publishType} onValueChange={(v: any) => setPublishType(v)}>
            <div className="flex items-center space-x-3 p-4 border border-grey-700 rounded-lg hover:border-gold-500 transition-colors">
              <RadioGroupItem value="now" id="now" />
              <Label htmlFor="now" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-white">Publish Now</p>
                    <p className="text-sm text-grey-400">
                      Content will be published immediately
                    </p>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border border-grey-700 rounded-lg hover:border-gold-500 transition-colors">
              <RadioGroupItem value="schedule" id="schedule" />
              <Label htmlFor="schedule" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-white">Schedule for Later</p>
                    <p className="text-sm text-grey-400">
                      Choose a specific date and time
                    </p>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* Schedule Options */}
          {publishType === "schedule" && (
            <div className="space-y-4 p-4 bg-grey-850 border border-grey-700 rounded-lg">
              <div>
                <Label className="text-grey-300 mb-2 block">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  disabled={(date) => date < new Date()}
                  className="bg-grey-900 border border-grey-700 rounded-lg"
                />
              </div>

              <div>
                <Label className="text-grey-300 mb-2 block">Select Time</Label>
                <Select value={scheduledTime} onValueChange={setScheduledTime}>
                  <SelectTrigger className="bg-grey-900 border-grey-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                      <SelectItem key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                        {`${hour.toString().padStart(2, "0")}:00`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {scheduledDate && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">
                    <strong>Scheduled for:</strong>{" "}
                    {scheduledDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    at {scheduledTime}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-grey-700">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-grey-600 hover:border-grey-500"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={publishing || (publishType === "schedule" && !scheduledDate)}
              className="bg-gold-500 hover:bg-gold-600 text-black"
            >
              {publishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : publishType === "now" ? (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Publish Now
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
