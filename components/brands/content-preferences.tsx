"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Settings } from "lucide-react";

interface ContentPreferencesProps {
  preferences: any;
  onChange: (preferences: any) => void;
}

export function ContentPreferences({ preferences, onChange }: ContentPreferencesProps) {
  const [newTopic, setNewTopic] = useState("");
  const [newAvoidedTopic, setNewAvoidedTopic] = useState("");
  const [newCTA, setNewCTA] = useState("");

  function addTopic() {
    if (newTopic.trim()) {
      onChange({
        ...preferences,
        preferredTopics: [...(preferences.preferredTopics || []), newTopic.trim()],
      });
      setNewTopic("");
    }
  }

  function removeTopic(index: number) {
    onChange({
      ...preferences,
      preferredTopics: preferences.preferredTopics.filter((_: any, i: number) => i !== index),
    });
  }

  function addAvoidedTopic() {
    if (newAvoidedTopic.trim()) {
      onChange({
        ...preferences,
        avoidedTopics: [...(preferences.avoidedTopics || []), newAvoidedTopic.trim()],
      });
      setNewAvoidedTopic("");
    }
  }

  function removeAvoidedTopic(index: number) {
    onChange({
      ...preferences,
      avoidedTopics: preferences.avoidedTopics.filter((_: any, i: number) => i !== index),
    });
  }

  function addCTA() {
    if (newCTA.trim()) {
      onChange({
        ...preferences,
        preferredCTAs: [...(preferences.preferredCTAs || []), newCTA.trim()],
      });
      setNewCTA("");
    }
  }

  function removeCTA(index: number) {
    onChange({
      ...preferences,
      preferredCTAs: preferences.preferredCTAs.filter((_: any, i: number) => i !== index),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-500" />
          Content Preferences
        </h3>
        <p className="text-grey-400">
          Configure what content to focus on and what to avoid
        </p>
      </div>

      {/* Preferred Topics */}
      <Card className="bg-grey-850 border-grey-700 p-6">
        <div className="space-y-4">
          <div>
            <Label className="text-grey-300 mb-2 block text-base font-semibold">
              Preferred Topics
            </Label>
            <p className="text-sm text-grey-400 mb-3">
              Topics and themes to focus on in content generation
            </p>
            <div className="flex gap-2 mb-3">
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTopic()}
                placeholder="Add a topic..."
                className="bg-grey-900 border-grey-600 text-white"
              />
              <Button onClick={addTopic} className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(preferences.preferredTopics || []).map((topic: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-blue-500/20 text-blue-300 border-blue-500/30 gap-2 py-2"
                >
                  {topic}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-400"
                    onClick={() => removeTopic(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Avoided Topics */}
      <Card className="bg-grey-850 border-grey-700 p-6">
        <div className="space-y-4">
          <div>
            <Label className="text-grey-300 mb-2 block text-base font-semibold">
              Topics to Avoid
            </Label>
            <p className="text-sm text-grey-400 mb-3">
              Topics, themes, or subjects that should never be covered
            </p>
            <div className="flex gap-2 mb-3">
              <Input
                value={newAvoidedTopic}
                onChange={(e) => setNewAvoidedTopic(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addAvoidedTopic()}
                placeholder="Add a topic to avoid..."
                className="bg-grey-900 border-grey-600 text-white"
              />
              <Button onClick={addAvoidedTopic} className="bg-red-500 hover:bg-red-600">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(preferences.avoidedTopics || []).map((topic: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-red-500/20 text-red-300 border-red-500/30 gap-2 py-2"
                >
                  {topic}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-grey-400"
                    onClick={() => removeAvoidedTopic(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Call-to-Actions */}
      <Card className="bg-grey-850 border-grey-700 p-6">
        <div className="space-y-4">
          <div>
            <Label className="text-grey-300 mb-2 block text-base font-semibold">
              Preferred CTAs
            </Label>
            <p className="text-sm text-grey-400 mb-3">
              Call-to-actions to use in your content
            </p>
            <div className="flex gap-2 mb-3">
              <Input
                value={newCTA}
                onChange={(e) => setNewCTA(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCTA()}
                placeholder="e.g., Book a demo, Download our guide..."
                className="bg-grey-900 border-grey-600 text-white"
              />
              <Button onClick={addCTA} className="bg-green-500 hover:bg-green-600">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(preferences.preferredCTAs || []).map((cta: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-green-500/20 text-green-300 border-green-500/30 gap-2 py-2"
                >
                  {cta}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-400"
                    onClick={() => removeCTA(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Formatting Preferences */}
      <Card className="bg-grey-850 border-grey-700 p-6">
        <div className="space-y-4">
          <Label className="text-grey-300 mb-2 block text-base font-semibold">
            Formatting Preferences
          </Label>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Use Emojis</Label>
                <p className="text-sm text-grey-400">Include emojis in content</p>
              </div>
              <Switch
                checked={preferences.formatting?.useEmojis || false}
                onCheckedChange={(checked) =>
                  onChange({
                    ...preferences,
                    formatting: { ...preferences.formatting, useEmojis: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Use Hashtags</Label>
                <p className="text-sm text-grey-400">Include relevant hashtags</p>
              </div>
              <Switch
                checked={preferences.formatting?.useHashtags || false}
                onCheckedChange={(checked) =>
                  onChange({
                    ...preferences,
                    formatting: { ...preferences.formatting, useHashtags: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Use Bullet Points</Label>
                <p className="text-sm text-grey-400">Prefer bulleted lists for readability</p>
              </div>
              <Switch
                checked={preferences.formatting?.useBullets || true}
                onCheckedChange={(checked) =>
                  onChange({
                    ...preferences,
                    formatting: { ...preferences.formatting, useBullets: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Include Statistics</Label>
                <p className="text-sm text-grey-400">Reference data and statistics when relevant</p>
              </div>
              <Switch
                checked={preferences.formatting?.includeStats || true}
                onCheckedChange={(checked) =>
                  onChange({
                    ...preferences,
                    formatting: { ...preferences.formatting, includeStats: checked },
                  })
                }
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Additional Guidelines */}
      <Card className="bg-grey-850 border-grey-700 p-6">
        <div className="space-y-4">
          <Label className="text-grey-300 mb-2 block text-base font-semibold">
            Additional Guidelines
          </Label>
          <Textarea
            value={preferences.additionalGuidelines || ""}
            onChange={(e) =>
              onChange({ ...preferences, additionalGuidelines: e.target.value })
            }
            placeholder="Any other content preferences or guidelines..."
            rows={4}
            className="bg-grey-900 border-grey-600 text-white"
          />
        </div>
      </Card>
    </div>
  );
}
