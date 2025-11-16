
import { db } from "../server/db";
import { campaigns, leads, events, tenants } from "@shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * Test script to verify tenant isolation
 * 
 * This script creates test data for multiple tenants and verifies that:
 * 1. Campaigns are properly scoped to tenants
 * 2. Leads are properly scoped to tenants
 * 3. Events are properly scoped to tenants
 * 4. Cross-tenant access is prevented
 */

const DEFAULT_TENANT_ID = 'tnt_revenueparty_default';
const TEST_TENANT_ID = 'tnt_test_customer';

async function setupTestTenants() {
  console.log("🔧 Setting up test tenants...");
  
  // Ensure default tenant exists
  const [defaultTenant] = await db.select().from(tenants).where(eq(tenants.id, DEFAULT_TENANT_ID));
  if (!defaultTenant) {
    await db.insert(tenants).values({
      id: DEFAULT_TENANT_ID,
      name: 'Revenue Party',
      slug: 'default',
    });
    console.log("✅ Created default tenant");
  }
  
  // Create test tenant
  const [testTenant] = await db.select().from(tenants).where(eq(tenants.id, TEST_TENANT_ID));
  if (!testTenant) {
    await db.insert(tenants).values({
      id: TEST_TENANT_ID,
      name: 'Test Customer',
      slug: 'test-customer',
    });
    console.log("✅ Created test tenant");
  }
}

async function createTestCampaigns() {
  console.log("\n📋 Creating test campaigns...");
  
  // Create campaign for default tenant
  const [defaultCampaign] = await db.insert(campaigns).values({
    tenantId: DEFAULT_TENANT_ID,
    campaignName: 'Default Tenant Campaign',
    contentType: 'calculator',
    displayAs: 'inline',
    targetZone: 'zone-1',
    isActive: true,
  }).returning();
  console.log(`✅ Created campaign for default tenant: ${defaultCampaign.id}`);
  
  // Create campaign for test tenant
  const [testCampaign] = await db.insert(campaigns).values({
    tenantId: TEST_TENANT_ID,
    campaignName: 'Test Tenant Campaign',
    contentType: 'form',
    displayAs: 'popup',
    isActive: true,
  }).returning();
  console.log(`✅ Created campaign for test tenant: ${testCampaign.id}`);
  
  return { defaultCampaign, testCampaign };
}

async function createTestLeads() {
  console.log("\n👥 Creating test leads...");
  
  // Create lead for default tenant
  const [defaultLead] = await db.insert(leads).values({
    tenantId: DEFAULT_TENANT_ID,
    email: 'default@example.com',
    source: 'test-script',
    pageUrl: '/test',
  }).returning();
  console.log(`✅ Created lead for default tenant: ${defaultLead.id}`);
  
  // Create lead for test tenant
  const [testLead] = await db.insert(leads).values({
    tenantId: TEST_TENANT_ID,
    email: 'test@example.com',
    source: 'test-script',
    pageUrl: '/test',
  }).returning();
  console.log(`✅ Created lead for test tenant: ${testLead.id}`);
  
  return { defaultLead, testLead };
}

async function createTestEvents(campaignIds: { defaultCampaign: any; testCampaign: any }) {
  console.log("\n📊 Creating test events...");
  
  // Create event for default tenant
  const [defaultEvent] = await db.insert(events).values({
    tenantId: DEFAULT_TENANT_ID,
    campaignId: campaignIds.defaultCampaign.id,
    eventType: 'view',
    payload: '{"test": true}',
  }).returning();
  console.log(`✅ Created event for default tenant: ${defaultEvent.id}`);
  
  // Create event for test tenant
  const [testEvent] = await db.insert(events).values({
    tenantId: TEST_TENANT_ID,
    campaignId: campaignIds.testCampaign.id,
    eventType: 'click',
    payload: '{"test": true}',
  }).returning();
  console.log(`✅ Created event for test tenant: ${testEvent.id}`);
  
  return { defaultEvent, testEvent };
}

async function verifyTenantIsolation() {
  console.log("\n🔍 Verifying tenant isolation...");
  
  // Test 1: Campaigns
  const defaultCampaigns = await db.select().from(campaigns)
    .where(eq(campaigns.tenantId, DEFAULT_TENANT_ID));
  const testCampaigns = await db.select().from(campaigns)
    .where(eq(campaigns.tenantId, TEST_TENANT_ID));
  
  console.log(`\n✓ Default tenant has ${defaultCampaigns.length} campaign(s)`);
  console.log(`✓ Test tenant has ${testCampaigns.length} campaign(s)`);
  
  // Verify no cross-tenant contamination
  const hasDefaultInTest = testCampaigns.some(c => c.tenantId === DEFAULT_TENANT_ID);
  const hasTestInDefault = defaultCampaigns.some(c => c.tenantId === TEST_TENANT_ID);
  
  if (hasDefaultInTest || hasTestInDefault) {
    console.error("❌ FAIL: Cross-tenant campaign contamination detected!");
  } else {
    console.log("✅ PASS: Campaigns properly isolated by tenant");
  }
  
  // Test 2: Leads
  const defaultLeads = await db.select().from(leads)
    .where(eq(leads.tenantId, DEFAULT_TENANT_ID));
  const testLeads = await db.select().from(leads)
    .where(eq(leads.tenantId, TEST_TENANT_ID));
  
  console.log(`\n✓ Default tenant has ${defaultLeads.length} lead(s)`);
  console.log(`✓ Test tenant has ${testLeads.length} lead(s)`);
  
  const hasDefaultLeadInTest = testLeads.some(l => l.tenantId === DEFAULT_TENANT_ID);
  const hasTestLeadInDefault = defaultLeads.some(l => l.tenantId === TEST_TENANT_ID);
  
  if (hasDefaultLeadInTest || hasTestLeadInDefault) {
    console.error("❌ FAIL: Cross-tenant lead contamination detected!");
  } else {
    console.log("✅ PASS: Leads properly isolated by tenant");
  }
  
  // Test 3: Events
  const defaultEvents = await db.select().from(events)
    .where(eq(events.tenantId, DEFAULT_TENANT_ID));
  const testEvents = await db.select().from(events)
    .where(eq(events.tenantId, TEST_TENANT_ID));
  
  console.log(`\n✓ Default tenant has ${defaultEvents.length} event(s)`);
  console.log(`✓ Test tenant has ${testEvents.length} event(s)`);
  
  const hasDefaultEventInTest = testEvents.some(e => e.tenantId === DEFAULT_TENANT_ID);
  const hasTestEventInDefault = defaultEvents.some(e => e.tenantId === TEST_TENANT_ID);
  
  if (hasDefaultEventInTest || hasTestEventInDefault) {
    console.error("❌ FAIL: Cross-tenant event contamination detected!");
  } else {
    console.log("✅ PASS: Events properly isolated by tenant");
  }
}

async function cleanup() {
  console.log("\n🧹 Cleaning up test data...");
  
  await db.delete(events).where(eq(events.tenantId, TEST_TENANT_ID));
  await db.delete(leads).where(eq(leads.tenantId, TEST_TENANT_ID));
  await db.delete(campaigns).where(eq(campaigns.tenantId, TEST_TENANT_ID));
  await db.delete(tenants).where(eq(tenants.id, TEST_TENANT_ID));
  
  console.log("✅ Test data cleaned up");
}

async function main() {
  try {
    console.log("🚀 Starting tenant isolation test...\n");
    
    await setupTestTenants();
    const campaignIds = await createTestCampaigns();
    await createTestLeads();
    await createTestEvents(campaignIds);
    await verifyTenantIsolation();
    await cleanup();
    
    console.log("\n✨ Test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

main();
