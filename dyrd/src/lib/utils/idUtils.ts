/**
 * Utility functions for ID generation and manipulation
 */

/**
 * Generates a unique ID with an optional prefix
 * 
 * @param prefix Optional prefix for the ID (e.g., 'job', 'truck', 'sched')
 * @returns A string ID with format: prefix-randomString or randomString if no prefix
 */
export function generateId(prefix?: string): string {
  const randomPart = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
  
  const timestamp = Date.now().toString(36);
  
  return prefix ? `${prefix}-${timestamp}-${randomPart}` : `${timestamp}-${randomPart}`;
}

/**
 * Simpler ID generation using a counter
 * This is primarily for mock data and testing
 * 
 * @param prefix Prefix for the ID (e.g., 'job', 'truck', 'sched')
 * @param counter Counter number to append
 * @returns A string ID with format: prefix-counter (padded to 3 digits)
 */
export function generateSimpleId(prefix: string, counter: number): string {
  return `${prefix}-${counter.toString().padStart(3, '0')}`;
} 