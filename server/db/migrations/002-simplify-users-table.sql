-- Remove the password hash, we'll only support google sign in
    ALTER TABLE users
     DROP COLUMN IF EXISTS password_hash;