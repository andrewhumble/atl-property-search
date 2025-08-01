import React, { useCallback, useState } from "react";
import FilterItem from "@/components/filter-item";
import { Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { filters } from "@/lib/constants";
import { FilterValues, FilterValue } from "@/types";
import { SlidersHorizontalIcon } from "lucide-react";

interface FilterBarProps {
  onSearch: (filters: FilterValues) => void;
  onToggle: () => void;
  filterValues: FilterValues;
  onFilterChange: (filterKey: string, newValue: number | (number | null)[]) => void;
  hasNonDefaultFilters: boolean;
  onClearFilters: () => void;
}

export default function FilterBar({
  onSearch,
  onToggle,
  filterValues,
  onFilterChange,
  hasNonDefaultFilters,
  onClearFilters
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
    <div className="w-full h-fit bg-primary rounded-2xl flex items-end mb-4 z-10 justify-between">
      <div className="flex-1 flex gap-3 px-2 items-end max-w-200">
        {filters.map((filter) => (
          <div className="flex-1" key={filter.key}>
            <FilterItem
              filter={filter}
              value={filterValues[filter.key] as FilterValue}
              onChange={(newValue: number | (number | null)[]) => {
                onFilterChange(filter.key, newValue);
              }}
            />
          </div>
        ))}
        <Button color="primary" variant="filled" className="flex flex-1 items-center max-w-32" onClick={openSideBar}>
          <SlidersHorizontalIcon size={16} />
          More Filters
        </Button>
      </div>
      <div className="flex flex-1 justify-end gap-3">
        <Button
          className="flex-1 max-w-24"
          variant="outlined"
          color={`${hasNonDefaultFilters ? "danger" : "default"}`}
          disabled={!hasNonDefaultFilters}
          onClick={onClearFilters}
        >
          <CloseOutlined />
          Clear
        </Button>
        <Button className="flex-1 max-w-40" variant="solid" color="primary" onClick={handleSearch}>Search</Button>
      </div>
    </div>
  );
}
