import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/utils";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ResearchData {
  trendingAngles?: string[];
  competitorInsights?: {
    topPerformingContent: string[];
    contentGaps: string[];
    uniqueApproaches: string[];
  };
  keyStatistics?: Array<{ stat: string; source: string }>;
  expertQuotes?: Array<{ quote: string; author: string; source: string }>;
  recommendedStructure?: {
    sections: string[];
    estimatedLength: number;
    contentFormat: string;
  };
  seoKeywords?: {
    primary: string[];
    secondary: string[];
    longTail: string[];
  };
  targetAudiencePainPoints?: string[];
  callToActionSuggestions?: string[];
  suggestedAngles?: string[];
  reasoning?: string;
  researchedAt?: string;
  researchDepth?: string;
}

export default async function IdeaDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // TODO: Fetch idea from API
  const idea = null as any;

  if (!idea) {
    return (
      <AppLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <h3 className="text-sm font-medium text-gray-900">Idea not found</h3>
                  <div className="mt-6">
                    <Link href="/ideas">
                      <Button>Back to Ideas</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  const researchData = (idea.researchData || {}) as ResearchData;
  const hasResearch = researchData.trendingAngles || researchData.keyStatistics;

  return (
    <AppLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Link href="/ideas">
                  <Button variant="outline" size="sm">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                  </Button>
                </Link>
                <Badge variant="outline">{idea.source}</Badge>
                <Badge
                  className={
                    idea.status === "new"
                      ? "bg-gray-100 text-gray-800"
                      : idea.status === "researching"
                      ? "bg-blue-100 text-blue-800"
                      : idea.status === "queued"
                      ? "bg-yellow-100 text-yellow-800"
                      : idea.status === "in_production"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }
                >
                  {idea.status}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{idea.title}</h1>
              {idea.description && (
                <p className="text-lg text-gray-600 mb-4">{idea.description}</p>
              )}

              {/* Scores */}
              {idea.overallScore && (
                <div className="flex gap-6 mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Overall Score</div>
                    <div className="text-2xl font-bold text-gray-900">{idea.overallScore}/100</div>
                  </div>
                  {idea.viralityScore && (
                    <div>
                      <div className="text-sm text-gray-500">Virality</div>
                      <div className="text-xl font-semibold text-gray-900">{idea.viralityScore}/100</div>
                    </div>
                  )}
                  {idea.relevanceScore && (
                    <div>
                      <div className="text-sm text-gray-500">Relevance</div>
                      <div className="text-xl font-semibold text-gray-900">{idea.relevanceScore}/100</div>
                    </div>
                  )}
                  {idea.competitionScore && (
                    <div>
                      <div className="text-sm text-gray-500">Competition</div>
                      <div className="text-xl font-semibold text-gray-900">{idea.competitionScore}/100</div>
                    </div>
                  )}
                </div>
              )}

              {/* Keywords */}
              {idea.keywords && idea.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {idea.keywords.map((keyword: string) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="ml-6 flex flex-col gap-2">
              {!hasResearch && (
                <Button size="lg">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Deep Research
                </Button>
              )}
              <Button variant={hasResearch ? "default" : "outline"} size="lg">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Content
              </Button>
            </div>
          </div>

          {/* Research Results */}
          {hasResearch ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content - Research Data */}
              <div className="lg:col-span-2 space-y-6">
                {/* Trending Angles */}
                {researchData.trendingAngles && researchData.trendingAngles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>🔥 Trending Angles</CardTitle>
                      <CardDescription>
                        Hot takes and unique perspectives to stand out
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {researchData.trendingAngles.map((angle, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                              {idx + 1}
                            </span>
                            <span className="text-sm text-gray-700">{angle}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Suggested Angles (from vetting) */}
                {researchData.suggestedAngles && researchData.suggestedAngles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>💡 Suggested Angles</CardTitle>
                      <CardDescription>AI-recommended approaches from vetting</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {researchData.suggestedAngles.map((angle, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span className="text-sm text-gray-700">{angle}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Key Statistics */}
                {researchData.keyStatistics && researchData.keyStatistics.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>📊 Key Statistics</CardTitle>
                      <CardDescription>Data points to support your content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {researchData.keyStatistics.map((stat, idx) => (
                          <div key={idx} className="border-l-4 border-blue-500 pl-4">
                            <p className="text-sm font-medium text-gray-900">{stat.stat}</p>
                            <p className="text-xs text-gray-500 mt-1">Source: {stat.source}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Expert Quotes */}
                {researchData.expertQuotes && researchData.expertQuotes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>💬 Expert Quotes</CardTitle>
                      <CardDescription>Authoritative voices and insights</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {researchData.expertQuotes.map((quote, idx) => (
                          <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700 italic mb-2">"{quote.quote}"</p>
                            <p className="text-xs text-gray-900 font-medium">
                              — {quote.author}
                            </p>
                            <p className="text-xs text-gray-500">{quote.source}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Competitor Insights */}
                {researchData.competitorInsights && (
                  <Card>
                    <CardHeader>
                      <CardTitle>🎯 Competitor Insights</CardTitle>
                      <CardDescription>What's working and what's missing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {researchData.competitorInsights.topPerformingContent && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Top Performing Content
                          </h4>
                          <ul className="space-y-1">
                            {researchData.competitorInsights.topPerformingContent.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-green-600">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {researchData.competitorInsights.contentGaps && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Content Gaps</h4>
                          <ul className="space-y-1">
                            {researchData.competitorInsights.contentGaps.map((gap, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-yellow-600">⚠</span>
                                <span>{gap}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {researchData.competitorInsights.uniqueApproaches && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Unique Approaches
                          </h4>
                          <ul className="space-y-1">
                            {researchData.competitorInsights.uniqueApproaches.map((approach, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-blue-600">→</span>
                                <span>{approach}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Target Audience Pain Points */}
                {researchData.targetAudiencePainPoints && researchData.targetAudiencePainPoints.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>😰 Audience Pain Points</CardTitle>
                      <CardDescription>Problems your content should address</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {researchData.targetAudiencePainPoints.map((pain, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span className="text-sm text-gray-700">{pain}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar - Structure & SEO */}
              <div className="space-y-6">
                {/* Recommended Structure */}
                {researchData.recommendedStructure && (
                  <Card>
                    <CardHeader>
                      <CardTitle>📝 Recommended Structure</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500">Format</div>
                        <div className="font-medium text-gray-900">
                          {researchData.recommendedStructure.contentFormat}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500">Estimated Length</div>
                        <div className="font-medium text-gray-900">
                          {researchData.recommendedStructure.estimatedLength} words
                        </div>
                      </div>

                      {researchData.recommendedStructure.sections && (
                        <div>
                          <div className="text-sm text-gray-500 mb-2">Sections</div>
                          <ol className="space-y-1">
                            {researchData.recommendedStructure.sections.map((section, idx) => (
                              <li key={idx} className="text-sm text-gray-700">
                                {idx + 1}. {section}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* SEO Keywords */}
                {researchData.seoKeywords && (
                  <Card>
                    <CardHeader>
                      <CardTitle>🔍 SEO Keywords</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {researchData.seoKeywords.primary && (
                        <div>
                          <div className="text-sm text-gray-500 mb-2">Primary</div>
                          <div className="flex flex-wrap gap-1">
                            {researchData.seoKeywords.primary.map((kw) => (
                              <Badge key={kw} className="bg-blue-600 text-white">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {researchData.seoKeywords.secondary && (
                        <div>
                          <div className="text-sm text-gray-500 mb-2">Secondary</div>
                          <div className="flex flex-wrap gap-1">
                            {researchData.seoKeywords.secondary.map((kw) => (
                              <Badge key={kw} variant="secondary">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {researchData.seoKeywords.longTail && (
                        <div>
                          <div className="text-sm text-gray-500 mb-2">Long-tail</div>
                          <div className="flex flex-wrap gap-1">
                            {researchData.seoKeywords.longTail.slice(0, 6).map((kw) => (
                              <Badge key={kw} variant="outline" className="text-xs">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Call to Action Suggestions */}
                {researchData.callToActionSuggestions && researchData.callToActionSuggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>👉 CTA Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {researchData.callToActionSuggestions.map((cta, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">→</span>
                            <span>{cta}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Research Meta */}
                {researchData.researchedAt && (
                  <Card className="bg-gray-50">
                    <CardContent className="pt-6">
                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Researched:</span>
                          <span className="font-medium">
                            {new Date(researchData.researchedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {researchData.researchDepth && (
                          <div className="flex justify-between">
                            <span>Depth:</span>
                            <span className="font-medium capitalize">
                              {researchData.researchDepth}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            // No research yet
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No research data yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Run deep research to gather data, statistics, and insights
                  </p>
                  <div className="mt-6">
                    <Button>
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Start Deep Research
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
