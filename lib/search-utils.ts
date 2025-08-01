import { FilterValues } from "@/types";


export async function searchProperties(filters: FilterValues) {
    const queryParams = new URLSearchParams();

    // Add filter parameters to query string
    Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            if (value[0] !== undefined && value[0] !== null) {
                queryParams.append(`${key.toLowerCase()}_min`, value[0].toString());
            }
            if (value[1] !== undefined && value[1] !== null) {
                queryParams.append(`${key.toLowerCase()}_max`, value[1].toString());
            }
        } else {
            queryParams.append(key.toLowerCase(), value.toString());
        }
    });

    const response = await fetch(`/api/properties?${queryParams.toString()}`);
    const data = await response.json();
    return data.features || [];
}
