const COUNTY_CONFIGS = {
  fulton: {
    name: "Fulton",
    base_url:
      "https://services1.arcgis.com/AQDHTHDrZzfsFsB5/ArcGIS/rest/services/Tax_Parcels_2025/FeatureServer/0/query",
    qpublic_app_id: "936",
    field_mappings: {
      parcel_id: "ParcelID",
    },
  },
  dekalb: {
    name: "Dekalb",
    base_url:
      "https://services2.arcgis.com/IxVN2oUE9EYLSnPE/ArcGIS/rest/services/PARCEL_TAX_JOIN/FeatureServer/0/query",
    qpublic_app_id: "994",
    field_mappings: {
      parcel_id: "PARCELID",
    },
  },
};

export function getQpublicUrl(county, parcelId) {
  county = (county || '').toLowerCase();
  const config = COUNTY_CONFIGS[county];
  if (!config || !config.qpublic_app_id) return '';
  const parcelIdWithPlus = (parcelId || '').replace(/ /g, '+');
  return `https://qpublic.schneidercorp.com/Application.aspx?AppID=${config.qpublic_app_id}&PageTypeID=4&KeyValue=${parcelIdWithPlus}`;
}

export function getGisUrl(county, parcelId) {
  county = (county || '').toLowerCase();
  const config = COUNTY_CONFIGS[county];
  if (!config || !config.base_url) return '';
  const fieldName = config.field_mappings.parcel_id;
  return `${config.base_url}?where=${fieldName}%3D%27${encodeURIComponent(parcelId)}%27&outFields=*&f=json`;
}
