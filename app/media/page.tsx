"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageGeneratorModal } from "@/components/media/image-generator-modal";
import {
  Image as ImageIcon,
  Search,
  Trash2,
  Download,
  Copy,
  Sparkles,
  Loader2,
} from "lucide-react";
import Image from "next/image";

interface MediaImage {
  id: string;
  url: string;
  prompt: string;
  provider: string;
  size: string;
  createdAt: string;
  metadata: any;
}

export default function MediaLibraryPage() {
  const [images, setImages] = useState<MediaImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredImages(
        images.filter((img) =>
          img.prompt.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredImages(images);
    }
  }, [searchQuery, images]);

  async function fetchImages() {
    setLoading(true);
    try {
      const response = await fetch("/api/media");
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image?")) return;

    try {
      await fetch(`/api/media/${id}`, { method: "DELETE" });
      setImages(images.filter((img) => img.id !== id));
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(url);
    alert("Image URL copied to clipboard!");
  }

  function handleDownload(url: string, filename: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  }

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-8 h-8 text-gold-500" />
              Media Library
            </h1>
            <p className="text-grey-200 mt-1">Generated images and assets</p>
          </div>

          <Button
            onClick={() => setShowGenerator(true)}
            className="bg-gold-500 hover:bg-gold-600 text-black"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Image
          </Button>
        </div>

        {/* Search */}
        <Card className="bg-grey-850 border-grey-600">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-grey-400" />
              <Input
                placeholder="Search by prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-grey-900 border-grey-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Images Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
          </div>
        ) : filteredImages.length === 0 ? (
          <Card className="bg-grey-850 border-grey-600">
            <CardContent className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-grey-400 mx-auto mb-4" />
              <p className="text-grey-300 mb-4">
                {images.length === 0
                  ? "No images generated yet"
                  : "No images match your search"}
              </p>
              {images.length === 0 && (
                <Button
                  onClick={() => setShowGenerator(true)}
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Your First Image
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <Card
                key={image.id}
                className="bg-grey-850 border-grey-600 hover:border-gold-500/50 transition-all group overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-square bg-grey-900">
                  <Image
                    src={image.url}
                    alt={image.prompt}
                    fill
                    className="object-cover"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyUrl(image.url)}
                      className="bg-grey-900 border-grey-600 hover:border-gold-500"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(image.url, `image-${image.id}.png`)}
                      className="bg-grey-900 border-grey-600 hover:border-gold-500"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(image.id)}
                      className="bg-grey-900 border-grey-600 hover:border-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <CardContent className="p-4">
                  <p className="text-sm text-grey-300 line-clamp-2 mb-2">
                    {image.prompt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-grey-500">
                    <span className="capitalize">{image.provider}</span>
                    <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Image Generator Modal */}
      <ImageGeneratorModal
        open={showGenerator}
        onOpenChange={setShowGenerator}
        onImageGenerated={fetchImages}
      />
    </AppLayout>
  );
}
