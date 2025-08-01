import Database from 'better-sqlite3';
import { LRUCache } from 'lru-cache';
import { getQpublicUrl, getGisUrl } from '@/lib/utils';
import { NextResponse } from 'next/server';

const db = new Database('db/properties.db', { readonly: true });

const cache = new LRUCache({
    max: 100, // Max number of unique filter combinations to cache
    ttl: 1000 * 60 * 10, // Cache each result for 10 minutes
});

function buildQuery(params) {
    const conditions = ['address IS NOT NULL'];
    const values = {};

    if (params.target) {
        conditions.push('address LIKE @target OR parcel_id LIKE @target');
        values.target = `%${params.target}%`;
    } else {
        if (params.appraised_value_min) {
            conditions.push('total_appraised_value >= @appraisedValueMin');
            values.appraisedValueMin = Number(params.appraised_value_min);
        }
        if (params.appraised_value_max) {
            conditions.push('total_appraised_value <= @appraisedValueMax');
            values.appraisedValueMax = Number(params.appraised_value_max);
        }
        if (params.bedrooms) {
            conditions.push('bedrooms >= @bedrooms');
            values.bedrooms = Number(params.bedrooms);
        }
        if (params.bathrooms) {
            conditions.push('bathrooms >= @bathrooms');
            values.bathrooms = Number(params.bathrooms);
        }
        if (params.sqft_min) {
            conditions.push('sqft >= @sqftMin');
            values.sqftMin = Number(params.sqft_min);
        }
        if (params.sqft_max) {
            conditions.push('sqft <= @sqftMax');
            values.sqftMax = Number(params.sqft_max);
        }
        if (params.acres_min) {
            conditions.push('acres >= @acresMin');
            values.acresMin = Number(params.acres_min);
        }
        if (params.acres_max) {
            conditions.push('acres <= @acresMax');
            values.acresMax = Number(params.acres_max);
        }
    }

    let sql = `SELECT * FROM properties_unique WHERE ${conditions.join(' AND ')}`;

    // Add LIMIT clause if limit parameter is provided
    if (params.limit) {
        const limit = parseInt(params.limit, 10);
        if (limit > 0 && limit <= 100) { // Sanity check: max 100 results
            sql += ` LIMIT ${limit}`;
        }
    }

    return { sql, values };
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const cacheKey = JSON.stringify(params);
    let rows = cache.get(cacheKey);

    if (!rows) {
        const { sql, values } = buildQuery(params);
        rows = db.prepare(sql).all(values);
        cache.set(cacheKey, rows);
    }

    const features = rows.map((prop) => {
        let lat = 0, lon = 0;
        try {
            [lat, lon] = prop.coordinates.split(',').map(Number);
        } catch { }

        const address = prop.address || 'N/A';
        const owner = prop.owner_name || 'N/A';
        const parcel_id = prop.parcel_id || '';
        const county = prop.county || 'N/A';
        const total = prop.total_appraised_value || 0;
        const land = prop.land_appraised_value || 0;
        const building = prop.building_appraised_value || 0;
        const acres = prop.acres || 0;
        const last_sale_year = prop.last_sale_year || 'N/A';
        const sqft = prop.sqft || 0;
        const bedrooms = prop.bedrooms || 0;
        const bathrooms = prop.bathrooms || 0;

        const qpublic_url = getQpublicUrl(county, parcel_id);
        const address_url = address.replace(/ /g, '+');
        const gis_url = getGisUrl(county, parcel_id);

        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [lon, lat]
            },
            properties: {
                address,
                owner_name: owner,
                county,
                parcel_id,
                total_appraised_value: total,
                land_appraised_value: land,
                building_appraised_value: building,
                acres,
                last_sale_year: String(last_sale_year),
                sqft,
                bedrooms,
                bathrooms,
                tooltip: address,
                search_text: `${address} (${parcel_id})`,
                gis_url,
                qpublic_url
            }
        };
    });

    return NextResponse.json({
        type: "FeatureCollection",
        features
    });
}
