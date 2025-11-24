"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface QueueFiltersProps {
  filters: {
    status: string;
    platform: string;
    brandId: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function QueueFilters({ filters, onFiltersChange }: QueueFiltersProps) {
  function updateFilter(key: string, value: string) {
    onFiltersChange({ ...filters, [key]: value });
  }

  return (
    <Card className="bg-grey-850 border-grey-600">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={filters.status} onValueChange={(v) => updateFilter("status", v)}>
            <SelectTrigger className="bg-grey-900 border-grey-600 text-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.platform} onValueChange={(v) => updateFilter("platform", v)}>
            <SelectTrigger className="bg-grey-900 border-grey-600 text-white">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.brandId} onValueChange={(v) => updateFilter("brandId", v)}>
            <SelectTrigger className="bg-grey-900 border-grey-600 text-white">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {/* TODO: Load brands dynamically */}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
