"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Link as LinkIcon, Tag } from "lucide-react";

interface SeoFieldsProps {
  seoData: {
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    slug: string;
  };
  onChange: (data: any) => void;
}

export function SeoFields({ seoData, onChange }: SeoFieldsProps) {
  function updateField(field: string, value: string) {
    onChange({ ...seoData, [field]: value });
  }

  return (
    <div className="space-y-6">
      {/* Meta Title */}
      <Card className="bg-grey-850 border-grey-600">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Search className="w-5 h-5 text-gold-500" />
            Meta Title
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={seoData.metaTitle}
            onChange={(e) => updateField("metaTitle", e.target.value)}
            placeholder="Enter meta title for search engines..."
            className="bg-grey-900 border-grey-600 text-white"
          />
          <div className="flex justify-between text-xs">
            <span className="text-grey-400">
              Recommended: 50-60 characters
            </span>
            <span className={seoData.metaTitle.length > 60 ? "text-red-400" : "text-grey-400"}>
              {seoData.metaTitle.length} / 60
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Meta Description */}
      <Card className="bg-grey-850 border-grey-600">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Search className="w-5 h-5 text-gold-500" />
            Meta Description
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={seoData.metaDescription}
            onChange={(e) => updateField("metaDescription", e.target.value)}
            placeholder="Enter meta description for search results..."
            rows={3}
            className="bg-grey-900 border-grey-600 text-white"
          />
          <div className="flex justify-between text-xs">
            <span className="text-grey-400">
              Recommended: 150-160 characters
            </span>
            <span className={seoData.metaDescription.length > 160 ? "text-red-400" : "text-grey-400"}>
              {seoData.metaDescription.length} / 160
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Focus Keyword */}
      <Card className="bg-grey-850 border-grey-600">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Tag className="w-5 h-5 text-gold-500" />
            Focus Keyword
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={seoData.focusKeyword}
            onChange={(e) => updateField("focusKeyword", e.target.value)}
            placeholder="Main keyword to target..."
            className="bg-grey-900 border-grey-600 text-white"
          />
          <p className="text-xs text-grey-400 mt-2">
            The primary keyword you want this content to rank for
          </p>
        </CardContent>
      </Card>

      {/* URL Slug */}
      <Card className="bg-grey-850 border-grey-600">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <LinkIcon className="w-5 h-5 text-gold-500" />
            URL Slug
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-grey-400 text-sm">yoursite.com/</span>
            <Input
              value={seoData.slug}
              onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              placeholder="url-slug"
              className="bg-grey-900 border-grey-600 text-white"
            />
          </div>
          <p className="text-xs text-grey-400 mt-2">
            SEO-friendly URL (lowercase, hyphens only)
          </p>
        </CardContent>
      </Card>

      {/* SEO Preview */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-lg text-white">Search Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-blue-400 text-sm">yoursite.com › {seoData.slug || "page"}</div>
            <div className="text-purple-400 text-lg font-medium">
              {seoData.metaTitle || "Your Page Title"}
            </div>
            <div className="text-grey-300 text-sm">
              {seoData.metaDescription || "Your meta description will appear here..."}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
