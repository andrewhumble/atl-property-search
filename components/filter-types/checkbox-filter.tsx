import { Radio } from "antd";

// Display text getter for checkbox filters
export const getCheckboxDisplayText = (options: { label: string, value: string }[], value: string[]): string => {
  if (!value || value.length === 0) {
    return "Any";
  }
  
  if (value.length === 1) {
    const option = options.find(opt => opt.value === value[0]);
    if (!option) return "Any";
    return option.label;
  }
  
  return `${value.length} selected`;
};

export default function CheckboxFilter({ 
    options, 
    value, 
    onChange 
}: {
    options: { label: string, value: string }[], 
    value: string[],
    onChange: (newValue: string[]) => void
}) {
    const handleChange = (e: any) => {
        onChange([e.target.value]);
    };

    // Ensure we have a valid value for Radio.Group
    const radioValue = value && value.length > 0 ? value[0] : undefined;

    return (
        <div className="flex flex-col gap-2">
            <Radio.Group
                options={options}
                value={radioValue}
                onChange={handleChange}
                className="flex flex-col gap-2"
            />
        </div>
    );
} 