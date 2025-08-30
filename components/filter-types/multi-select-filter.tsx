import { Segmented } from "antd"

// Display text getter for selection filters
export const getSelectionDisplayText = (options: { label: string, value: number }[], value: number, units?: string): string => {
  if (value === undefined) {
    return "Any";
  }
  
  const option = options.find(opt => opt.value === value);
  if (!option) return "Any";
  
  if (units) {
    return `${option.value}+ ${units}`;
  }
  
  return option.label;
};

export default function MultiSelectFilter({ options, value, onChange }: {
    options: { label: string, value: number }[], 
    value: number,
    onChange: (newValue: number) => void
}) {
    return (
        <div className="flex flex-col gap-2 items-start">
            <Segmented options={options} value={value} onChange={onChange} />
        </div>
    )
}
