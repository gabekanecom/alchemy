"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DollarSign,
  Activity,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Download,
  Calendar,
  Lightbulb,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface UsageStats {
  summary: {
    totalCost: number;
    totalUnits: number;
    totalOperations: number;
    successfulOperations: number;
    successRate: number;
    period: string;
    startDate: string;
    endDate: string;
  };
  byIntegration: Array<{
    integration: {
      id: string;
      displayName: string;
      provider: string;
      category: string;
    };
    totalCost: number;
    totalUnits: number;
    operations: number;
    successfulOperations: number;
  }>;
  topIntegrations: Array<{
    integration: {
      id: string;
      displayName: string;
      provider: string;
      category: string;
    };
    totalCost: number;
    totalUnits: number;
    operations: number;
  }>;
  timeline: Array<{
    date: string;
    cost: number;
    units: number;
    operations: number;
  }>;
  byOperation: Array<{
    operation: string;
    totalCost: number;
    totalUnits: number;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    integration: {
      id: string;
      displayName: string;
      provider: string;
    };
    operation: string;
    unitsUsed: number;
    cost: number;
    success: boolean;
    errorMessage: string | null;
    createdAt: string;
  }>;
}

interface Recommendations {
  recommendations: Array<{
    type: string;
    message: string;
    potentialSavings?: number;
  }>;
  projection: {
    currentMonthCost: number;
    projectedMonthlyCost: number;
    averageDailyCost: number;
    daysInMonth: number;
    daysElapsed: number;
  };
  trends: {
    currentPeriod: { cost: number; operations: number };
    previousPeriod: { cost: number; operations: number };
    percentageChange: { cost: number; operations: number };
  };
}

export default function UsagePage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    fetchUsageStats();
    fetchRecommendations();
  }, [period]);

  async function fetchUsageStats() {
    setLoading(true);
    try {
      const response = await fetch(`/api/integrations/usage?period=${period}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch usage stats:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecommendations() {
    try {
      const response = await fetch("/api/integrations/recommendations");
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  }

  function formatNumber(num: number) {
    return new Intl.NumberFormat("en-US").format(num);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatDateTime(date: string) {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function exportData() {
    if (!stats) return;

    const csvData = stats.recentActivity.map((activity) => ({
      Date: formatDateTime(activity.createdAt),
      Integration: activity.integration.displayName,
      Operation: activity.operation,
      Units: activity.unitsUsed,
      Cost: activity.cost,
      Status: activity.success ? "Success" : "Failed",
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usage-export-${period}.csv`;
    a.click();
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-grey-400">Loading usage statistics...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!stats) {
    return (
      <AppLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-grey-400">Failed to load usage statistics</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Usage & Costs</h1>
            <p className="text-grey-200 mt-1">Monitor your integration usage and spending</p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[150px] bg-grey-900 border-grey-600">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="border-grey-600 hover:border-gold-500"
              onClick={exportData}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Cost Projection & Trends */}
        {recommendations && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-gold-500/10 to-gold-600/10 border-gold-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gold-300 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Monthly Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(recommendations.projection.projectedMonthlyCost)}
                </div>
                <p className="text-xs text-grey-300 mt-1">
                  {formatCurrency(recommendations.projection.currentMonthCost)} spent so far (
                  {recommendations.projection.daysElapsed} / {recommendations.projection.daysInMonth} days)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-grey-850 border-grey-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-grey-300 flex items-center">
                  Cost Trend (30d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(recommendations.trends.currentPeriod.cost)}
                  </div>
                  <div
                    className={`flex items-center text-sm font-medium ${
                      recommendations.trends.percentageChange.cost > 0
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {recommendations.trends.percentageChange.cost > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {Math.abs(recommendations.trends.percentageChange.cost).toFixed(1)}%
                  </div>
                </div>
                <p className="text-xs text-grey-400 mt-1">vs previous 30 days</p>
              </CardContent>
            </Card>

            <Card className="bg-grey-850 border-grey-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-grey-300 flex items-center">
                  Operations Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(recommendations.trends.currentPeriod.operations)}
                  </div>
                  <div
                    className={`flex items-center text-sm font-medium ${
                      recommendations.trends.percentageChange.operations > 0
                        ? "text-blue-500"
                        : "text-grey-400"
                    }`}
                  >
                    {recommendations.trends.percentageChange.operations > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {Math.abs(recommendations.trends.percentageChange.operations).toFixed(1)}%
                  </div>
                </div>
                <p className="text-xs text-grey-400 mt-1">API calls vs previous period</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && recommendations.recommendations.length > 0 && (
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-blue-400" />
                Cost Optimization Recommendations
              </CardTitle>
              <CardDescription className="text-grey-300">
                Ways to reduce your integration costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-grey-900/50 rounded-lg border border-blue-500/20"
                  >
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-white">{rec.message}</p>
                      {rec.potentialSavings && rec.potentialSavings > 0 && (
                        <p className="text-xs text-green-400 mt-1">
                          Potential savings: {formatCurrency(rec.potentialSavings)}/month
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-grey-850 border-grey-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-grey-300 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-gold-500" />
                Total Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(stats.summary.totalCost)}
              </div>
              <p className="text-xs text-grey-400 mt-1">
                {stats.summary.totalOperations} operations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-grey-850 border-grey-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-grey-300 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-blue-500" />
                Total Units
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatNumber(stats.summary.totalUnits)}
              </div>
              <p className="text-xs text-grey-400 mt-1">Tokens/requests used</p>
            </CardContent>
          </Card>

          <Card className="bg-grey-850 border-grey-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-grey-300 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                Avg Cost/Operation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(
                  stats.summary.totalOperations > 0
                    ? stats.summary.totalCost / stats.summary.totalOperations
                    : 0
                )}
              </div>
              <p className="text-xs text-grey-400 mt-1">Per request</p>
            </CardContent>
          </Card>

          <Card className="bg-grey-850 border-grey-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-grey-300 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.summary.successRate.toFixed(1)}%
              </div>
              <p className="text-xs text-grey-400 mt-1">
                {stats.summary.successfulOperations} / {stats.summary.totalOperations} successful
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cost Timeline Chart */}
        <Card className="bg-grey-850 border-grey-600">
          <CardHeader>
            <CardTitle className="text-white">Cost Over Time</CardTitle>
            <CardDescription className="text-grey-300">Daily spending breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.timeline.length === 0 ? (
                <div className="text-center py-12 text-grey-400">No usage data available</div>
              ) : (
                stats.timeline.map((day) => {
                  const maxCost = Math.max(...stats.timeline.map((d) => d.cost));
                  const percentage = maxCost > 0 ? (day.cost / maxCost) * 100 : 0;

                  return (
                    <div key={day.date} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-grey-300">{formatDate(day.date)}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-grey-400">{day.operations} ops</span>
                          <span className="text-white font-medium">
                            {formatCurrency(day.cost)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-grey-900 rounded-full h-2">
                        <div
                          className="bg-gold-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Integrations by Cost */}
          <Card className="bg-grey-850 border-grey-600">
            <CardHeader>
              <CardTitle className="text-white">Top Integrations by Cost</CardTitle>
              <CardDescription className="text-grey-300">
                Highest spending integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topIntegrations.length === 0 ? (
                  <div className="text-center py-8 text-grey-400">No integrations used yet</div>
                ) : (
                  stats.topIntegrations.map((item) => (
                    <div key={item.integration.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-white">{item.integration.displayName}</div>
                        <div className="text-sm text-grey-400">
                          {item.operations} operations • {formatNumber(item.totalUnits)} units
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gold-500">
                          {formatCurrency(item.totalCost)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Usage by Operation Type */}
          <Card className="bg-grey-850 border-grey-600">
            <CardHeader>
              <CardTitle className="text-white">Usage by Operation</CardTitle>
              <CardDescription className="text-grey-300">
                Breakdown by operation type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.byOperation.length === 0 ? (
                  <div className="text-center py-8 text-grey-400">No operations yet</div>
                ) : (
                  stats.byOperation.map((item) => (
                    <div key={item.operation} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-white capitalize">
                          {item.operation.replace(/_/g, " ")}
                        </div>
                        <div className="text-sm text-grey-400">
                          {item.count} calls • {formatNumber(item.totalUnits)} units
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          {formatCurrency(item.totalCost)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-grey-850 border-grey-600">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-grey-300">Latest integration usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-8 text-grey-400">No activity yet</div>
              ) : (
                stats.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-grey-900 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {activity.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">
                          {activity.integration.displayName}
                        </div>
                        <div className="text-sm text-grey-400">
                          {activity.operation.replace(/_/g, " ")} •{" "}
                          {formatNumber(activity.unitsUsed)} units
                        </div>
                        {!activity.success && activity.errorMessage && (
                          <div className="text-xs text-red-400 mt-1 truncate">
                            {activity.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-sm font-medium text-white">
                        {formatCurrency(activity.cost)}
                      </div>
                      <div className="text-xs text-grey-400">
                        {formatDateTime(activity.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
