/**
 * AI Assistants System - Main Export
 * Centralized export for LYNA, AURA, and JOI
 */

// Main LYNA Component (Floating Chat with Admin Access)
export { FloatingLYNA } from './LYNA/FloatingLYNA';

// LYNA Analytics Dashboard
export { LynaAnalytics } from './LYNA/LynaAnalytics';

// System Context
export { SystemProvider, useSystem } from './SystemContext';
export { SystemToggle } from './SystemToggle';

// Export Types
export type { Message, LYNARequest, LYNAResponse } from './LYNA/types';
