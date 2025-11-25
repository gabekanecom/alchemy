"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, Zap, FileText, Image as ImageIcon, Brain } from "lucide-react";

interface UsageMetricsProps {
  timeRange: string;
  brandId: string;
}

export function UsageMetrics({ timeRange, brandId }: UsageMetricsProps) {
  const [usageData, setUsageData] = useState<any>({
    totalTokens: 0,
    totalRequests: 0,
    byProvider: [],
    byCategory: [],
    trend: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageData();
  }, [timeRange, brandId]);

  async function fetchUsageData() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(brandId !== "all" && { brandId }),
      });

      const response = await fetch(`/api/analytics/usage?${params}`);
      const result = await response.json();
      setUsageData(result.data);
    } catch (error) {
      console.error("Failed to fetch usage data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-50 border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
        </div>
      </Card>
    );
  }

  const categoryIcons: Record<string, any> = {
    text_generation: Brain,
    image_generation: ImageIcon,
    research: FileText,
    other: Zap,
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-50 border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {usageData.totalRequests.toLocaleString()}
              </p>
            </div>
            <Zap className="w-10 h-10 text-purple-400" />
          </div>
        </Card>

        <Card className="bg-gray-50 border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Tokens</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {(usageData.totalTokens / 1000000).toFixed(2)}M
              </p>
            </div>
            <Brain className="w-10 h-10 text-gold-500" />
          </div>
        </Card>

        <Card className="bg-gray-50 border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Tokens/Request</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {Math.round(usageData.totalTokens / usageData.totalRequests || 0).toLocaleString()}
              </p>
            </div>
            <FileText className="w-10 h-10 text-blue-400" />
          </div>
        </Card>
      </div>

      {/* Usage by Category */}
      <Card className="bg-gray-50 border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Usage by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {usageData.byCategory.map((category: any) => {
            const Icon = categoryIcons[category.id] || Zap;
            return (
              <Card key={category.id} className="bg-white border-gray-300 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-gold-500" />
                    <span className="font-medium text-gray-900 capitalize">
                      {category.name.replace("_", " ")}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-gold-500/20 text-gold-400">
                    {category.requests} requests
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Tokens Used</span>
                    <span className="text-gray-900 font-medium">
                      {(category.tokens / 1000).toFixed(1)}K
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Avg Cost</span>
                    <span className="text-gray-900 font-medium">${category.avgCost.toFixed(3)}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gold-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(category.requests / usageData.totalRequests) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {((category.requests / usageData.totalRequests) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Usage Trend */}
      <Card className="bg-gray-50 border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Volume</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={usageData.trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend />
            <Bar dataKey="requests" fill="#8B5CF6" name="Requests" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Token Usage Trend */}
      <Card className="bg-gray-50 border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Consumption</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={usageData.trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="tokens"
              stroke="#F59E0B"
              strokeWidth={2}
              name="Tokens"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Provider Breakdown */}
      <Card className="bg-gray-50 border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Provider</h3>
        <div className="space-y-3">
          {usageData.byProvider.map((provider: any) => (
            <div
              key={provider.name}
              className="flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="font-medium text-gray-900">{provider.name}</span>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border border-purple-200">
                  {provider.requests} requests
                </Badge>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Tokens</p>
                  <p className="text-sm font-medium text-gray-900">
                    {(provider.tokens / 1000).toFixed(1)}K
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Cost</p>
                  <p className="text-sm font-medium text-gray-900">${provider.cost.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
