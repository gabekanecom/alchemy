"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, TrendingUp, Zap } from "lucide-react";

export function OnboardingModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem("alchemy_onboarding_completed");
    if (!hasSeenOnboarding) {
      // Show onboarding after a short delay
      setTimeout(() => setOpen(true), 1000);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem("alchemy_onboarding_completed", "true");
    setOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem("alchemy_onboarding_completed", "true");
    setOpen(false);
  };

  const steps = [
    {
      title: "Welcome to Alchemy! ✨",
      description: "AI-powered content creation platform for modern marketers",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Alchemy helps you discover viral ideas, generate high-quality content, and publish across multiple platforms - all powered by AI.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium">AI Discovery</p>
            </div>
            <div className="text-center p-4 bg-gold-50 rounded-lg">
              <Zap className="w-8 h-8 text-gold-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Fast Generation</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Multi-Platform</p>
            </div>
          </div>
        </div>
      ),
      cta: "Get Started",
    },
    {
      title: "Create Your First Brand",
      description: "Define your brand voice, audience, and content preferences",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Set up your brand profile to ensure all generated content matches your unique voice and resonates with your target audience.
          </p>
          <div className="bg-gradient-gold-light border border-gold-200 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-gray-900 mb-2">What you'll configure:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Brand voice (tone, style, personality)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Target audience demographics</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Content preferences and guidelines</span>
              </li>
            </ul>
          </div>
        </div>
      ),
      cta: "Create Brand",
      action: () => router.push("/brands/new"),
    },
    {
      title: "Discover Content Ideas",
      description: "Let AI find viral topics from Reddit, YouTube, Twitter, and more",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Our AI scans multiple sources to find trending topics with high virality potential. Each idea is scored based on engagement, relevance, and competition.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Discovery sources:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                Reddit trending
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                YouTube viral
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                Twitter trends
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                SEO keywords
              </div>
            </div>
          </div>
        </div>
      ),
      cta: "Start Discovery",
      action: () => router.push("/discovery"),
    },
    {
      title: "Quick Tips",
      description: "Keyboard shortcuts and power user features",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <kbd className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-mono">⌘K</kbd>
              <span className="text-sm text-gray-700">Global search - find anything instantly</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <kbd className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-mono">⌘N</kbd>
              <span className="text-sm text-gray-700">Quick create - start generating content</span>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Pro tip:</h4>
            <p className="text-sm text-gray-700">
              Use <strong>Quick Mode</strong> in the content generator for fast creation with smart defaults. Toggle to Advanced Mode when you need full control.
            </p>
          </div>
        </div>
      ),
      cta: "Start Creating",
      action: () => router.push("/create"),
    },
  ];

  const currentStep = steps[step];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{currentStep.title}</DialogTitle>
          <DialogDescription>{currentStep.description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {currentStep.content}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === step ? 'bg-gold-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>
                {currentStep.cta}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (currentStep.action) {
                    currentStep.action();
                  }
                  handleComplete();
                }}
                className="bg-gradient-gold text-white"
              >
                {currentStep.cta}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
