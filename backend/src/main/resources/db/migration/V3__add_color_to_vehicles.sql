-- Migration V3: Add color field to vehicles table

ALTER TABLE vehicles ADD COLUMN color VARCHAR(50) NOT NULL DEFAULT 'Não informada';
