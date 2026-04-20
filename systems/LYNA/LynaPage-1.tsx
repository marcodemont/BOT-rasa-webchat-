import React, { useState } from "react";
import {
  ArrowLeft,
  Brain,
  Sparkles,
  Shield,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { ChatBot } from "./LYNA_Chat";
import { BeschreibungLYNA } from "./BeschreibungLYNA";

interface LynaPageProps {
  onBack: () => void;
  onOpenAura?: () => void; // ✅ AURA Support
}

export function LynaPage({
  onBack,
  onOpenAura,
}: LynaPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Startseite
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl">LYNA</h1>
              <p className="text-gray-600">
                Ihre KI-Assistentin für medizinische Beratung
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: LYNA Description */}
          <div className="lg:col-span-1">
            <BeschreibungLYNA />
          </div>

          {/* Right: ChatBot */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Chat mit LYNA
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ChatBot onOpenAura={onOpenAura} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Information Banner */}
        <Card className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-purple-100">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-purple-900">
                  Wichtiger Hinweis
                </h3>
                <p className="text-sm text-purple-800">
                  LYNA ist eine KI-Assistentin zur Unterstützung
                  und Information. Sie ersetzt keine
                  professionelle medizinische Beratung, Diagnose
                  oder Behandlung. Bei gesundheitlichen
                  Beschwerden konsultieren Sie bitte immer einen
                  qualifizierten Arzt.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}