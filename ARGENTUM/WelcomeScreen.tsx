/**
 * ARGENTUM Welcome Screen
 * The ephemeral counterpart - fleeting, immediate, present
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Wind, Sparkles, FlameKindling, ChevronRight, X } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface WelcomeScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function WelcomeScreen({ onComplete, onSkip }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: FlameKindling,
      title: "A surface in the moment",
      description: "ARGENTUM exists in the present. A fleeting canvas for immediate thoughts, quick sketches, and transient ideas. Nothing persists, everything flows.",
      visual: "surface",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: Wind,
      title: "No layers, only flow",
      description: "Unlike AURUM's depth, ARGENTUM embraces the flat. No history, no archive. Each moment replaces the last, like breath or waves.",
      visual: "flow",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: Sparkles,
      title: "Freedom in impermanence",
      description: "When nothing is saved, everything is possible. No fear of mistakes. No weight of the past. Pure creative freedom in the ephemeral.",
      visual: "freedom",
      color: "from-cyan-600 to-blue-600",
    },
    {
      icon: Zap,
      title: "The beauty of letting go",
      description: "ARGENTUM teaches release. Like silver tarnishes and renews, your canvas refreshes. In forgetting, we find clarity. In release, we find space.",
      visual: "release",
      color: "from-blue-600 to-cyan-500",
    },
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Skip Button */}
      <button
        onClick={onSkip}
        className="absolute top-4 right-4 text-cyan-300/60 hover:text-cyan-200 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* AURUM Light Glow - "Licht durch ARGENTUM" */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-amber-400/30 via-orange-400/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.08, scale: 1.2 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-radial from-amber-300/20 to-transparent rounded-full blur-2xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.08, scale: 1.2 }}
          transition={{ duration: 4, delay: 1, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-gradient-radial from-orange-300/20 to-transparent rounded-full blur-2xl"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* ARGENTUM Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mb-8"
            >
              <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${currentStepData.color} rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-500/20`}>
                <currentStepData.icon className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-light text-cyan-100 mb-4"
            >
              {currentStepData.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-cyan-200/80 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              {currentStepData.description}
            </motion.p>

            {/* Visual Representation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              {currentStepData.visual === 'surface' && <SurfaceVisual />}
              {currentStepData.visual === 'flow' && <FlowVisual />}
              {currentStepData.visual === 'freedom' && <FreedomVisual />}
              {currentStepData.visual === 'release' && <ReleaseVisual />}
            </motion.div>

            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`
                    h-2 rounded-full transition-all
                    ${index === currentStep 
                      ? 'w-8 bg-gradient-to-r from-cyan-500 to-blue-500' 
                      : 'w-2 bg-cyan-700 hover:bg-cyan-600'}
                  `}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="border-cyan-600 text-cyan-200 hover:bg-cyan-900/50"
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  'Begin Flowing'
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Background Pattern - Subtle waves */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 49%, rgba(6, 182, 212, 0.3) 50%, transparent 51%),
            linear-gradient(90deg, transparent 49%, rgba(6, 182, 212, 0.3) 50%, transparent 51%)
          `,
          backgroundSize: '60px 60px',
        }} />
      </div>
    </div>
  );
}

// ============================================================================
// Visual Components
// ============================================================================

function SurfaceVisual() {
  return (
    <div className="flex items-center justify-center h-64">
      <motion.div
        initial={{ rotateY: -90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="w-64 h-80 bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-cyan-500/20 border border-cyan-500/30 relative overflow-hidden"
      >
        {/* Flowing particles */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: -100, opacity: 0 }}
              animate={{ 
                x: 300,
                opacity: [0, 1, 1, 0],
              }}
              transition={{ 
                delay: i * 0.3,
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="absolute top-1/2 h-px w-20 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              style={{ top: `${20 + i * 15}%` }}
            />
          ))}
        </div>
        {/* Cyan accent */}
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-cyan-500 to-blue-500" />
      </motion.div>
    </div>
  );
}

function FlowVisual() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative w-72 h-72">
        {/* Single flat surface with flowing energy */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-cyan-500/30 shadow-xl shadow-cyan-500/20"
        >
          {/* Wave animation */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1,
                opacity: [0, 0.5, 0],
                x: [0, 300]
              }}
              transition={{
                delay: i * 0.4,
                duration: 2,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
              className="absolute left-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              style={{ top: `${20 + i * 15}%` }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function FreedomVisual() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative w-64 h-64">
        {/* Sparkles floating freely */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) * Math.PI / 180;
          const radius = 80 + Math.random() * 40;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [0, -20, -40]
              }}
              transition={{
                delay: i * 0.2,
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="absolute w-2 h-2 bg-cyan-400 rounded-full"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
            />
          );
        })}
        {/* Center glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-2xl" />
        </motion.div>
      </div>
    </div>
  );
}

function ReleaseVisual() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative">
        {/* Fading circles - representing release */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ 
              scale: [1, 2.5],
              opacity: [0.6, 0]
            }}
            transition={{
              delay: i * 0.6,
              duration: 2.4,
              repeat: Infinity,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-cyan-400 rounded-full"
          />
        ))}
        
        {/* Center core */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-xl shadow-cyan-500/50"
        >
          <Zap className="w-8 h-8 text-white" />
        </motion.div>
      </div>
    </div>
  );
}
