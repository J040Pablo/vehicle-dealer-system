-- Flyway Migration V6: Adição dos campos de chassis e valor no veículo
ALTER TABLE vehicles
ADD COLUMN chassis VARCHAR(100);

ALTER TABLE vehicles
ADD COLUMN value NUMERIC(15,2);
