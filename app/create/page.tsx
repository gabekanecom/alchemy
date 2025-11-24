"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CreationMethod =
  | "quick-idea"        // Just an idea, generate everything
  | "optimize-existing"  // Already have content, make it viral
  | "reverse-engineer"   // Give example, replicate it
  | "import-transcript"  // YouTube/podcast transcript
  | "repurpose-content"; // One format to many platforms

export default function CreateContentPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<CreationMethod | null>(null);

  const methods = [
    {
      id: "quick-idea" as CreationMethod,
      title: "Quick Idea → Content",
      description: "Have an idea? Skip research and generate viral content immediately",
      icon: "⚡",
      badge: "Fastest",
      useCases: [
        "I have a clear topic in mind",
        "I want to test an idea quickly",
        "I know exactly what to create"
      ],
      estimatedTime: "2 minutes",
      href: "/create/quick-idea"
    },
    {
      id: "optimize-existing" as CreationMethod,
      title: "Optimize Existing Content",
      description: "Upload your draft or published content to make it more viral",
      icon: "🔄",
      badge: "Optimize",
      useCases: [
        "I have a draft that needs improvement",
        "My content isn't getting engagement",
        "I want to boost an old post"
      ],
      estimatedTime: "3 minutes",
      href: "/create/optimize"
    },
    {
      id: "reverse-engineer" as CreationMethod,
      title: "Reverse-Engineer Viral Content",
      description: "Provide a viral post/video URL and create similar high-performing content",
      icon: "🔬",
      badge: "Learn & Replicate",
      useCases: [
        "I found a viral post in my niche",
        "I want to replicate a winning formula",
        "Learn from top performers"
      ],
      estimatedTime: "4 minutes",
      href: "/create/reverse-engineer"
    },
    {
      id: "import-transcript" as CreationMethod,
      title: "Import Transcript/URL",
      description: "Paste YouTube link, podcast transcript, or article URL to create adapted content",
      icon: "📥",
      badge: "Import",
      useCases: [
        "Turn a YouTube video into a blog post",
        "Convert podcast into LinkedIn posts",
        "Adapt popular content to my niche"
      ],
      estimatedTime: "5 minutes",
      href: "/create/import"
    },
    {
      id: "repurpose-content" as CreationMethod,
      title: "Repurpose Across Platforms",
      description: "Take one piece of content and automatically format it for multiple platforms",
      icon: "🎯",
      badge: "Multi-Platform",
      useCases: [
        "I wrote a blog, need social posts",
        "Turn one video into 10+ content pieces",
        "Maximize content ROI"
      ],
      estimatedTime: "3 minutes",
      href: "/create/repurpose"
    }
  ];

  const fullWorkflow = {
    title: "Complete Workflow",
    description: "Full ideation → research → generation → optimization process",
    icon: "🎓",
    badge: "Complete",
    estimatedTime: "15-20 minutes",
    href: "/ideas/new"
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Content</h1>
          <p className="text-lg text-gray-600">
            Choose your starting point - jump in at any stage of the workflow
          </p>
        </div>

        {/* Quick Start Methods */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Start Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {methods.map((method) => (
              <Card
                key={method.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => router.push(method.href)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-4xl">{method.icon}</div>
                    <Badge variant="secondary">{method.badge}</Badge>
                  </div>
                  <CardTitle className="group-hover:text-blue-600 transition-colors">
                    {method.title}
                  </CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Perfect for:</div>
                    <ul className="space-y-1">
                      {method.useCases.map((useCase, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{useCase}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500">~{method.estimatedTime}</span>
                    <Button size="sm" variant="outline">
                      Start →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Full Workflow Option */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Workflow</h2>
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 bg-blue-50"
            onClick={() => router.push(fullWorkflow.href)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="text-5xl">{fullWorkflow.icon}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {fullWorkflow.title}
                      </h3>
                      <p className="text-gray-700">{fullWorkflow.description}</p>
                    </div>
                    <Badge className="bg-blue-600">{fullWorkflow.badge}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl mb-1">💡</div>
                      <div className="text-xs font-medium text-gray-900">Ideation</div>
                      <div className="text-xs text-gray-500">Discover ideas</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl mb-1">🤖</div>
                      <div className="text-xs font-medium text-gray-900">AI Vetting</div>
                      <div className="text-xs text-gray-500">Score potential</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl mb-1">🔬</div>
                      <div className="text-xs font-medium text-gray-900">Research</div>
                      <div className="text-xs text-gray-500">Gather data</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl mb-1">⚡</div>
                      <div className="text-xs font-medium text-gray-900">Generate</div>
                      <div className="text-xs text-gray-500">Create content</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl mb-1">🚀</div>
                      <div className="text-xs font-medium text-gray-900">Publish</div>
                      <div className="text-xs text-gray-500">Multi-platform</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Best for comprehensive content strategy
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">~{fullWorkflow.estimatedTime}</span>
                      <Button>Start Full Workflow →</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Compare Methods</h2>
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Method</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Speed</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Research</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Viral Score</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Platforms</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">Quick Idea</td>
                      <td className="py-3 px-4 text-center">⚡⚡⚡</td>
                      <td className="py-3 px-4 text-center">Basic</td>
                      <td className="py-3 px-4 text-center">75-85</td>
                      <td className="py-3 px-4 text-center">Single</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">Optimize Existing</td>
                      <td className="py-3 px-4 text-center">⚡⚡</td>
                      <td className="py-3 px-4 text-center">N/A</td>
                      <td className="py-3 px-4 text-center">+10-20</td>
                      <td className="py-3 px-4 text-center">Same</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">Reverse-Engineer</td>
                      <td className="py-3 px-4 text-center">⚡⚡</td>
                      <td className="py-3 px-4 text-center">From example</td>
                      <td className="py-3 px-4 text-center">80-90</td>
                      <td className="py-3 px-4 text-center">Multiple</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">Import Transcript</td>
                      <td className="py-3 px-4 text-center">⚡⚡</td>
                      <td className="py-3 px-4 text-center">From source</td>
                      <td className="py-3 px-4 text-center">75-85</td>
                      <td className="py-3 px-4 text-center">Multiple</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">Repurpose</td>
                      <td className="py-3 px-4 text-center">⚡⚡</td>
                      <td className="py-3 px-4 text-center">N/A</td>
                      <td className="py-3 px-4 text-center">Same</td>
                      <td className="py-3 px-4 text-center">5-10</td>
                    </tr>
                    <tr className="hover:bg-blue-50">
                      <td className="py-3 px-4 font-medium">Full Workflow</td>
                      <td className="py-3 px-4 text-center">⚡</td>
                      <td className="py-3 px-4 text-center">Deep</td>
                      <td className="py-3 px-4 text-center">85-95</td>
                      <td className="py-3 px-4 text-center">Multiple</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
