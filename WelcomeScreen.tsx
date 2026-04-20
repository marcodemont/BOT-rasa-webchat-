/**
 * AURUM Welcome Screen
 * Introduction to the core philosophy and principles
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Layers, Box, Lightbulb, ChevronRight, X } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface WelcomeScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function WelcomeScreen({ onComplete, onSkip }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: FileText,
      title: "A sheet is the beginning",
      description: "AURUM starts with a minimal digital sheet. Freely writable, drawable, and structurally adaptable. Simple in form, infinite in potential.",
      visual: "sheet",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Layers,
      title: "Multiple sheets form layers",
      description: "Content is never deleted, only layered. Stack your thoughts, sketches, and ideas. Each layer preserves a moment in time.",
      visual: "layers",
      color: "from-orange-500 to-amber-600",
    },
    {
      icon: Box,
      title: "Layers create space",
      description: "Through layering, depth emerges. Space for stories, concepts, and personal development. Your ideas gain dimension.",
      visual: "space",
      color: "from-amber-600 to-orange-600",
    },
    {
      icon: Lightbulb,
      title: "Space creates meaning",
      description: "Structure gives context. Time reveals patterns. In this digital space, a single stroke can become an idea. Multiple layers can evolve into entire worlds.",
      visual: "meaning",
      color: "from-orange-600 to-amber-500",
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
    <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Skip Button */}
      <button
        onClick={onSkip}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Content */}
      <div className="max-w-4xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* AURUM Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mb-8"
            >
              <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${currentStepData.color} rounded-2xl flex items-center justify-center shadow-xl`}>
                <currentStepData.icon className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-light text-gray-800 mb-4"
            >
              {currentStepData.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
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
              {currentStepData.visual === 'sheet' && <SheetVisual />}
              {currentStepData.visual === 'layers' && <LayersVisual />}
              {currentStepData.visual === 'space' && <SpaceVisual />}
              {currentStepData.visual === 'meaning' && <MeaningVisual />}
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
                      ? 'w-8 bg-gradient-to-r from-amber-500 to-orange-500' 
                      : 'w-2 bg-gray-300 hover:bg-gray-400'}
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
                  className="border-gray-300"
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  'Begin Creating'
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #F59E0B 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>
    </div>
  );
}

// ============================================================================
// Visual Components
// ============================================================================

function SheetVisual() {
  return (
    <div className="flex items-center justify-center h-64">
      <motion.div
        initial={{ rotateY: -90 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="w-64 h-80 bg-white rounded-lg shadow-2xl border border-gray-200 relative overflow-hidden"
      >
        {/* Ruled lines */}
        <div className="absolute inset-0 p-6">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
              className="h-px bg-gray-200 mb-6"
            />
          ))}
        </div>
        {/* Gold accent */}
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-500 to-orange-500" />
      </motion.div>
    </div>
  );
}

function LayersVisual() {
  return (
    <div className="flex items-center justify-center h-64 relative">
      {[3, 2, 1].map((layer) => (
        <motion.div
          key={layer}
          initial={{ opacity: 0, y: -50, rotateX: 45 }}
          animate={{ 
            opacity: 0.3 + (layer * 0.2), 
            y: 0,
            rotateX: 0,
          }}
          transition={{ 
            delay: 0.2 * layer,
            duration: 0.6,
            type: "spring"
          }}
          className="absolute w-56 h-72 bg-white rounded-lg shadow-xl border border-gray-300"
          style={{
            transform: `translateX(${(3 - layer) * 20}px) translateY(${(3 - layer) * 20}px)`,
            zIndex: layer,
          }}
        >
          <div className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-sm font-medium`}>
            {4 - layer}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SpaceVisual() {
  return (
    <div className="flex items-center justify-center h-64 perspective-1000">
      <div className="relative w-64 h-64">
        {/* 3D Box representation */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 0.2 + (i * 0.2),
              scale: 0.6 + (i * 0.1),
            }}
            transition={{ 
              delay: i * 0.15,
              duration: 0.8,
              type: "spring"
            }}
            className="absolute inset-0 border-2 border-amber-500 rounded-lg"
            style={{
              transform: `translateZ(${i * 20}px)`,
            }}
          />
        ))}
        {/* Center glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-xl opacity-50" />
        </motion.div>
      </div>
    </div>
  );
}

function MeaningVisual() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative">
        {/* Central idea */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl"
        >
          <Lightbulb className="w-10 h-10 text-white" />
        </motion.div>

        {/* Radiating connections */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <motion.div
            key={angle}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
            className="absolute top-1/2 left-1/2 w-px h-16 bg-gradient-to-t from-amber-500 to-transparent origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${angle}deg)`,
            }}
          />
        ))}

        {/* Outer dots */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const x = Math.cos((angle * Math.PI) / 180) * 100;
          const y = Math.sin((angle * Math.PI) / 180) * 100;
          return (
            <motion.div
              key={angle}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
              className="absolute w-3 h-3 bg-amber-400 rounded-full"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
