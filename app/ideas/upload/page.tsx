"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ParsedIdea {
  title: string;
  description?: string;
  keywords?: string[];
  sourceUrl?: string;
}

export default function UploadIdeasPage() {
  const router = useRouter();
  const [uploadMethod, setUploadMethod] = useState<"paste" | "file" | "url">("paste");
  const [pastedText, setPastedText] = useState("");
  const [parsedIdeas, setParsedIdeas] = useState<ParsedIdea[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVetting, setIsVetting] = useState(false);

  const handleParse = () => {
    if (!pastedText.trim()) return;

    setIsProcessing(true);

    // Simple parsing: split by newlines, treat each line as an idea
    const lines = pastedText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const ideas: ParsedIdea[] = lines.map((line) => {
      // Check if line has format: "Title | Description | Keywords"
      const parts = line.split("|").map((p) => p.trim());

      if (parts.length >= 2) {
        return {
          title: parts[0],
          description: parts[1],
          keywords: parts[2] ? parts[2].split(",").map((k) => k.trim()) : undefined,
        };
      }

      // Otherwise, treat entire line as title
      return { title: line };
    });

    setParsedIdeas(ideas);
    setIsProcessing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    const text = await file.text();

    // Handle CSV
    if (file.name.endsWith(".csv")) {
      const lines = text.split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const titleIdx = headers.indexOf("title");
      const descIdx = headers.indexOf("description");
      const keywordsIdx = headers.indexOf("keywords");

      const ideas: ParsedIdea[] = lines.slice(1).map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        return {
          title: parts[titleIdx] || parts[0],
          description: descIdx >= 0 ? parts[descIdx] : undefined,
          keywords:
            keywordsIdx >= 0 && parts[keywordsIdx]
              ? parts[keywordsIdx].split(";").map((k) => k.trim())
              : undefined,
        };
      });

      setParsedIdeas(ideas.filter((i) => i.title));
    }
    // Handle JSON
    else if (file.name.endsWith(".json")) {
      const data = JSON.parse(text);
      setParsedIdeas(Array.isArray(data) ? data : [data]);
    }
    // Handle plain text
    else {
      setPastedText(text);
      handleParse();
    }

    setIsProcessing(false);
  };

  const handleVetIdeas = async () => {
    setIsVetting(true);

    try {
      const response = await fetch("/api/ideas/vet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideas: parsedIdeas,
          autoSave: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to vet ideas");
      }

      const data = await response.json();

      alert(
        `✅ AI Vetting Complete!\n\n` +
          `${data.ideas.length} ideas analyzed and scored.\n` +
          `Top idea: "${data.ideas[0].title}" (${data.ideas[0].overallScore}/100)\n\n` +
          `All ideas saved to your Ideas list.`
      );

      router.push("/ideas");
    } catch (error) {
      console.error("Vetting error:", error);
      alert("Failed to vet ideas. Please try again.");
    } finally {
      setIsVetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Upload Content Ideas</h1>
            <p className="mt-1 text-sm text-gray-600">
              Import your ideas for AI vetting, scoring, and research
            </p>
          </div>
          <Link href="/discovery">
            <Button variant="outline">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upload Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Choose Upload Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setUploadMethod("paste")}
                    className={`
                      p-4 rounded-lg border-2 text-center transition-all
                      ${
                        uploadMethod === "paste"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div className="text-2xl mb-2">📝</div>
                    <div className="text-sm font-medium">Paste Text</div>
                  </button>

                  <button
                    onClick={() => setUploadMethod("file")}
                    className={`
                      p-4 rounded-lg border-2 text-center transition-all
                      ${
                        uploadMethod === "file"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div className="text-2xl mb-2">📁</div>
                    <div className="text-sm font-medium">Upload File</div>
                  </button>

                  <button
                    onClick={() => setUploadMethod("url")}
                    className={`
                      p-4 rounded-lg border-2 text-center transition-all
                      ${
                        uploadMethod === "url"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <div className="text-2xl mb-2">🔗</div>
                    <div className="text-sm font-medium">Import URL</div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Paste Text Method */}
            {uploadMethod === "paste" && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Paste Your Ideas</CardTitle>
                  <CardDescription>
                    One idea per line, or use format: Title | Description | Keywords
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={
                      "AI-powered content creation tools\n" +
                      "How to optimize React performance | Guide for developers | react, performance, optimization\n" +
                      "Best productivity apps for 2024\n" +
                      "Machine learning for beginners"
                    }
                    rows={12}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                  />
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      {pastedText.split("\n").filter((l) => l.trim()).length} ideas detected
                    </p>
                    <Button onClick={handleParse} disabled={!pastedText.trim() || isProcessing}>
                      {isProcessing ? "Parsing..." : "Parse Ideas"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* File Upload Method */}
            {uploadMethod === "file" && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Upload File</CardTitle>
                  <CardDescription>Supports CSV, JSON, or TXT files</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      Drag and drop your file here, or click to browse
                    </p>
                    <input
                      type="file"
                      accept=".csv,.json,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="mt-4" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </div>

                  {/* File Format Examples */}
                  <div className="mt-6 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">CSV Format:</h4>
                      <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                        {`title,description,keywords\n"AI Tools","Best AI tools for 2024","ai,tools,productivity"\n"React Tips","Performance optimization","react,javascript"`}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">JSON Format:</h4>
                      <pre className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                        {`[\n  { "title": "AI Tools", "description": "Best AI tools", "keywords": ["ai", "tools"] },\n  { "title": "React Tips", "keywords": ["react"] }\n]`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* URL Import Method */}
            {uploadMethod === "url" && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Import from URL</CardTitle>
                  <CardDescription>
                    Scrape ideas from competitor blogs, content calendars, or spreadsheets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/content-ideas.csv"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Import Type
                      </label>
                      <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option>CSV/JSON File URL</option>
                        <option>Google Sheets (Public)</option>
                        <option>Notion Page</option>
                        <option>Competitor Blog (Scrape)</option>
                      </select>
                    </div>

                    <Button className="w-full">Import from URL</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Parsed Ideas Review */}
            {parsedIdeas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 3: Review & Vet Ideas</CardTitle>
                  <CardDescription>
                    AI will score each idea based on virality potential, competition, and relevance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                    {parsedIdeas.map((idea, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{idea.title}</h4>
                            {idea.description && (
                              <p className="text-sm text-gray-600 mt-1">{idea.description}</p>
                            )}
                            {idea.keywords && idea.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {idea.keywords.map((keyword) => (
                                  <Badge key={keyword} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <button className="text-gray-400 hover:text-red-600">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleVetIdeas}
                    disabled={isVetting}
                    className="w-full"
                    size="lg"
                  >
                    {isVetting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        AI is vetting {parsedIdeas.length} ideas...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Vet & Save {parsedIdeas.length} Ideas
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Info & Tips */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <div className="flex items-start gap-3">
                    <div className="text-xl">1️⃣</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Upload</h4>
                      <p className="text-gray-600 text-xs mt-1">
                        Paste, upload, or import your content ideas
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-3">
                    <div className="text-xl">2️⃣</div>
                    <div>
                      <h4 className="font-medium text-gray-900">AI Vetting</h4>
                      <p className="text-gray-600 text-xs mt-1">
                        AI analyzes each idea for virality potential, competition, and relevance
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-3">
                    <div className="text-xl">3️⃣</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Deep Research</h4>
                      <p className="text-gray-600 text-xs mt-1">
                        Top ideas get researched for trending angles and supporting data
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-3">
                    <div className="text-xl">4️⃣</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Generate</h4>
                      <p className="text-gray-600 text-xs mt-1">
                        One-click to create exceptional content across all platforms
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Scoring Criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900">Virality Score</span>
                    <span className="text-xs text-gray-500">/100</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Trending topics, emotional hooks, shareability
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900">Relevance Score</span>
                    <span className="text-xs text-gray-500">/100</span>
                  </div>
                  <p className="text-xs text-gray-600">Brand fit, audience alignment, timing</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900">Competition</span>
                    <span className="text-xs text-gray-500">/100</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Uniqueness, keyword difficulty, market saturation
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900">Overall Score</span>
                    <span className="text-xs text-gray-500">/100</span>
                  </div>
                  <p className="text-xs text-gray-600">Weighted average of all factors</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-sm">
                  <div className="font-medium text-blue-900 mb-2">💡 Pro Tip</div>
                  <p className="text-blue-800 text-xs">
                    Upload 20-50 ideas at once. AI will rank them by potential and highlight the
                    top performers worth creating content for.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
