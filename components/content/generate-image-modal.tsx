"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Download, RefreshCw } from "lucide-react";

interface Integration {
  id: string;
  displayName: string;
  provider: string;
  enabled: boolean;
}

interface GenerateImageModalProps {
  open: boolean;
  onClose: () => void;
  contentId: string;
  contentTitle: string;
  onImageGenerated?: (imageUrl: string) => void;
}

export function GenerateImageModal({
  open,
  onClose,
  contentId,
  contentTitle,
  onImageGenerated,
}: GenerateImageModalProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [size, setSize] = useState<string>("1792x1024");
  const [quality, setQuality] = useState<string>("hd");
  const [style, setStyle] = useState<string>("vivid");
  const [loading, setLoading] = useState(false);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);
  const [generatedImage, setGeneratedImage] = useState<{
    url: string;
    revisedPrompt?: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      fetchIntegrations();
      setGeneratedImage(null);
      // Auto-fill prompt based on content title
      setPrompt(`Create a professional, eye-catching featured image for: ${contentTitle}`);
    }
  }, [open, contentTitle]);

  async function fetchIntegrations() {
    setLoadingIntegrations(true);
    try {
      const response = await fetch("/api/integrations?category=image_generation");
      const data = await response.json();
      const imageIntegrations = (data.integrations || []).filter(
        (int: Integration) => int.enabled
      );
      setIntegrations(imageIntegrations);

      if (imageIntegrations.length > 0) {
        setSelectedIntegration(imageIntegrations[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
    } finally {
      setLoadingIntegrations(false);
    }
  }

  async function handleGenerate() {
    if (!selectedIntegration) {
      alert("Please select an image generation integration");
      return;
    }

    setLoading(true);
    setGeneratedImage(null);

    try {
      const response = await fetch(`/api/content/${contentId}/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          integrationId: selectedIntegration,
          prompt,
          size,
          quality,
          style,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedImage({
          url: data.image.url,
          revisedPrompt: data.image.revisedPrompt,
        });
        if (onImageGenerated) {
          onImageGenerated(data.image.url);
        }
      } else {
        alert(data.error || "Failed to generate image");
      }
    } catch (error) {
      alert("Failed to generate image");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!generatedImage) return;
    window.open(generatedImage.url, "_blank");
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-grey-900 border-grey-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold-500" />
            Generate Featured Image
          </DialogTitle>
          <DialogDescription className="text-grey-300">
            Create an AI-generated image for your content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Integration Selection */}
          <div className="space-y-2">
            <Label htmlFor="integration" className="text-sm font-medium text-white">
              Image Generator
            </Label>
            {loadingIntegrations ? (
              <div className="text-sm text-grey-400">Loading...</div>
            ) : integrations.length === 0 ? (
              <div className="text-sm text-grey-400">
                No image generation integrations configured.{" "}
                <a href="/settings/integrations" className="text-gold-500 hover:underline">
                  Set one up
                </a>
              </div>
            ) : (
              <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
                <SelectTrigger className="bg-grey-850 border-grey-600">
                  <SelectValue placeholder="Select generator" />
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

          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium text-white">
              Image Description
            </Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              rows={4}
              className="bg-grey-850 border-grey-600 resize-none"
            />
            <p className="text-xs text-grey-400">
              Be specific about style, mood, colors, and composition
            </p>
          </div>

          {/* Provider Info */}
          {selectedIntegration && (
            <>
              {integrations.find((i) => i.id === selectedIntegration)?.provider === "banana" && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-300">
                    💰 <strong>Nano Banana:</strong> Ultra-fast and affordable at $0.002/image
                  </p>
                </div>
              )}
              {integrations.find((i) => i.id === selectedIntegration)?.provider === "grok-imagine" && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-sm text-purple-300">
                    ✨ <strong>Grok Imagine:</strong> Creative, high-quality images from X.AI
                  </p>
                </div>
              )}
            </>
          )}

          {/* Image Options */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size" className="text-sm font-medium text-white">
                Size
              </Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger className="bg-grey-850 border-grey-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024x1024">Square (1024x1024)</SelectItem>
                  <SelectItem value="1792x1024">Landscape (1792x1024)</SelectItem>
                  <SelectItem value="1024x1792">Portrait (1024x1792)</SelectItem>
                  {integrations.find((i) => i.id === selectedIntegration)?.provider === "banana" && (
                    <>
                      <SelectItem value="512x512">Small (512×512)</SelectItem>
                      <SelectItem value="768x768">Medium (768×768)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality" className="text-sm font-medium text-white">
                Quality
              </Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="bg-grey-850 border-grey-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="hd">HD (Higher cost)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style" className="text-sm font-medium text-white">
                Style
              </Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="bg-grey-850 border-grey-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vivid">Vivid</SelectItem>
                  <SelectItem value="natural">Natural</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generated Image Preview */}
          {generatedImage && (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border-2 border-gold-500/50">
                <img
                  src={generatedImage.url}
                  alt="Generated image"
                  className="w-full h-auto"
                />
              </div>

              {generatedImage.revisedPrompt && (
                <div className="bg-grey-850 rounded-lg p-3 border border-grey-700">
                  <p className="text-xs font-medium text-grey-300 mb-1">Revised Prompt:</p>
                  <p className="text-xs text-grey-400">{generatedImage.revisedPrompt}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex-1 border-grey-600 hover:border-gold-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setGeneratedImage(null)}
                  className="flex-1 border-grey-600 hover:border-gold-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate New
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-grey-700">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-grey-600"
            >
              {generatedImage ? "Done" : "Cancel"}
            </Button>
            {!generatedImage && (
              <Button
                onClick={handleGenerate}
                disabled={loading || !selectedIntegration || !prompt.trim()}
                className="bg-gold-500 hover:bg-gold-600 text-black"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
