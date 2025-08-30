"use client";

import { useCallback, useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import MapContainer from "@/components/map-container";
import { FilterValues, FilterValue, PropertyFeature } from "@/types";
import Navbar from "@/components/navbar";
import { searchProperties } from "@/lib/search-utils";
import FilterSideBar from "@/components/filter-side-bar";
import { AnimatePresence, motion } from "framer-motion";
import { filters } from "@/lib/constants";
import { getFilterComponent } from "@/lib/filter-registry";
import { loadFilterValues, saveFilterValues, clearFilterValues } from "@/lib/session-storage";

export default function Home() {
  const [initialFeatures, setInitialFeatures] = useState<PropertyFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [hasNonDefaultFilters, setHasNonDefaultFilters] = useState(false);
  const [hasMoreFilters, setHasMoreFilters] = useState(false);
  
  // Initialize filter values from session storage or defaults
  const [filterValues, setFilterValues] = useState<FilterValues>(() => {
    // Try to load from session storage first
    const storedValues = loadFilterValues();
    if (storedValues) {
      return storedValues;
    }
    
    // Fall back to default values
    return filters.reduce((acc, filter) => {
      acc[filter.key] = filter.defaultValue;
      return acc;
    }, {} as FilterValues);
  });
  
  // Save filter values to session storage whenever they change
  useEffect(() => {
    saveFilterValues(filterValues);
  }, [filterValues]);

  const handleSearch = useCallback(async (filters: FilterValues) => {
    setLoading(true);
    const features = await searchProperties(filters);
    setInitialFeatures(features);
    setLoading(false);
  }, []);

  const handleFilterChange = useCallback((filterKey: string, newValue: FilterValue) => {
    setFilterValues(prev => ({ ...prev, [filterKey]: newValue }));
  }, []);

  // Update hasNonDefaultFilters whenever filterValues change
  useEffect(() => {
    const hasNonDefault = filters.some(filter => {
      const value = filterValues[filter.key];
      const factory = getFilterComponent(filter.type);
      return factory && !factory.isDefault(filter, value as any);
    });
    setHasNonDefaultFilters(hasNonDefault);

    const hasNonDefaultMore = filters.slice(4).some(filter => {
      const value = filterValues[filter.key];
      const factory = getFilterComponent(filter.type);
      return factory && !factory.isDefault(filter, value as any);
    });
    setHasMoreFilters(hasNonDefaultMore);
  }, [filterValues]);

  const clearAllFilters = useCallback(() => {
    const clearedValues = filters.reduce((acc, filter) => {
      acc[filter.key] = filter.defaultValue;
      return acc;
    }, {} as FilterValues);
    setFilterValues(clearedValues);
    // Also clear from session storage
    clearFilterValues();
  }, []);

  return (
    <div className={`flex flex-col flex-1 h-full w-full ${isSideBarOpen ? 'bg-dimmed' : ''}`}>
      <AnimatePresence>
        {isSideBarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSideBarOpen(false)}
            />
            <FilterSideBar 
              onToggle={setIsSideBarOpen} 
              filterValues={filterValues}
              onFilterChange={handleFilterChange}
              hasNonDefaultFilters={hasNonDefaultFilters}
              onClearFilters={clearAllFilters}
              onSearch={handleSearch}
            />
          </>
        )}
      </AnimatePresence>
      <Navbar onSearch={handleSearch} />
      <div className="flex flex-1">
        <MapContainer 
          initialFeatures={initialFeatures} 
          onToggle={() => setIsSideBarOpen(!isSideBarOpen)}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          hasNonDefaultFilters={hasNonDefaultFilters}
          hasMoreFilters={hasMoreFilters}
          onClearFilters={clearAllFilters}
          onSearch={handleSearch}
        />
      </div>
    </div>
  );
}
