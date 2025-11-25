"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

interface PerformanceChartProps {
  timeRange: string;
  brandId: string;
}

export function PerformanceChart({ timeRange, brandId }: PerformanceChartProps) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange, brandId]);

  async function fetchPerformanceData() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(brandId !== "all" && { brandId }),
      });

      const response = await fetch(`/api/analytics/performance?${params}`);
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error("Failed to fetch performance data:", error);
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

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Views and Engagement Over Time */}
      <Card className="bg-gray-50 border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Views & Engagement</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="views"
              stroke="#F59E0B"
              fillOpacity={1}
              fill="url(#colorViews)"
              name="Views"
            />
            <Area
              type="monotone"
              dataKey="engagement"
              stroke="#8B5CF6"
              fillOpacity={1}
              fill="url(#colorEngagement)"
              name="Engagement"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Conversion Rate */}
      <Card className="bg-gray-50 border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rate</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
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
              dataKey="conversionRate"
              stroke="#10B981"
              strokeWidth={2}
              name="Conversion Rate (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
