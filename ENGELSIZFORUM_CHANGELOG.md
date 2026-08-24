# EngelsizForum Changelog & Scope (Phase 0)

- **Root Directory**: `/`
- **Next.js Version**: 15.4.9
- **Stack**: React 19, TypeScript, Tailwind CSS v4, Supabase SSR
- **Branch / Environment**: Preview Sandbox (Main/Production protected)
- **Protected Areas / Core Rules**:
  - Supabase is the sole source of truth; no local storage caching for user messages, discussions, comments, or community state.
  - Auth session persistence, recovery sessionStorage, `ef_remembered_email`, and visitor device ID are preserved.
  - Synthetic profile fallbacks are strictly prohibited (`null` profile state when unauthenticated or un-synced).
  - Client-side secret keys and service-role keys are never exposed in browser bundles.
  - Fail-closed Supabase client proxy for build/import safety without credentials.
  - OG images and favicon binary validation.
