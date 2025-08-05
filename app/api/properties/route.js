import { LRUCache } from 'lru-cache';
import { getQpublicUrl, getGisUrl } from '@/lib/utils';
import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { filters } from '@/lib/constants';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

const cache = new LRUCache({
    max: 100, // Max number of unique filter combinations to cache
    ttl: 1000 * 60 * 10, // Cache each result for 10 minutes
});

function buildQuery(params) {
    const conditions = ['address IS NOT NULL'];
    const values = {};

    if (params.target) {
        const owner_words = params.target.split(' ').filter(word => word.length > 0);
        const owner_conditions = owner_words.map((word, index) => `owner_name LIKE @owner_word_${index}`);
        conditions.push(`address LIKE @target OR parcel_id LIKE @target OR (${owner_conditions.join(' AND ')})`);
        values.target = `%${params.target}%`;
        owner_words.forEach((word, index) => {
            values[`owner_word_${index}`] = `%${word}%`;
        });
    } else {
        // Use the existing filter configuration from constants.ts to build the query
        filters.forEach(filter => {
            if (filter.type === 'range') {
                const minValue = params[`${filter.key}_min`];
                const maxValue = params[`${filter.key}_max`];
                
                if (minValue && !isNaN(Number(minValue))) {
                    const paramName = `${filter.key}_min`;
                    conditions.push(`${filter.key} >= @${paramName}`);
                    values[paramName] = Number(minValue);
                }
                if (maxValue && !isNaN(Number(maxValue))) {
                    const paramName = `${filter.key}_max`;
                    conditions.push(`${filter.key} <= @${paramName}`);
                    values[paramName] = Number(maxValue);
                }
            } else if (filter.type === 'selection') {
                const value = params[filter.key];
                if (value && !isNaN(Number(value)) && Number(value) > 0) {
                    conditions.push(`${filter.key} >= @${filter.key}`);
                    values[filter.key] = Number(value);
                }
            } else if (filter.type === 'slider') {
                const minValue = params[`${filter.key}_min`];
                const maxValue = params[`${filter.key}_max`];
                
                if (minValue && !isNaN(Number(minValue))) {
                    conditions.push(`${filter.key} >= @${filter.key}_min`);
                    values[`${filter.key}_min`] = Number(minValue);
                }
                if (maxValue && !isNaN(Number(maxValue))) {
                    conditions.push(`${filter.key} <= @${filter.key}_max`);
                    values[`${filter.key}_max`] = Number(maxValue);
                }
            }
        });
    }

    let sql = `SELECT * FROM properties_unique WHERE ${conditions.join(' AND ')}`;

    // Add LIMIT clause if limit parameter is provided
    if (params.limit) {
        const limit = parseInt(params.limit, 10);
        if (limit > 0 && limit <= 100) { // Sanity check: max 100 results
            sql += ` LIMIT ${limit}`;
        }
    } else {
        sql += ` LIMIT 5000`;
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
        const result = await client.execute(sql, values);
        rows = result.rows;
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
