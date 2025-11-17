
ALTER TABLE "media_library" ADD COLUMN "project_id" text;

ALTER TABLE "media_library" ADD CONSTRAINT "media_library_project_id_projects_id_fk" 
FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE set null ON UPDATE no action;
