# Tab 1

# **Project Cygnus \- Sprint 0: Foundation**

**Owner:** Backend Team **Time:** 30 minutes **Based On:** Project Cygnus Technical Specification v2.1

## **1\. Sprint Goal**

The sole focus of this sprint is to establish the core database schema and type-safety for the new `scene_templates` table. This is the foundational data structure that all subsequent backend, frontend, and AI tasks will depend on.

## **2\. Technical Tasks**

$$0.1$$

Database Schema Implementation

Modify `shared/schema.ts` to add the new `sceneTemplates` table.

**Schema Definition:**

// in shared/schema.ts  
// ... imports (pgTable, varchar, text, jsonb, integer, timestamp, index, etc.)  
// ... existing schema (projects, projectScenes, etc.)

export const sceneTemplates \= pgTable("scene\_templates", {  
  // Primary identifier  
  id: varchar("id").primaryKey().$defaultFn(() \=\> \`tmpl\_${nanoid(12)}\`),  
    
  // CRITICAL: Tenant isolation  
  tenantId: varchar("tenant\_id")  
    .notNull()  
    .references(() \=\> tenants.id, { onDelete: "cascade" }),  
    
  // Template metadata  
  name: varchar("name", { length: 255 }).notNull(),  
  description: text("description"),  
    
  // The complete scene blueprint (copied from project\_scenes.sceneConfig)  
  sceneConfig: jsonb("scene\_config").$type\<SceneConfig\>().notNull(),  
    
  // Visual preview for gallery UI  
  previewImageUrl: varchar("preview\_image\_url", { length: 2048 }),  
    
  // Categorization and search  
  tags: text("tags").array().default(\[\]), // Correct Drizzle syntax for text array  
  category: varchar("category", { length: 100 }), // e.g., "hero", "testimonial", "gallery"  
    
  // Source tracking (optional \- which scene was this template created from?)  
  sourceProjectId: varchar("source\_project\_id").references(() \=\> projects.id, { onDelete: "set null" }),  
  sourceSceneId: varchar("source\_scene\_id").references(() \=\> projectScenes.id, { onDelete: "set null" }),  
    
  // Usage analytics  
  usageCount: integer("usage\_count").default(0).notNull(),  
  lastUsedAt: timestamp("last\_used\_at"),  
    
  // Auditing  
  createdAt: timestamp("created\_at").defaultNow().notNull(),  
  createdBy: varchar("created\_by").references(() \=\> users.id, { onDelete: "set null" }),  
  updatedAt: timestamp("updated\_at").defaultNow().notNull(),  
    
  // Schema versioning for migrations  
  schemaVersion: varchar("schema\_version", { length: 10 }).default("1.0").notNull(),  
});

// Indexes for performance  
export const sceneTemplatesIndexes \= \[  
  // Fast tenant filtering  
  index("scene\_templates\_tenant\_id\_idx").on(sceneTemplates.tenantId),  
    
  // Search by category  
  index("scene\_templates\_category\_idx").on(sceneTemplates.category),  
    
  // Full-text search on name/description  
  index("scene\_templates\_search\_idx").on(sceneTemplates.name, sceneTemplates.description),  
\];

$$0.2$$

Zod Schemas and TypeScript Types

In the same file (`shared/schema.ts`), define the Zod schemas for validation and export the new TypeScript types.

// ... after table definition

// Zod schemas for validation  
export const insertSceneTemplateSchema \= createInsertSchema(sceneTemplates)  
  .omit({   
    id: true,   
    createdAt: true,   
    updatedAt: true,  
    usageCount: true,  
    lastUsedAt: true,  
  })  
  .extend({  
    name: z.string().min(3, "Template name must be at least 3 characters").max(255),  
    description: z.string().max(1000).optional(),  
    sceneConfig: sceneConfigSchema, // Reuse existing validation from projectScenes  
    tags: z.array(z.string()).max(10).optional(),  
    category: z.enum(\["hero", "testimonial", "gallery", "split", "text", "media", "other"\]).optional(),  
  });

export type InsertSceneTemplate \= z.infer\<typeof insertSceneTemplateSchema\>;  
export type SceneTemplate \= typeof sceneTemplates.$inferSelect;

$$0.3$$

Migration

Run the Drizzle migration to push the schema changes to the database:  
npm run db:push \--force

1.   
2. Verify the table and its indexes exist in your PostgreSQL database.

## **3\. Definition of Done**

Sprint 0 is complete when:

* The `scene_templates` table and its indexes exist in the database.  
* The `insertSceneTemplateSchema`, `InsertSceneTemplate`, and `SceneTemplate` types are exported from `shared/schema.ts`.  
* The code is committed to version control.

# Tab 2

# **Project Cygnus \- Sprint 1: Backend API Layer**

**Owner:** Backend Team **Time:** 2-3 hours **Based On:** Project Cygnus Technical Specification v2.1

## **1\. Sprint Goal**

Implement the complete, production-ready backend API for `scene_templates`. This includes all CRUD operations, tenant isolation, media validation, and the core "recycle" logic. This sprint provides the functional endpoints the frontend will consume.

## **2\. Dependencies**

* **Sprint 0 must be complete.** This code depends on the `sceneTemplates` schema and types from `shared/schema.ts`.

## **3\. Technical Tasks**

### **\[1.1\] POST /api/scene-templates/create-from-scene**

* **Action:** "Save As Template."  
* **File:** `server/routes.ts` (or equivalent controller).  
* **Request Validation:** Use Zod schema: `sceneId` (string required), `templateName` (3-255 chars), `description` (max 1000 optional), `category` (enum optional), `tags` (array max 10 optional), `previewImageUrl` (URL optional).  
* **Security & Validation Logic (Critical):**  
  1. Fetch the source `project_scene` with a join to `projects` to get its `tenantId`.  
  2. Verify `sourceScene.project.tenantId === req.tenantId`. Return 403 if mismatch.  
  3. Validate `sourceScene.sceneConfig` against the `sceneConfigSchema`.  
* **Media Validation (Critical):**  
  1. Extract *all* `mediaId`s from `sceneConfig.content` (e.g., `mediaId`, `mediaMediaId`, `images[].mediaId`).  
  2. Query `media_library` table: `WHERE id IN (...) AND tenantId = req.tenantId`.  
  3. If `mediaRecords.length !== mediaIdsToValidate.size`, return a 403 error with the `invalidMediaIds` array. This prevents cross-tenant media theft.  
* **Logic:**  
  1. Auto-generate `category` from `sceneConfig.type` if not provided.  
  2. Auto-generate `previewImageUrl`: use `content.url` or `content.images[0].url` if available.  
  3. Create the new `scene_templates` row with all metadata.  
* **Response:** `201` with the created `SceneTemplate` object.

### **\[1.2\] GET /api/scene-templates**

* **Action:** Lists available templates for the recycler modal.  
* **File:** `server/routes.ts`.  
* **Query Parameters:** `category`, `tag`, `search`, `limit` (default 50, max 100), `offset` (default 0), `sortBy` (enum: "recent" | "popular" | "name").  
* **Logic:**  
  1. **Security:** Start the query with a *mandatory* `WHERE eq(sceneTemplates.tenantId, req.tenantId)` clause.  
  2. Add optional filters for `category`, `tag` (using `sql`${tag} \= ANY(${sceneTemplates.tags})`), and` search`(using`ILIKE`on`name`/`description\`).  
  3. Implement `ORDER BY` logic for `sortBy`.  
  4. Execute the paginated query and a separate `count(*)` query.  
* **Response:** `200` with `{ templates: SceneTemplate[], total: number, limit: number, offset: number }`.

### **\[1.3\] POST /api/projects/:projectId/scenes/recycle**

* **Action:** "Recycles" (clones) a template into a project.  
* **File:** `server/routes.ts`.  
* **Request Body:** `templateId` (string required), `order` (number optional), `customizations` (optional object with `content` and `director` overrides).  
* **Implementation (Use `db.transaction(async (tx) => { ... })` for this entire block):**  
  1. **Validation:**  
     * Verify `project` (from `:projectId`) exists and `project.tenantId === req.tenantId`.  
     * Fetch `template` (from `templateId`) and verify `template.tenantId === req.tenantId`.  
  2. **Media Validation & Orphan Cleanup:**  
     * Extract all `mediaId`s from `template.sceneConfig`.  
     * Query `media_library` for `WHERE id IN (...) AND tenantId = req.tenantId`.  
     * Identify `orphanedMediaIds` (IDs in template but not in DB or wrong tenant).  
     * **Graceful Degradation:** Create a `cleanedSceneConfig` by stripping the orphaned `mediaId` fields (but keeping `url`s). Log a warning.  
     * **Auto-Link:** For valid media, ensure it is associated with the target `projectId`.  
  3. **Apply Customizations:** If `customizations` exist, merge them into `cleanedSceneConfig`.  
  4. **Add Lineage:** Add `_sourceTemplateId` and `_recycledAt` to the `cleanedSceneConfig`.  
  5. **Scene Ordering:**  
     * If `order` is not specified: `finalOrder = (max order in project) + 1`.  
     * If `order` is specified: `finalOrder = order`, and run `UPDATE project_scenes SET order = order + 1 WHERE order >= finalOrder AND projectId = ...` (using `tx`).  
  6. **Create Scene:** `tx.insert(projectScenes)` with the `projectId`, `cleanedSceneConfig`, and `finalOrder`.  
  7. **Update Analytics:** `tx.update(sceneTemplates)` to increment `usageCount` and set `lastUsedAt`.  
  8. **(Optional but Recommended) Version History:** `tx.insert(portfolioVersions)` to log the recycle event for rollback.  
* **Response:** `201` with `{ scene: newScene, warnings: orphanedMediaIds.length > 0 ? { ... } : null }`.

### **\[1.4\] PATCH /api/scene-templates/:id**

* **Action:** Updates template metadata (name, description, etc. \- NOT `sceneConfig`).  
* **File:** `server/routes.ts`.  
* **Logic:** Fetch template, verify `tenantId`, update fields, set `updatedAt`.  
* **Response:** `200` with updated `SceneTemplate`.

### **\[1.5\] DELETE /api/scene-templates/:id**

* **Action:** Deletes a template.  
* **File:** `server/routes.ts`.  
* **Logic:** Fetch template, verify `tenantId`, delete.  
* **Response:** `204 No Content`.

## **4\. Definition of Done**

Sprint 1 is complete when:

* All 5 API endpoints are implemented in `server/routes.ts`.  
* All endpoints are verifiable via a tool like Postman or `curl`.  
* All endpoints *strictly* enforce `tenantId` isolation.  
* `create-from-scene` and `recycle` endpoints correctly validate all `mediaId`s.  
* The `recycle` endpoint correctly handles scene ordering and runs in a transaction.

# Tab 3

# **Project Cygnus \- Sprint 2: Frontend UI & Integration**

**Owner:** Frontend Team **Time:** 2-3 hours **Based On:** Project Cygnus Technical Specification v2.1

## **1\. Sprint Goal**

Build the complete frontend user experience for scene recycling. This includes the "Save As Template" button, the "Add from Library" modal, and the React Query hooks to power them. This sprint makes the feature tangible for the user.

## **2\. Dependencies**

* **Sprint 1 must be complete.** This entire sprint consumes the APIs built in Sprint 1\.

## **3\. Technical Tasks**

### **\[2.1\] Build `useRecycleScene` Hook**

* **File:** `client/src/hooks/useRecycleScene.ts`  
* **Action:** This hook is required by other components, so build it first.  
* **Logic:**  
  * Use `useMutation` from `@tanstack/react-query`.  
  * `mutationFn` should call your `apiRequest` utility for `POST /api/projects/:projectId/scenes/recycle`.  
  * Implement the `onSuccess` callback:

It *must* invalidate the project's scene list query:  
queryClient.invalidateQueries({   
  queryKey: \['/api/projects', projectId, 'scenes'\]   
});  
// Also invalidate the hydrated version if it exists  
queryClient.invalidateQueries({   
  queryKey: \['/api/projects', projectId, 'scenes', { hydrate: true }\]   
});

*   
  * Handle `onError` by showing a destructive toast.

### **\[2.2\] Build `SceneRecyclerModal` Component**

* **File:** `client/src/components/admin/SceneRecyclerModal.tsx`  
* **Props:** `projectId`, `isOpen`, `onClose`, `onSceneRecycled`  
* **Features:**  
  * Use `Dialog` components from `shadcn/ui`.  
  * **State:** Use `useState` for `searchTerm`, `selectedCategory`, `selectedTag`.  
  * **Data Fetching:** Use `useQuery` to call `GET /api/scene-templates`. The query key must include the filters (e.g., `['/api/scene-templates', { search, category, tag }]`).  
  * **UI \- Filters:**  
    * `Input` with `Search` icon for `searchTerm`. (Use debouncing).  
    * `Tabs` (`TabsList`, `TabsTrigger`) for `selectedCategory` (All, Hero, Testimonial, etc.).  
    * `Badge` components (in a flex-wrap container) for `selectedTag`.  
  * **UI \- Grid:**  
    * Show `Loader2` spinner on `isLoading`.  
    * Show `AlertCircle` on `error`.  
    * Show "No templates found" message if `data.templates.length === 0`.  
    * Render a responsive `grid` (cols-1 md:2 lg:3) of `TemplateCard` components.  
  * **UI \- Footer:** Show stats: "Showing {data.templates.length} of {data.total} templates".

### **\[2.3\] Build `TemplateCard` Sub-Component**

* **File:** Can be inlined within `SceneRecyclerModal.tsx`.  
* **Props:** `template`, `onRecycle`, `isRecycling`  
* **Logic:**  
  * **Preview:** `aspect-video` div. Show `previewImageUrl` if it exists. If not, show a fallback icon based on `sceneConfig.type`.  
  * **Metadata:** Show `usageCount` badge, `name`, `description` (line-clamped), and `tags`.  
  * **Action:** `Button` ("Add to Project") that calls `onRecycle(template.id)`. Show loading state (`Loader2` spinner) if `isRecycling` is true.

### **\[2.4\] Build `SaveAsTemplateButton` Component**

* **File:** `client/src/components/admin/SaveAsTemplateButton.tsx`  
* **Features:**  
  * A `Button` ("Save as Template") that opens a `Dialog`.  
  * **Form:** The dialog contains a form for `templateName` (with char counter), `description` (with char counter), and the `tags` input system (input \+ "Add" button \+ list of removable badges).  
  * **Validation:** Client-side validation for `templateName.length >= 3`.  
  * **State:** Use `useMutation` to call `POST /api/scene-templates/create-from-scene`.  
  * **Callbacks:**  
    * `onSuccess`: Invalidate `['/api/scene-templates']` query, show success toast, close dialog.  
    * `onError`: Show destructive toast.

### **\[2.5\] Integration into `ProjectSceneEditor` (Critical)**

* **File:** `client/src/pages/admin/ProjectSceneEditor.tsx` (or your main editor component).  
* **Actions:**  
  1. Add `useState` for `[showRecyclerModal, setShowRecyclerModal]`.  
  2. In the scene list header, add a new "Add from Library" `Button`. `onClick` sets `setShowRecyclerModal(true)`.  
  3. Render the `<SceneRecyclerModal ... />` component, passing all required props.  
  4. In the action menu for *each scene card*, render the `<SaveAsTemplateButton sceneId={scene.id} ... />`.

## **4\. Definition of Done**

Sprint 2 is complete when:

* A user can click a "Save as Template" button on a scene, fill out the form, and the template is created.  
* A user can click "Add from Library," see the `SceneRecyclerModal`, and view a grid of templates.  
* Search, category, and tag filters work in the modal.  
* Clicking "Add to Project" on a template closes the modal and the new scene appears *immediately* in the `ProjectSceneEditor` list (verifying React Query invalidation).

# Tab 4

# **Project Cygnus \- Sprint 3: AI Enhancement**

**Owner:** AI / Backend Team **Time:** 1-2 hours **Based On:** Project Cygnus Technical Specification v2.1

## **1\. Sprint Goal**

Evolve the AI from a pure "generator" to an "assembler" by making it "template-aware." This sprint teaches the AI to use the new template library as its first choice, improving the quality, consistency, and speed of AI-driven generation.

## **2\. Dependencies**

* **Sprint 0 must be complete.** The `scene_templates` table must exist to be queried.

## **3\. Technical Tasks**

### **\[3.1\] Load Template Library in AI Endpoint**

* **File:** `server/routes.ts` (or `server/utils/portfolio-director.ts`, wherever the AI prompt context is built).  
* **Location:** Inside the `POST /api/portfolio/generate-enhanced` (or `generate-ai`) endpoint, *before* calling Gemini.  
* **Logic:**

After fetching `availableMediaLibrary`, add a new query:  
const availableTemplates \= await db.query.sceneTemplates.findMany({  
  where: eq(sceneTemplates.tenantId, req.tenantId),  
  orderBy: \[desc(sceneTemplates.usageCount), desc(sceneTemplates.createdAt)\],  
  limit: 20, // Limit to top 20 most popular/recent  
});

console.log(\`\[Portfolio Generation\] Loaded ${availableTemplates.length} scene templates for tenant ${req.tenantId}\`);

1. 

### **\[3.2\] Inject Template Context into AI Prompt**

* **File:** `server/utils/portfolio-director.ts` (or wherever the prompt string is constructed).  
* **Action:** Prepend the following text block to the *beginning* of the system prompt context.

**Prompt Addition:**  
\<AVAILABLE\_SCENE\_TEMPLATES\>  
${availableTemplates.length \> 0   
  ? availableTemplates.map(tmpl \=\> \`  
  \---  
  Template ID: ${tmpl.id}  
  Name: ${tmpl.name}  
  Description: ${tmpl.description || 'No description'}  
  Type: ${tmpl.sceneConfig.type}  
  Category: ${tmpl.category || 'general'}  
  Tags: ${tmpl.tags?.join(', ') || 'none'}

  Director Config (USE THIS FOR CONSISTENCY):  
  ${JSON.stringify(tmpl.sceneConfig.director, null, 2)}

  Content Structure (Use this for field names):  
  ${JSON.stringify(tmpl.sceneConfig.content, null, 2)}  
  \---  
  \`).join('\\n')  
  : 'No templates available \- generate all scenes from scratch.'}  
\</AVAILABLE\_SCENE\_TEMPLATES\>

\<CRITICAL\_INSTRUCTIONS\_FOR\_TEMPLATE\_USAGE\>  
1\.  \*\*PREFER TEMPLATES:\*\* Your primary goal is to use \<AVAILABLE\_SCENE\_TEMPLATES\> when the user's request matches a template's purpose (e.g., user asks for "testimonial," you use a "testimonial" template).  
2\.  \*\*COPY DIRECTOR CONFIG:\*\* You \*must\* use the template's exact \`director\` config (entryEffect, duration, colors, etc.) to ensure consistency.  
3\.  \*\*CUSTOMIZE CONTENT:\*\* You \*must\* populate the template's \`content\` fields with the user's specific text, media, or other requirements.  
4\.  \*\*TRACK LINEAGE:\*\* You \*must\* include \`"\_sourceTemplateId": "tmpl\_xxx"\` in the root of your generated \`sceneConfig\` object if you use a template.  
5\.  \*\*FALLBACK:\*\* If no template matches the user's specific request, generate a new \`sceneConfig\` from scratch using animation best practices.

\*\*EXAMPLE of using a template:\*\*  
User Request: "add a dark testimonial from Jane Smith"  
Your Process:  
1\.  Find a template in the library with \`category="testimonial"\`.  
2\.  Select \`tmpl\_quote\_dark\_01\`.  
3\.  Copy its \`director\` config \*exactly\*.  
4\.  Populate its \`content\` fields with the user's data.  
5\.  Add the \`\_sourceTemplateId\` field.

Your JSON Output for that scene:  
{  
  "type": "quote",  
  "content": {  
    "quote": "This product is amazing.",  
    "author": "Jane Smith",  
    "role": "CEO of Acme"   
  },  
  "director": {  
    "entryEffect": "fade",  
    "entryDuration": 1.5,  
    "backgroundColor": "\#111111",  
    "textColor": "\#FFFFFF",  
    "parallaxIntensity": 0.2  
  },  
  "\_sourceTemplateId": "tmpl\_quote\_dark\_01"   
}  
\</CRITICAL\_INSTRUCTIONS\_FOR\_TEMPLATE\_USAGE\>

* 

### **\[3.3\] Add Template Usage Logging**

* **File:** `server/routes.ts` (or AI endpoint).  
* **Location:** *After* receiving the `portfolioResult.scenes` array from Gemini.

**Logic:**  
// Track template usage  
let templateUsageCount \= 0;  
const templateUsageDetails: string\[\] \= \[\];

portfolioResult.scenes.forEach((scene, idx) \=\> {  
  if (scene.\_sourceTemplateId) {  
    templateUsageCount++;  
    templateUsageDetails.push(  
      \`Scene ${idx \+ 1} (${scene.type}): used template ${scene.\_sourceTemplateId}\`  
    );  
  }  
});

console.log(\`\[AI Template Usage\] ${templateUsageCount}/${portfolioResult.scenes.length} scenes used templates\`);  
if (templateUsageDetails.length \> 0\) {  
  console.log('\[AI Template Details\]:\\n' \+ templateUsageDetails.join('\\n'));  
}

* 

## **4\. Definition of Done**

Sprint 3 is complete when:

* The system prompt sent to Gemini correctly includes the `AVAILABLE_SCENE_TEMPLATES` and `CRITICAL_INSTRUCTIONS_FOR_TEMPLATE_USAGE` sections.  
* When a user makes a request (e.g., "add a testimonial") that matches a template, the generated `sceneConfig` includes the `_sourceTemplateId` field.  
* The generated scene's `director` config *exactly* matches the template's `director` config.  
* The server logs correctly print `[AI Template Usage]` statistics after a generation request.

# 1st of Project Genesis

# **Project Genesis \- Sprint 0: Platform Foundation**

**Owner:** Backend Team **Time:** 1-2 hours **Based On:** Project Genesis Technical Specification v1.0

## **1\. Sprint Goal**

This sprint establishes the foundational data model for the entire platform. We will modify the existing `tenants` and `portfolio_projects` tables to support brand identity (logos, colors) and project-level settings (slugs, generation type). This is the core "record" for the "super system of record."

## **2\. Technical Tasks**

### **\[0.1\] Database Schema: Brand Identity**

Modify the *existing* `tenants` table to store brand assets.

**File:** `shared/schema.ts`

// ... imports  
// (This assumes you have a 'tenants' table. If not, create one.)

// Define a Zod schema for brand colors  
export const brandColorsSchema \= z.object({  
  primary: z.string().regex(/^\#(\[0-9a-f\]{3}){1,2}$/i, { message: "Must be a hex color" }).default("\#000000"),  
  secondary: z.string().regex(/^\#(\[0-9a-f\]{3}){1,2}$/i, { message: "Must be a hex color" }).default("\#FFFFFF"),  
  tertiary: z.string().regex(/^\#(\[0-9a-f\]{3}){1,2}$/i, { message: "Must be a hex color" }).default("\#808080"),  
});  
export type BrandColors \= z.infer\<typeof brandColorsSchema\>;

// Add new columns to the 'tenants' table  
export const tenants \= pgTable("tenants", {  
  id: varchar("id").primaryKey(),  
  // ... existing tenant fields (name, etc.)

  // NEW: Brand Identity Fields  
  logoLightId: varchar("logo\_light\_id").references(() \=\> mediaLibrary.id, { onDelete: "set null" }),  
  logoDarkId: varchar("logo\_dark\_id").references(() \=\> mediaLibrary.id, { onDelete: "set null" }),  
    
  brandColors: jsonb("brand\_colors").$type\<BrandColors\>().default({  
    primary: "\#000000",  
    secondary: "\#FFFFFF",  
    tertiary: "\#808080",  
  }),  
});

### **\[0.2\] Database Schema: Project Configuration**

Modify the *existing* `portfolio_projects` table (or `projects`) to store the web page settings.

**File:** `shared/schema.ts`

// ... imports

// Add new columns to the 'projects' table  
export const projects \= pgTable("portfolio\_projects", {  
  id: varchar("id").primaryKey(),  
  tenantId: varchar("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "cascade" }),  
  name: varchar("name", { length: 255 }).notNull(),  
  // ... other existing fields  
    
  // NEW: Project Configuration Fields  
  slug: varchar("slug", { length: 255 }).notNull().unique(),  
    
  generationType: varchar("generation\_type", { length: 50 }).default("storyscroll").notNull(), // 'storyscroll' or 'static'  
    
  brandEnforcement: varchar("brand\_enforcement", { length: 50 }).default("strict").notNull(), // 'strict' or 'creative'  
    
  componentToolkitId: varchar("component\_toolkit\_id").default("default\_v1").notNull(), // Links to a future 'component\_toolkits' table  
});

### **\[0.3\] API: Brand & Project Endpoints**

Create/update the endpoints needed to manage these new settings.

**File:** `server/routes.ts`

1. **`PATCH /api/tenants/:id/brand`**  
   * **Action:** Updates the brand identity for the tenant.  
   * **Body:** `{ logoLightId?: string, logoDarkId?: string, brandColors?: BrandColors }`  
   * **Validation:** Use Zod (`brandColorsSchema`) to validate color object.  
   * **Logic:** Update the `tenants` table.  
2. **`POST /api/projects` (The "Create Web Page" Button)**  
   * **Action:** Creates a new, empty project shell.  
   * **Body:** `{ name: string, slug: string, generationType: 'storyscroll' | 'static' }`  
   * **Logic:**  
     1. Validate the `slug` (check for duplicates, valid characters).  
     2. Create the new `projects` row with the `tenantId` from the authenticated user.  
   * **Response:** `201` with the new project object.  
3. **`PATCH /api/projects/:id/settings`**  
   * **Action:** Updates a project's core settings.  
   * **Body:** `{ slug?: string, generationType?: 'storyscroll' | 'static', brandEnforcement?: 'strict' | 'creative', componentToolkitId?: string }`  
   * **Logic:** Validate inputs and update the `projects` table.

### **\[0.4\] Migration**

Run the Drizzle migration to apply schema changes:  
npm run db:push \--force

1. 

## **4\. Definition of Done**

Sprint 0 is complete when:

* The `tenants` and `projects` tables are successfully migrated with the new columns.  
* Zod schemas and TypeScript types for `BrandColors` are created.  
* The three new API endpoints (`/api/tenants/:id/brand`, `/api/projects`, `/api/projects/:id/settings`) are functional and testable via Postman.  
* The `slug` field is correctly validated for uniqueness.

# Tab 6

# **Project Genesis \- Sprint 1: The Generation Wizard**

**Owner:** Frontend & AI Teams **Time:** 2-3 hours **Based On:** Project Genesis Technical Specification v1.0

## **1\. Sprint Goal**

Build the multi-step user interface (the "Wizard") that captures all generation parameters. This sprint's output is a "Submit" button that sends a perfectly formatted, comprehensive prompt to the AI Director to generate the initial JSON.

## **2\. Dependencies**

* **Sprint 0 must be complete.** This sprint's UI reads/writes the `project` settings (slug, generationType) created in Sprint 0\.

## **3\. Technical Tasks**

### **\[3.1\] Frontend: `ProjectCreationWizard` Component**

* **File:** `client/src/components/admin/ProjectCreationWizard.tsx`  
* **Purpose:** A multi-step modal or full-page component that implements the "User's Journey."

**State Management:** Use `useState` or `useReducer` to manage a single `wizardState` object:  
interface WizardState {  
  step: number; // 1, 2, 3...  
  name: string;  
  slug: string;  
  generationType: 'storyscroll' | 'static';  
  brandEnforcement: 'strict' | 'creative';  
  componentToolkitId: string;  
  directorNotes: string;  
  sections: Array\<{ type: string; size: 'small' | 'medium' | 'large' | 'fullscreen'; notes: string }\>;  
}

*   
* **UI Flow:**  
  1. **Step 1: Project Basics:**  
     * Input for `name` (e.g., "New Landing Page").  
     * Input for `slug` (e.g., "new-landing-page").  
     * Calls `POST /api/projects` to create the project shell. On success, stores the new `projectId` and moves to Step 2\.  
  2. **Step 2: Generation Settings:**  
     * Radio group for `generationType` (Storyscroll vs. Static).  
     * Radio group for `brandEnforcement` (Strict Colors vs. Creative Freedom).  
     * Dropdown for `componentToolkitId` (for now, hardcode "Default v1").  
     * Calls `PATCH /api/projects/:id/settings` to save these.  
  3. **Step 3: Section Planning (Optional):**  
     * UI to add/remove sections (`wizardState.sections`).  
     * For each section: Dropdown for `size`, `type` (e.g., 'hero', 'quote'), and a text input for `notes`.  
  4. **Step 4: Director Notes:**  
     * A large `<Textarea>` for `directorNotes` (the user's main prompt).  
  5. **Final Step: "Generate" Button:**  
     * This button is the final task. It bundles `wizardState` and sends it to the AI generation endpoint.

### **\[3.2\] Backend: AI Director Endpoint & Prompt**

* **File:** `server/routes.ts`  
* **Endpoint:** `POST /api/projects/:id/generate` (This can be your existing `generate-ai` or `generate-cinematic` endpoint).  
* **Action:** This endpoint receives the `wizardState` from the frontend and uses it to build a comprehensive prompt for Gemini.  
* **File:** `server/utils/portfolio-director.ts`

**Logic:** Build the *master prompt* sent to Gemini.  
// 1\. Fetch all required data  
const project \= await db.query.projects.findFirst(...);  
const tenant \= await db.query.tenants.findFirst(...);  
const brandColors \= tenant.brandColors;  
const mediaLibrary \= await db.query.mediaLibrary.findMany(...);  
const sceneTemplates \= await db.query.sceneTemplates.findMany(...); // From Cygnus

// 2\. Get wizard data from request body  
const wizardState \= req.body; 

// 3\. Construct the Master Prompt  
const systemPrompt \= \`  
\<SESSION\_GOAL\>  
Generate a full JSON array of 'sceneConfig' objects for a new web page.  
\</SESSION\_GOAL\>

\<BRAND\_CONFIG\>  
Primary Color: ${brandColors.primary}  
Secondary Color: ${brandColors.secondary}  
Tertiary Color: ${brandColors.tertiary}  
Brand Enforcement: ${project.brandEnforcement}   
(If 'strict', all 'backgroundColor' and 'textColor' properties MUST be derived from these colors).  
\</BRAND\_CONFIG\>

\<PROJECT\_SETTINGS\>  
Project Name: ${project.name}  
URL Slug: /${project.slug}  
Generation Type: ${project.generationType}  
(If 'storyscroll', you MUST use the 'director' config to create scroll-based animations. If 'static', use 'entryEffect' only.)  
\</PROJECT\_SETTINGS\>

\<COMPONENT\_TOOLKIT\>  
Toolkit ID: ${project.componentToolkitId}  
Available Scene Types: \["fullscreen", "split", "gallery", "quote", "text", "image", "video"\]  
\</COMPONENT\_TOOLKIT\>

\<USER\_DIRECTOR\_NOTES\>  
${wizardState.directorNotes}  
\</USER\_DIRECTOR\_NOTES\>

\<USER\_SECTION\_PLAN\>  
(If any scenes are defined here, you MUST generate them in this order.)  
${wizardState.sections.map((s, i) \=\> \`  
  \- Scene ${i+1}:   
    Type: ${s.type},   
    Size: ${s.size},   
    Notes: ${s.notes}  
\`).join('\\n')}  
\</USER\_SECTION\_PLAN\>

\<AVAILABLE\_MEDIA\_LIBRARY\>  
(Context from existing 'media\_library' table...)  
\</AVAILABLE\_MEDIA\_LIBRARY\>

\<AVAILABLE\_SCENE\_TEMPLATES\>  
(Context from 'scene\_templates' \- Project Cygnus Sprint 3...)  
\</AVAILABLE\_SCENE\_TEMPLATES\>

\<CRITICAL\_INSTRUCTIONS\>  
1\.  Your response MUST be a valid JSON array of 'sceneConfig' objects.  
2\.  Use the 'AVAILABLE\_SCENE\_TEMPLATES' first if they match a section request.  
3\.  Populate 'mediaId' fields from 'AVAILABLE\_MEDIA\_LIBRARY'.  
4\.  Obey all 'BRAND\_ENFORCEMENT' and 'GENERATION\_TYPE' rules.  
5\.  The JSON MUST be 100% compliant with the 'sceneConfigSchema'.  
\</CRITICAL\_INSTRUCTIONS\>

Respond with the JSON array.  
\`;

// 4\. Call Gemini with this 'systemPrompt'  
// 5\. Save the resulting JSON array to the 'project\_scenes' table.

* 

## **4\. Definition of Done**

Sprint 1 is complete when:

* The `ProjectCreationWizard.tsx` component is functional, capturing all user inputs across its steps.  
* The "Generate" button successfully calls the `POST /api/projects/:id/generate` endpoint.  
* The backend endpoint correctly fetches all context (brand, media, templates) and assembles the complete `systemPrompt` as defined.  
* The AI's response (the JSON array) is successfully saved to the `project_scenes` table.

# Tab 7

# **Project Genesis \- Sprint 2: The Hybrid Studio**

**Owner:** Frontend & Backend Teams **Time:** 2-3 hours **Based On:** Project Genesis Technical Specification v1.0

## **1\. Sprint Goal**

Build the hybrid editing environment. This includes the admin-only `/test` preview, the direct JSON editor, and the "re-prompt" chat interface that allows users to iteratively refine the AI-generated page.

## **2\. Dependencies**

* **Sprint 1 must be complete.** This sprint edits the `project_scenes` JSON that the Generation Wizard created.

## **3\. Technical Tasks**

### **\[3.1\] Backend: Admin-Only Preview Route**

* **File:** `server/routes.ts`  
* **Action:** Create a new GET route that dynamically renders a project for admins.

**Logic:**  
// Add this route BEFORE any wildcard client-side routing  
app.get('/:slug/test', requireAdminAuth, async (req, res) \=\> {  
  try {  
    const { slug } \= req.params;

    // 1\. Find project by slug  
    const project \= await db.query.projects.findFirst({  
      where: and(  
        eq(projects.slug, slug),  
        eq(projects.tenantId, req.tenantId) // Ensure tenant isolation  
      )  
    });

    if (\!project) {  
      return res.status(404).send("Project not found");  
    }

    // 2\. Fetch all scenes for this project  
    const scenes \= await db.query.projectScenes.findMany({  
      where: eq(projectScenes.projectId, project.id),  
      orderBy: \[asc(projectScenes.order)\]  
    });

    // 3\. Hydrate Media (This is your existing logic)  
    // const hydratedScenes \= await hydrateMedia(scenes, req.tenantId);

    // 4\. Render the page  
    // This part depends on your SSR setup. You might send the  
    // client-side app with this data, or render it server-side.  
    // For a Vite/React app, you'd typically send the main HTML  
    // with the scene data embedded as a JSON blob.

    // Example: Sending data to the client to render  
    res.render('index.html', {  
      // Embed data for the client app to pick up  
      \_\_PROJECT\_DATA\_\_: {  
        project,  
        scenes, // or hydratedScenes  
      }  
    });

  } catch (error) {  
    res.status(500).send("Error rendering test page");  
  }  
});

* 

### **\[3.2\] Frontend: The Hybrid Editor UI**

* **File:** `client/src/pages/admin/ProjectEditor.tsx` (This is your existing `ProjectSceneEditor.tsx`).  
* **Goal:** Create a two-column layout.  
* **Left Column:** The editing interface.  
* **Right Column:** The live preview (in an `<iframe>` pointing to the `/test` URL).

**Left Column Components:**

1. **JSON Editor:**  
   * A tab containing a text editor (like Monaco or a simple `<textarea>`) displaying the *full* `scenes` JSON array.  
   * A "Save JSON" button that calls `PATCH /api/projects/:id/scenes` (a new endpoint to bulk-save the entire JSON array).  
2. **`ChatPanel.tsx` (New Component):**  
   * A new chat interface.  
   * Displays `portfolio_conversations` history.  
   * A text input for the user to type new prompts (e.g., "Make the hero section's text bigger").

### **\[3.3\] Backend: The "Re-Prompt" (Chat) Endpoint**

* **File:** `server/routes.ts`  
* **Endpoint:** `POST /api/projects/:id/chat`  
* **Action:** Receives a single chat message and regenerates the project.  
* **Logic:**  
  1. This is a *"lite" version* of the `POST /api/projects/:id/generate` endpoint.  
  2. **Save Message:** Save the user's new message to `portfolio_conversations`.  
  3. **Build Context:**  
     * Fetch `project`, `tenant` (for brand), `mediaLibrary`, `sceneTemplates`.  
     * Fetch the *complete `portfolio_conversations` history*.  
     * Fetch the *current `project_scenes` JSON*.

**Build Prompt:** Create a *new* system prompt for "editing":  
\<SESSION\_GOAL\>  
You are editing an existing web page. The user will provide a new instruction.  
You MUST return the \*complete, new\* JSON array of 'sceneConfig' objects.  
Do NOT just return the change. Return the full page.  
\</SESSION\_GOAL\>

\<CURRENT\_PAGE\_JSON\>  
${JSON.stringify(currentScenes, null, 2)}  
\</CURRENT\_PAGE\_JSON\>

\<BRAND\_CONFIG\>...\</BRAND\_CONFIG\>  
\<AVAILABLE\_MEDIA\_LIBRARY\>...\</AVAILABLE\_MEDIA\_LIBRARY\>  
\<AVAILABLE\_SCENE\_TEMPLATES\>...\</AVAILABLE\_SCENE\_TEMPLATES\>  
\<CRITICAL\_INSTRUCTIONS\>...\</CRITICAL\_INSTRUCTIONS\>

\<CONVERSATION\_HISTORY\>  
${conversationHistory.map(msg \=\> \`${msg.role}: ${msg.content}\`).join('\\n')}  
\</CONVERSATION\_HISTORY\>

\<USER\_LATEST\_REQUEST\>  
${latestUserMessage}  
\</USER\_LATEST\_REQUEST\>

Respond with the \*complete, updated\* JSON array.

4.   
   5. **Execute:** Call Gemini, get the new JSON array.  
   6. **Save:** *Replace* the old `project_scenes` with the new ones. (Or use a diffing library for advanced optimization).  
   7. **Response:** `200` with the new scenes array.

### **\[3.4\] Frontend: Connecting the Loop**

* The `ChatPanel.tsx`'s "Send" button calls `POST /api/projects/:id/chat`.  
* The `useMutation` hook for this call *must* invalidate the project scenes query.  
* This will automatically refresh the `<iframe>` on the right (or you can force a reload) to show the user's change live.

## **4\. Definition of Done**

Sprint 2 is complete when:

* Admins can navigate to `/:slug/test` and see a preview of the page.  
* The `ProjectEditor.tsx` shows a JSON editor and a `ChatPanel.tsx`.  
* A user can type "Make the hero headline 'Hello World'" into the chat, press send, and see the preview on the right update with "Hello World."  
* A user can manually edit the JSON, click "Save JSON," and see the preview update.

# Tab 8

# **Project Genesis \- Sprint 3: The Toolkit Engine**

**Owner:** Frontend & Backend Teams **Time:** 2-3 hours **Based On:** Project Genesis Technical Specification v1.0

## **1\. Sprint Goal**

Implement the "Component Toolkit" architecture. This decouples the AI-generated JSON (`sceneConfig`) from the React components that render it. This allows us to create different "themes" or "toolkits" (e.g., "Default v1," "Client X Custom") that can render the *same* JSON in completely different visual styles.

## **2\. Dependencies**

* **Sprint 0-2 must be complete.** This system modifies the `SceneRenderer` and builds upon the `projects.componentToolkitId` field.

## **3\. Technical Tasks**

### **\[3.1\] Backend: `component_toolkits` Table**

* **File:** `shared/schema.ts`  
* **Action:** This can be a "soft" feature (hardcoded map) or a "hard" feature (database table). For a scalable system, we'll use a table.

**Schema:**  
export const componentToolkits \= pgTable("component\_toolkits", {  
  id: varchar("id").primaryKey(), // e.g., 'default\_v1'  
  name: varchar("name", { length: 255 }).notNull(),  
  description: text("description"),  
  tenantId: varchar("tenant\_id").references(() \=\> tenants.id, { onDelete: "cascade" }), // NULL \= global/system toolkit  
  availableSceneTypes: text("available\_scene\_types").array().notNull(), // \['fullscreen', 'split', 'quote', 'client\_x\_hero'\]  
});

*   
* **Migration:** Run `npm run db:push --force`.

**Seed:** Insert your "Default v1" toolkit into this table.  
INSERT INTO component\_toolkits (id, name, availableSceneTypes)   
VALUES ('default\_v1', 'Default Toolkit', ARRAY\['fullscreen', 'split', 'gallery', 'quote', 'text', 'image', 'video'\]);

* 

### **\[3.2\] Frontend: The Dynamic Component "Registry"**

* **File:** `client/src/components/branding/toolkits/default_v1.ts`  
* **Action:** Create a "registry" file that maps string keys to your actual React components.

**Logic:**  
// This file defines your 'Default v1' toolkit  
import FullscreenScene from '../scenes/FullscreenScene.tsx';  
import SplitScene from '../scenes/SplitScene.tsx';  
import GalleryScene from '../scenes/GalleryScene.tsx';  
import QuoteScene from '../scenes/QuoteScene.tsx';  
// ... import all your scene components

export const defaultToolkit \= new Map\<string, React.ComponentType\<any\>\>(\[  
  \['fullscreen', FullscreenScene\],  
  \['split', SplitScene\],  
  \['gallery', GalleryScene\],  
  \['quote', QuoteScene\],  
  // ... etc.  
\]);

*   
* **File:** `client/src/components/branding/toolkits/registry.ts`  
* **Action:** Create a master registry that knows how to load toolkits.

**Logic:**  
import { defaultToolkit } from './default\_v1.ts';  
// Import other toolkits as you build them  
// import { clientXToolkit } from './client\_x.ts';

const toolkitRegistry \= new Map\<string, Map\<string, React.ComponentType\<any\>\>\>(\[  
  \['default\_v1', defaultToolkit\],  
  // \['client\_x', clientXToolkit\],  
\]);

export const getComponent \= (toolkitId: string, sceneType: string) \=\> {  
  const toolkit \= toolkitRegistry.get(toolkitId);  
  if (\!toolkit) {  
    console.error(\`Unknown toolkit: ${toolkitId}\`);  
    return null;  
  }  
  const SceneComponent \= toolkit.get(sceneType);  
  if (\!SceneComponent) {  
    console.error(\`Unknown scene type '${sceneType}' in toolkit '${toolkitId}'\`);  
    return null;  
  }  
  return SceneComponent;  
};

* 

### **\[3.3\] Frontend: Modify `SceneRenderer.tsx`**

* **File:** `client/src/components/branding/SceneRenderer.tsx`  
* **Action:** Replace the static `switch` statement with a dynamic lookup.

**Logic:**  
import { getComponent } from './toolkits/registry';

// Props will include the 'project' object or just the 'toolkitId'  
interface SceneRendererProps {  
  scene: SceneConfig;  
  projectToolkitId: string;  
  // ... other props  
}

export const SceneRenderer \= ({ scene, projectToolkitId, ...props }: SceneRendererProps) \=\> {  
  // DYNAMIC LOOKUP  
  const SceneComponent \= getComponent(projectToolkitId, scene.type);

  if (\!SceneComponent) {  
    // Render a fallback or error component  
    return (  
      \<div className="text-red-500"\>  
        Error: Scene type "{scene.type}" not found in toolkit "{projectToolkitId}".  
      \</div\>  
    );  
  }

  // Render the dynamically-found component  
  return \<SceneComponent scene={scene} {...props} /\>;

  /\* // DELETE THE OLD STATIC SWITCH STATEMENT  
  switch (scene.type) {  
    case "fullscreen": return \<FullscreenScene ... /\>;  
    case "split": return \<SplitScene ... /\>;  
    // ... etc.  
  }  
  \*/  
};

* 

### **\[3.4\] AI Integration: Update AI Director**

* **File:** `server/utils/portfolio-director.ts`  
* **Action:** The prompt is already set up\! In Sprint 1, we added this line: `<Available Scene Types: ["fullscreen", "split", "gallery", "quote", "text", "image", "video"]>`  
* **Logic:** Now, you just need to make this dynamic.  
  1. Fetch the `componentToolkit` from the DB using `project.componentToolkitId`.  
  2. Inject its `availableSceneTypes` array into the prompt.

// Inside 'POST /api/projects/:id/generate'  
const toolkit \= await db.query.componentToolkits.findFirst({  
  where: eq(componentToolkits.id, project.componentToolkitId)  
});

const availableTypes \= toolkit ? toolkit.availableSceneTypes : \['fullscreen', 'split'\]; // Default fallback

// ... inside the system prompt string:  
\<COMPONENT\_TOOLKIT\>  
Toolkit ID: ${project.componentToolkitId}  
Available Scene Types: ${JSON.stringify(availableTypes)}  
(You MUST only use 'type' values from this list.)  
\</COMPONENT\_TOOLKIT\>

* 

## **4\. Definition of Done**

Sprint 3 is complete when:

* The `component_toolkits` table exists and is seeded.  
* The static `switch` statement in `SceneRenderer.tsx` is gone.  
* The `SceneRenderer.tsx` now uses `getComponent(toolkitId, sceneType)` to dynamically render scenes.  
* The AI "Director" prompt is dynamically populated with the `availableSceneTypes` from the project's selected toolkit.  
* (Test): You can manually create a `client_x` toolkit, register it, and watch the AI generate JSON and the frontend render it using your new components.

