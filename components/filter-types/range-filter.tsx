import { InputNumber } from "antd";
import { useCallback } from "react";

// Helper function to format appraised value
const formatAppraisedValue = (value: number): string => {
    if (value > 1000000) {
        const rounded = Math.round(value / 1000);
        return rounded >= 1000 ? `${Math.round(rounded / 1000)}M` : `${rounded}k`;
    } else {
        return value.toLocaleString();
    }
};

// Display text getter for range filters
export const getRangeDisplayText = (filterKey: string, value: (number | null)[]): string => {
    const [min, max] = value;

    // Both values are null or undefined
    if ((min === null || min === undefined) && (max === null || max === undefined)) {
        return "Any";
    }

    const formatter = filterKey === 'total_appraised_value' || filterKey === 'land_appraised_value'
        ? formatAppraisedValue
        : (val: number) => val.toString();

    // Both values are set
    if (min !== null && min !== undefined && max !== null && max !== undefined) {
        return `${formatter(min)} - ${formatter(max)}`;
    }

    // Only min is set
    if (min !== null && min !== undefined) {
        return `${formatAppraisedValue(min)}+`;
    }

    // Only max is set
    if (max !== null && max !== undefined) {
        return `up to ${formatAppraisedValue(max)}`;
    }

    return "Any";
};

export default function RangeFilter({ name, min, max, value, onMinChange, onMaxChange }: {
    name: string,
    min: number,
    max: number,
    value: (number | null)[],
    onMinChange: (newValue: number | null) => void,
    onMaxChange: (newValue: number | null) => void
}) {
    const getMinParser = useCallback(() => {
        return (value: string | undefined): number => {
            if (value === null || value === undefined || value === 'Any' || value === '') return 0;
            return Number(value)
        }
    }, [name]);

    const getMaxParser = useCallback(() => {
        return (value: string | undefined): number => {
            if (value === null || value === undefined || value === 'Any' || value === '') return 0;
            return Number(value)
        }
    }, [name]);

    const getFormatter = useCallback(() => {
        return (value: number | null | undefined | string) => {
            if (value === null || value === undefined || value === '' || value === '0') return '';
            return value.toString()
        }
    }, [name]);

    return (
        <div className="grid grid-cols-13 gap-1 items-center w-full">
            <div className="col-span-6">
                <InputNumber
                    min={min}
                    max={max}
                    style={{ width: '100%' }}
                    value={typeof value !== "undefined" && Array.isArray(value) && typeof value[0] !== "undefined" ? value[0] : null}
                    formatter={getFormatter()}
                    parser={getMinParser()}
                    onChange={(newValue: number | null) => onMinChange(newValue)}
                    placeholder="Any"
                />
            </div>
            <div className="col-span-1 flex items-center justify-center">
                <span className="text-gray-400">–</span>
            </div>
            <div className="col-span-6">
                <InputNumber
                    min={min}
                    max={max}
                    style={{ width: '100%' }}
                    value={typeof value !== "undefined" && Array.isArray(value) && typeof value[1] !== "undefined" ? value[1] : null}
                    formatter={getFormatter()}
                    parser={getMaxParser()}
                    onChange={(newValue: number | null) => onMaxChange(newValue)}
                    placeholder="Any"
                />
            </div>
        </div>
    )
};