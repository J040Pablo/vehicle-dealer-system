-- Migration V7: Clean up empty or whitespace-only image URLs in vehicles and dealers tables

UPDATE vehicles
SET image_url = NULL
WHERE image_url IS NOT NULL
  AND TRIM(image_url) = '';

UPDATE dealers
SET image_url = NULL
WHERE image_url IS NOT NULL
  AND TRIM(image_url) = '';
