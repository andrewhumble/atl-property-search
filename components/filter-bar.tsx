import React, { useCallback, useState } from "react";
import FilterItem from "@/components/filter-item";
import { Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { filters } from "@/lib/constants";
import { FilterValues, FilterValue } from "@/types";
import { SlidersHorizontalIcon } from "lucide-react";
import TargetSearch from "@/components/target-search";
import { Loader2 } from "lucide-react";

interface FilterBarProps {
  onSearch: (filters: FilterValues) => void;
  onToggle: () => void;
  filterValues: FilterValues;
  onFilterChange: (filterKey: string, newValue: number | (number | null)[]) => void;
  hasNonDefaultFilters: boolean;
  onClearFilters: () => void;
  isLoading: boolean;
}

export default function FilterBar({
  onSearch,
  onToggle,
  filterValues,
  onFilterChange,
  hasNonDefaultFilters,
  onClearFilters,
  isLoading
}: FilterBarProps) {
  const handleSearch = useCallback(() => {
    const searchFilters: FilterValues = {};

    // Collect current values from all filter components
    filters.forEach(filter => {
      const value = filterValues[filter.key];

      // Only include filters that have actual values (not undefined)
      if (value !== undefined) {
        if (Array.isArray(value)) {
          if (filter.type === "range") {
            // For range filters, check if at least one value is set
            const [min, max] = value as (number | null)[];
            if (min !== null || max !== null) {
              searchFilters[filter.key] = value;
            }
          } else if (filter.type === "slider") {
            // For slider filters, check if values are not at extremes
            const [min, max] = value as [number, number];
            if (min !== filter.min || max !== filter.max) {
              searchFilters[filter.key] = value;
            }
          }
        } else {
          // For selection filters, only include if value is defined and not 0 (default)
          if (value !== 0) {
            searchFilters[filter.key] = value;
          }
        }
      }
    });
    onSearch(searchFilters);
  }, [filterValues, onSearch]);

  const openSideBar = useCallback(() => {
    onToggle();
  }, [onToggle]);

  return (
    <div className="w-full bg-primary rounded-2xl flex flex-col gap-4 md:pr-4 z-10 h-full">
      {/* Search at top */}
      <TargetSearch onSearch={onSearch} />

      <div className="border-t border-gray-200 my-2 hidden md:block" />

      {/* Filters expand + scroll */}
      <div className="hidden md:flex flex-col gap-4 flex-grow overflow-y-auto min-h-0">
        <div className="flex flex-col gap-4">
          {filters.map((filter) => (
            <div className="w-full" key={filter.key}>
              <FilterItem
                filter={filter}
                value={filterValues[filter.key] as FilterValue}
                onChange={(newValue: number | (number | null)[]) => {
                  onFilterChange(filter.key, newValue);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sticky action buttons at bottom */}
      <div className="hidden md:flex flex-col gap-3 mt-auto">
        <Button
          className="w-full"
          variant="outlined"
          color={`${hasNonDefaultFilters ? "danger" : "default"}`}
          disabled={!hasNonDefaultFilters}
          onClick={onClearFilters}
        >
          <CloseOutlined />
          <span className="ml-1">Clear</span>
        </Button>
        <Button
          className="w-full"
          variant="solid"
          color="primary"
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Apply"}
        </Button>
      </div>

      {/* Mobile filter bar */}
      <div className="flex md:hidden mb-4">
        <Button
          color="primary"
          variant="filled"
          className="flex items-center justify-center w-full"
          onClick={openSideBar}
        >
          <SlidersHorizontalIcon size={16} />
          Filters
        </Button>
      </div>
    </div>
  );
}
