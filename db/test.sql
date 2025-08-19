SELECT * FROM properties_unique WHERE parcel_id = '18 053 02 023' AND sqft > 2000;

SELECT * FROM properties_unique LIMIT 10;

SELECT * FROM properties_unique WHERE address IS NOT NULL AND total_appraised_value <= 700000 AND sqft <= 2000 AND acres <= 0.39

SELECT * FROM
(SELECT * FROM properties_unique WHERE address IS NOT NULL AND total_appraised_value <= 700000 AND sqft <= 2000 AND acres <= 0.39) AS filtered
WHERE parcel_id = '18 053 02 023';

 -- Display the column types and the column names
SELECT name, type FROM pragma_table_info('properties_unique');

-- Create a bathroom_float column
ALTER TABLE properties_unique ADD COLUMN bathroom_float FLOAT;

-- Drop bathroom_float column
ALTER TABLE properties_unique DROP COLUMN bathroom_float;

-- Correct the bathrooms column
UPDATE properties_unique SET bathroom_float = 
    CASE 
        WHEN bathrooms LIKE '%/1' THEN CAST(SUBSTR(bathrooms, 1, INSTR(bathrooms, '/') - 1) AS FLOAT) + 0.5
        WHEN bathrooms LIKE '%/2' THEN CAST(SUBSTR(bathrooms, 1, INSTR(bathrooms, '/') - 1) AS FLOAT) + 1
        WHEN bathrooms LIKE '%/3' THEN CAST(SUBSTR(bathrooms, 1, INSTR(bathrooms, '/') - 1) AS FLOAT) + 1.5
        WHEN bathrooms LIKE '%/4' THEN CAST(SUBSTR(bathrooms, 1, INSTR(bathrooms, '/') - 1) AS FLOAT) + 2
        WHEN bathrooms LIKE '%/5' THEN CAST(SUBSTR(bathrooms, 1, INSTR(bathrooms, '/') - 1) AS FLOAT) + 2.5
        WHEN bathrooms LIKE '%/6' THEN CAST(SUBSTR(bathrooms, 1, INSTR(bathrooms, '/') - 1) AS FLOAT) + 3
        WHEN bathrooms LIKE '%/7' THEN CAST(SUBSTR(bathrooms, 1, INSTR(bathrooms, '/') - 1) AS FLOAT) + 3.5
        WHEN bathrooms LIKE '%/8' THEN CAST(SUBSTR(bathrooms, 1, INSTR(bathrooms, '/') - 1) AS FLOAT) + 4
        WHEN bathrooms LIKE '%/9' THEN CAST(SUBSTR(bathrooms, 1, INSTR(bathrooms, '/') - 1) AS FLOAT) + 4.5
        WHEN bathrooms LIKE '%/10' THEN CAST(SUBSTR(bathrooms, 1, INSTR(bathrooms, '/') - 1) AS FLOAT) + 5
        ELSE CAST(SUBSTR(bathrooms, 1, INSTR(bathrooms, '/') - 1) AS FLOAT)
    END;





