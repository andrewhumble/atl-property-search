# Generic Filter System

The `FilterItem` component has been refactored to be more generic and extensible. It uses a registry pattern that allows you to easily add new filter types without modifying the core component.

## Architecture

The system is now split into two main parts:

1. **`lib/filter-registry.ts`** - Contains all filter implementation logic and registry management
2. **`components/filter-item.tsx`** - Clean, focused component that only handles UI rendering

## How It Works

The system uses a `FilterComponentFactory` that contains:
- `component`: The React component to render
- `getDisplayText`: Function to generate display text for the filter
- `isDefault`: Function to check if the filter is in its default state
- `getProps`: Function to generate props for the component

## Adding a New Filter Type

### 1. Create Your Filter Component

Create a new component in `components/filter-types/`:

```tsx
// components/filter-types/my-filter.tsx
import { SomeAntdComponent } from "antd";

// Display text getter
export const getMyFilterDisplayText = (options: any[], value: any): string => {
  if (!value || value.length === 0) {
    return "Any";
  }
  return `${value.length} selected`;
};

export default function MyFilter({ 
    options, 
    value, 
    onChange 
}: {
    options: any[], 
    value: any,
    onChange: (newValue: any) => void
}) {
    return (
        <div>
            <SomeAntdComponent
                options={options}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}
```

### 2. Update the Filter Type Definition

Add your new filter type to `types/index.ts`:

```tsx
export type Filter =
  | {
    label: string;
    key: string;
    type: "my-filter";
    options: any[];
    defaultValue: any;
  }
  // ... existing types
```

### 3. Register Your Filter Component

Add your filter to the registry in `lib/filter-registry.ts`:

```tsx
// In the loadFilterComponents function, add to the loadPromises array:
import("@/components/filter-types/my-filter").then(({ default: MyFilter, getMyFilterDisplayText }) => {
    registerFilterComponent("my-filter", {
        component: MyFilter,
        getDisplayText: (filter, value) => {
            if (filter.type === "my-filter") {
                return getMyFilterDisplayText(filter.options, value);
            }
            return "Any";
        },
        isDefault: (filter, value) => {
            if (filter.type === "my-filter") {
                return value === filter.defaultValue;
            }
            return false;
        },
        getProps: (filter, value, onChange) => {
            if (filter.type === "my-filter") {
                return {
                    options: filter.options,
                    value: value,
                    onChange: (newValue: any) => onChange(newValue)
                };
            }
            return {};
        }
    });
})
```

### 4. Add Your Filter to Constants

Add your filter configuration to `lib/constants.ts`:

```tsx
export const filters: Filter[] = [
    // ... existing filters
    {
        label: "My Filter",
        key: "my_filter",
        type: "my-filter",
        options: [
            { label: "Option 1", value: "opt1" },
            { label: "Option 2", value: "opt2" },
        ],
        defaultValue: []
    },
];
```

## Example: Checkbox Filter

A complete example is provided in `components/filter-types/checkbox-filter.tsx` that demonstrates:
- A checkbox-based multi-select filter
- Proper display text formatting
- Integration with the Ant Design Checkbox component

## Benefits of This Approach

1. **Separation of Concerns**: 
   - `FilterItem` only handles UI rendering
   - `filter-registry.ts` handles all filter logic
   - Each filter type is self-contained

2. **Easy Extension**: Add new filter types without touching core components

3. **Type Safety**: TypeScript ensures proper prop passing

4. **Lazy Loading**: Components are loaded only when needed

5. **Consistent Interface**: All filters follow the same pattern

6. **Maintainable**: Clear separation makes debugging and maintenance easier

## Filter Component Requirements

Your filter component should:
- Accept `value` and `onChange` props
- Export a display text function
- Handle its own state management
- Use consistent styling with other filters

## Display Text Guidelines

- Return "Any" for default/empty states
- Be concise but descriptive
- Handle multiple selected values appropriately
- Use consistent formatting across filter types

## Registry API

The `filter-registry.ts` module provides these functions:

- `registerFilterComponent(type, factory)` - Register a new filter type
- `getFilterComponent(type)` - Get a filter factory by type
- `loadFilterComponents()` - Load all filter components (returns Promise)
- `areFilterComponentsLoaded()` - Check if components are loaded 