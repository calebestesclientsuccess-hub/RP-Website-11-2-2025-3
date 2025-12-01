import { db } from '../server/db';
import { users, tenants } from '../shared/schema';

async function checkDb() {
  try {
    console.log('🔍 Checking production database...\n');
    console.log(`📍 Database: ${process.env.DATABASE_URL?.substring(0, 30)}...\n`);
    
    const allTenants = await db.select().from(tenants);
    console.log('📊 Tenants found:', allTenants.length);
    allTenants.forEach(t => console.log(`  - ${t.id} (${t.name})`));
    
    const allUsers = await db.select().from(users);
    console.log('\n👥 Users found:', allUsers.length);
    allUsers.forEach(u => console.log(`  - ${u.username} | ${u.email} | tenant: ${u.tenantId}`));
    
    console.log('\n✅ Check complete!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkDb();

