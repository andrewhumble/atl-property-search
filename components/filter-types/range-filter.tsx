import { InputNumber } from "antd";
import { useCallback } from "react";

export default function RangeFilter({ name, min, max, value, onMinChange, onMaxChange }: {
    name: string, 
    min: number, 
    max: number, 
    value: (number | null)[],
    onMinChange: (newValue: number | null) => void,
    onMaxChange: (newValue: number | null) => void
}) {
    const getMinParser = useCallback(() => {
        return name === 'Appraised Value' ? (value: string | undefined): number => {
            if (value === null || value === undefined || value === 'Any' || value === '') return 0;
            return Number(value.replace(/\$\s?|(,*)/g, ''))
        } : (value: string | undefined): number => {
            if (value === null || value === undefined || value === 'Any' || value === '') return 0;
            return Number(value)
        }
    }, [name]);

    const getMaxParser = useCallback(() => {
        return name === 'Appraised Value' ? (value: string | undefined): number => {
            if (value === null || value === undefined || value === 'Any' || value === '') return 0;
            return Number(value.replace(/\$\s?|(,*)/g, ''))
        } : (value: string | undefined): number => {
            if (value === null || value === undefined || value === 'Any' || value === '') return 0;
            return Number(value)
        }
    }, [name]);

    const getFormatter = useCallback(() => {
        return name === 'Appraised Value' ? (value: number | null | undefined | string) => {
            if (value === null || value === undefined || value === '' || value === '0') return '';
            return `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        } : (value: number | null | undefined | string) => {
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