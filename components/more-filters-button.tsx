import { Button, Dropdown } from "antd"
import { useEffect, useState } from "react"
import FilterItem from "./filter-item";
import { filters } from "@/lib/constants";
import { FilterValues } from "@/types";
import { FilterValue } from "@/types";
import { loadFilterComponents, getFilterComponent } from "@/lib/filter-registry";
import { SlidersHorizontalIcon } from "lucide-react";

export default function MoreFiltersButton({ filterValues, onFilterChange }: { filterValues: FilterValues, onFilterChange: (filterKey: string, newValue: FilterValue) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDefault, setIsDefault] = useState<boolean>(true);

    // Ensure filter components are available
    useEffect(() => {
        loadFilterComponents();
    }, []);

    // Recompute button default state based on additional filters (index >= 4)
    useEffect(() => {
        const computeIsDefault = () => {
            let allDefault = true;
            for (const filter of filters.slice(4)) {
                const factory = getFilterComponent(filter.type);
                if (!factory) {
                    continue;
                }

                const currentValue = filterValues[filter.key] as FilterValue | undefined;

                let valueToCheck: FilterValue;
                if (currentValue === undefined) {
                    if (filter.type === "range" || filter.type === "slider" || filter.type === "selection") {
                        valueToCheck = filter.defaultValue as unknown as FilterValue;
                    } else if (filter.type === "checkbox") {
                        valueToCheck = [] as unknown as FilterValue;
                    } else {
                        valueToCheck = currentValue as unknown as FilterValue;
                    }
                } else {
                    valueToCheck = currentValue;
                }

                if (!factory.isDefault(filter, valueToCheck)) {
                    allDefault = false;
                    break;
                }
            }
            setIsDefault(allDefault);
        };

        computeIsDefault();
        const interval = setInterval(computeIsDefault, 100);
        return () => clearInterval(interval);
    }, [filterValues]);

    const dropdownContent = (
        <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-lg flex flex-col gap-1">
            {filters.slice(4).map((filter) => (
                <FilterItem btnVariant="text" key={filter.key} filter={filter} value={filterValues[filter.key] as FilterValue} onChange={(newValue: FilterValue) => {
                    onFilterChange(filter.key, newValue);
                }} />
            ))}
        </div>
    );

    return (
        <div className="flex items-center justify-center w-36">
            <Dropdown
                overlay={dropdownContent}
                trigger={['click']}
                open={isOpen}
                onOpenChange={setIsOpen}
                placement="bottomLeft"
            >
                <Button
                    className="flex items-center justify-between w-full text-gray-700 rounded-lg"
                    variant="filled"
                    color={`${isDefault ? "default" : "primary"}`}
                >
                    <SlidersHorizontalIcon className="size-4" />
                    <span className="text-md">More Filters</span>
                </Button>
            </Dropdown>
        </div>
    )
}