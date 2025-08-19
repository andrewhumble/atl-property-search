import { Filter } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { FilterValue } from "@/types";
import { loadFilterComponents, getFilterComponent } from "@/lib/filter-registry";

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

    // Load filter components on mount
    useEffect(() => {
        loadFilterComponents();
    }, []);

    // Update display text when filter values change
    useEffect(() => {
        const updateDisplayText = () => {
            const factory = getFilterComponent(filter.type);
            if (factory) {
                setDisplayText(factory.getDisplayText(filter, value));
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
        <div className="bg-white p-4 rounded-lg shadow-lg min-w-64">
            <div className="text-sm font-medium text-gray-900 mb-3">{filter.label}</div>
            {renderFilterComponent()}
        </div>
    );

    return (
        <div className="flex flex-col">
            <span className="text-sm mb-1">
                {filter.label}
            </span>
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
                        <span className="flex-1 text-left text-md">{displayText}</span>
                        <DownOutlined className="ml-auto" />
                    </Button>
                </div>
            </Dropdown>
        </div>
    );
}
