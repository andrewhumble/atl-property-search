import { Filter } from "@/types";

export const filters: Filter[] = [
    {
        label: "Total Appraised Value",
        key: "total_appraised_value",
        type: "range",
        min: 0,
        max: 100000000,
        defaultValue: [null, null],
        units: ''
    },
    {
        label: "Bedrooms",
        key: "bedrooms",
        type: "selection",
        options: [
            { label: "Any", value: 0 },
            { label: "1+", value: 1 },
            { label: "2+", value: 2 },
            { label: "3+", value: 3 },
            { label: "4+", value: 4 },
            { label: "5+", value: 5 },
        ],
        defaultValue: 0,
        units: "bedrooms"
    },
    {
        label: "Bathrooms",
        key: "bathrooms",
        type: "selection",
        options: [
            { label: "Any", value: 0 },
            { label: "1+", value: 1 },
            { label: "2+", value: 2 },
            { label: "3+", value: 3 },
            { label: "4+", value: 4 },
            { label: "5+", value: 5 },
        ],
        defaultValue: 0,
        units: "bathrooms"
    },
    {
        label: "Square Feet",
        key: "sqft",
        type: "range",
        min: 0,
        max: 10000,
        defaultValue: [null, null],
        units: "sqft"
    },
    {
        label: "Acreage",
        key: "acres",
        type: "range",
        min: 0,
        max: 10,
        defaultValue: [null, null],
        units: "acres"
    },
    {
        label: "Year Built",
        key: "year_built",
        type: "slider",
        min: 1900,
        max: 2025,
        defaultValue: [1900, 2025],
        units: "built year"
    },
    {
        label: "Last Sale Year",
        key: "last_sale_year",
        type: "slider",
        min: 1974,
        max: 2025,
        defaultValue: [1974, 2025],
        units: "last sale year"
    },
    {
        label: "Land Appraised Value",
        key: "land_appraised_value",
        type: "range",
        min: 0,
        max: 100000000,
        defaultValue: [null, null],
        units: "land value"
    },
    {
        label: "Owned by Landlord?",
        key: "multiple_property_owner",
        type: "checkbox",
        options: [
            { label: "Owned by Landlord", value: "yes" },
            { label: "Not Owned by Landlord", value: "no" },
        ],
        defaultValue: undefined
    }
]
