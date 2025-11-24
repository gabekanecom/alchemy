"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GenerationConfigModalProps {
  ideaId?: string;
  ideaTitle: string;
  brands: Array<{ id: string; name: string; brandVoice?: any }>;
  onClose: () => void;
  onGenerate: (config: GenerationConfig) => void;
}

interface GenerationConfig {
  brandId: string;
  platforms: PlatformConfig[];
  primaryStyle: string;
  emotionalTones: { tone: string; intensity: number }[];
  viralIntensity: "moderate" | "high" | "extreme";
  hookFramework?: string;
  storyFramework?: string;
  customInstructions?: string;
  aiModel?: string;
  temperature?: number;
}

interface PlatformConfig {
  platform: string;
  format: string;
  length: "short" | "medium" | "long";
}

type Style = "educational" | "entertaining" | "inspirational" | "provocative" | "analytical" | "practical";

export function GenerationConfigModal({
  ideaId,
  ideaTitle,
  brands,
  onClose,
  onGenerate,
}: GenerationConfigModalProps) {
  // Essential config
  const [selectedBrand, setSelectedBrand] = useState(brands[0]?.id || "");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [primaryStyle, setPrimaryStyle] = useState<Style>("educational");

  // Emotional tones (multi-select with intensity)
  const [emotionalTones, setEmotionalTones] = useState<Record<string, number>>({
    surprising: 0,
    humorous: 0,
    validating: 0,
    urgent: 0,
    controversial: 0,
    "awe-inspiring": 0,
  });

  // Platform-specific configs
  const [platformConfigs, setPlatformConfigs] = useState<Record<string, PlatformConfig>>({});

  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viralIntensity, setViralIntensity] = useState<"moderate" | "high" | "extreme">("high");
  const [hookFramework, setHookFramework] = useState("auto");
  const [storyFramework, setStoryFramework] = useState("auto");
  const [customInstructions, setCustomInstructions] = useState("");

  // Expert options
  const [showExpert, setShowExpert] = useState(false);
  const [aiModel, setAiModel] = useState("claude-sonnet-4.5");
  const [temperature, setTemperature] = useState(0.7);

  // Platform definitions
  const platforms = [
    {
      id: "blog",
      name: "Blog",
      icon: "📝",
      formats: [
        { id: "article", label: "Article", lengths: ["short", "long", "ultimate"] },
        { id: "listicle", label: "Listicle", lengths: ["short", "long"] },
      ],
      defaultFormat: "article",
      defaultLength: "long" as const,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: "💼",
      formats: [
        { id: "post", label: "Standard Post", lengths: ["short", "long"] },
        { id: "article", label: "Article", lengths: ["long"] },
        { id: "carousel", label: "Carousel", lengths: ["medium"] },
      ],
      defaultFormat: "post",
      defaultLength: "short" as const,
    },
    {
      id: "twitter",
      name: "Twitter/X",
      icon: "🐦",
      formats: [
        { id: "thread", label: "Thread", lengths: ["short", "long"] },
        { id: "single", label: "Single Tweet", lengths: ["short"] },
      ],
      defaultFormat: "thread",
      defaultLength: "medium" as const,
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: "🎬",
      formats: [
        { id: "script", label: "Video Script", lengths: ["short", "medium", "long"] },
      ],
      defaultFormat: "script",
      defaultLength: "medium" as const,
    },
    {
      id: "email",
      name: "Email",
      icon: "📧",
      formats: [
        { id: "newsletter", label: "Newsletter", lengths: ["short", "long"] },
      ],
      defaultFormat: "newsletter",
      defaultLength: "medium" as const,
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: "📱",
      formats: [
        { id: "carousel", label: "Carousel", lengths: ["medium"] },
        { id: "caption", label: "Caption", lengths: ["short"] },
      ],
      defaultFormat: "carousel",
      defaultLength: "medium" as const,
    },
  ];

  // Style definitions
  const styles: Array<{ id: Style; label: string; icon: string; description: string }> = [
    {
      id: "educational",
      label: "Educational",
      icon: "📚",
      description: "Teach concepts, explain how things work, deep dives",
    },
    {
      id: "entertaining",
      label: "Entertaining",
      icon: "🎭",
      description: "Humor, storytelling, personality-driven, fun",
    },
    {
      id: "inspirational",
      label: "Inspirational",
      icon: "🎯",
      description: "Motivational, aspirational, transformation stories",
    },
    {
      id: "provocative",
      label: "Provocative",
      icon: "🔥",
      description: "Controversial takes, challenge status quo, debate",
    },
    {
      id: "analytical",
      label: "Analytical",
      icon: "📊",
      description: "Data-driven, research-heavy, logical arguments",
    },
    {
      id: "practical",
      label: "Practical",
      icon: "💡",
      description: "Actionable tips, step-by-step guides, how-to",
    },
  ];

  // Toggle platform selection
  const togglePlatform = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platformId));
      const newConfigs = { ...platformConfigs };
      delete newConfigs[platformId];
      setPlatformConfigs(newConfigs);
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
      const platform = platforms.find((p) => p.id === platformId);
      if (platform) {
        setPlatformConfigs({
          ...platformConfigs,
          [platformId]: {
            platform: platformId,
            format: platform.defaultFormat,
            length: platform.defaultLength,
          },
        });
      }
    }
  };

  // Quick select functions
  const selectAllPlatforms = () => {
    const allIds = platforms.map((p) => p.id);
    setSelectedPlatforms(allIds);
    const configs: Record<string, PlatformConfig> = {};
    platforms.forEach((p) => {
      configs[p.id] = {
        platform: p.id,
        format: p.defaultFormat,
        length: p.defaultLength,
      };
    });
    setPlatformConfigs(configs);
  };

  const selectSocialPlatforms = () => {
    const socialIds = ["linkedin", "twitter", "instagram"];
    setSelectedPlatforms(socialIds);
    const configs: Record<string, PlatformConfig> = {};
    platforms
      .filter((p) => socialIds.includes(p.id))
      .forEach((p) => {
        configs[p.id] = {
          platform: p.id,
          format: p.defaultFormat,
          length: p.defaultLength,
        };
      });
    setPlatformConfigs(configs);
  };

  // Calculate estimates
  const getEstimates = () => {
    const count = selectedPlatforms.length;
    const avgTime = 90; // seconds per platform
    const totalSeconds = count * avgTime;
    const minutes = Math.ceil(totalSeconds / 60);
    const cost = count * 0.05; // rough estimate

    return {
      count,
      time: minutes === 1 ? "1 minute" : `${minutes} minutes`,
      cost: `$${cost.toFixed(2)}`,
    };
  };

  const estimates = getEstimates();

  const handleGenerate = () => {
    const activeTones = Object.entries(emotionalTones)
      .filter(([_, intensity]) => intensity > 0)
      .map(([tone, intensity]) => ({ tone, intensity }));

    const config: GenerationConfig = {
      brandId: selectedBrand,
      platforms: Object.values(platformConfigs),
      primaryStyle,
      emotionalTones: activeTones,
      viralIntensity,
      hookFramework: hookFramework !== "auto" ? hookFramework : undefined,
      storyFramework: storyFramework !== "auto" ? storyFramework : undefined,
      customInstructions: customInstructions || undefined,
      aiModel,
      temperature,
    };

    onGenerate(config);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Configure Generation</h2>
            <p className="text-sm text-gray-600 mt-1">{ideaTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Left Column - Settings */}
          <div className="space-y-6">
            {/* Brand Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Brand <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Voice will match brand settings</p>
            </div>

            {/* Primary Style */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Primary Style <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setPrimaryStyle(style.id)}
                    className={`
                      p-3 rounded-lg border-2 text-left transition-all
                      ${
                        primaryStyle === style.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                    title={style.description}
                  >
                    <div className="text-2xl mb-1">{style.icon}</div>
                    <div className="text-xs font-medium text-gray-900">{style.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Emotional Tones */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Emotional Tone (Select 1-3)
              </label>
              <div className="space-y-3">
                {Object.keys(emotionalTones).map((tone) => (
                  <div key={tone}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm text-gray-700 capitalize">{tone}</label>
                      <span className="text-xs text-gray-500">
                        {emotionalTones[tone] === 0
                          ? "Off"
                          : emotionalTones[tone] <= 33
                          ? "Low"
                          : emotionalTones[tone] <= 66
                          ? "Medium"
                          : "High"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="33"
                      value={emotionalTones[tone]}
                      onChange={(e) =>
                        setEmotionalTones({
                          ...emotionalTones,
                          [tone]: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {showAdvanced ? "▼" : "▶"} Advanced Options
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
                  {/* Viral Intensity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Viral Intensity
                    </label>
                    <div className="space-y-2">
                      {["moderate", "high", "extreme"].map((level) => (
                        <label key={level} className="flex items-center gap-2">
                          <input
                            type="radio"
                            value={level}
                            checked={viralIntensity === level}
                            onChange={(e) => setViralIntensity(e.target.value as any)}
                            className="text-blue-600"
                          />
                          <span className="text-sm capitalize">{level}</span>
                          {level === "high" && (
                            <Badge variant="secondary" className="text-xs">
                              Recommended
                            </Badge>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Custom Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Custom Instructions
                    </label>
                    <textarea
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      rows={3}
                      placeholder="Add specific instructions..."
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Column - Platform Selection */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Select Platforms <span className="text-red-500">*</span>
              </label>

              {/* Quick Select Buttons */}
              <div className="flex gap-2 mb-4">
                <Button size="sm" variant="outline" onClick={selectAllPlatforms}>
                  All
                </Button>
                <Button size="sm" variant="outline" onClick={selectSocialPlatforms}>
                  Social
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedPlatforms([]);
                    setPlatformConfigs({});
                  }}
                >
                  Clear
                </Button>
              </div>

              {/* Platform Grid */}
              <div className="grid grid-cols-2 gap-3">
                {platforms.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-center
                        ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }
                      `}
                    >
                      <div className="text-3xl mb-2">{platform.icon}</div>
                      <div className="text-sm font-medium text-gray-900">{platform.name}</div>
                      {isSelected && (
                        <div className="mt-2">
                          <svg
                            className="h-5 w-5 text-blue-600 mx-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Per-Platform Config (if platforms selected) */}
            {selectedPlatforms.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Format & Length
                </label>
                <div className="space-y-3">
                  {selectedPlatforms.map((platformId) => {
                    const platform = platforms.find((p) => p.id === platformId);
                    const config = platformConfigs[platformId];
                    if (!platform || !config) return null;

                    return (
                      <Card key={platformId}>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{platform.icon}</span>
                            <span className="text-sm font-medium">{platform.name}</span>
                          </div>

                          {platform.formats.length > 1 && (
                            <select
                              value={config.format}
                              onChange={(e) =>
                                setPlatformConfigs({
                                  ...platformConfigs,
                                  [platformId]: { ...config, format: e.target.value },
                                })
                              }
                              className="w-full text-xs rounded border-gray-300 mb-2"
                            >
                              {platform.formats.map((format) => (
                                <option key={format.id} value={format.id}>
                                  {format.label}
                                </option>
                              ))}
                            </select>
                          )}

                          <div className="flex gap-2">
                            {["short", "medium", "long"].map((length) => (
                              <button
                                key={length}
                                onClick={() =>
                                  setPlatformConfigs({
                                    ...platformConfigs,
                                    [platformId]: { ...config, length: length as any },
                                  })
                                }
                                className={`
                                  flex-1 px-2 py-1 text-xs rounded transition-colors
                                  ${
                                    config.length === length
                                      ? "bg-blue-600 text-white"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }
                                `}
                              >
                                {length}
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">📋 Generation Preview</h3>

                {selectedPlatforms.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Select platforms to see preview
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-2">You will generate:</div>
                      <div className="space-y-2">
                        {selectedPlatforms.map((platformId) => {
                          const platform = platforms.find((p) => p.id === platformId);
                          const config = platformConfigs[platformId];
                          if (!platform || !config) return null;

                          return (
                            <div key={platformId} className="text-sm">
                              <div className="font-medium text-gray-900">
                                {platform.icon} {platform.name}
                              </div>
                              <div className="text-xs text-gray-600 ml-6">
                                {config.format} • {config.length}-form
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total pieces:</span>
                          <span className="font-medium">{estimates.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Est. time:</span>
                          <span className="font-medium">{estimates.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Est. cost:</span>
                          <span className="font-medium">{estimates.cost}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Viral target:</span>
                          <span className="font-medium text-green-600">80+</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Style: {primaryStyle}</div>
                        <div>
                          Tones:{" "}
                          {Object.entries(emotionalTones)
                            .filter(([_, v]) => v > 0)
                            .map(([k]) => k)
                            .join(", ") || "None"}
                        </div>
                        <div>Intensity: {viralIntensity}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={selectedPlatforms.length === 0}
              className="w-full"
              size="lg"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Generate Content →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
