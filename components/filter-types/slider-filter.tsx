import { Slider } from "antd";
import { useCallback } from "react";

export default function SliderFilter({ 
    name, 
    min, 
    max, 
    value, 
    onMinChange, 
    onMaxChange 
}: {
    name: string, 
    min: number, 
    max: number
    value: [number, number],
    onMinChange: (newValue: number) => void,
    onMaxChange: (newValue: number) => void
}) {
    const handleRangeChange = useCallback((newValue: number | number[]) => {
        if (Array.isArray(newValue) && newValue.length === 2) {
            onMinChange(newValue[0]);
            onMaxChange(newValue[1]);
        }
    }, [onMinChange, onMaxChange]);

    return (
        <div className="w-full space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
                <span>{value[0]}</span>
                <span>{value[1]}</span>
            </div>
            <Slider
                range
                min={min}
                max={max}
                value={value}
                onChange={handleRangeChange}
                className="w-full"
                tooltip={{
                    formatter: (value) => value?.toString() || ''
                }}
            />
            <div className="flex justify-between text-xs text-gray-500">
                <span>{min}</span>
                <span>{max}</span>
            </div>
        </div>
    );
}
