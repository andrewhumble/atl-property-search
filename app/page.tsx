"use client";

import { useCallback, useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import MapContainer from "@/components/map-container";
import { FilterValues, PropertyFeature } from "@/types";
import Navbar from "@/components/navbar";
import { searchProperties } from "@/lib/search-utils";
import FilterSideBar from "@/components/filter-side-bar";
import { AnimatePresence, motion } from "framer-motion";
import { filters, advancedFilters } from "@/lib/constants";

export default function Home() {
  const [initialFeatures, setInitialFeatures] = useState<PropertyFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  
  // Initialize filter values to their default values
  const [filterValues, setFilterValues] = useState<FilterValues>(
    [...filters, ...advancedFilters].reduce((acc, filter) => {
      if (filter.type === "range") {
        const defaultValue = filter.defaultValue as [number | null, number | null];
        acc[filter.key] = [defaultValue[0] ?? null, defaultValue[1] ?? null];
      } else if (filter.type === "slider") {
        const defaultValue = filter.defaultValue as [number, number];
        acc[filter.key] = defaultValue;
      } else {
        acc[filter.key] = filter.defaultValue as number;
      }
      return acc;
    }, {} as FilterValues)
  );
  const [hasNonDefaultFilters, setHasNonDefaultFilters] = useState(false);

  const handleSearch = useCallback(async (filters: FilterValues) => {
    setLoading(true);
    const features = await searchProperties(filters);
    setInitialFeatures(features);
    setLoading(false);
  }, []);

  const handleFilterChange = useCallback((filterKey: string, newValue: number | (number | null)[]) => {
    setFilterValues(prev => ({ ...prev, [filterKey]: newValue }));
    setHasNonDefaultFilters(true);
  }, []);

  const clearAllFilters = useCallback(() => {
    [...filters, ...advancedFilters].forEach(filter => {
      if (filter.type === "range") {
        const defaultValues = filter.defaultValue as number[];
        setFilterValues(prev => ({ ...prev, [filter.key]: defaultValues }));
      } else if (filter.type === "slider") {
        const defaultValues = filter.defaultValue as [number, number];
        setFilterValues(prev => ({ ...prev, [filter.key]: defaultValues }));
      } else if (filter.type === "selection") {
        setFilterValues(prev => ({ ...prev, [filter.key]: filter.defaultValue }));
      }
    });
    setHasNonDefaultFilters(false);
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
      <div className="flex flex-1 px-12">
        <MapContainer 
          initialFeatures={initialFeatures} 
          onToggle={() => setIsSideBarOpen(!isSideBarOpen)}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          hasNonDefaultFilters={hasNonDefaultFilters}
          onClearFilters={clearAllFilters}
          onSearch={handleSearch}
        />
      </div>
    </div>
  );
}
