"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from "lucide-react";

interface BrandVoiceWizardProps {
  onComplete: (voiceData: any) => void;
  initialData?: any;
}

export function BrandVoiceWizard({ onComplete, initialData }: BrandVoiceWizardProps) {
  const [step, setStep] = useState(1);
  const [voiceData, setVoiceData] = useState({
    tones: initialData?.tones || [],
    personality: initialData?.personality || [],
    writingStyle: initialData?.writingStyle || "",
    vocabulary: initialData?.vocabulary || "",
    examples: initialData?.examples || "",
    avoidances: initialData?.avoidances || "",
  });

  const toneOptions = [
    { id: "professional", label: "Professional", description: "Formal and business-oriented" },
    { id: "casual", label: "Casual", description: "Relaxed and conversational" },
    { id: "friendly", label: "Friendly", description: "Warm and approachable" },
    { id: "authoritative", label: "Authoritative", description: "Expert and credible" },
    { id: "playful", label: "Playful", description: "Fun and lighthearted" },
    { id: "inspirational", label: "Inspirational", description: "Motivating and uplifting" },
    { id: "educational", label: "Educational", description: "Informative and teaching" },
    { id: "empathetic", label: "Empathetic", description: "Understanding and caring" },
  ];

  const personalityOptions = [
    { id: "innovative", label: "Innovative", icon: "💡" },
    { id: "trustworthy", label: "Trustworthy", icon: "🤝" },
    { id: "energetic", label: "Energetic", icon: "⚡" },
    { id: "sophisticated", label: "Sophisticated", icon: "✨" },
    { id: "approachable", label: "Approachable", icon: "😊" },
    { id: "bold", label: "Bold", icon: "🔥" },
    { id: "thoughtful", label: "Thoughtful", icon: "🤔" },
    { id: "witty", label: "Witty", icon: "😄" },
    { id: "authentic", label: "Authentic", icon: "💯" },
    { id: "passionate", label: "Passionate", icon: "❤️" },
  ];

  function toggleTone(toneId: string) {
    setVoiceData((prev) => ({
      ...prev,
      tones: prev.tones.includes(toneId)
        ? prev.tones.filter((t) => t !== toneId)
        : [...prev.tones, toneId],
    }));
  }

  function togglePersonality(personalityId: string) {
    setVoiceData((prev) => ({
      ...prev,
      personality: prev.personality.includes(personalityId)
        ? prev.personality.filter((p) => p !== personalityId)
        : [...prev.personality, personalityId],
    }));
  }

  function handleNext() {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete(voiceData);
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return voiceData.tones.length >= 1;
      case 2:
        return voiceData.personality.length >= 2;
      case 3:
        return voiceData.writingStyle.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-colors ${
                  i < step
                    ? "bg-green-500 text-white"
                    : i === step
                    ? "bg-gold-500 text-black"
                    : "bg-grey-700 text-grey-400"
                }`}
              >
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i}
              </div>
              {i < 4 && (
                <div
                  className={`w-12 h-1 transition-colors ${
                    i < step ? "bg-green-500" : "bg-grey-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <span className="text-sm text-grey-400">Step {step} of 4</span>
      </div>

      {/* Step Content */}
      <Card className="bg-grey-850 border-grey-700 p-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-gold-500" />
                Select Brand Tones
              </h3>
              <p className="text-grey-400">
                Choose 1-3 tones that best represent your brand's voice
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {toneOptions.map((tone) => {
                const isSelected = voiceData.tones.includes(tone.id);
                return (
                  <Card
                    key={tone.id}
                    onClick={() => toggleTone(tone.id)}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-gold-500/10 border-gold-500"
                        : "bg-grey-900 border-grey-600 hover:border-grey-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-white">{tone.label}</h4>
                        <p className="text-sm text-grey-400 mt-1">{tone.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-gold-500 flex-shrink-0" />
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {voiceData.tones.length > 0 && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm text-green-300">
                  Selected {voiceData.tones.length} tone{voiceData.tones.length > 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-gold-500" />
                Define Personality Traits
              </h3>
              <p className="text-grey-400">
                Select 2-5 traits that capture your brand's personality
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {personalityOptions.map((trait) => {
                const isSelected = voiceData.personality.includes(trait.id);
                return (
                  <Card
                    key={trait.id}
                    onClick={() => togglePersonality(trait.id)}
                    className={`p-4 cursor-pointer transition-all text-center ${
                      isSelected
                        ? "bg-gold-500/10 border-gold-500"
                        : "bg-grey-900 border-grey-600 hover:border-grey-500"
                    }`}
                  >
                    <div className="text-3xl mb-2">{trait.icon}</div>
                    <h4 className="font-medium text-white text-sm">{trait.label}</h4>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-gold-500 mx-auto mt-2" />
                    )}
                  </Card>
                );
              })}
            </div>

            {voiceData.personality.length > 0 && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm text-green-300">
                  Selected {voiceData.personality.length} trait
                  {voiceData.personality.length > 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-gold-500" />
                Writing Style & Vocabulary
              </h3>
              <p className="text-grey-400">Describe how your brand communicates</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-grey-300 mb-2 block">
                  Writing Style <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  value={voiceData.writingStyle}
                  onChange={(e) =>
                    setVoiceData({ ...voiceData, writingStyle: e.target.value })
                  }
                  placeholder="e.g., We use short, punchy sentences. Active voice. Occasional humor. Always actionable."
                  rows={4}
                  className="bg-grey-900 border-grey-600 text-white"
                />
                <p className="text-xs text-grey-500 mt-1">
                  Describe sentence structure, tone, and overall approach
                </p>
              </div>

              <div>
                <Label className="text-grey-300 mb-2 block">
                  Preferred Vocabulary & Phrases
                </Label>
                <Textarea
                  value={voiceData.vocabulary}
                  onChange={(e) =>
                    setVoiceData({ ...voiceData, vocabulary: e.target.value })
                  }
                  placeholder="e.g., We say 'customers' not 'clients'. We use 'transform' and 'empower'. We avoid jargon."
                  rows={3}
                  className="bg-grey-900 border-grey-600 text-white"
                />
                <p className="text-xs text-grey-500 mt-1">
                  Words and phrases you prefer or avoid
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-gold-500" />
                Examples & Guidelines
              </h3>
              <p className="text-grey-400">
                Provide examples and things to avoid for consistency
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-grey-300 mb-2 block">Example Content</Label>
                <Textarea
                  value={voiceData.examples}
                  onChange={(e) => setVoiceData({ ...voiceData, examples: e.target.value })}
                  placeholder="Paste 1-2 examples of content that perfectly captures your brand voice..."
                  rows={6}
                  className="bg-grey-900 border-grey-600 text-white"
                />
                <p className="text-xs text-grey-500 mt-1">
                  Examples help AI learn your exact style
                </p>
              </div>

              <div>
                <Label className="text-grey-300 mb-2 block">Things to Avoid</Label>
                <Textarea
                  value={voiceData.avoidances}
                  onChange={(e) =>
                    setVoiceData({ ...voiceData, avoidances: e.target.value })
                  }
                  placeholder="e.g., Don't use corporate buzzwords. Avoid being too salesy. Never use all caps for emphasis."
                  rows={4}
                  className="bg-grey-900 border-grey-600 text-white"
                />
                <p className="text-xs text-grey-500 mt-1">
                  Helps prevent off-brand content
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="bg-gold-500 hover:bg-gold-600 text-black gap-2"
        >
          {step === 4 ? "Complete" : "Next"}
          {step < 4 && <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
