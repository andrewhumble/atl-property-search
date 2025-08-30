import { Slider } from "antd";
import { useCallback } from "react";

// Display text getter for slider filters
export const getSliderDisplayText = (min: number, max: number, value: [number, number], units?: string): string => {
  const [currentMin, currentMax] = value;
  
  // Check if values are at the extremes (default state)
  if (currentMin === min && currentMax === max) {
    return "Any";
  }
  
  // Both values are set
  if (currentMin !== min || currentMax !== max) {
    return `${currentMin} - ${currentMax} ${units}`;
  }
  
  return "Any";
};

export default function SliderFilter({ 
    name, 
    min, 
    max, 
    value, 
    onChange 
}: {
    name: string, 
    min: number, 
    max: number
    value: [number, number],
    onChange: (newValue: [number, number]) => void
}) {
    const handleRangeChange = useCallback((newValue: number | number[]) => {
        if (Array.isArray(newValue) && newValue.length === 2) {
            const [newMin, newMax] = newValue;
            // Update the entire range at once
            onChange([newMin, newMax]);
        }
    }, [onChange, name, value]);

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
