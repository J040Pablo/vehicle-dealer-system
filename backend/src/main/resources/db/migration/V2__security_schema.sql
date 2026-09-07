CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insere usuário admin padrão com senha 'admin123' criptografada em BCrypt
INSERT INTO users (username, password, role)
VALUES ('admin', '$2a$10$28rF2003naGfCXhm5e1oJ.Jl1YiU7jUu.7ABCRxsgfcYgO/.SA472', 'ADMIN')
ON CONFLICT (username) DO NOTHING;
