-- Migration V2: Security Schema - Complete Users Table & Seed Admin

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    provider_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'USER')),
    CONSTRAINT chk_users_provider CHECK (provider IN ('LOCAL', 'GOOGLE'))
);

CREATE UNIQUE INDEX idx_users_provider_id ON users(provider, provider_id) WHERE provider_id IS NOT NULL;

-- Seed default admin user with BCrypt hashed password ('admin123') and verified mandatory email
INSERT INTO users (username, email, password, role, provider)
VALUES ('admin', 'admin@dealership.com', '$2a$10$28rF2003naGfCXhm5e1oJ.Jl1YiU7jUu.7ABCRxsgfcYgO/.SA472', 'ADMIN', 'LOCAL')
ON CONFLICT (username) DO NOTHING;
