"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function Header() {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        router.push("/create");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // For now, redirect to ideas page with search query
      router.push(`/ideas?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Search */}
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors min-w-[300px]"
            >
              <Search className="w-4 h-4" />
              <span>Search...</span>
              <kbd className="ml-auto px-2 py-1 text-xs bg-white border border-gray-200 rounded">
                ⌘K
              </kbd>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push("/create")}
                className="bg-gradient-gold text-white hover:opacity-90 shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Content
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearch} className="mt-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search ideas, content, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                autoFocus
              />
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>Press <kbd className="px-2 py-1 bg-gray-100 rounded border">Enter</kbd> to search</p>
              <p className="mt-2">Tip: Use <kbd className="px-2 py-1 bg-gray-100 rounded border">⌘K</kbd> anytime to open search</p>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
