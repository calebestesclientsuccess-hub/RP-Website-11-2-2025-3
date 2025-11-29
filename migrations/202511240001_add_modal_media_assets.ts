import { sql } from "drizzle-orm";

export const up = async (db) => {
  await db.run(
    sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS modal_media_assets JSONB NOT NULL DEFAULT '[]'::jsonb;`,
  );

  await db.run(sql`
    UPDATE projects
    SET modal_media_assets = COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', CONCAT('legacy_', ord::text),
            'type', CASE WHEN projects.modal_media_type = 'carousel' THEN 'image' ELSE 'video' END,
            'url', url
          )
        )
        FROM unnest(COALESCE(projects.modal_media_urls, ARRAY[]::text[])) WITH ORDINALITY AS media(url, ord)
      ),
      '[]'::jsonb
    )
    WHERE (modal_media_urls IS NOT NULL AND array_length(modal_media_urls, 1) > 0)
      AND (modal_media_assets IS NULL OR jsonb_array_length(modal_media_assets) = 0);
  `);
};

export const down = async (db) => {
  await db.run(
    sql`ALTER TABLE projects DROP COLUMN IF EXISTS modal_media_assets;`,
  );
};







