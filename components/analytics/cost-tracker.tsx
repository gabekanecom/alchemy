"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";

interface CostTrackerProps {
  timeRange: string;
  brandId: string;
}

export function CostTracker({ timeRange, brandId }: CostTrackerProps) {
  const [costData, setCostData] = useState<any>({
    totalCost: 0,
    byProvider: [],
    byBrand: [],
    trend: [],
    budgetUsage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCostData();
  }, [timeRange, brandId]);

  async function fetchCostData() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(brandId !== "all" && { brandId }),
      });

      const response = await fetch(`/api/analytics/costs?${params}`);
      const result = await response.json();
      setCostData(result.data);
    } catch (error) {
      console.error("Failed to fetch cost data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="bg-grey-850 border-grey-700 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
        </div>
      </Card>
    );
  }

  const COLORS = ["#F59E0B", "#8B5CF6", "#10B981", "#3B82F6", "#EF4444", "#EC4899"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Total Cost and Budget */}
      <Card className="bg-grey-850 border-grey-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cost Overview</h3>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-grey-400">Total Spend</span>
              <span className="text-2xl font-bold text-white">
                ${costData.totalCost.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {costData.trend >= 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">+{costData.trend}% from last period</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">{costData.trend}% from last period</span>
                </>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-grey-400">Budget Usage</span>
              <span className="text-sm font-medium text-white">{costData.budgetUsage}%</span>
            </div>
            <div className="w-full bg-grey-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  costData.budgetUsage > 90
                    ? "bg-red-500"
                    : costData.budgetUsage > 75
                    ? "bg-gold-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(costData.budgetUsage, 100)}%` }}
              />
            </div>
            {costData.budgetUsage > 90 && (
              <p className="text-xs text-red-400 mt-2">⚠️ Approaching budget limit</p>
            )}
          </div>

          <div className="pt-4 border-t border-grey-700">
            <h4 className="text-sm font-medium text-grey-300 mb-3">Cost per Content</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-grey-400">Average</span>
                <span className="text-white font-medium">$0.12</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-grey-400">Minimum</span>
                <span className="text-white font-medium">$0.03</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-grey-400">Maximum</span>
                <span className="text-white font-medium">$0.45</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Cost by Provider */}
      <Card className="bg-grey-850 border-grey-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cost by Provider</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={costData.byProvider}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: $${entry.value.toFixed(2)}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {costData.byProvider.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Cost Trend */}
      <Card className="bg-grey-850 border-grey-700 p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-4">Cost Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={costData.trend}>
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
            <Bar dataKey="cost" fill="#F59E0B" name="Cost ($)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Cost by Brand (if viewing all brands) */}
      {brandId === "all" && costData.byBrand.length > 0 && (
        <Card className="bg-grey-850 border-grey-700 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Cost by Brand</h3>
          <div className="space-y-3">
            {costData.byBrand.map((brand: any, index: number) => (
              <div key={brand.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-white">{brand.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-grey-400">{brand.pieces} pieces</span>
                  <span className="text-lg font-semibold text-white min-w-[80px] text-right">
                    ${brand.cost.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
