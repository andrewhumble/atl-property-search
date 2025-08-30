import { motion } from "framer-motion";
import { XIcon } from "lucide-react";
import FilterItem from "./filter-item";
import { filters } from "@/lib/constants";
import { FilterValues, FilterValue } from "@/types";
import { CloseOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useMemo } from "react";

interface FilterSideBarProps {
    onToggle: (isOpen: boolean) => void;
    filterValues: FilterValues;
    onFilterChange: (filterKey: string, newValue: FilterValue) => void;
    hasNonDefaultFilters: boolean;
    onClearFilters: () => void;
    onSearch: (filters: FilterValues) => void;
}

const MOBILE_BREAKPOINT = 768;

export default function FilterSideBar({
    onToggle,
    filterValues,
    onFilterChange,
    hasNonDefaultFilters,
    onClearFilters,
    onSearch
}: FilterSideBarProps) {

    const animationVariants = useMemo(() => {
        const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
        
        return {
            initial: {
                x: isMobile ? "0%" : "-100%",
                y: isMobile ? "-100%" : "0%"
            },
            animate: {
                x: "0%",
                y: "0%"
            },
            exit: {
                x: isMobile ? "0%" : "-100%",
                y: isMobile ? "-100%" : "0%"
            }
        };
    }, []);

    return (
        <motion.div
            className="absolute top-0 left-0 w-full md:w-1/3 h-3/4 sm:h-full bg-white z-50 shadow-lg"
            initial={animationVariants.initial}
            animate={animationVariants.animate}
            exit={animationVariants.exit}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
            }}
        >
            <button
                onClick={() => onToggle(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
                <XIcon className="w-4 h-4" />
            </button>
            <div className="p-8 py-16 flex flex-col h-full justify-between">
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold">More Filters</h2>
                    {filters.slice(4).map((filter) => (
                        <FilterItem
                            key={filter.key}
                            filter={filter}
                            value={filterValues[filter.key] as FilterValue}
                            onChange={(newValue: FilterValue) => {
                                onFilterChange(filter.key, newValue);
                            }}
                        />
                    ))}
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outlined"
                        color={`${hasNonDefaultFilters ? "danger" : "default"}`}
                        className=" w-full"
                        disabled={!hasNonDefaultFilters}
                        onClick={onClearFilters}
                    >
                        <CloseOutlined />
                        Clear
                    </Button>
                    <Button variant="solid" color="primary" className="w-full" onClick={() => onSearch(filterValues)}>Apply</Button>
                </div>
            </div>
        </motion.div>
    )
}