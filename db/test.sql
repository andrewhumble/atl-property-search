-- Right now bathrooms ar stored as a string like "1/1" for one full and one half bath
-- We want to store them as a number, so we need to convert them

UPDATE properties_unique
SET bathrooms = 
    CASE
        WHEN bathrooms LIKE '0/0' THEN 0
        WHEN bathrooms LIKE '0/1' THEN 0.5
        WHEN bathrooms LIKE '1/0' THEN 1
        WHEN bathrooms LIKE '1/1' THEN 1.5
        WHEN bathrooms LIKE '1/2' THEN 2
        WHEN bathrooms LIKE '2/0' THEN 2
        WHEN bathrooms LIKE '2/1' THEN 2.5
        WHEN bathrooms LIKE '2/2' THEN 3
        WHEN bathrooms LIKE '3/0' THEN 3
        WHEN bathrooms LIKE '3/1' THEN 3.5
        WHEN bathrooms LIKE '3/2' THEN 4
        WHEN bathrooms LIKE '4/0' THEN 4
        WHEN bathrooms LIKE '4/1' THEN 4.5
        WHEN bathrooms LIKE '4/2' THEN 5
        WHEN bathrooms LIKE '5/0' THEN 5
        WHEN bathrooms LIKE '5/1' THEN 5.5
        WHEN bathrooms LIKE '5/2' THEN 6
        WHEN bathrooms LIKE '6/0' THEN 6
        WHEN bathrooms LIKE '6/1' THEN 6.5
        WHEN bathrooms LIKE '6/2' THEN 7
        WHEN bathrooms IS NULL THEN NULL
        ELSE CAST(bathrooms AS DECIMAL)
    END;

-- Verify the update
SELECT bedrooms, bathrooms FROM properties_unique LIMIT 10;

-- Get cols and their types
PRAGMA table_info(properties_unique);

-- Make the bathrooms column a float
ALTER TABLE properties_unique 
       ADD COLUMN bathrooms_float FLOAT;
UPDATE properties_unique 
       SET bathrooms_float = CAST(bathrooms as FLOAT);

-- Drop the bathrooms column
ALTER TABLE properties_unique 
       DROP COLUMN bathrooms;

-- Rename the bathrooms_float column to bathrooms
ALTER TABLE properties_unique 
       RENAME COLUMN bathrooms_float TO bathrooms;

-- Recreate the index on the new bathrooms column
CREATE INDEX idx_bathrooms ON properties_unique(bathrooms);

-- Verify the update
SELECT bedrooms, bathrooms FROM properties_unique WHERE bathrooms IS NULL LIMIT 10;

-- Add back the index
CREATE INDEX idx_bathrooms ON properties_unique(bathrooms);