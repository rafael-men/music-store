CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(60) NOT NULL DEFAULT 'Principal',
    street VARCHAR(255),
    number VARCHAR(20),
    complement VARCHAR(255),
    neighborhood VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);


CREATE UNIQUE INDEX idx_user_addresses_one_default
    ON user_addresses(user_id) WHERE is_default = TRUE;

INSERT INTO user_addresses (user_id, label, street, number, complement, neighborhood, city, state, zip_code, is_default)
SELECT id, 'Principal', street, number, complement, neighborhood, city, state, zip_code, TRUE
FROM users
WHERE street IS NOT NULL OR city IS NOT NULL OR zip_code IS NOT NULL;
