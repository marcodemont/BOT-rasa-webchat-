/**
 * Analytics & Tracking Utilities
 * Simple event tracking system
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private enabled: boolean = true;

  /**
   * Track a page view
   */
  trackPageView(pageName: string, properties?: Record<string, any>) {
    this.track('page_view', {
      page: pageName,
      ...properties,
    });
  }

  /**
   * Track an action/event
   */
  trackAction(actionName: string, properties?: Record<string, any>) {
    this.track('action', {
      action: actionName,
      ...properties,
    });
  }

  /**
   * Track generic event
   */
  track(eventName: string, properties?: Record<string, any>) {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event);
    }

    // In production, you could send to analytics service
    // Example: sendToAnalyticsService(event);
  }

  /**
   * Get all tracked events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Clear all events
   */
  clearEvents() {
    this.events = [];
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

// Singleton instance
export const analytics = new Analytics();

/**
 * Track system-specific usage
 */
export const trackSystemUsage = {
  systemSelected(system: 'aurum' | 'argentum') {
    analytics.trackAction('system_selected', { system });
  },

  featureUsed(feature: string, system: 'aurum' | 'argentum') {
    analytics.trackAction('feature_used', { feature, system });
  },

  sheetCreated(system: 'aurum' | 'argentum') {
    analytics.trackAction('sheet_created', { system });
  },

  layerAdded(type: string, system: 'aurum' | 'argentum') {
    analytics.trackAction('layer_added', { type, system });
  },

  sheetArchived(system: 'aurum' | 'argentum') {
    analytics.trackAction('sheet_archived', { system });
  },

  sheetDeleted(system: 'aurum' | 'argentum') {
    analytics.trackAction('sheet_deleted', { system });
  },

  // ARGENTUM specific tracking
  surfaceSaved(contentLength: number, wordCount: number) {
    analytics.trackAction('surface_saved', { contentLength, wordCount, system: 'argentum' });
  },

  surfaceExported(format: string) {
    analytics.trackAction('surface_exported', { format, system: 'argentum' });
  },

  surfaceLocked(isLocked: boolean) {
    analytics.trackAction('surface_locked', { isLocked, system: 'argentum' });
  },

  surfaceCleared() {
    analytics.trackAction('surface_cleared', { system: 'argentum' });
  },
};