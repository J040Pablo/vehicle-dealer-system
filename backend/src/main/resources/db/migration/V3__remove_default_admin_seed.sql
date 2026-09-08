-- Migration V3: Clean up legacy static admin seed created with default factory password ('admin123')
DELETE FROM users 
WHERE username = 'admin' 
  AND password = '$2a$10$28rF2003naGfCXhm5e1oJ.Jl1YiU7jUu.7ABCRxsgfcYgO/.SA472';
