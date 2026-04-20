/**
 * ARGENTUM Flatten Mode
 * Reduces all complexity to single visible state
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface FlattenModeProps {
  onClose: () => void;
}

export function FlattenMode({ onClose }: FlattenModeProps) {
  const [isFlattened, setIsFlattened] = useState(false);

  const handleFlatten = () => {
    setIsFlattened(true);
  };

  const handleExpand = () => {
    setIsFlattened(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700"
      >
        {/* Header */}
        <div className="border-b border-gray-700 p-6 flex items-center justify-between bg-gray-900">
          <div>
            <h2 className="text-2xl font-light text-gray-200">Flatten Mode</h2>
            <p className="text-sm text-gray-400 mt-1">
              All complexity reduced to single visible state
            </p>
          </div>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-8">
          {!isFlattened ? (
            <div className="text-center">
              <p className="text-gray-300 mb-8">
                Remove all depth. Collapse all states into one.
              </p>

              {/* Visual: Multiple layers collapsing */}
              <div className="relative h-64 mb-8 flex items-center justify-center">
                {[3, 2, 1].map((layer) => (
                  <motion.div
                    key={layer}
                    initial={{ opacity: 0.8 - (layer * 0.2) }}
                    animate={{ 
                      opacity: 0.8 - (layer * 0.2),
                      x: (3 - layer) * 30,
                      y: (3 - layer) * 30,
                    }}
                    className="absolute w-48 h-64 bg-gray-700 border-2 border-gray-600 rounded"
                  />
                ))}
              </div>

              <Button
                onClick={handleFlatten}
                className="bg-gray-600 hover:bg-gray-500 text-white"
              >
                <Minimize2 className="w-4 h-4 mr-2" />
                Flatten to Single State
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Visual: Single flat surface */}
                <div className="relative h-64 mb-8 flex items-center justify-center">
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.6 }}
                    className="w-64 h-2 bg-gray-600 rounded shadow-xl"
                  />
                </div>

                <h3 className="text-xl text-gray-200 mb-2">Flattened</h3>
                <p className="text-gray-400 mb-6">
                  No depth. No hidden layers. Only surface.
                </p>

                <Button
                  onClick={handleExpand}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Restore View
                </Button>
              </motion.div>
            </div>
          )}

          {/* Philosophy */}
          <div className="mt-8 p-4 bg-gray-900 border border-gray-700 rounded">
            <p className="text-xs text-gray-400 italic text-center">
              "All complexity is reduced to a single visible state. No depth, no hidden layers, no stacking logic."
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
