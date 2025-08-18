import fs from 'fs';
import path from 'path';
import { query, closePool } from '../database/config';
import dotenv from 'dotenv';

dotenv.config();
console.log(dotenv.config())

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '../database/schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL statements (basic split on semicolons)
    const statements = sql
      .split(';')
      .map((stmt: string) => stmt.trim())
      .filter((stmt: string) => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await query(statement);
        console.log(`✅ [${i + 1}/${statements.length}] Executed: ${statement.substring(0, 60)}...`);
      } catch (error: any) {
        // Skip if table already exists
        if (error.message && error.message.includes('already exists')) {
          console.log(`⚠️  [${i + 1}/${statements.length}] Skipped (already exists): ${statement.substring(0, 60)}...`);
          continue;
        }
        console.error(`❌ [${i + 1}/${statements.length}] Error executing: ${statement.substring(0, 60)}...`);
        console.error('Error:', error);
        throw error;
      }
    }

    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupDatabase();
}