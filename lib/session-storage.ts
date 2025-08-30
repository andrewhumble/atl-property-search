import { FilterValues } from "@/types";

const FILTER_STORAGE_KEY = "atl-property-search-filters";

/**
 * Save filter values to session storage
 */
export function saveFilterValues(filterValues: FilterValues): void {
  try {
    sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filterValues));
  } catch (error) {
    console.warn("Failed to save filter values to session storage:", error);
  }
}

/**
 * Load filter values from session storage
 */
export function loadFilterValues(): FilterValues | null {
  try {
    const stored = sessionStorage.getItem(FILTER_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Basic validation that it's an object
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as FilterValues;
      }
    }
  } catch (error) {
    console.warn("Failed to load filter values from session storage:", error);
  }
  return null;
}

/**
 * Clear filter values from session storage
 */
export function clearFilterValues(): void {
  try {
    sessionStorage.removeItem(FILTER_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear filter values from session storage:", error);
  }
}

/**
 * Check if there are stored filter values
 */
export function hasStoredFilterValues(): boolean {
  try {
    return sessionStorage.getItem(FILTER_STORAGE_KEY) !== null;
  } catch (error) {
    return false;
  }
}
