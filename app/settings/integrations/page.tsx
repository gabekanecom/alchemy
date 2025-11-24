"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X, AlertCircle, Settings2, Zap } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { AddIntegrationModal } from "@/components/settings/add-integration-modal";
import { EditIntegrationModal } from "@/components/settings/edit-integration-modal";

interface Integration {
  id: string;
  provider: string;
  category: string;
  displayName: string;
  description: string;
  enabled: boolean;
  isDefault: boolean;
  status: string;
  usageToday: number;
  dailyLimit: number | null;
  totalCost: number;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  async function fetchIntegrations() {
    try {
      const response = await fetch("/api/integrations");
      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
    } finally {
      setLoading(false);
    }
  }

  async function testIntegration(id: string) {
    setTestingId(id);
    try {
      const response = await fetch(`/api/integrations/${id}/test`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        alert(`✓ Test successful: ${data.message}`);
        await fetchIntegrations();
      } else {
        alert(`✗ Test failed: ${data.error}`);
      }
    } catch (error) {
      alert(`✗ Test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setTestingId(null);
    }
  }

  async function toggleIntegration(id: string, enabled: boolean) {
    try {
      const response = await fetch(`/api/integrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });

      if (response.ok) {
        await fetchIntegrations();
      }
    } catch (error) {
      console.error("Failed to toggle integration:", error);
    }
  }

  async function setAsDefault(id: string) {
    try {
      const response = await fetch(`/api/integrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      if (response.ok) {
        await fetchIntegrations();
      }
    } catch (error) {
      console.error("Failed to set as default:", error);
    }
  }

  function getCategoryName(category: string) {
    const names: Record<string, string> = {
      ai_provider: "AI Text Generation",
      image_generation: "Image Generation",
      video_generation: "Video Generation",
      publishing: "CMS Publishing",
      social_media: "Social Media",
      analytics: "Analytics",
    };
    return names[category] || category;
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { color: string; text: string }> = {
      active: { color: "bg-green-500/20 text-green-500 border-green-500/30", text: "Active" },
      error: { color: "bg-red-500/20 text-red-500 border-red-500/30", text: "Error" },
      rate_limited: { color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30", text: "Rate Limited" },
      disabled: { color: "bg-grey-700 text-grey-300 border-grey-600", text: "Disabled" },
    };

    const variant = variants[status] || variants.disabled;
    return (
      <Badge className={variant.color} variant="outline">
        {variant.text}
      </Badge>
    );
  }

  // Group integrations by category
  const grouped = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-grey-400">Loading integrations...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Integrations</h1>
            <p className="text-grey-200 mt-1">Manage your AI providers, publishing platforms, and media services</p>
          </div>

          <Button
            className="bg-gold-500 hover:bg-gold-600 text-black"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Integration
          </Button>
        </div>

        {/* Integration Categories */}
        {Object.keys(grouped).length === 0 ? (
          <Card className="bg-grey-850 border-grey-600">
            <CardContent className="text-center py-12">
              <Zap className="w-12 h-12 text-grey-400 mx-auto mb-4" />
              <p className="text-grey-300 mb-4">No integrations configured yet</p>
              <Button
                className="bg-gold-500 hover:bg-gold-600 text-black"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Integration
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Settings2 className="w-5 h-5 mr-2 text-gold-500" />
                  {getCategoryName(category)}
                </h2>

                <div className="grid gap-4">
                  {items.map((integration) => (
                    <Card
                      key={integration.id}
                      className="bg-grey-850 border-grey-600 hover:border-gold-500/50 transition-all"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-white">{integration.displayName}</CardTitle>
                              {integration.isDefault && (
                                <Badge className="bg-gold-500/20 text-gold-500 border-gold-500/30">DEFAULT</Badge>
                              )}
                              {getStatusBadge(integration.status)}
                            </div>
                            <CardDescription>{integration.description}</CardDescription>
                          </div>

                          {/* Toggle Switch */}
                          <button
                            onClick={() => toggleIntegration(integration.id, integration.enabled)}
                            className={`
                              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                              ${integration.enabled ? "bg-gold-500" : "bg-grey-700"}
                            `}
                          >
                            <span
                              className={`
                                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                ${integration.enabled ? "translate-x-6" : "translate-x-1"}
                              `}
                            />
                          </button>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6 text-sm text-grey-300">
                            {integration.dailyLimit && (
                              <div>
                                <span className="text-grey-400">Usage today:</span>{" "}
                                <span className="font-medium text-white">
                                  {integration.usageToday.toLocaleString()}
                                </span>
                                {" / "}
                                <span className="text-grey-400">{integration.dailyLimit.toLocaleString()}</span>
                              </div>
                            )}

                            {integration.totalCost > 0 && (
                              <div>
                                <span className="text-grey-400">Total cost:</span>{" "}
                                <span className="font-medium text-white">${integration.totalCost.toFixed(2)}</span>
                              </div>
                            )}

                            {integration.status === "error" && (
                              <div className="flex items-center text-red-500">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                <span>Connection error</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-grey-600 hover:border-gold-500"
                              onClick={() => testIntegration(integration.id)}
                              disabled={testingId === integration.id}
                            >
                              {testingId === integration.id ? "Testing..." : "Test"}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="border-grey-600 hover:border-gold-500"
                              onClick={() => setEditingIntegration(integration)}
                            >
                              Configure
                            </Button>

                            {!integration.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-grey-600 hover:border-gold-500"
                                onClick={() => setAsDefault(integration.id)}
                              >
                                Set as Default
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Available Providers */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-4">Available Providers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Claude (Anthropic)", category: "AI Provider", icon: "🤖" },
              { name: "OpenAI GPT-4", category: "AI Provider", icon: "🤖" },
              { name: "Google Gemini", category: "AI Provider", icon: "🤖" },
              { name: "DALL-E 3", category: "Image Generation", icon: "🎨" },
              { name: "Sanity CMS", category: "Publishing", icon: "📝" },
              { name: "WordPress", category: "Publishing", icon: "📝" },
              { name: "LinkedIn", category: "Social Media", icon: "💼" },
              { name: "Twitter/X", category: "Social Media", icon: "🐦" },
            ].map((provider) => (
              <Card
                key={provider.name}
                className="bg-grey-900 border-grey-700 hover:border-gold-500/50 transition-all cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-2xl mb-2">{provider.icon}</div>
                      <h3 className="font-semibold text-white mb-1">{provider.name}</h3>
                      <p className="text-sm text-grey-400">{provider.category}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-grey-600 hover:border-gold-500"
                      onClick={() => setShowAddModal(true)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Add Integration Modal */}
        <AddIntegrationModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchIntegrations();
            setShowAddModal(false);
          }}
        />

        {/* Edit Integration Modal */}
        <EditIntegrationModal
          open={!!editingIntegration}
          onClose={() => setEditingIntegration(null)}
          onSuccess={() => {
            fetchIntegrations();
            setEditingIntegration(null);
          }}
          integration={editingIntegration}
        />
      </div>
    </AppLayout>
  );
}
