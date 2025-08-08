import React, { useCallback, useState, useEffect, useRef } from "react";
import FilterItem from "@/components/filter-item";
import { Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { filters } from "@/lib/constants";
import { FilterValues, FilterValue } from "@/types";
import { SlidersHorizontalIcon } from "lucide-react";
import TargetSearch from "@/components/target-search";
import { Loader2, ChevronDown } from "lucide-react";

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
  const [showDownArrow, setShowDownArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Check scroll position and show/hide arrow
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px tolerance
        setShowDownArrow(!isAtBottom && scrollHeight > clientHeight);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Check initial state
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [filterValues]); // Re-check when filters change

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full bg-primary rounded-2xl flex flex-col gap-3 md:pr-4 z-10 h-full">
      {/* Search at top */}
      <TargetSearch onSearch={onSearch} />

      <div className="border-t border-gray-200 my-2 hidden md:block" />

      {/* Filters expand + scroll */}
      <div className="hidden md:flex flex-col 3 flex-grow relative">
        <div 
          ref={scrollContainerRef}
          className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-10rem)]"
        >
          <div className="flex flex-col gap-3">
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
        
        {/* Floating down arrow */}
        {/* {showDownArrow && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-gray-200 opacity-40 bg-gradient-to-b from-white to-gray-300 rounded-full p-2 shadow-lg border border-gray-200 cursor-pointer" onClick={scrollToBottom}>
            <ChevronDown className="w-4 h-4 text-gray-600" onClick={scrollToBottom} />
          </div>
        )} */}
      </div>

      {/* Sticky action buttons at bottom */}
      <div className="hidden md:flex gap-3 mt-auto">
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
