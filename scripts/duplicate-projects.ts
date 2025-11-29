import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const pool = new Pool({ 
  connectionString: DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

async function duplicateProjects() {
  const client = await pool.connect();
  try {
    // First, check existing projects
    const existing = await client.query('SELECT id, slug, title, client_name FROM projects');
    console.log('Existing projects:', existing.rows.length);
    existing.rows.forEach((p: any) => console.log('  -', p.slug, ':', p.client_name));
    
    // Duplicate each project 4 times with unique slugs (v2, v3, v4, v5)
    const result = await client.query(`
      INSERT INTO projects (tenant_id, slug, title, client_name, thumbnail_url, categories, challenge_text, solution_text, outcome_text, modal_media_type, modal_media_urls, testimonial_text, testimonial_author, brand_logo_url, brand_colors, component_library, asset_plan, case_study_content)
      SELECT 
        tenant_id, 
        slug || '-v' || gs.n, 
        title, 
        client_name || ' ' || gs.n, 
        thumbnail_url, 
        categories, 
        challenge_text, 
        solution_text, 
        outcome_text, 
        modal_media_type, 
        modal_media_urls, 
        testimonial_text, 
        testimonial_author,
        brand_logo_url,
        brand_colors,
        component_library,
        asset_plan,
        case_study_content
      FROM projects 
      CROSS JOIN generate_series(2, 5) AS gs(n)
      WHERE slug NOT LIKE '%-v%'
      RETURNING id, slug, client_name
    `);
    
    console.log('\nCreated', result.rows.length, 'new projects:');
    result.rows.forEach((p: any) => console.log('  -', p.slug, ':', p.client_name));
    
    // Final count
    const total = await client.query('SELECT COUNT(*) FROM projects');
    console.log('\nTotal projects now:', total.rows[0].count);
  } finally {
    client.release();
    await pool.end();
  }
}

duplicateProjects().catch(console.error);

