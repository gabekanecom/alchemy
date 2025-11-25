"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScatterChart, Scatter, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from "recharts";
import { Loader2, TrendingUp, Target, Award } from "lucide-react";
import Link from "next/link";

interface ViralityScoresProps {
  timeRange: string;
  brandId: string;
}

export function ViralityScores({ timeRange, brandId }: ViralityScoresProps) {
  const [viralityData, setViralityData] = useState<any>({
    avgScore: 0,
    topContent: [],
    scoreAccuracy: [],
    scoreTrend: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViralityData();
  }, [timeRange, brandId]);

  async function fetchViralityData() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(brandId !== "all" && { brandId }),
      });

      const response = await fetch(`/api/analytics/virality?${params}`);
      const result = await response.json();
      setViralityData(result.data);
    } catch (error) {
      console.error("Failed to fetch virality data:", error);
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

  function getScoreColor(score: number) {
    if (score >= 80) return "text-gold-400";
    if (score >= 60) return "text-green-400";
    if (score >= 40) return "text-blue-400";
    return "text-gray-500";
  }

  function getScoreBadgeColor(score: number) {
    if (score >= 80) return "bg-gold-500/20 text-gold-400 border-gold-500/30";
    if (score >= 60) return "bg-green-50 text-green-700 border border-green-200 border-green-500/30";
    if (score >= 40) return "bg-blue-50 text-blue-700 border border-blue-200 border-blue-500/30";
    return "bg-grey-500/20 text-gray-500 border-gray-400/30";
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-50 border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Score</p>
              <p className={`text-3xl font-bold mt-2 ${getScoreColor(viralityData.avgScore)}`}>
                {viralityData.avgScore.toFixed(1)}
              </p>
            </div>
            <Target className="w-10 h-10 text-gold-500" />
          </div>
        </Card>

        <Card className="bg-gray-50 border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Score Accuracy</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {viralityData.scoreAccuracy[0]?.accuracy || 0}%
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-400" />
          </div>
        </Card>

        <Card className="bg-gray-50 border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Viral Content (80+)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {viralityData.topContent.filter((c: any) => c.predictedScore >= 80).length}
              </p>
            </div>
            <Award className="w-10 h-10 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Top Performing Content */}
      <Card className="bg-gray-50 border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Content</h3>
        <div className="space-y-3">
          {viralityData.topContent.slice(0, 10).map((content: any, index: number) => (
            <Card
              key={content.id}
              className="bg-white border-gray-300 p-4 hover:border-gold-500/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/content/${content.id}/edit`}
                      className="text-gray-900 hover:text-gold-400 font-medium line-clamp-1"
                    >
                      {content.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs bg-grey-500/20 text-gray-500">
                        {content.platform}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(content.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Predicted</p>
                    <Badge variant="outline" className={`mt-1 ${getScoreBadgeColor(content.predictedScore)}`}>
                      {content.predictedScore}
                    </Badge>
                  </div>
                  {content.actualScore && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Actual</p>
                      <Badge variant="outline" className={`mt-1 ${getScoreBadgeColor(content.actualScore)}`}>
                        {content.actualScore}
                      </Badge>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Views</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {content.views?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Predicted vs Actual Scores */}
      <Card className="bg-gray-50 border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Predicted vs Actual Scores
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              type="number"
              dataKey="predicted"
              name="Predicted Score"
              stroke="#9CA3AF"
              domain={[0, 100]}
            />
            <YAxis
              type="number"
              dataKey="actual"
              name="Actual Score"
              stroke="#9CA3AF"
              domain={[0, 100]}
            />
            <ZAxis range={[50, 200]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend />
            <Scatter
              name="Content"
              data={viralityData.scoreAccuracy}
              fill="#F59E0B"
            />
            {/* Ideal line (predicted = actual) */}
            <Scatter
              name="Ideal"
              data={[
                { predicted: 0, actual: 0 },
                { predicted: 100, actual: 100 },
              ]}
              fill="#10B981"
              line
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Points closer to the green line indicate more accurate predictions
        </p>
      </Card>

      {/* Score Trend Over Time */}
      <Card className="bg-gray-50 border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Virality Score Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={viralityData.scoreTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" domain={[0, 100]} />
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
              dataKey="avgScore"
              stroke="#F59E0B"
              strokeWidth={2}
              name="Average Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
