import { Filter } from "@/types";
import RangeFilter from "@/components/filter-types/range-filter";
import MultiSelectFilter from "@/components/filter-types/multi-select-filter";
import SliderFilter from "@/components/filter-types/slider-filter";
import { useState, useEffect, useCallback } from "react";
import { Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { FilterValue } from "@/types";
// Helper function to format appraised value
const formatAppraisedValue = (value: number): string => {
  const rounded = Math.round(value / 1000);
  return rounded >= 1000 ? `${Math.round(rounded / 1000)}M` : `${rounded}k`;
};

// Helper function to get display text for range filters
const getRangeDisplayText = (filter: Filter, value: (number | null)[]): string => {
  const [min, max] = value;
  
  // Both values are null or undefined
  if ((min === null || min === undefined) && (max === null || max === undefined)) {
    return "Any";
  }
  
  // Both values are set
  if (min !== null && min !== undefined && max !== null && max !== undefined) {
    const formatter = filter.label === 'Appraised Value' ? formatAppraisedValue : (val: number) => val.toString();
    return `${formatter(min)} - ${formatter(max)}`;
  }
  
  // Only min is set
  if (min !== null && min !== undefined) {
    const formatter = filter.label === 'Appraised Value' 
      ? (val: number) => `${formatAppraisedValue(val)}+`
      : (val: number) => `${val}+`;
    return formatter(min);
  }
  
  // Only max is set
  if (max !== null && max !== undefined) {
    const formatter = filter.label === 'Appraised Value'
      ? (val: number) => `${formatAppraisedValue(val)}-`
      : (val: number) => `${val}-`;
    return formatter(max);
  }
  
  return "Any";
};

// Helper function to get display text for slider filters
const getSliderDisplayText = (filter: Extract<Filter, { type: "slider" }>, value: [number, number]): string => {
  const [min, max] = value;
  
  // Check if values are at the extremes (default state)
  if (min === filter.min && max === filter.max) {
    return "Any";
  }
  
  // Both values are set
  if (min !== filter.min || max !== filter.max) {
    return `${min} - ${max}`;
  }
  
  return "Any";
};

// Helper function to get display text for selection filters
const getSelectionDisplayText = (filter: Extract<Filter, { type: "selection" }>, value: number): string => {
  if (value === undefined) {
    return "Any";
  }
  
  const option = filter.options.find(opt => opt.value === value);
  return option ? option.label : "Any";
};

export default function FilterItem({
    filter,
    value,
    onChange
}: {
    filter: Filter,
    value: FilterValue,
    onChange?: (newValue: FilterValue) => void
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [displayText, setDisplayText] = useState("Any");

    // Update display text when filter values change
    useEffect(() => {
        const updateDisplayText = () => {
            if (filter.type === "range") {
                const rangeValue = value as (number | null)[];
                setDisplayText(getRangeDisplayText(filter, rangeValue));
            } else if (filter.type === "slider") {
                const sliderValue = value as [number, number];
                setDisplayText(getSliderDisplayText(filter, sliderValue));
            } else if (filter.type === "selection") {
                const selectionValue = value as number;
                setDisplayText(getSelectionDisplayText(filter, selectionValue));
            }
        };

        updateDisplayText();
        const interval = setInterval(updateDisplayText, 100);

        return () => clearInterval(interval);
    }, [value, filter]);

    const handleSelectionChange = useCallback((newValue: number) => {
        onChange?.(newValue);
    }, [onChange]);

    const handleMinChange = useCallback((newValue: number | null) => {
        if (newValue === null) {
            return;
        }
        const values = value as (number | null)[];
        const updatedValues: (number | null)[] = [newValue, values[1]];
        onChange?.(updatedValues);
    }, [value, onChange]);

    const handleMaxChange = useCallback((newValue: number | null) => {
        if (newValue === null) {
            return;
        }
        const values = value as (number | null)[];
        const updatedValues: (number | null)[] = [values[0], newValue];
        onChange?.(updatedValues);
    }, [value, onChange]);

    const handleSliderMinChange = useCallback((newValue: number) => {
        const values = value as [number, number];
        const updatedValues: [number, number] = [newValue, values[1]];
        onChange?.(updatedValues);
    }, [value, onChange]);

    const handleSliderMaxChange = useCallback((newValue: number) => {
        const values = value as [number, number];
        const updatedValues: [number, number] = [values[0], newValue];
        onChange?.(updatedValues);
    }, [value, onChange]);

    const dropdownContent = (
        <div className="bg-white p-4 rounded-lg shadow-lg min-w-64">
            <div className="text-sm font-medium text-gray-900 mb-3">{filter.label}</div>
            {filter.type === "range" && (
                <RangeFilter
                    name={filter.label}
                    min={filter.min}
                    max={filter.max}
                    value={value as (number | null)[]}
                    onMinChange={handleMinChange}
                    onMaxChange={handleMaxChange}
                />
            )}
            {filter.type === "slider" && (
                <SliderFilter
                    name={filter.label}
                    min={filter.min}
                    max={filter.max}
                    value={value as [number, number]}
                    onMinChange={handleSliderMinChange}
                    onMaxChange={handleSliderMaxChange}
                />
            )}
            {filter.type === "selection" && (
                <MultiSelectFilter
                    options={filter.options}
                    value={value as number}
                    onChange={handleSelectionChange}
                />
            )}
        </div>
    );

    const isDefault = (filter: Filter, value: FilterValue) => {
        if (filter.type === "range") {
            const values = value as (number | null)[];
            return values.every((val, index) => val === filter.defaultValue[index]);
        }
        return value === filter.defaultValue;
    }

    return (
        <div className="flex flex-col">
            <span className="text-xs mb-1">{filter.label}</span>
            <Dropdown
                overlay={dropdownContent}
                trigger={['click']}
                open={isOpen}
                onOpenChange={setIsOpen}
                placement="bottomLeft"
            >
                <div className="border-b-1 border-gray-300">
                    <Button
                        className="flex items-center justify-between w-full text-gray-700 hover:text-gray-800 rounded-none"
                        variant={`${isDefault(filter, value) ? "text" : "filled"}`}
                        color={`${isDefault(filter, value) ? "default" : "primary"}`}
                        style={{ borderRadius: "0" }}
                    >
                        <span className="flex-1 text-left">{displayText}</span>
                        <DownOutlined className="ml-auto" />
                    </Button>
                </div>
            </Dropdown>
        </div>
    );
}
