import { Filter } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { Dropdown, Button, Checkbox } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { FilterValue } from "@/types";
import { loadFilterComponents, getFilterComponent } from "@/lib/filter-registry";

export default function FilterItem({
    filter,
    value,
    onChange,
    btnVariant = "outlined",
}: {
    filter: Filter,
    value: FilterValue,
    onChange?: (newValue: FilterValue) => void,
    btnVariant?: "outlined" | "text",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [displayText, setDisplayText] = useState("Any");

    // Load filter components on mount
    useEffect(() => {
        loadFilterComponents();
    }, []);

    // Update display text when filter values change
    useEffect(() => {
        const updateDisplayText = () => {
            const factory = getFilterComponent(filter.type);
            if (factory) {
                // Check if the filter is in its default state
                if (factory.isDefault(filter, value)) {
                    setDisplayText(filter.label);
                } else {
                    setDisplayText(factory.getDisplayText(filter, value));
                }
            }
        };

        updateDisplayText();
        const interval = setInterval(updateDisplayText, 100);

        return () => clearInterval(interval);
    }, [value, filter]);

    const handleChange = useCallback((newValue: FilterValue) => {
        onChange?.(newValue);
    }, [onChange]);

    const renderFilterComponent = () => {
        const factory = getFilterComponent(filter.type);
        if (!factory) {
            console.warn(`No filter component registered for type: ${filter.type}`);
            return null;
        }

        const FilterComponent = factory.component;
        const props = factory.getProps(filter, value, handleChange);

        return <FilterComponent {...props} />;
    };

    const isDefault = (filter: Filter, value: FilterValue) => {
        const factory = getFilterComponent(filter.type);
        return factory ? factory.isDefault(filter, value) : false;
    };

    const dropdownContent = (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
            {renderFilterComponent()}
        </div>
    );

    return (
        <div className="flex flex-col">
            {filter.type !== "checkbox" && (
                <Dropdown
                    overlay={dropdownContent}
                    trigger={['click']}
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    placement="bottomLeft"
                >
                    <Button
                        className="flex items-center justify-between w-full text-gray-700 rounded-lg"
                        variant={btnVariant}
                        color={`${isDefault(filter, value) ? "default" : "primary"}`}
                    >
                        <span className="flex-1 text-left text-md">{displayText}</span>
                        <DownOutlined className="ml-auto" />
                    </Button>
                </Dropdown>
            )}
            {filter.type === "checkbox" && (
                <Button
                    className="flex items-center justify-between w-full text-gray-700 rounded-lg"
                    variant={btnVariant}
                    color={`${isDefault(filter, value) ? "default" : "primary"}`}
                    onClick={() => handleChange(!(value as boolean))}
                >
                    <span className="flex-1 text-left text-md">{displayText}</span>
                    <Checkbox
                        checked={value as boolean}
                        onChange={(e) => handleChange(e.target.checked)}
                    />
                </Button>
            )}
        </div>
    );
}
