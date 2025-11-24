"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, AlertCircle } from "lucide-react";

interface IntegrationProvider {
  id: string;
  category: string;
  name: string;
  description: string;
  capabilities: string[];
  configSchema: {
    shape: Record<string, any>;
  };
  pricing: {
    model: string;
    tiers?: Array<{ name: string; input?: number; output?: number; unit: string }>;
  };
  setupInstructions: string;
}

interface AddIntegrationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddIntegrationModal({ open, onClose, onSuccess }: AddIntegrationModalProps) {
  const [providers, setProviders] = useState<IntegrationProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "configure">("select");

  useEffect(() => {
    if (open) {
      fetchProviders();
      setStep("select");
      setSelectedProvider(null);
      setConfig({});
      setError(null);
      setIsDefault(false);
    }
  }, [open]);

  async function fetchProviders() {
    try {
      const response = await fetch("/api/integrations/registry");
      const data = await response.json();
      setProviders(data.providers || []);
    } catch (error) {
      console.error("Failed to fetch providers:", error);
    }
  }

  function handleProviderSelect(providerId: string) {
    setSelectedProvider(providerId);
    const provider = providers.find((p) => p.id === providerId);

    // Initialize config with default values
    if (provider) {
      const initialConfig: Record<string, any> = {};
      Object.entries(provider.configSchema.shape).forEach(([key, schema]: [string, any]) => {
        if (schema._def?.defaultValue !== undefined) {
          initialConfig[key] = schema._def.defaultValue();
        }
      });
      setConfig(initialConfig);
    }

    setStep("configure");
  }

  function handleConfigChange(field: string, value: any) {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!selectedProvider) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          config,
          isDefault,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add integration");
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add integration");
    } finally {
      setLoading(false);
    }
  }

  function renderConfigField(fieldName: string, schema: any) {
    const label = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, " $1");

    // Handle nested objects (like defaultSettings)
    if (schema._def?.typeName === "ZodObject") {
      return (
        <div key={fieldName} className="space-y-3 p-4 border border-grey-700 rounded-lg">
          <Label className="text-sm font-medium text-white">{label}</Label>
          {Object.entries(schema.shape).map(([nestedField, nestedSchema]: [string, any]) => (
            <div key={nestedField} className="ml-4">
              {renderConfigField(`${fieldName}.${nestedField}`, nestedSchema)}
            </div>
          ))}
        </div>
      );
    }

    // Handle enums (select dropdown)
    if (schema._def?.values) {
      const values = Array.from(schema._def.values) as string[];
      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName} className="text-sm font-medium text-white">
            {label}
          </Label>
          <Select
            value={getNestedValue(config, fieldName) || ""}
            onValueChange={(value) => handleConfigChange(fieldName, value)}
          >
            <SelectTrigger className="bg-grey-900 border-grey-600">
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {values.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Handle numbers
    if (schema._def?.typeName === "ZodNumber") {
      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName} className="text-sm font-medium text-white">
            {label}
          </Label>
          <Input
            id={fieldName}
            type="number"
            step={schema._def?.checks?.some((c: any) => c.kind === "int") ? 1 : 0.01}
            min={schema._def?.checks?.find((c: any) => c.kind === "min")?.value}
            max={schema._def?.checks?.find((c: any) => c.kind === "max")?.value}
            value={getNestedValue(config, fieldName) || ""}
            onChange={(e) => handleConfigChange(fieldName, parseFloat(e.target.value))}
            className="bg-grey-900 border-grey-600"
          />
        </div>
      );
    }

    // Handle booleans
    if (schema._def?.typeName === "ZodBoolean") {
      return (
        <div key={fieldName} className="flex items-center space-x-2">
          <Checkbox
            id={fieldName}
            checked={getNestedValue(config, fieldName) || false}
            onCheckedChange={(checked) => handleConfigChange(fieldName, checked)}
          />
          <Label htmlFor={fieldName} className="text-sm font-medium text-white cursor-pointer">
            {label}
          </Label>
        </div>
      );
    }

    // Default to text input
    return (
      <div key={fieldName} className="space-y-2">
        <Label htmlFor={fieldName} className="text-sm font-medium text-white">
          {label}
          {fieldName.toLowerCase().includes("key") && (
            <Badge variant="outline" className="ml-2 text-xs">Required</Badge>
          )}
        </Label>
        <Input
          id={fieldName}
          type={fieldName.toLowerCase().includes("key") || fieldName.toLowerCase().includes("secret") ? "password" : "text"}
          value={getNestedValue(config, fieldName) || ""}
          onChange={(e) => handleConfigChange(fieldName, e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="bg-grey-900 border-grey-600"
        />
      </div>
    );
  }

  function getNestedValue(obj: Record<string, any>, path: string) {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  }

  const provider = providers.find((p) => p.id === selectedProvider);

  // Group providers by category
  const groupedProviders = providers.reduce((acc, provider) => {
    if (!acc[provider.category]) {
      acc[provider.category] = [];
    }
    acc[provider.category].push(provider);
    return acc;
  }, {} as Record<string, IntegrationProvider[]>);

  const categoryNames: Record<string, string> = {
    ai_provider: "AI Text Generation",
    image_generation: "Image Generation",
    video_generation: "Video Generation",
    publishing: "CMS Publishing",
    social_media: "Social Media",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-grey-900 border-grey-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {step === "select" ? "Add Integration" : `Configure ${provider?.name}`}
          </DialogTitle>
          <DialogDescription className="text-grey-300">
            {step === "select"
              ? "Choose a provider to integrate with your content generation workflow"
              : "Enter your API credentials and configuration settings"}
          </DialogDescription>
        </DialogHeader>

        {step === "select" && (
          <Tabs defaultValue={Object.keys(groupedProviders)[0]} className="mt-4">
            <TabsList className="bg-grey-850">
              {Object.keys(groupedProviders).map((category) => (
                <TabsTrigger key={category} value={category}>
                  {categoryNames[category] || category}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(groupedProviders).map(([category, categoryProviders]) => (
              <TabsContent key={category} value={category} className="mt-4 space-y-3">
                {categoryProviders.map((provider) => (
                  <div
                    key={provider.id}
                    onClick={() => handleProviderSelect(provider.id)}
                    className="p-4 border border-grey-700 rounded-lg hover:border-gold-500 cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{provider.name}</h3>
                        <p className="text-sm text-grey-300 mb-3">{provider.description}</p>

                        <div className="flex flex-wrap gap-2">
                          {provider.capabilities.map((cap) => (
                            <Badge key={cap} variant="outline" className="text-xs">
                              {cap.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>

                        {provider.pricing.tiers && provider.pricing.tiers.length > 0 && (
                          <div className="mt-3 text-xs text-grey-400">
                            <span className="font-medium">Pricing:</span>{" "}
                            {provider.pricing.tiers[0].input && (
                              <span>${provider.pricing.tiers[0].input} input</span>
                            )}
                            {provider.pricing.tiers[0].output && (
                              <span> / ${provider.pricing.tiers[0].output} output</span>
                            )}
                            <span> {provider.pricing.tiers[0].unit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}

        {step === "configure" && provider && (
          <div className="space-y-6 mt-4">
            {/* Setup Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-medium text-blue-400 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Setup Instructions
              </h4>
              <div className="text-sm text-grey-300 whitespace-pre-line">
                {provider.setupInstructions}
              </div>
            </div>

            {/* Configuration Form */}
            <div className="space-y-4">
              {Object.entries(provider.configSchema.shape).map(([fieldName, schema]) =>
                renderConfigField(fieldName, schema)
              )}
            </div>

            {/* Set as Default */}
            <div className="flex items-center space-x-2 pt-4 border-t border-grey-700">
              <Checkbox
                id="isDefault"
                checked={isDefault}
                onCheckedChange={(checked) => setIsDefault(!!checked)}
              />
              <Label htmlFor="isDefault" className="text-sm font-medium text-white cursor-pointer">
                Set as default provider for {categoryNames[provider.category]}
              </Label>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-500 font-medium">Configuration Error</p>
                  <p className="text-red-400 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep("select")}
                className="border-grey-600 hover:border-grey-500"
              >
                Back
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-grey-600 hover:border-grey-500"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Add Integration
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
