import { Radio } from "antd";

// Display text getter for checkbox filters
export const getCheckboxDisplayText = (options: { label: string, value: string }[], value: string[]): string => {
  if (!value || value.length === 0) {
    return "Any";
  }
  
  if (value.length === 1) {
    const option = options.find(opt => opt.value === value[0]);
    return option ? option.label : "Any";
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

    return (
        <div className="flex flex-col gap-2">
            <Radio.Group
                options={options}
                value={value}
                onChange={handleChange}
                className="flex flex-col gap-2"
            />
        </div>
    );
} 