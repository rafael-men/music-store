DELETE FROM users u
USING users u2
WHERE u.id > u2.id
  AND LOWER(u.email) = LOWER(u2.email);
UPDATE users SET email = LOWER(TRIM(email)) WHERE email <> LOWER(TRIM(email));

