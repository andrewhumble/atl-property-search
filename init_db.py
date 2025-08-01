# Write a script to init my Turso DB from properties.db

import sqlite3
import libsql_client

# Connect to the SQLite database
conn = sqlite3.connect('db/properties.db')
cursor = conn.cursor()

# Get all data from the properties table
cursor.execute("SELECT * FROM properties_unique")
data = cursor.fetchall()

# Connect to Turso database
client = libsql_client.create_client_sync(
    url="libsql://atl-property-db-vercel-icfg-fra4r2qamyz4tu83avngobfd.aws-us-east-1.turso.io",
    auth_token="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTQwNzI2NDcsImlkIjoiOTY1YzllMjgtNzhiZS00NmJhLWFmODEtYjk5YWNmYTA2OTM0IiwicmlkIjoiOWY4ZDMyNDgtYjM1ZS00MDhiLTlhNzAtNTIxMDNiOTFiOGEyIn0.JDhjft3SOidvQjrgJRCoIYWLAPK4FFoJO1jK6OGJDHFe1Rt_Ya5ccDU2DRxMcgtLpeOJcVnV9wxO8_HgNJlsBA"
)

# Create the table if it doesn't exist
client.execute("CREATE TABLE IF NOT EXISTS properties (address TEXT, parcel_id TEXT, county TEXT, total_appraised_value REAL, land_appraised_value REAL, building_appraised_value REAL, bedrooms INTEGER, bathrooms INTEGER, sqft INTEGER, acres REAL, last_sale_year INTEGER, last_sale_price REAL, coordinates TEXT)")

# Insert data row by row
for row in data:
    try:
        client.execute("INSERT INTO properties (address, parcel_id, county, total_appraised_value, land_appraised_value, building_appraised_value, bedrooms, bathrooms, sqft, acres, last_sale_year, last_sale_price, coordinates) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", row)
        print(f"Inserted: {row[0]}")  # Print address for progress
    except Exception as e:
        print(f"Error inserting {row[0]}: {e}")

# Close the connection
conn.close()
client.close()