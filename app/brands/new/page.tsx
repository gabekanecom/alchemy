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
  const [activeTab, setActiveTab] = useState<"basics" | "voice" | "visual" | "audience">("basics");

  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    slug: "",
    description: "",
    websiteUrl: "",
    logoUrl: "",

    // Brand Voice
    brandVoice: {
      tone: "professional" as const,
      formality: "formal" as const,
      writingStyle: "detailed" as const,
      personality: [] as string[],
      vocabulary: {
        preferred: [] as string[],
        avoid: [] as string[],
      },
    },

    // Visual Identity
    visualIdentity: {
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
      accentColor: "#F59E0B",
      fontHeading: "Inter",
      fontBody: "Inter",
    },

    // Target Audience
    targetAudience: {
      demographics: {
        ageRange: "",
        gender: "all",
        location: [] as string[],
        profession: [] as string[],
      },
      psychographics: {
        interests: [] as string[],
        painPoints: [] as string[],
        goals: [] as string[],
      },
      expertiseLevel: "intermediate" as const,
    },

    // Content Preferences
    contentPreferences: {
      contentTypes: [] as string[],
      platforms: [] as string[],
      toneGuidelines: "",
      styleGuide: "",
      keywords: [] as string[],
      prohibitedTopics: [] as string[],
      callToAction: "",
    },
  });

  const [personalityInput, setPersonalityInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          websiteUrl: formData.websiteUrl,
          logoUrl: formData.logoUrl,
          brandVoice: formData.brandVoice,
          targetAudience: formData.targetAudience,
          contentPreferences: formData.contentPreferences,
        }),
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

  const addToArray = (field: string, value: string, subField?: string) => {
    if (!value.trim()) return;

    if (subField) {
      setFormData({
        ...formData,
        [field]: {
          ...(formData as any)[field],
          [subField]: [...(formData as any)[field][subField], value.trim()],
        },
      });
    } else {
      setFormData({
        ...formData,
        [field]: {
          ...(formData as any)[field],
          [field]: [...(formData as any)[field][field], value.trim()],
        },
      });
    }
  };

  const removeFromArray = (field: string, index: number, subField?: string) => {
    if (subField) {
      setFormData({
        ...formData,
        [field]: {
          ...(formData as any)[field],
          [subField]: (formData as any)[field][subField].filter((_: any, i: number) => i !== index),
        },
      });
    }
  };

  const tabs = [
    { id: "basics", label: "Basics", icon: "📋" },
    { id: "voice", label: "Brand Voice", icon: "🎤" },
    { id: "visual", label: "Visual Identity", icon: "🎨" },
    { id: "audience", label: "Target Audience", icon: "👥" },
  ];

  return (
    <AppLayout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Create New Brand</h1>
            <p className="mt-1 text-sm text-gray-600">
              Configure your brand identity, voice, and visual style
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* BASICS TAB */}
              {activeTab === "basics" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Essential details about your brand
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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

                    <div>
                      <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">
                        Logo URL
                      </label>
                      <Input
                        id="logoUrl"
                        type="url"
                        value={formData.logoUrl}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        className="mt-1"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Upload your logo to Supabase storage or provide an external URL
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* BRAND VOICE TAB */}
              {activeTab === "voice" && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Communication Style</CardTitle>
                      <CardDescription>
                        Define how your brand communicates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
                            Tone
                          </label>
                          <select
                            id="tone"
                            value={formData.brandVoice.tone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                brandVoice: { ...formData.brandVoice, tone: e.target.value as any },
                              })
                            }
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="professional">Professional</option>
                            <option value="casual">Casual</option>
                            <option value="friendly">Friendly</option>
                            <option value="authoritative">Authoritative</option>
                            <option value="playful">Playful</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="formality" className="block text-sm font-medium text-gray-700 mb-1">
                            Formality
                          </label>
                          <select
                            id="formality"
                            value={formData.brandVoice.formality}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                brandVoice: { ...formData.brandVoice, formality: e.target.value as any },
                              })
                            }
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="formal">Formal</option>
                            <option value="informal">Informal</option>
                            <option value="conversational">Conversational</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="writingStyle" className="block text-sm font-medium text-gray-700 mb-1">
                            Writing Style
                          </label>
                          <select
                            id="writingStyle"
                            value={formData.brandVoice.writingStyle}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                brandVoice: { ...formData.brandVoice, writingStyle: e.target.value as any },
                              })
                            }
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="concise">Concise</option>
                            <option value="detailed">Detailed</option>
                            <option value="storytelling">Storytelling</option>
                            <option value="technical">Technical</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Personality Traits
                        </label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="e.g., Innovative, Trustworthy"
                            value={personalityInput}
                            onChange={(e) => setPersonalityInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addToArray("brandVoice", personalityInput, "personality");
                                setPersonalityInput("");
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              addToArray("brandVoice", personalityInput, "personality");
                              setPersonalityInput("");
                            }}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.brandVoice.personality.map((trait, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                            >
                              {trait}
                              <button
                                type="button"
                                onClick={() => removeFromArray("brandVoice", i, "personality")}
                                className="hover:text-blue-900"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Content Guidelines</CardTitle>
                      <CardDescription>
                        Define content preferences and style guide
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tone Guidelines
                        </label>
                        <textarea
                          rows={3}
                          value={formData.contentPreferences.toneGuidelines}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contentPreferences: {
                                ...formData.contentPreferences,
                                toneGuidelines: e.target.value,
                              },
                            })
                          }
                          placeholder="Describe how content should sound and feel..."
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Style Guide Notes
                        </label>
                        <textarea
                          rows={3}
                          value={formData.contentPreferences.styleGuide}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contentPreferences: {
                                ...formData.contentPreferences,
                                styleGuide: e.target.value,
                              },
                            })
                          }
                          placeholder="Specific style guidelines, formatting preferences, etc..."
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Call to Action
                        </label>
                        <Input
                          value={formData.contentPreferences.callToAction}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contentPreferences: {
                                ...formData.contentPreferences,
                                callToAction: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g., Visit our website, Sign up today"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* VISUAL IDENTITY TAB */}
              {activeTab === "visual" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Visual Identity</CardTitle>
                    <CardDescription>
                      Colors, fonts, and visual elements that represent your brand
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-4">Brand Colors</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Primary Color
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={formData.visualIdentity.primaryColor}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  visualIdentity: {
                                    ...formData.visualIdentity,
                                    primaryColor: e.target.value,
                                  },
                                })
                              }
                              className="h-10 w-20 rounded border border-gray-300"
                            />
                            <Input
                              type="text"
                              value={formData.visualIdentity.primaryColor}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  visualIdentity: {
                                    ...formData.visualIdentity,
                                    primaryColor: e.target.value,
                                  },
                                })
                              }
                              placeholder="#3B82F6"
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Secondary Color
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={formData.visualIdentity.secondaryColor}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  visualIdentity: {
                                    ...formData.visualIdentity,
                                    secondaryColor: e.target.value,
                                  },
                                })
                              }
                              className="h-10 w-20 rounded border border-gray-300"
                            />
                            <Input
                              type="text"
                              value={formData.visualIdentity.secondaryColor}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  visualIdentity: {
                                    ...formData.visualIdentity,
                                    secondaryColor: e.target.value,
                                  },
                                })
                              }
                              placeholder="#10B981"
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Accent Color
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={formData.visualIdentity.accentColor}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  visualIdentity: {
                                    ...formData.visualIdentity,
                                    accentColor: e.target.value,
                                  },
                                })
                              }
                              className="h-10 w-20 rounded border border-gray-300"
                            />
                            <Input
                              type="text"
                              value={formData.visualIdentity.accentColor}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  visualIdentity: {
                                    ...formData.visualIdentity,
                                    accentColor: e.target.value,
                                  },
                                })
                              }
                              placeholder="#F59E0B"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-4">Typography</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Heading Font
                          </label>
                          <select
                            value={formData.visualIdentity.fontHeading}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                visualIdentity: {
                                  ...formData.visualIdentity,
                                  fontHeading: e.target.value,
                                },
                              })
                            }
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Poppins">Poppins</option>
                            <option value="Montserrat">Montserrat</option>
                            <option value="Playfair Display">Playfair Display</option>
                            <option value="Merriweather">Merriweather</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Body Font
                          </label>
                          <select
                            value={formData.visualIdentity.fontBody}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                visualIdentity: {
                                  ...formData.visualIdentity,
                                  fontBody: e.target.value,
                                },
                              })
                            }
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Lato">Lato</option>
                            <option value="Source Sans Pro">Source Sans Pro</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Color Preview */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-4">Preview</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div
                          className="h-24 rounded-lg flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: formData.visualIdentity.primaryColor }}
                        >
                          Primary
                        </div>
                        <div
                          className="h-24 rounded-lg flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: formData.visualIdentity.secondaryColor }}
                        >
                          Secondary
                        </div>
                        <div
                          className="h-24 rounded-lg flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: formData.visualIdentity.accentColor }}
                        >
                          Accent
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* TARGET AUDIENCE TAB */}
              {activeTab === "audience" && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Demographics</CardTitle>
                      <CardDescription>
                        Who is your target audience?
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Age Range
                          </label>
                          <Input
                            value={formData.targetAudience.demographics.ageRange}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                targetAudience: {
                                  ...formData.targetAudience,
                                  demographics: {
                                    ...formData.targetAudience.demographics,
                                    ageRange: e.target.value,
                                  },
                                },
                              })
                            }
                            placeholder="e.g., 25-45"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender
                          </label>
                          <select
                            value={formData.targetAudience.demographics.gender}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                targetAudience: {
                                  ...formData.targetAudience,
                                  demographics: {
                                    ...formData.targetAudience.demographics,
                                    gender: e.target.value,
                                  },
                                },
                              })
                            }
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="all">All</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="non-binary">Non-binary</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expertise Level
                        </label>
                        <select
                          value={formData.targetAudience.expertiseLevel}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              targetAudience: {
                                ...formData.targetAudience,
                                expertiseLevel: e.target.value as any,
                              },
                            })
                          }
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Psychographics</CardTitle>
                      <CardDescription>
                        Understand your audience's mindset
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pain Points
                        </label>
                        <textarea
                          rows={3}
                          placeholder="What problems does your audience face? (one per line)"
                          onChange={(e) => {
                            const painPoints = e.target.value.split("\n").filter((p) => p.trim());
                            setFormData({
                              ...formData,
                              targetAudience: {
                                ...formData.targetAudience,
                                psychographics: {
                                  ...formData.targetAudience.psychographics,
                                  painPoints,
                                },
                              },
                            });
                          }}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Goals
                        </label>
                        <textarea
                          rows={3}
                          placeholder="What does your audience want to achieve? (one per line)"
                          onChange={(e) => {
                            const goals = e.target.value.split("\n").filter((g) => g.trim());
                            setFormData({
                              ...formData,
                              targetAudience: {
                                ...formData.targetAudience,
                                psychographics: {
                                  ...formData.targetAudience.psychographics,
                                  goals,
                                },
                              },
                            });
                          }}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interests
                        </label>
                        <textarea
                          rows={3}
                          placeholder="What is your audience interested in? (one per line)"
                          onChange={(e) => {
                            const interests = e.target.value.split("\n").filter((i) => i.trim());
                            setFormData({
                              ...formData,
                              targetAudience: {
                                ...formData.targetAudience,
                                psychographics: {
                                  ...formData.targetAudience.psychographics,
                                  interests,
                                },
                              },
                            });
                          }}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
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
