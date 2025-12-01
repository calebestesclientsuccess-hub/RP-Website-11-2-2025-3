import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function createSessionTable() {
  try {
    console.log('🛠️  Creating user_sessions table...');
    
    // SQL from connect-pg-simple documentation
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "user_sessions" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      )
      WITH (OIDS=FALSE);
    `);

    try {
      await db.execute(sql`
        ALTER TABLE "user_sessions" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
      `);
    } catch (err: any) {
      if (!err.message.includes('multiple primary keys') && !err.message.includes('already exists')) {
        throw err;
      }
    }

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "user_sessions" ("expire");
    `);

    console.log('✅ user_sessions table created successfully!');
    process.exit(0);
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log('✅ Table already exists (checked via error)');
      process.exit(0);
    }
    console.error('❌ Error creating table:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createSessionTable();

