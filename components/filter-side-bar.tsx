import { motion } from "framer-motion";
import { XIcon } from "lucide-react";
import FilterItem from "./filter-item";
import { filters } from "@/lib/constants";
import { FilterValues, FilterValue } from "@/types";
import { CloseOutlined } from "@ant-design/icons";
import { Button } from "antd";

interface FilterSideBarProps {
    onToggle: (isOpen: boolean) => void;
    filterValues: FilterValues;
    onFilterChange: (filterKey: string, newValue: number | (number | null)[]) => void;
    hasNonDefaultFilters: boolean;
    onClearFilters: () => void;
    onSearch: (filters: FilterValues) => void;
}

export default function FilterSideBar({
    onToggle,
    filterValues,
    onFilterChange,
    hasNonDefaultFilters,
    onClearFilters,
    onSearch
}: FilterSideBarProps) {
    return (
        <motion.div
            className="absolute top-0 left-0 w-full h-full bg-white z-50 shadow-lg"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
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
            <div className="p-8 py-16 flex flex-col gap-4 h-full justify-between">
                <div className="flex flex-col gap-6">
                    <h2 className="text-xl font-bold pb-4">Filters</h2>
                    {filters.map((filter) => (
                        <FilterItem
                            key={filter.key}
                            filter={filter}
                            value={filterValues[filter.key] as FilterValue}
                            onChange={(newValue: number | (number | null)[]) => {
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