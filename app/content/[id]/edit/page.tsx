"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { SeoFields } from "@/components/editor/seo-fields";
import { PreviewPanel } from "@/components/editor/preview-panel";
import { PublishModal } from "@/components/editor/publish-modal";
import { Save, Eye, Send, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ContentEditPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<any>(null);

  // Load preview state from localStorage
  const [showPreview, setShowPreview] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('alchemy_editor_show_preview');
      return saved === 'true';
    }
    return false;
  });

  const [showPublishModal, setShowPublishModal] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [seoData, setSeoData] = useState({
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
    slug: "",
  });

  useEffect(() => {
    fetchContent();
  }, [contentId]);

  // Persist preview state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('alchemy_editor_show_preview', showPreview.toString());
    }
  }, [showPreview]);

  async function fetchContent() {
    setLoading(true);
    try {
      const response = await fetch(`/api/content/${contentId}`);
      const data = await response.json();

      if (data.content) {
        setContent(data.content);
        setTitle(data.content.title || "");
        setBody(data.content.body || "");
        setExcerpt(data.content.excerpt || "");
        setSeoData(data.content.seoData || {
          metaTitle: "",
          metaDescription: "",
          focusKeyword: "",
          slug: "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/content/${contentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          excerpt,
          seoData,
        }),
      });
      toast.success("Content saved successfully!");
    } catch (error) {
      console.error("Failed to save content:", error);
      toast.error("Failed to save content");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
        </div>
      </AppLayout>
    );
  }

  if (!content) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-grey-300 mb-4">Content not found</p>
            <Button onClick={() => router.push("/content")}>Back to Content</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-grey-700 bg-grey-900 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/content">
                <Button variant="ghost" size="sm" className="text-grey-300">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-white">Edit Content</h1>
                <p className="text-sm text-grey-400">
                  {content.platform} • {content.contentType}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="border-grey-600 hover:border-gold-500"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? "Hide" : "Show"} Preview
              </Button>

              <Button
                variant="outline"
                onClick={handleSave}
                disabled={saving}
                className="border-grey-600 hover:border-gold-500"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>

              <Button
                onClick={() => setShowPublishModal(true)}
                className="bg-gold-500 hover:bg-gold-600 text-black"
              >
                <Send className="w-4 h-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Editor Area */}
          <div className={`${showPreview ? "w-1/2" : "w-full"} overflow-y-auto p-8`}>
            <Tabs defaultValue="content" className="space-y-6">
              <TabsList className="bg-grey-850 border border-grey-600">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6">
                {/* Title */}
                <Card className="bg-grey-850 border-grey-600">
                  <CardContent className="pt-6">
                    <label className="block text-sm font-medium text-grey-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-grey-900 border border-grey-600 rounded-lg text-white text-xl font-semibold focus:outline-none focus:border-gold-500"
                      placeholder="Enter title..."
                    />
                  </CardContent>
                </Card>

                {/* Excerpt */}
                <Card className="bg-grey-850 border-grey-600">
                  <CardContent className="pt-6">
                    <label className="block text-sm font-medium text-grey-300 mb-2">
                      Excerpt / Description
                    </label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-grey-900 border border-grey-600 rounded-lg text-white focus:outline-none focus:border-gold-500"
                      placeholder="Brief summary of the content..."
                    />
                    <p className="text-xs text-grey-400 mt-2">
                      {excerpt.length} characters (recommended: 150-160)
                    </p>
                  </CardContent>
                </Card>

                {/* Rich Text Editor */}
                <Card className="bg-grey-850 border-grey-600">
                  <CardContent className="pt-6">
                    <label className="block text-sm font-medium text-grey-300 mb-2">
                      Content
                    </label>
                    <RichTextEditor content={body} onChange={setBody} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="seo">
                <SeoFields seoData={seoData} onChange={setSeoData} />
              </TabsContent>

              <TabsContent value="settings">
                <Card className="bg-grey-850 border-grey-600">
                  <CardContent className="pt-6">
                    <p className="text-grey-400">Settings coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-1/2 border-l border-grey-700 overflow-y-auto bg-grey-900">
              <PreviewPanel
                title={title}
                body={body}
                excerpt={excerpt}
                platform={content.platform}
                contentType={content.contentType}
              />
            </div>
          )}
        </div>
      </div>

      {/* Publish Modal */}
      <PublishModal
        open={showPublishModal}
        onOpenChange={setShowPublishModal}
        contentId={contentId}
        platform={content.platform}
      />
    </AppLayout>
  );
}
