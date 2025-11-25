"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PerformanceChart } from "@/components/analytics/performance-chart";
import { CostTracker } from "@/components/analytics/cost-tracker";
import { UsageMetrics } from "@/components/analytics/usage-metrics";
import { ViralityScores } from "@/components/analytics/virality-scores";
import { TrendingUp, DollarSign, Zap, BarChart3, Loader2 } from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalEngagement: 0,
    totalCost: 0,
    avgViralityScore: 0,
  });

  useEffect(() => {
    fetchBrands();
    fetchStats();
  }, [timeRange, selectedBrand]);

  async function fetchBrands() {
    try {
      const response = await fetch("/api/brands");
      const data = await response.json();
      setBrands(data.brands || []);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  }

  async function fetchStats() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(selectedBrand !== "all" && { brandId: selectedBrand }),
      });

      const response = await fetch(`/api/analytics/stats?${params}`);
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-gold-500" />
              Analytics Dashboard
            </h1>
            <p className="text-grey-400 mt-1">Track performance, costs, and insights</p>
          </div>

          <div className="flex gap-3">
            {/* Brand Filter */}
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="bg-grey-850 border-grey-600 text-white w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand: any) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Time Range */}
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="bg-grey-850 border-grey-600 text-white w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-grey-850 border-grey-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-grey-400">Total Views</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {stats.totalViews.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-400 mt-1">+12.5% from previous period</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-400" />
                </div>
              </Card>

              <Card className="bg-grey-850 border-grey-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-grey-400">Total Engagement</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {stats.totalEngagement.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-400 mt-1">+8.3% from previous period</p>
                  </div>
                  <Zap className="w-10 h-10 text-purple-400" />
                </div>
              </Card>

              <Card className="bg-grey-850 border-grey-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-grey-400">Total Cost</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      ${stats.totalCost.toFixed(2)}
                    </p>
                    <p className="text-xs text-red-400 mt-1">+15.2% from previous period</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-gold-500" />
                </div>
              </Card>

              <Card className="bg-grey-850 border-grey-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-grey-400">Avg Virality Score</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {stats.avgViralityScore.toFixed(1)}
                    </p>
                    <p className="text-xs text-green-400 mt-1">+3.2 from previous period</p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-blue-400" />
                </div>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="performance" className="space-y-6">
              <TabsList className="bg-grey-850 border-grey-700">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="costs">Costs</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="virality">Virality</TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-6">
                <PerformanceChart timeRange={timeRange} brandId={selectedBrand} />
              </TabsContent>

              <TabsContent value="costs" className="space-y-6">
                <CostTracker timeRange={timeRange} brandId={selectedBrand} />
              </TabsContent>

              <TabsContent value="usage" className="space-y-6">
                <UsageMetrics timeRange={timeRange} brandId={selectedBrand} />
              </TabsContent>

              <TabsContent value="virality" className="space-y-6">
                <ViralityScores timeRange={timeRange} brandId={selectedBrand} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
}
