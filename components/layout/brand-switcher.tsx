"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, ChevronDown, Search, Plus, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Brand {
  id: string;
  name: string;
  description?: string;
}

export function BrandSwitcher() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentBrands, setRecentBrands] = useState<string[]>([]);

  useEffect(() => {
    fetchBrands();
    loadRecentBrands();
  }, []);

  async function fetchBrands() {
    try {
      const response = await fetch("/api/brands");
      const data = await response.json();
      setBrands(data.brands || []);

      // Set first brand as current if none selected
      if (!currentBrand && data.brands.length > 0) {
        const savedBrandId = localStorage.getItem("currentBrandId");
        const brand = savedBrandId
          ? data.brands.find((b: Brand) => b.id === savedBrandId)
          : data.brands[0];
        setCurrentBrand(brand || data.brands[0]);
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  }

  function loadRecentBrands() {
    const recent = localStorage.getItem("recentBrands");
    if (recent) {
      setRecentBrands(JSON.parse(recent));
    }
  }

  function saveRecentBrand(brandId: string) {
    const recent = [...new Set([brandId, ...recentBrands])].slice(0, 5);
    setRecentBrands(recent);
    localStorage.setItem("recentBrands", JSON.stringify(recent));
  }

  function switchBrand(brand: Brand) {
    setCurrentBrand(brand);
    localStorage.setItem("currentBrandId", brand.id);
    saveRecentBrand(brand.id);
    // Trigger a page refresh to reload data for the new brand
    window.location.reload();
  }

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentBrandObjects = recentBrands
    .map((id) => brands.find((b) => b.id === id))
    .filter(Boolean) as Brand[];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-grey-850 border-grey-600 text-white hover:bg-grey-800 gap-2 min-w-[200px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gold-500" />
            <span className="truncate">{currentBrand?.name || "Select Brand"}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-grey-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 bg-grey-900 border-grey-700 text-white p-2">
        {/* Search */}
        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-grey-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands..."
              className="pl-10 bg-grey-850 border-grey-600 text-white"
            />
          </div>
        </div>

        {/* Recent Brands */}
        {recentBrandObjects.length > 0 && !searchQuery && (
          <>
            <DropdownMenuLabel className="text-grey-400 text-xs">
              Recent
            </DropdownMenuLabel>
            {recentBrandObjects.map((brand) => (
              <DropdownMenuItem
                key={brand.id}
                onClick={() => switchBrand(brand)}
                className="cursor-pointer focus:bg-grey-800 focus:text-white"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-grey-400" />
                    <div>
                      <p className="font-medium">{brand.name}</p>
                      {brand.description && (
                        <p className="text-xs text-grey-400 truncate max-w-[200px]">
                          {brand.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {currentBrand?.id === brand.id && (
                    <Check className="w-4 h-4 text-gold-500" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-grey-700" />
          </>
        )}

        {/* All Brands */}
        <DropdownMenuLabel className="text-grey-400 text-xs">
          {searchQuery ? "Search Results" : "All Brands"}
        </DropdownMenuLabel>

        <div className="max-h-64 overflow-y-auto">
          {filteredBrands.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-grey-400">
              No brands found
            </div>
          ) : (
            filteredBrands.map((brand) => (
              <DropdownMenuItem
                key={brand.id}
                onClick={() => switchBrand(brand)}
                className="cursor-pointer focus:bg-grey-800 focus:text-white"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-grey-400" />
                    <div>
                      <p className="font-medium">{brand.name}</p>
                      {brand.description && (
                        <p className="text-xs text-grey-400 truncate max-w-[200px]">
                          {brand.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {currentBrand?.id === brand.id && (
                    <Check className="w-4 h-4 text-gold-500" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator className="bg-grey-700" />

        {/* Create New Brand */}
        <DropdownMenuItem asChild>
          <Link
            href="/brands/new"
            className="cursor-pointer focus:bg-grey-800 focus:text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-gold-500" />
            <span>Create New Brand</span>
          </Link>
        </DropdownMenuItem>

        {/* Manage Brands */}
        <DropdownMenuItem asChild>
          <Link
            href="/brands"
            className="cursor-pointer focus:bg-grey-800 focus:text-white flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-grey-400" />
            <span>Manage All Brands</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
