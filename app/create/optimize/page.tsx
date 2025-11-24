"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OptimizeContentPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("blog");
  const [currentTitle, setCurrentTitle] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [optimizedContent, setOptimizedContent] = useState<any>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    try {
      // Step 1: Analyze current viral score
      const analyzeRes = await fetch("/api/content/analyze-viral-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          platform,
          title: currentTitle,
          contentType: "article"
        })
      });

      if (!analyzeRes.ok) throw new Error("Analysis failed");

      const analysisData = await analyzeRes.json();
      setAnalysis(analysisData.analysis);

      // Step 2: Generate optimized version
      const optimizeRes = await fetch("/api/content/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          platform,
          currentTitle,
          currentScore: analysisData.analysis.overallScore,
          improvements: analysisData.analysis.improvements
        })
      });

      if (!optimizeRes.ok) throw new Error("Optimization failed");

      const optimizedData = await optimizeRes.json();
      setOptimizedContent(optimizedData);

    } catch (error) {
      console.error("Optimization error:", error);
      alert("Failed to optimize content. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Optimize Existing Content</h1>
            <p className="text-gray-600 mt-1">
              Make your content more viral with AI-powered optimization
            </p>
          </div>
          <Link href="/create">
            <Button variant="outline">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Button>
          </Link>
        </div>

        {!analysis ? (
          // Input Form
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Your Content</CardTitle>
                  <CardDescription>
                    Paste your existing content below to analyze and optimize
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="blog">Blog Post</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">Twitter/X Thread</option>
                      <option value="youtube">YouTube Script</option>
                      <option value="email">Email Newsletter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Title/Headline
                    </label>
                    <input
                      type="text"
                      value={currentTitle}
                      onChange={(e) => setCurrentTitle(e.target.value)}
                      placeholder="Enter your current headline..."
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={20}
                      placeholder="Paste your content here..."
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {content.split(/\s+/).filter(Boolean).length} words
                    </p>
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    disabled={!content.trim() || isAnalyzing}
                    className="w-full"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing & Optimizing...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Analyze & Optimize
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>What We'll Do</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">1️⃣</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Viral Score Analysis</h4>
                      <p className="text-gray-600 text-xs mt-1">
                        Analyze your content across 5 dimensions: hook, value, shareability, story, platform optimization
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="text-xl">2️⃣</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Identify Weaknesses</h4>
                      <p className="text-gray-600 text-xs mt-1">
                        Pinpoint exactly what's holding your content back from going viral
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="text-xl">3️⃣</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Apply Viral Frameworks</h4>
                      <p className="text-gray-600 text-xs mt-1">
                        Rewrite with proven hooks, storytelling, and psychological triggers
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="text-xl">4️⃣</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Generate Variations</h4>
                      <p className="text-gray-600 text-xs mt-1">
                        Create 5 optimized headline options and 3 hook variations
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-sm">
                    <div className="font-medium text-blue-900 mb-2">💡 Pro Tip</div>
                    <p className="text-blue-800 text-xs">
                      Content scoring below 60 typically sees +40-60 point improvement after optimization. Score of 75+ already has good viral potential!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Results View
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Before/After Comparison */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Viral Score Comparison</CardTitle>
                    <Badge
                      className={
                        optimizedContent?.newScore >= analysis.overallScore + 10
                          ? "bg-green-600"
                          : "bg-yellow-600"
                      }
                    >
                      +{Math.round(optimizedContent?.newScore - analysis.overallScore || 0)} points
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-2">Before</div>
                      <div className="text-4xl font-bold text-gray-900 mb-4">
                        {analysis.overallScore}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Hook:</span>
                          <span className="font-medium">{analysis.hookScore}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Value:</span>
                          <span className="font-medium">{analysis.valueScore}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Shareability:</span>
                          <span className="font-medium">{analysis.shareabilityScore}</span>
                        </div>
                      </div>
                    </div>

                    {optimizedContent && (
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-2">After</div>
                        <div className="text-4xl font-bold text-green-600 mb-4">
                          {optimizedContent.newScore}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Hook:</span>
                            <span className="font-medium text-green-600">
                              {optimizedContent.analysis.hookScore}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Value:</span>
                            <span className="font-medium text-green-600">
                              {optimizedContent.analysis.valueScore}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Shareability:</span>
                            <span className="font-medium text-green-600">
                              {optimizedContent.analysis.shareabilityScore}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Optimized Content */}
              {optimizedContent && (
                <Card>
                  <CardHeader>
                    <CardTitle>Optimized Content</CardTitle>
                    <CardDescription>
                      AI-enhanced version with viral frameworks applied
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="prose max-w-none">
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-500 mb-2">
                            Optimized Headline
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {optimizedContent.optimizedTitle}
                          </h3>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <div className="text-sm font-medium text-gray-500 mb-2">
                            Optimized Body
                          </div>
                          <div className="whitespace-pre-wrap text-gray-700">
                            {optimizedContent.optimizedContent}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <Button className="flex-1">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy to Clipboard
                      </Button>
                      <Button variant="outline">Save to Content</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Headline Variations */}
              {optimizedContent?.headlineVariations && (
                <Card>
                  <CardHeader>
                    <CardTitle>Alternative Headlines (A/B Test These)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {optimizedContent.headlineVariations.map((variation: any, idx: number) => (
                        <div
                          key={idx}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{variation.content}</h4>
                            <Badge variant="outline">
                              Score: {variation.viralScore}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{variation.reasoning}</p>
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">
                              Framework: {variation.framework}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Analysis */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>What Changed</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Strengths (Original)</h4>
                    <ul className="space-y-1">
                      {analysis.strengths.map((strength: string, idx: number) => (
                        <li key={idx} className="text-gray-700 flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span className="text-xs">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Fixed Issues</h4>
                    <ul className="space-y-1">
                      {analysis.weaknesses.map((weakness: string, idx: number) => (
                        <li key={idx} className="text-gray-700 flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">→</span>
                          <span className="text-xs">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Improvements Applied</h4>
                    <ul className="space-y-1">
                      {analysis.improvements.map((improvement: string, idx: number) => (
                        <li key={idx} className="text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">+</span>
                          <span className="text-xs">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setAnalysis(null);
                    setOptimizedContent(null);
                  }}
                >
                  Optimize Another
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
