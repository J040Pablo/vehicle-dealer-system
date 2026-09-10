-- Migration V8: Clean duplicate chassis and add UNIQUE constraint to vehicle chassis

UPDATE vehicles
SET chassis = NULL
WHERE chassis IS NOT NULL
  AND TRIM(chassis) = '';

-- Keep chassis for the earliest vehicle ID and set duplicates to NULL
UPDATE vehicles v1
SET chassis = NULL
WHERE v1.chassis IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM vehicles v2
    WHERE v2.chassis = v1.chassis
      AND v2.id < v1.id
  );

ALTER TABLE vehicles
ADD CONSTRAINT uk_vehicle_chassis UNIQUE (chassis);
