import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/utils";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function BrandDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // TODO: Fetch brand from API
  const brand = null;

  if (!brand) {
    return (
      <AppLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Brand not found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    The brand you're looking for doesn't exist or you don't have access to it.
                  </p>
                  <div className="mt-6">
                    <Link href="/brands">
                      <Button variant="outline">Back to Brands</Button>
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

  const brandVoice = (brand as any).brandVoice as any;
  const targetAudience = (brand as any).targetAudience as any;
  const contentPreferences = (brand as any).contentPreferences as any;

  return (
    <AppLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">{(brand as any).name}</h1>
                {(brand as any).isDefault && <Badge variant="secondary">Default</Badge>}
                {(brand as any).isActive ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">@{(brand as any).slug}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/brands/${(brand as any).id}/edit` as any}>
                <Button>Edit Brand</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {(brand as any).description || "No description provided"}
                    </dd>
                  </div>
                  {(brand as any).websiteUrl && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Website</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a
                          href={(brand as any).websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {(brand as any).websiteUrl}
                        </a>
                      </dd>
                    </div>
                  )}
                </CardContent>
              </Card>

              {brandVoice && (
                <Card>
                  <CardHeader>
                    <CardTitle>Brand Voice</CardTitle>
                    <CardDescription>
                      How this brand communicates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Tone</dt>
                        <dd className="mt-1">
                          <Badge variant="outline">{brandVoice.tone}</Badge>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Formality</dt>
                        <dd className="mt-1">
                          <Badge variant="outline">{brandVoice.formality}</Badge>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Writing Style</dt>
                        <dd className="mt-1">
                          <Badge variant="outline">{brandVoice.writingStyle}</Badge>
                        </dd>
                      </div>
                    </div>
                    {brandVoice.personality?.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-2">
                          Personality Traits
                        </dt>
                        <dd className="flex flex-wrap gap-2">
                          {brandVoice.personality.map((trait: string) => (
                            <Badge key={trait} variant="secondary">
                              {trait}
                            </Badge>
                          ))}
                        </dd>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {targetAudience && (
                <Card>
                  <CardHeader>
                    <CardTitle>Target Audience</CardTitle>
                    <CardDescription>
                      Who this brand is for
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Expertise Level</dt>
                      <dd className="mt-1">
                        <Badge variant="outline">{targetAudience.expertiseLevel}</Badge>
                      </dd>
                    </div>
                    {targetAudience.painPoints?.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-2">Pain Points</dt>
                        <dd>
                          <ul className="list-disc list-inside text-sm text-gray-900 space-y-1">
                            {targetAudience.painPoints.map((point: string, i: number) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Ideas</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">0</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Content Generated</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">0</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Publications</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">0</dd>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href={`/ideas/new?brandId=${(brand as any).id}` as any} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      New Idea
                    </Button>
                  </Link>
                  <Link href={`/content/new?brandId=${(brand as any).id}` as any} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Generate Content
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
