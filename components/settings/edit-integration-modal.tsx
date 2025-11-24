"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, AlertCircle, Trash2 } from "lucide-react";

interface Integration {
  id: string;
  provider: string;
  category: string;
  displayName: string;
  config: Record<string, any>;
  enabled: boolean;
  isDefault: boolean;
}

interface IntegrationProvider {
  id: string;
  category: string;
  name: string;
  description: string;
  configSchema: {
    shape: Record<string, any>;
  };
}

interface EditIntegrationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  integration: Integration | null;
}

export function EditIntegrationModal({ open, onClose, onSuccess, integration }: EditIntegrationModalProps) {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<IntegrationProvider | null>(null);

  useEffect(() => {
    if (open && integration) {
      setConfig(integration.config);
      setIsDefault(integration.isDefault);
      setError(null);
      fetchProvider(integration.provider);
    }
  }, [open, integration]);

  async function fetchProvider(providerId: string) {
    try {
      const response = await fetch("/api/integrations/registry");
      const data = await response.json();
      const foundProvider = data.providers.find((p: IntegrationProvider) => p.id === providerId);
      setProvider(foundProvider || null);
    } catch (error) {
      console.error("Failed to fetch provider:", error);
    }
  }

  function handleConfigChange(field: string, value: any) {
    setConfig((prev) => {
      const newConfig = { ...prev };
      const parts = field.split(".");

      if (parts.length === 1) {
        newConfig[field] = value;
      } else {
        // Handle nested fields
        let current = newConfig;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
      }

      return newConfig;
    });
  }

  async function handleSubmit() {
    if (!integration) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/integrations/${integration.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          isDefault,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update integration");
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update integration");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!integration) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${integration.displayName}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/integrations/${integration.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete integration");
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete integration");
    } finally {
      setDeleting(false);
    }
  }

  function renderConfigField(fieldName: string, schema: any) {
    const label = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, " $1");

    // Handle nested objects
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

    // Handle enums
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

  const categoryNames: Record<string, string> = {
    ai_provider: "AI Text Generation",
    image_generation: "Image Generation",
    video_generation: "Video Generation",
    publishing: "CMS Publishing",
    social_media: "Social Media",
  };

  if (!integration || !provider) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-grey-900 border-grey-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            Configure {integration.displayName}
          </DialogTitle>
          <DialogDescription className="text-grey-300">
            Update your API credentials and configuration settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
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
              Set as default provider for {categoryNames[integration.category]}
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
              onClick={handleDelete}
              disabled={deleting || loading}
              className="border-red-500/50 hover:border-red-500 hover:bg-red-500/10 text-red-500"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
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
                disabled={loading || deleting}
                className="bg-gold-500 hover:bg-gold-600 text-black"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
