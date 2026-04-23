# Carbon Cluster Implementation Plan

> For Hermes: implement directly in small verified steps without touching unrelated dirty files.

Goal: turn IdleForest's existing carbon-footprint pages into a real SEO cluster by adding an indexable hub page, stronger cluster navigation, and richer on-page intent matching for the highest-opportunity carbon pages.

Architecture: keep the existing dynamic child-page system for calculator pages, add a dedicated hub route at /carbon-footprint, and enrich the generic child template with optional SEO-focused content blocks sourced from lib/carbon-data.ts. This avoids a large rewrite while fixing the biggest structural gap first.

Tech Stack: Next.js 14 app router, TypeScript, next-intl, existing carbon components.

---

### Task 1: Add shared cluster metadata in lib/carbon-data.ts
Objective: expose category grouping and optional SEO content for carbon pages.

Files:
- Modify: lib/carbon-data.ts

Steps:
1. Add optional types for page-specific SEO copy / FAQs / intent bullets.
2. Add helper exports for grouping carbon items by category.
3. Add SEO content only for the highest-leverage pages first: chatgpt, youtube, netflix, instagram, tiktok, zoom.
4. Keep the existing calculator data shape backwards-compatible.

Verification:
- TypeScript compiles.
- Existing imports still work.

### Task 2: Create the missing carbon hub route
Objective: ship a real /carbon-footprint page instead of a 404.

Files:
- Create: app/[locale]/carbon-footprint/page.tsx

Steps:
1. Add metadata for the hub page.
2. Render a clear H1, methodology summary, category sections, and links to all child pages.
3. Include internal links to the highest-opportunity pages and parent topics.
4. Add JSON-LD ItemList / CollectionPage style metadata if practical.

Verification:
- Route resolves instead of 404.
- Links render for all carbon pages.

### Task 3: Enrich the dynamic child carbon page template
Objective: improve intent matching and cluster internal linking for pages already getting impressions.

Files:
- Modify: app/[locale]/carbon-footprint/[slug]/page.tsx

Steps:
1. Add an optional “what people search for” / FAQ-style section using the SEO content from lib/carbon-data.ts.
2. Add a stronger cluster navigation block back to the hub and related parent topics.
3. Improve metadata keywords and on-page copy without breaking existing localized strings.
4. Keep changes additive and safe for slugs without extra SEO content.

Verification:
- Existing pages still render.
- Enhanced pages show the new sections.

### Task 4: Strengthen cluster entry points in shared navigation surfaces
Objective: make the cluster easier for users and crawlers to discover.

Files:
- Modify: components/Footer.tsx
- Modify: app/sitemap.ts

Steps:
1. Add a direct footer link to the carbon hub.
2. Ensure /carbon-footprint is included in the sitemap.
3. Keep existing carbon child sitemap entries intact.

Verification:
- Footer includes hub link.
- Sitemap includes /carbon-footprint.

### Task 5: Verify implementation
Objective: confirm the change set is limited and valid.

Files:
- No additional files required

Steps:
1. Run targeted git diff to ensure only intended files changed.
2. Run build or lint/build verification.
3. Report any remaining warnings or blockers.

Verification:
- No unrelated dirty files were modified.
- Build passes or failures are clearly isolated and explained.
