"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewBrandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    websiteUrl: "",
    brandVoice: {
      tone: "professional",
      formality: "formal",
      writingStyle: "detailed",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to create brand");
      }

      router.push("/brands");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: formData.slug || generateSlug(name),
    });
  };

  return (
    <AppLayout>
      <div className="py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Create New Brand</h1>
            <p className="mt-1 text-sm text-gray-600">
              Set up a new brand profile with voice and style guidelines.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Essential details about your brand
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="text-sm text-red-800">{error}</div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Brand Name *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Acme Inc."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                      Slug *
                    </label>
                    <Input
                      id="slug"
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="acme-inc"
                      className="mt-1"
                      pattern="[a-z0-9-]+"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Lowercase letters, numbers, and hyphens only
                    </p>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="A brief description of your brand..."
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">
                      Website URL
                    </label>
                    <Input
                      id="websiteUrl"
                      type="url"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                      placeholder="https://example.com"
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Brand Voice</CardTitle>
                  <CardDescription>
                    Define how your brand communicates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="tone" className="block text-sm font-medium text-gray-700">
                      Tone
                    </label>
                    <select
                      id="tone"
                      value={formData.brandVoice.tone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brandVoice: { ...formData.brandVoice, tone: e.target.value },
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="friendly">Friendly</option>
                      <option value="authoritative">Authoritative</option>
                      <option value="playful">Playful</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="formality" className="block text-sm font-medium text-gray-700">
                      Formality
                    </label>
                    <select
                      id="formality"
                      value={formData.brandVoice.formality}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brandVoice: { ...formData.brandVoice, formality: e.target.value },
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="formal">Formal</option>
                      <option value="informal">Informal</option>
                      <option value="conversational">Conversational</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="writingStyle" className="block text-sm font-medium text-gray-700">
                      Writing Style
                    </label>
                    <select
                      id="writingStyle"
                      value={formData.brandVoice.writingStyle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brandVoice: { ...formData.brandVoice, writingStyle: e.target.value },
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="concise">Concise</option>
                      <option value="detailed">Detailed</option>
                      <option value="storytelling">Storytelling</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/brands")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Brand"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
