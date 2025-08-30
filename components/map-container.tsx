import FilterBar from "@/components/filter-bar"
import { FilterValues, FilterValue, PropertyFeature } from "@/types"
import React, { useState, useCallback, useEffect, useMemo } from "react"
import dynamic from 'next/dynamic';
import { searchProperties } from "@/lib/search-utils";

// Use Google Maps instead of Leaflet
const MapView = dynamic(() => import('./google-map-view'), {
    ssr: false
});

interface MapContainerProps {
    initialFeatures: PropertyFeature[];
    onToggle: () => void;
    filterValues: FilterValues;
    onFilterChange: (filterKey: string, newValue: FilterValue) => void;
    hasNonDefaultFilters: boolean;
    hasMoreFilters: boolean;
    onClearFilters: () => void;
    onSearch: (filters: FilterValues) => void;
}

export default function MapContainer({
    initialFeatures,
    onToggle,
    filterValues,
    onFilterChange,
    hasNonDefaultFilters,
    hasMoreFilters,
    onClearFilters,
    onSearch
}: MapContainerProps) {
    const [features, setFeatures] = useState<PropertyFeature[]>(initialFeatures);
    const [loading, setLoading] = useState(false);
    const [shouldAutoOpenPopup, setShouldAutoOpenPopup] = useState(false);

    useEffect(() => {
        setFeatures(initialFeatures);
        if (initialFeatures.length === 1) {
            setShouldAutoOpenPopup(true);
        }
    }, [initialFeatures]);

    const handleSearch = useCallback(async (filters: FilterValues) => {
        setLoading(true);
        setFeatures([]);
        setShouldAutoOpenPopup(false);

        try {
            const newFeatures = await searchProperties(filters);
            setFeatures(newFeatures);
            setShouldAutoOpenPopup(newFeatures.length === 1);
        } catch (error) {
            console.error('Error fetching filtered properties:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Memoize the MapView component to prevent unnecessary re-renders
    const memoizedMapView = useMemo(() => (
        <MapView features={features} shouldAutoOpenPopup={shouldAutoOpenPopup} />
    ), [features, shouldAutoOpenPopup]);

    // Memoize the FilterBar component to prevent unnecessary re-renders
    const memoizedFilterBar = useMemo(() => (
        <FilterBar
            onSearch={handleSearch}
            onToggle={onToggle}
            filterValues={filterValues}
            onFilterChange={onFilterChange}
            hasNonDefaultFilters={hasNonDefaultFilters}
            hasMoreFilters={hasMoreFilters}
            onClearFilters={onClearFilters}
            isLoading={loading}
        />
    ), [handleSearch, onToggle, filterValues, onFilterChange, hasNonDefaultFilters, hasMoreFilters, onClearFilters, loading]);

    return (
        <div className="flex flex-col w-full">
            <div className="flex md:w-full bg-white mb-4">
                {memoizedFilterBar}
            </div>
            <div className="flex flex-1 h-full">
                {memoizedMapView}
            </div>
        </div>
    )
}