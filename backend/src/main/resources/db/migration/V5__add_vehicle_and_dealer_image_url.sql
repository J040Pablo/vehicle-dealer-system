-- Migration V5: Add optional image_url column to vehicles and dealers tables

ALTER TABLE vehicles ADD COLUMN image_url VARCHAR(500);
ALTER TABLE dealers ADD COLUMN image_url VARCHAR(500);
