import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

/**
 * A feature in the property map.
 */
export type PropertyFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
  };
  properties: {
    tooltip: string;
    address: string;
    owner_name: string;
    county: string;
    parcel_id: string;
    total_appraised_value: number;
    land_appraised_value: number;
    building_appraised_value: number;
    acres: number;
    last_sale_year: string;
    sqft: number;
    bedrooms: number;
    bathrooms: number;
    search_text: string;
    gis_url?: string;
    qpublic_url?: string;
  };
};

export type Filter =
  | {
    label: string;
    key: string;
    type: "range";
    min: number;
    max: number;
    defaultValue: [number | null, number | null];
  }
  | {
    label: string;
    key: string;
    type: "selection";
    options: { label: string; value: number }[];
    defaultValue: number;
  }
  | {
    label: string;
    key: string;
    type: "slider";
    min: number;
    max: number;
    defaultValue: [number, number];
  };

export interface FilterValues {
  [key: string]: (number | null)[] | number | string;
}

export type FilterValue = number | (number | null)[] | [number, number];
