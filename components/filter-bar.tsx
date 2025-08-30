import React, { useCallback } from "react";
import FilterItem from "@/components/filter-item";
import { Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { filters } from "@/lib/constants";
import { FilterValues, FilterValue } from "@/types";
import { SlidersHorizontalIcon } from "lucide-react";
import TargetSearch from "@/components/target-search";
import { Loader2 } from "lucide-react";
import { getFilterComponent } from "@/lib/filter-registry";

interface FilterBarProps {
  onSearch: (filters: FilterValues) => void;
  onToggle: () => void;
  filterValues: FilterValues;
  onFilterChange: (filterKey: string, newValue: FilterValue) => void;
  hasNonDefaultFilters: boolean;
  hasMoreFilters: boolean;
  onClearFilters: () => void;
  isLoading: boolean;
}

export default function FilterBar({
  onSearch,
  onToggle,
  filterValues,
  onFilterChange,
  hasNonDefaultFilters,
  hasMoreFilters,
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
        const factory = getFilterComponent(filter.type);

        // Use the filter registry's isDefault function to determine if this filter should be included
        if (factory && !factory.isDefault(filter, value as FilterValue)) {
          searchFilters[filter.key] = value;
        }
      }
    });
    onSearch(searchFilters);
  }, [filterValues, onSearch]);

  const openSideBar = useCallback(() => {
    onToggle();
  }, [onToggle]);

  return (
    <div className="w-full bg-primary rounded-2xl px-4 flex flex-col md:flex-row gap-2 z-10 justify-between">
      {/* Filters and buttons that can wrap together */}
      <div className="flex flex-wrap gap-2 items-end">
        {/* Search at top */}
        <TargetSearch onSearch={onSearch} />
        {/* Filters section */}
        <div className="flex gap-2 flex-wrap">
          {filters.slice(0, 4).map((filter) => (
            <div key={filter.key}>
              <FilterItem
                filter={filter}
                value={filterValues[filter.key] as FilterValue}
                onChange={(newValue: FilterValue) => {
                  onFilterChange(filter.key, newValue);
                }}
              />
            </div>
          ))}
        </div>
        <Button
          variant="filled"
          color={`${hasMoreFilters ? "default" : "primary"}`}
          className="flex items-center justify-center w-36"
          onClick={openSideBar}
        >
          <SlidersHorizontalIcon size={16} />
          More Filters
        </Button>
      </div>
      {/* Action buttons */}
      <div className="flex gap-2 items-end flex-shrink-0">
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
    </div>
  );
}
