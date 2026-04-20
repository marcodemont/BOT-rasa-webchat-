/**
 * System Selector
 * Choose between AURUM (permanence) and ARGENTUM (impermanence)
 */

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Square, ArrowRight, Layers, Minimize2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { SkipToContent } from '../../utils/accessibility';
import { analytics, trackSystemUsage } from '../../utils/analytics';

interface SystemSelectorProps {
  onSelect: (system: 'aurum' | 'argentum') => void;
}

export function SystemSelector({ onSelect }: SystemSelectorProps) {
  // Track page view
  useEffect(() => {
    analytics.trackPageView('system_selector');
  }, []);

  const handleSelect = (system: 'aurum' | 'argentum') => {
    // Track selection
    trackSystemUsage.systemSelected(system);
    analytics.trackAction('system_selected', { system });
    
    onSelect(system);
  };

  return (
    <>
      <SkipToContent />
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 flex items-center justify-center p-4" id="main-content">
        <div className="max-w-6xl w-full">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-light text-gray-800 mb-4">
              Choose Your Philosophy
            </h1>
            <p className="text-lg text-gray-600">
              Two systems. Two worldviews. One platform.
            </p>
          </motion.div>

          {/* System Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AURUM Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <button
                onClick={() => handleSelect('aurum')}
                className="
                  w-full h-full p-8 
                  bg-gradient-to-br from-amber-50 via-orange-50 to-white
                  border-2 border-amber-200 rounded-2xl
                  hover:border-amber-400 hover:shadow-2xl
                  transition-all text-left
                "
                aria-label="Select AURUM system"
              >
                {/* Icon */}
                <div className="w-16 h-16 mb-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-3xl font-light text-gray-800 mb-4">AURUM</h2>

                {/* Tagline */}
                <p className="text-lg text-amber-700 mb-6 italic">
                  "Ideas grow through depth, structure, and time"
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Permanence:</strong> Nothing is lost. Everything is archived.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Layering:</strong> Ideas stack and evolve over time.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>History:</strong> Complete version tracking and restoration.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Features:</strong> Letter Mode, Fold Mode, Archive, Drawing & Sketch
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between pt-6 border-t border-amber-200">
                  <span className="text-sm text-gray-600">Warm, reflective, structured</span>
                  <ArrowRight className="w-5 h-5 text-amber-600 group-hover:translate-x-2 transition-transform" />
                </div>
              </button>
            </motion.div>

            {/* ARGENTUM Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <button
                onClick={() => handleSelect('argentum')}
                className="
                  w-full h-full p-8 
                  bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900
                  border-2 border-gray-600 rounded-2xl
                  hover:border-gray-500 hover:shadow-2xl
                  transition-all text-left
                "
                aria-label="Select ARGENTUM system"
              >
                {/* Icon */}
                <div className="w-16 h-16 mb-6 bg-gradient-to-br from-gray-600 to-gray-700 rounded-sm flex items-center justify-center">
                  <Square className="w-8 h-8 text-gray-300" />
                </div>

                {/* Title */}
                <h2 className="text-3xl font-light text-gray-200 mb-4">ARGENTUM</h2>

                {/* Tagline */}
                <p className="text-lg text-gray-400 mb-6 italic">
                  "Immediacy without long-term responsibility"
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-sm bg-gray-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-gray-300 text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      <strong>Impermanence:</strong> Content auto-expires. Deletion is final.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-sm bg-gray-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-gray-300 text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      <strong>Flat Structure:</strong> Single surface. No layers, no depth.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-sm bg-gray-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-gray-300 text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      <strong>No Archive:</strong> No version history. Present moment only.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-sm bg-gray-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-gray-300 text-xs">✓</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      <strong>Features:</strong> Instant Mode, Flatten Mode, Export-only
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-600">
                  <span className="text-sm text-gray-400">Cold, immediate, minimal</span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-2 transition-transform" />
                </div>
              </button>
            </motion.div>
          </div>

          {/* Philosophy Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 bg-white border border-gray-300 rounded-xl"
          >
            <h3 className="text-lg font-medium text-gray-800 mb-4 text-center">
              Philosophical Contrast
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-amber-600 mb-2">AURUM Philosophy</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Accumulation creates meaning</li>
                  <li>• Growth happens over time</li>
                  <li>• Structure preserves context</li>
                  <li>• Reflection requires history</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">ARGENTUM Philosophy</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Impermanence prevents burden</li>
                  <li>• Speed over contemplation</li>
                  <li>• Flat structure avoids complexity</li>
                  <li>• Present moment is sufficient</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}