/**
 * AURUM Philosophy Footer
 * Displays core principles at the bottom of the interface
 */

import React from 'react';
import { ScrollText, Layers, Box, Lightbulb } from 'lucide-react';

export function PhilosophyFooter() {
  const principles = [
    {
      icon: ScrollText,
      number: "1",
      text: "A sheet is the beginning",
      color: "text-amber-600",
    },
    {
      icon: Layers,
      number: "2",
      text: "Multiple sheets form layers",
      color: "text-orange-600",
    },
    {
      icon: Box,
      number: "3",
      text: "Layers create space",
      color: "text-amber-700",
    },
    {
      icon: Lightbulb,
      number: "4",
      text: "Space creates meaning",
      color: "text-orange-700",
    },
  ];

  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* AURUM Vision */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-light text-gray-800 mb-2">AURUM</h3>
          <p className="text-sm text-gray-600 italic">
            A digital space where ideas can grow
          </p>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {principles.map((principle) => (
            <div
              key={principle.number}
              className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100"
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                {principle.number}
              </div>
              <div className="flex-1">
                <principle.icon className={`w-4 h-4 mb-1 ${principle.color}`} />
                <p className="text-sm text-gray-700 font-medium">
                  {principle.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Philosophy Quote */}
            <p className="text-xs text-gray-500 italic text-center md:text-left">
              "A single stroke can become an idea. Multiple layers can evolve into entire worlds."
            </p>

            {/* Objective */}
            <p className="text-xs text-gray-400 text-center md:text-right">
              Not just a note-taking tool — a digital space extended by depth, structure, and time
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}