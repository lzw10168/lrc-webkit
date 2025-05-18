import { track } from '@vercel/analytics';

// Analytics event names
export const AnalyticsEvents = {
  IMPORT_AUDIO: 'import_audio',
  IMPORT_LRC: 'import_lrc',
  EXPORT_LRC: 'export_lrc',
  ADD_TIMESTAMP: 'add_timestamp',
  ADJUST_TIMESTAMP: 'adjust_timestamp',
  COPY_TIMESTAMP: 'copy_timestamp',
  SWITCH_LANGUAGE: 'switch_language',
  TOGGLE_THEME: 'toggle_theme',
} as const;

type EventName = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];

interface EventProperties {
  [key: string]: string | number | boolean | null;
}

/**
 * Track an analytics event
 * @param eventName The name of the event to track
 * @param properties Additional properties to track with the event
 */
export function trackEvent(eventName: EventName, properties?: EventProperties) {
  track(eventName, properties);
}

/**
 * Example usage:
 * 
 * // Track audio import
 * trackEvent(AnalyticsEvents.IMPORT_AUDIO, { 
 *   fileCount: 3,
 *   fileType: 'mp3'
 * });
 * 
 * // Track LRC export
 * trackEvent(AnalyticsEvents.EXPORT_LRC, {
 *   lineCount: 50,
 *   hasTimestamps: true
 * });
 * 
 * // Track language switch
 * trackEvent(AnalyticsEvents.SWITCH_LANGUAGE, {
 *   from: 'en',
 *   to: 'zh'
 * });
 */
