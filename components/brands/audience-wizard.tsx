"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, Users, CheckCircle2, Plus, X } from "lucide-react";

interface AudienceWizardProps {
  onComplete: (audienceData: any) => void;
  initialData?: any;
}

export function AudienceWizard({ onComplete, initialData }: AudienceWizardProps) {
  const [step, setStep] = useState(1);
  const [audienceData, setAudienceData] = useState({
    demographics: initialData?.demographics || {
      ageRange: "",
      location: "",
      occupation: "",
      income: "",
    },
    psychographics: initialData?.psychographics || {
      interests: [],
      values: [],
      lifestyle: "",
    },
    painPoints: initialData?.painPoints || [],
    goals: initialData?.goals || [],
    behaviors: initialData?.behaviors || "",
  });

  const [newInterest, setNewInterest] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newPainPoint, setNewPainPoint] = useState("");
  const [newGoal, setNewGoal] = useState("");

  function addInterest() {
    if (newInterest.trim()) {
      setAudienceData((prev) => ({
        ...prev,
        psychographics: {
          ...prev.psychographics,
          interests: [...prev.psychographics.interests, newInterest.trim()],
        },
      }));
      setNewInterest("");
    }
  }

  function removeInterest(index: number) {
    setAudienceData((prev) => ({
      ...prev,
      psychographics: {
        ...prev.psychographics,
        interests: prev.psychographics.interests.filter((_, i) => i !== index),
      },
    }));
  }

  function addValue() {
    if (newValue.trim()) {
      setAudienceData((prev) => ({
        ...prev,
        psychographics: {
          ...prev.psychographics,
          values: [...prev.psychographics.values, newValue.trim()],
        },
      }));
      setNewValue("");
    }
  }

  function removeValue(index: number) {
    setAudienceData((prev) => ({
      ...prev,
      psychographics: {
        ...prev.psychographics,
        values: prev.psychographics.values.filter((_, i) => i !== index),
      },
    }));
  }

  function addPainPoint() {
    if (newPainPoint.trim()) {
      setAudienceData((prev) => ({
        ...prev,
        painPoints: [...prev.painPoints, newPainPoint.trim()],
      }));
      setNewPainPoint("");
    }
  }

  function removePainPoint(index: number) {
    setAudienceData((prev) => ({
      ...prev,
      painPoints: prev.painPoints.filter((_, i) => i !== index),
    }));
  }

  function addGoal() {
    if (newGoal.trim()) {
      setAudienceData((prev) => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()],
      }));
      setNewGoal("");
    }
  }

  function removeGoal(index: number) {
    setAudienceData((prev) => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index),
    }));
  }

  function handleNext() {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete(audienceData);
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
        return audienceData.demographics.ageRange.length > 0;
      case 2:
        return audienceData.psychographics.interests.length > 0;
      case 3:
        return audienceData.painPoints.length > 0;
      case 4:
        return audienceData.goals.length > 0;
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
                    ? "bg-green-500 text-gray-900"
                    : i === step
                    ? "bg-purple-500 text-gray-900"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i}
              </div>
              {i < 4 && (
                <div
                  className={`w-12 h-1 transition-colors ${
                    i < step ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <span className="text-sm text-gray-500">Step {step} of 4</span>
      </div>

      {/* Step Content */}
      <Card className="bg-gray-50 border-gray-200 p-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-500" />
                Demographics
              </h3>
              <p className="text-gray-500">
                Define the basic characteristics of your target audience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-600 mb-2 block">
                  Age Range <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={audienceData.demographics.ageRange}
                  onChange={(e) =>
                    setAudienceData({
                      ...audienceData,
                      demographics: {
                        ...audienceData.demographics,
                        ageRange: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., 25-45"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div>
                <Label className="text-gray-600 mb-2 block">Primary Location</Label>
                <Input
                  value={audienceData.demographics.location}
                  onChange={(e) =>
                    setAudienceData({
                      ...audienceData,
                      demographics: {
                        ...audienceData.demographics,
                        location: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., United States, Urban areas"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div>
                <Label className="text-gray-600 mb-2 block">Occupation/Industry</Label>
                <Input
                  value={audienceData.demographics.occupation}
                  onChange={(e) =>
                    setAudienceData({
                      ...audienceData,
                      demographics: {
                        ...audienceData.demographics,
                        occupation: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., Tech professionals, Entrepreneurs"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div>
                <Label className="text-gray-600 mb-2 block">Income Level</Label>
                <Input
                  value={audienceData.demographics.income}
                  onChange={(e) =>
                    setAudienceData({
                      ...audienceData,
                      demographics: {
                        ...audienceData.demographics,
                        income: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., $50K-$150K annually"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-500" />
                Psychographics
              </h3>
              <p className="text-gray-500">
                Understand their interests, values, and lifestyle
              </p>
            </div>

            <div className="space-y-6">
              {/* Interests */}
              <div>
                <Label className="text-gray-600 mb-2 block">
                  Interests <span className="text-red-400">*</span>
                </Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addInterest()}
                    placeholder="Add an interest..."
                    className="bg-white border-gray-300 text-gray-900"
                  />
                  <Button onClick={addInterest} className="bg-purple-500 hover:bg-purple-600">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {audienceData.psychographics.interests.map((interest, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-purple-500/20 text-purple-300 border-purple-500/30 gap-2"
                    >
                      {interest}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-400"
                        onClick={() => removeInterest(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Values */}
              <div>
                <Label className="text-gray-600 mb-2 block">Core Values</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addValue()}
                    placeholder="Add a value..."
                    className="bg-white border-gray-300 text-gray-900"
                  />
                  <Button onClick={addValue} className="bg-purple-500 hover:bg-purple-600">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {audienceData.psychographics.values.map((value, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-blue-500/20 text-blue-300 border-blue-500/30 gap-2"
                    >
                      {value}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-400"
                        onClick={() => removeValue(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Lifestyle */}
              <div>
                <Label className="text-gray-600 mb-2 block">Lifestyle Description</Label>
                <Textarea
                  value={audienceData.psychographics.lifestyle}
                  onChange={(e) =>
                    setAudienceData({
                      ...audienceData,
                      psychographics: {
                        ...audienceData.psychographics,
                        lifestyle: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., Busy professionals who value efficiency, health-conscious, tech-savvy..."
                  rows={4}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-500" />
                Pain Points
              </h3>
              <p className="text-gray-500">
                What challenges or problems does your audience face?
              </p>
            </div>

            <div>
              <Label className="text-gray-600 mb-2 block">
                Add Pain Points <span className="text-red-400">*</span>
              </Label>
              <div className="flex gap-2 mb-4">
                <Textarea
                  value={newPainPoint}
                  onChange={(e) => setNewPainPoint(e.target.value)}
                  placeholder="Describe a pain point..."
                  rows={2}
                  className="bg-white border-gray-300 text-gray-900"
                />
                <Button
                  onClick={addPainPoint}
                  className="bg-purple-500 hover:bg-purple-600 h-auto"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {audienceData.painPoints.map((painPoint, index) => (
                  <Card key={index} className="bg-white border-gray-300 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-900 flex-1">{painPoint}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removePainPoint(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-500" />
                Goals & Behaviors
              </h3>
              <p className="text-gray-500">
                What are they trying to achieve and how do they behave?
              </p>
            </div>

            <div className="space-y-6">
              {/* Goals */}
              <div>
                <Label className="text-gray-600 mb-2 block">
                  Goals & Aspirations <span className="text-red-400">*</span>
                </Label>
                <div className="flex gap-2 mb-4">
                  <Textarea
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Describe a goal..."
                    rows={2}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                  <Button
                    onClick={addGoal}
                    className="bg-purple-500 hover:bg-purple-600 h-auto"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {audienceData.goals.map((goal, index) => (
                    <Card key={index} className="bg-white border-gray-300 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-900 flex-1">{goal}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeGoal(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Behaviors */}
              <div>
                <Label className="text-gray-600 mb-2 block">Online Behaviors</Label>
                <Textarea
                  value={audienceData.behaviors}
                  onChange={(e) =>
                    setAudienceData({ ...audienceData, behaviors: e.target.value })
                  }
                  placeholder="e.g., Active on LinkedIn, consumes content early morning, prefers video over text..."
                  rows={4}
                  className="bg-white border-gray-300 text-gray-900"
                />
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
          className="bg-purple-500 hover:bg-purple-600 text-gray-900 gap-2"
        >
          {step === 4 ? "Complete" : "Next"}
          {step < 4 && <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
