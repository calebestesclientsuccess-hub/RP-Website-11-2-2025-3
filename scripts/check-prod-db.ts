import { db } from '../server/db';
import { users, tenants } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function checkDb() {
  try {
    console.log('🔍 Checking production database...\n');
    console.log(`📍 Database: ${process.env.DATABASE_URL?.substring(0, 30)}...\n`);
    
    // 1. Check Tenants
    const allTenants = await db.select().from(tenants);
    console.log('📊 Tenants found:', allTenants.length);
    allTenants.forEach(t => console.log(`  - ${t.id} (${t.name}) slug: ${t.slug}`));
    
    // 2. Check Users
    const allUsers = await db.select().from(users);
    console.log('\n👥 Users found:', allUsers.length);
    allUsers.forEach(u => console.log(`  - ${u.username} | tenant: ${u.tenantId}`));

    // 3. Check if sessions table exists
    try {
      const result = await db.execute(sql`SELECT count(*) FROM user_sessions`);
      console.log('\n✅ user_sessions table exists');
      console.log('   Active sessions:', result[0].count);
    } catch (e) {
      console.log('\n❌ user_sessions table MISSING!');
    }

    console.log('\n✅ Check complete!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDb();

