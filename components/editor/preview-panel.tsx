"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Smartphone } from "lucide-react";

interface PreviewPanelProps {
  title: string;
  body: string;
  excerpt: string;
  platform: string;
  contentType: string;
}

export function PreviewPanel({ title, body, excerpt, platform, contentType }: PreviewPanelProps) {
  return (
    <div className="p-8 space-y-6">
      <Card className="bg-grey-850 border-grey-600">
        <CardHeader>
          <CardTitle className="text-white">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="desktop">
            <TabsList className="bg-grey-900 border border-grey-700">
              <TabsTrigger value="desktop" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Desktop
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Mobile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="desktop" className="mt-6">
              <DesktopPreview title={title} body={body} excerpt={excerpt} />
            </TabsContent>

            <TabsContent value="mobile" className="mt-6">
              <MobilePreview title={title} body={body} excerpt={excerpt} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function DesktopPreview({ title, body, excerpt }: any) {
  return (
    <div className="bg-white rounded-lg p-8 min-h-[600px]">
      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        {title || "Your Title Here"}
      </h1>

      {/* Excerpt */}
      {excerpt && (
        <p className="text-lg text-gray-600 mb-8 italic border-l-4 border-gray-300 pl-4">
          {excerpt}
        </p>
      )}

      {/* Body */}
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: body || "<p>Start writing to see preview...</p>" }}
      />
    </div>
  );
}

function MobilePreview({ title, body, excerpt }: any) {
  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-white rounded-lg p-4 min-h-[600px] shadow-xl">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {title || "Your Title Here"}
        </h1>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-gray-600 mb-4 italic border-l-2 border-gray-300 pl-3">
            {excerpt}
          </p>
        )}

        {/* Body */}
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: body || "<p>Start writing to see preview...</p>" }}
        />
      </div>
    </div>
  );
}
