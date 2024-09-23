-- Create organizations table
   CREATE TABLE organizations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP
               WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP
               WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

-- Create users table
   CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          organization_id INTEGER,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255),
          picture VARCHAR(255),
          created_at TIMESTAMP
               WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP
               WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (organization_id) REFERENCES organizations (id)
          );

-- Create index on users.email for faster lookups
CREATE INDEX idx_users_email ON users (email);