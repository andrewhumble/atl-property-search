import { Filter, FilterValue } from "@/types";

// Filter component factory type
export type FilterComponentFactory = {
    component: React.ComponentType<any>;
    getDisplayText: (filter: Filter, value: FilterValue) => string;
    isDefault: (filter: Filter, value: FilterValue) => boolean;
    getProps: (filter: Filter, value: FilterValue, onChange: (newValue: FilterValue) => void) => any;
};

// Filter component registry
const filterComponents = new Map<string, FilterComponentFactory>();

// Register filter components
export function registerFilterComponent(
    type: string,
    factory: FilterComponentFactory
) {
    filterComponents.set(type, factory);
}

// Get filter component factory
export function getFilterComponent(type: string): FilterComponentFactory | undefined {
    return filterComponents.get(type);
}

// Check if filter components are loaded
export function areFilterComponentsLoaded(): boolean {
    return filterComponents.size > 0;
}

// Lazy load and register filter components
export function loadFilterComponents(): Promise<void> {
    if (filterComponents.size > 0) {
        return Promise.resolve();
    }

    const loadPromises = [
        // Load range filter
        import("@/components/filter-types/range-filter").then(({ default: RangeFilter, getRangeDisplayText }) => {
            registerFilterComponent("range", {
                component: RangeFilter,
                getDisplayText: (filter, value) => {
                    if (filter.type === "range") {
                        return getRangeDisplayText(filter.key, value as (number | null)[], filter.units);
                    }
                    return "Any";
                },
                isDefault: (filter, value) => {
                    if (filter.type === "range") {
                        const values = value as (number | null)[];
                        return values.every((val, index) => val === filter.defaultValue[index]);
                    }
                    return false;
                },
                getProps: (filter, value, onChange) => {
                    if (filter.type === "range") {
                        return {
                            name: filter.label,
                            min: filter.min,
                            max: filter.max,
                            value: value as (number | null)[],
                            onMinChange: (newValue: number | null) => {
                                const values = value as (number | null)[];
                                const currentMax = values[1];
                                
                                // If new min value is greater than or equal to current max, set to null
                                if (newValue !== null && currentMax !== null && newValue >= currentMax) {
                                    onChange([null, currentMax]);
                                    return;
                                }
                                
                                const updatedValues: (number | null)[] = [newValue, currentMax];
                                onChange(updatedValues);
                            },
                            onMaxChange: (newValue: number | null) => {
                                const values = value as (number | null)[];
                                const currentMin = values[0];
                                
                                // If new max value is less than or equal to current min, set to null
                                if (newValue !== null && currentMin !== null && newValue <= currentMin) {
                                    onChange([currentMin, null]);
                                    return;
                                }
                                
                                const updatedValues: (number | null)[] = [currentMin, newValue];
                                onChange(updatedValues);
                            }
                        };
                    }
                    return {};
                }
            });
        }),

        // Load slider filter
        import("@/components/filter-types/slider-filter").then(({ default: SliderFilter, getSliderDisplayText }) => {
            registerFilterComponent("slider", {
                component: SliderFilter,
                getDisplayText: (filter, value) => {
                    if (filter.type === "slider") {
                        return getSliderDisplayText(filter.min, filter.max, value as [number, number], filter.units);
                    }
                    return "Any";
                },
                isDefault: (filter, value) => {
                    if (filter.type === "slider") {
                        const values = value as [number, number];
                        return values[0] === filter.defaultValue[0] && values[1] === filter.defaultValue[1];
                    }
                    return false;
                },
                getProps: (filter, value, onChange) => {
                    if (filter.type === "slider") {
                        return {
                            name: filter.label,
                            min: filter.min,
                            max: filter.max,
                            value: value as [number, number],
                            onChange: (newValue: [number, number]) => onChange(newValue)
                        };
                    }
                    return {};
                }
            });
        }),

        // Load selection filter
        import("@/components/filter-types/multi-select-filter").then(({ default: MultiSelectFilter, getSelectionDisplayText }) => {
            registerFilterComponent("selection", {
                component: MultiSelectFilter,
                getDisplayText: (filter, value) => {
                    if (filter.type === "selection") {
                        return getSelectionDisplayText(filter.options, value as number, filter.units);
                    }
                    return "Any";
                },
                isDefault: (filter, value) => {
                    if (filter.type === "selection") {
                        return value === filter.defaultValue;
                    }
                    return false;
                },
                getProps: (filter, value, onChange) => {
                    if (filter.type === "selection") {
                        return {
                            options: filter.options,
                            value: value as number,
                            onChange: (newValue: number) => onChange(newValue)
                        };
                    }
                    return {};
                }
            });
        }),

        // Load checkbox filter (example of adding a new filter type)
        import("@/components/filter-types/checkbox-filter").then(({ default: CheckboxFilter, getCheckboxDisplayText }) => {
            registerFilterComponent("checkbox", {
                component: CheckboxFilter,
                getDisplayText: (filter, value) => {
                    if (filter.type === "checkbox") {
                        return getCheckboxDisplayText(filter.options, value as string[]);
                    }
                    return "Any";
                },
                isDefault: (filter, value) => {
                    if (filter.type === "checkbox") {
                        const values = value as string[];
                        return !values || values.length === 0;
                    }
                    return false;
                },
                getProps: (filter, value, onChange) => {
                    if (filter.type === "checkbox") {
                        return {
                            options: filter.options,
                            value: value as string[],
                            onChange: (newValue: string[]) => onChange(newValue)
                        };
                    }
                    return {};
                }
            });
        })
    ];

    return Promise.all(loadPromises).then(() => {});
}
