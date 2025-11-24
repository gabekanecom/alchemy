import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/utils";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function IdeasPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // TODO: Fetch from API
  const ideas = [];
  const brands = [];

  return (
    <AppLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Content Ideas</h1>
              <p className="mt-1 text-sm text-gray-600">
                Capture, score, and transform ideas into content
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/ideas/discover">
                <Button variant="outline">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Discover Ideas
                </Button>
              </Link>
              <Link href="/ideas/new">
                <Button>
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Idea
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                <option>All Brands</option>
                {brands.map((brand: any) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>

              <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                <option>All Sources</option>
                <option>Manual</option>
                <option>Reddit</option>
                <option>YouTube</option>
                <option>Twitter</option>
                <option>Firecrawl</option>
              </select>

              <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                <option>All Status</option>
                <option>New</option>
                <option>Researching</option>
                <option>Queued</option>
                <option>In Production</option>
                <option>Published</option>
              </select>

              <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                <option>Sort by: Newest</option>
                <option>Sort by: Overall Score</option>
                <option>Sort by: Virality Score</option>
                <option>Sort by: Priority</option>
              </select>
            </div>
          </div>

          {/* Ideas Grid/List */}
          {ideas.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
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
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No ideas yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding a new idea or discovering trending content
                  </p>
                  <div className="mt-6 flex gap-3 justify-center">
                    <Link href="/ideas/new">
                      <Button>Add Idea</Button>
                    </Link>
                    <Link href="/ideas/discover">
                      <Button variant="outline">Discover Ideas</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {ideas.map((idea: any) => (
                <Card key={idea.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Checkbox for multi-select */}
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />

                          <div className="flex-1">
                            {/* Title and Description */}
                            <div className="mb-3">
                              <Link href={`/ideas/${idea.id}`}>
                                <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                                  {idea.title}
                                </h3>
                              </Link>
                              {idea.description && (
                                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                  {idea.description}
                                </p>
                              )}
                            </div>

                            {/* Metadata */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline" className="text-xs">
                                {idea.source}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {idea.contentType}
                              </Badge>
                              {idea.priority === "high" && (
                                <Badge className="text-xs bg-red-100 text-red-800">
                                  High Priority
                                </Badge>
                              )}
                              {idea.targetPlatforms?.map((platform: string) => (
                                <Badge key={platform} variant="secondary" className="text-xs">
                                  {platform}
                                </Badge>
                              ))}
                            </div>

                            {/* Scores */}
                            {idea.overallScore && (
                              <div className="flex gap-4 text-xs text-gray-600 mb-3">
                                <div>
                                  Overall: <strong>{idea.overallScore}/100</strong>
                                </div>
                                {idea.viralityScore && (
                                  <div>
                                    Virality: <strong>{idea.viralityScore}/100</strong>
                                  </div>
                                )}
                                {idea.relevanceScore && (
                                  <div>
                                    Relevance: <strong>{idea.relevanceScore}/100</strong>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Keywords */}
                            {idea.keywords?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {idea.keywords.slice(0, 5).map((keyword: string) => (
                                  <span
                                    key={keyword}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                                {idea.keywords.length > 5 && (
                                  <span className="text-xs text-gray-500">
                                    +{idea.keywords.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions - THIS IS THE KEY SMOOTH FLOW */}
                      <div className="ml-6 flex flex-col gap-2">
                        <Button
                          size="sm"
                          className="whitespace-nowrap"
                          // TODO: Open content generation modal
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Generate Content
                        </Button>

                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            title="Generate Blog Post"
                          >
                            📝
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            title="Generate Video Script"
                          >
                            🎬
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            title="Generate Social Posts"
                          >
                            📱
                          </Button>
                        </div>

                        <Link href={`/ideas/${idea.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Bulk Actions (shown when items are selected) */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 hidden">
            <Card className="shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">3 ideas selected</span>
                  <Button size="sm">Generate Content for All</Button>
                  <Button variant="outline" size="sm">
                    Change Status
                  </Button>
                  <Button variant="outline" size="sm">
                    Add to Queue
                  </Button>
                  <button className="text-sm text-gray-500 hover:text-gray-700">
                    Clear
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
