DELETE FROM users WHERE email = 'rafael@music.com';

INSERT INTO users (id, name, email, password, role)
VALUES (
    gen_random_uuid(),
    'Admin',
    'rafael@music.com',
    '$2b$12$ZGbcRf.ZWZCXk8.1eSSFLezOvrRXn9rKHE0Z1S910SXZ30ciBykG6',
    'ADMIN'
);
