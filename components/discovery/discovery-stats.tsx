"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Sparkles, Clock, Target } from "lucide-react";

interface DiscoveryStatsProps {
  ideas: any[];
  onFilterClick?: (filter: { type: string; value: any }) => void;
}

export function DiscoveryStats({ ideas, onFilterClick }: DiscoveryStatsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = {
    total: ideas.length,
    today: ideas.filter((i) => new Date(i.discoveredAt) >= today).length,
    highScore: ideas.filter((i) => i.overallScore >= 80).length,
    saved: ideas.filter((i) => i.status === "saved").length,
  };

  const topSource =
    ideas.length > 0
      ? Object.entries(
          ideas.reduce((acc: Record<string, number>, idea) => {
            acc[idea.source] = (acc[idea.source] || 0) + 1;
            return acc;
          }, {})
        ).sort(([, a], [, b]) => (b as number) - (a as number))[0]
      : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <button
        onClick={() => onFilterClick?.({ type: 'date', value: 'today' })}
        className="text-left transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
      >
        <Card className="bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Discovered Today</p>
                <p className="text-2xl font-bold text-white">{stats.today}</p>
                <p className="text-xs text-purple-400 mt-1">Click to filter</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </button>

      <button
        onClick={() => onFilterClick?.({ type: 'score', value: 'high' })}
        className="text-left transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold-500 rounded-lg"
      >
        <Card className="bg-gold-500/10 border-gold-500/30 hover:bg-gold-500/20 cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gold-300">High Score Ideas</p>
                <p className="text-2xl font-bold text-white">{stats.highScore}</p>
                <p className="text-xs text-gold-400 mt-1">Click to filter</p>
              </div>
              <TrendingUp className="w-8 h-8 text-gold-500" />
            </div>
          </CardContent>
        </Card>
      </button>

      <button
        onClick={() => onFilterClick?.({ type: 'status', value: 'saved' })}
        className="text-left transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <Card className="bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Saved Ideas</p>
                <p className="text-2xl font-bold text-white">{stats.saved}</p>
                <p className="text-xs text-blue-400 mt-1">Click to filter</p>
              </div>
              <Sparkles className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </button>

      <button
        onClick={() => topSource && onFilterClick?.({ type: 'source', value: topSource[0] })}
        className="text-left transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg"
        disabled={!topSource}
      >
        <Card className="bg-green-500/10 border-green-500/30 hover:bg-green-500/20 cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Top Source</p>
                <p className="text-lg font-bold text-white">
                  {topSource ? topSource[0] : "N/A"}
                </p>
                {topSource && (
                  <>
                    <p className="text-xs text-green-400">{topSource[1]} ideas</p>
                    <p className="text-xs text-green-400 mt-1">Click to filter</p>
                  </>
                )}
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </button>
    </div>
  );
}
