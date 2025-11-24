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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Download, Copy } from "lucide-react";
import Image from "next/image";

interface ImageGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageGenerated?: () => void;
}

export function ImageGeneratorModal({
  open,
  onOpenChange,
  onImageGenerated,
}: ImageGeneratorModalProps) {
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState("dalle");
  const [size, setSize] = useState("1024x1024");
  const [quality, setQuality] = useState("standard");
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [availableProviders, setAvailableProviders] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetchAvailableProviders();
    }
  }, [open]);

  async function fetchAvailableProviders() {
    try {
      const response = await fetch("/api/integrations?category=image_generation");
      const data = await response.json();
      setAvailableProviders(data.integrations || []);

      // Set first available provider as default
      if (data.integrations?.length > 0) {
        setProvider(data.integrations[0].provider);
      }
    } catch (error) {
      console.error("Failed to fetch providers:", error);
    }
  }

  async function handleGenerate() {
    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    setGenerating(true);
    setGeneratedImages([]);

    try {
      const response = await fetch("/api/media/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          provider,
          size,
          quality,
        }),
      });

      const data = await response.json();

      if (data.images) {
        setGeneratedImages(data.images.map((img: any) => img.url));
        if (onImageGenerated) {
          onImageGenerated();
        }
      }
    } catch (error) {
      console.error("Failed to generate image:", error);
      alert("Failed to generate image");
    } finally {
      setGenerating(false);
    }
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(url);
    alert("Image URL copied!");
  }

  function handleDownload(url: string, index: number) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `generated-${Date.now()}-${index}.png`;
    a.click();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-grey-900 border-grey-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold-500" />
            Generate Image
          </DialogTitle>
          <DialogDescription className="text-grey-300">
            Create images with AI for your content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Prompt */}
          <div>
            <Label className="text-grey-300 mb-2 block">Prompt</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              rows={4}
              className="bg-grey-900 border-grey-600 text-white resize-none"
            />
            <p className="text-xs text-grey-400 mt-2">
              Be specific and descriptive for best results
            </p>
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Provider Selection */}
            <div>
              <Label className="text-grey-300 mb-2 block">Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="bg-grey-900 border-grey-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableProviders.map((p) => (
                    <SelectItem key={p.provider} value={p.provider}>
                      {p.displayName || p.provider}
                    </SelectItem>
                  ))}
                  {availableProviders.length === 0 && (
                    <SelectItem value="dalle">DALL-E (Default)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Size */}
            <div>
              <Label className="text-grey-300 mb-2 block">Size</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger className="bg-grey-900 border-grey-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024x1024">Square (1024×1024)</SelectItem>
                  <SelectItem value="1024x1792">Portrait (1024×1792)</SelectItem>
                  <SelectItem value="1792x1024">Landscape (1792×1024)</SelectItem>
                  {provider === "banana" && (
                    <>
                      <SelectItem value="512x512">Small (512×512)</SelectItem>
                      <SelectItem value="768x768">Medium (768×768)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Quality */}
            {(provider === "dalle" || provider === "grok-imagine") && (
              <div>
                <Label className="text-grey-300 mb-2 block">Quality</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger className="bg-grey-900 border-grey-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="hd">HD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Provider Info */}
          {provider === "banana" && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-300">
                💰 <strong>Nano Banana:</strong> Ultra-fast and affordable at $0.002/image
              </p>
            </div>
          )}

          {provider === "grok-imagine" && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-sm text-purple-300">
                ✨ <strong>Grok Imagine:</strong> Creative, high-quality images from X.AI
              </p>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="w-full bg-gold-500 hover:bg-gold-600 text-black"
          >
            {generating ? (
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

          {/* Generated Images */}
          {generatedImages.length > 0 && (
            <div className="space-y-3">
              <Label className="text-grey-300">Generated Images</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedImages.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square bg-grey-800 rounded-lg overflow-hidden group"
                  >
                    <Image
                      src={url}
                      alt={`Generated ${index + 1}`}
                      fill
                      className="object-cover"
                    />

                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyUrl(url)}
                        className="bg-grey-900 border-grey-600 hover:border-gold-500"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy URL
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(url, index)}
                        className="bg-grey-900 border-grey-600 hover:border-gold-500"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
