import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import Database from 'better-sqlite3';

// Returns a FeatureCollection of saved parcels
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'db', 'saved-parcels.txt');
    let ids: string[] = [];
    try {
      const content = await readFile(filePath, { encoding: 'utf8' });
      ids = content
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
    } catch (_) {
      ids = [];
    }

    if (ids.length === 0) {
      return NextResponse.json({ type: 'FeatureCollection', features: [] });
    }

    // Deduplicate while preserving order (last occurrence keeps order fine since we don't care)
    const uniqueIds = Array.from(new Set(ids));

    let rows: any[] = [];
    if (process.env.NODE_ENV === 'development') {
      const db = Database('/Users/andrewhumble/projects/atl-property-map2/atl-property-search/db/properties.db');
      // Build a parameterized IN clause
      const placeholders = uniqueIds.map((_, i) => `@id${i}`).join(',');
      const params = Object.fromEntries(uniqueIds.map((id, i) => [`id${i}`, id]));
      const sql = `SELECT * FROM properties_unique WHERE parcel_id IN (${placeholders})`;
      rows = db.prepare(sql).all(params);
    } else {
      // In production, reuse the existing /api/properties route logic via fetch per id (ids are few),
      // to avoid duplicating DB client setup here.
      const results = await Promise.all(
        uniqueIds.map(async (id) => {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/properties?target=${encodeURIComponent(id)}&limit=1`, { cache: 'no-store' });
          if (!res.ok) return [] as any[];
          const data = await res.json();
          return data.features || [];
        })
      );
      // Flatten features if we took the fetch path
      const features = results.flat();
      return NextResponse.json({ type: 'FeatureCollection', features });
    }

    // Map DB rows to GeoJSON Features (mirror /api/properties)
    const features = rows.map((prop: any) => {
      let lat = 0, lon = 0;
      try {
        [lat, lon] = String(prop.coordinates).split(',').map(Number);
      } catch {}

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

      // Avoid importing TS utils here; inline minimal URLs
      const countyLower = String(county || '').toLowerCase();
      const qpublicAppId = countyLower === 'fulton' ? '936' : countyLower === 'dekalb' ? '994' : '';
      const qpublic_url = qpublicAppId ? `https://qpublic.schneidercorp.com/Application.aspx?AppID=${qpublicAppId}&PageTypeID=4&KeyValue=${String(parcel_id).replace(/ /g, '+')}` : '';

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat],
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
          gis_url: '',
          qpublic_url,
        },
      };
    });

    return NextResponse.json({ type: 'FeatureCollection', features });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}


