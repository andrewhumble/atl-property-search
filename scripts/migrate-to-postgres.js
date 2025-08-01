import Database from 'better-sqlite3';
import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

async function migrateToPostgres() {
    console.log('Starting migration from SQLite to Postgres...');
    
    // Connect to SQLite database
    const sqliteDb = new Database('db/properties.db', { readonly: true });
    
    try {
        // Create the table in Postgres
        console.log('Creating table in Postgres...');
        await sql`
            CREATE TABLE IF NOT EXISTS properties_unique (
                id SERIAL PRIMARY KEY,
                address TEXT,
                owner_name TEXT,
                parcel_id TEXT,
                county TEXT,
                total_appraised_value DECIMAL(15,2),
                land_appraised_value DECIMAL(15,2),
                building_appraised_value DECIMAL(15,2),
                acres DECIMAL(10,4),
                last_sale_year INTEGER,
                sqft INTEGER,
                bedrooms INTEGER,
                bathrooms DECIMAL(3,1),
                coordinates TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        // Create indexes for better performance
        console.log('Creating indexes...');
        await sql`CREATE INDEX IF NOT EXISTS idx_address ON properties_unique(address)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_parcel_id ON properties_unique(parcel_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_total_appraised_value ON properties_unique(total_appraised_value)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_bedrooms ON properties_unique(bedrooms)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_bathrooms ON properties_unique(bathrooms)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_sqft ON properties_unique(sqft)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_acres ON properties_unique(acres)`;
        
        // Get total count for progress tracking
        const totalCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM properties_unique').get().count;
        console.log(`Total properties to migrate: ${totalCount}`);
        
        // Migrate data in batches
        const batchSize = 1000;
        let migrated = 0;
        
        for (let offset = 0; offset < totalCount; offset += batchSize) {
            const rows = sqliteDb.prepare(`
                SELECT address, owner_name, parcel_id, county, 
                       total_appraised_value, land_appraised_value, building_appraised_value,
                       acres, last_sale_year, sqft, bedrooms, bathrooms, coordinates
                FROM properties_unique 
                LIMIT ${batchSize} OFFSET ${offset}
            `).all();
            
            if (rows.length === 0) break;
            
            // Insert batch into Postgres
            const values = rows.map(row => [
                row.address,
                row.owner_name,
                row.parcel_id,
                row.county,
                row.total_appraised_value,
                row.land_appraised_value,
                row.building_appraised_value,
                row.acres,
                row.last_sale_year,
                row.sqft,
                row.bedrooms,
                row.bathrooms,
                row.coordinates
            ]);
            
            await sql`
                INSERT INTO properties_unique 
                (address, owner_name, parcel_id, county, total_appraised_value, 
                 land_appraised_value, building_appraised_value, acres, last_sale_year, 
                 sqft, bedrooms, bathrooms, coordinates)
                SELECT * FROM unnest(${values}::text[][])
            `;
            
            migrated += rows.length;
            console.log(`Migrated ${migrated}/${totalCount} properties (${Math.round(migrated/totalCount*100)}%)`);
        }
        
        console.log('Migration completed successfully!');
        
        // Verify the migration
        const postgresCount = await sql`SELECT COUNT(*) as count FROM properties_unique`;
        console.log(`Postgres now has ${postgresCount.rows[0].count} properties`);
        
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        sqliteDb.close();
    }
}

// Run the migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    migrateToPostgres().catch(console.error);
}

export { migrateToPostgres }; 