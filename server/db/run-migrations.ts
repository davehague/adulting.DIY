import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    console.log('Connecting to the database');

    // Check if POSTGRES_URL is available
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL is not defined in the environment variables');
    }

    // Create migrations table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir).sort();

    for (const file of migrationFiles) {
      const migrationName = path.parse(file).name;

      // Check if migration has been executed
      const { rows } = await sql`SELECT * FROM migrations WHERE name = ${migrationName}`;
      
      if (rows.length === 0) {
        console.log(`Executing migration: ${migrationName}`);
        
        const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        try {
          // Start transaction
          await sql`BEGIN`;
          
          // Execute migration
          // Split the migration SQL into individual statements
          const statements = migrationSQL.split(';').filter(statement => statement.trim() !== '');
          for (const statement of statements) {
            await sql.query(statement);
          }
          
          // Record migration
          await sql`INSERT INTO migrations (name) VALUES (${migrationName})`;
          
          // Commit transaction
          await sql`COMMIT`;
          
          console.log(`Migration ${migrationName} executed successfully`);
        } catch (error) {
          // Rollback transaction on error
          await sql`ROLLBACK`;
          console.error(`Error executing migration ${migrationName}:`, error);
          throw error;
        }
      } else {
        console.log(`Migration ${migrationName} already executed, skipping`);
      }
    }

    console.log('All migrations executed successfully');
  } catch (error) {
    console.error('Error in runMigrations:', error);
  }
}

runMigrations().catch(console.error);