/**
 * Accessibility Utilities
 * A11y helpers and components
 */

import React from 'react';

/**
 * Skip to content link for keyboard navigation
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only 
        focus:absolute focus:top-4 focus:left-4 
        focus:z-50 focus:px-4 focus:py-2 
        focus:bg-amber-500 focus:text-white 
        focus:rounded focus:shadow-lg
      "
    >
      Skip to main content
    </a>
  );
}

/**
 * Announce changes to screen readers
 */
export function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get appropriate animation duration based on user preference
 */
export function getAnimationDuration(defaultMs: number): number {
  return prefersReducedMotion() ? 0 : defaultMs;
}
