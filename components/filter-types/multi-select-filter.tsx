import { Segmented } from "antd"

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
