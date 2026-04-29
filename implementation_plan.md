# Implementation Plan: EngelsizForum MVP

## 🛠️ Phase 1: Infrastructure & Data Setup
- [x] **Supabase Setup:** Connection utility and types.
- [ ] **Database Schema:** (Types defined in `/types/database.ts`)
    - `profiles`: id (uuid), username, full_name, avatar_url, accessibility_prefs (jsonb).
    - `categories`: id, name, slug, description, icon.
    - `topics`: id, category_id, author_id, title, content (markdown), created_at.
    - `comments`: id, topic_id, author_id, content, created_at.
- [ ] **Auth:** Sign-in/Sign-up logic with Supabase. (Implementation started)

## ♿ Phase 2: Accessibility Core (Aria's Focus)
- [ ] **AccessibilityProvider:** React Context to manage:
    - High contrast mode.
    - Font scaling (Small, Medium, Large, Extra Large).
    - Screen reader hints (Aria-labels).
    - Reduced motion.
- [ ] **Accessibility Toolbar:** Floating or fixed tool to toggle these settings.

## 🎨 Phase 3: UI Components
- [x] **Home:** Accessible landing page.
- [x] **Communities:** Topluluklar page created.
- [x] **About:** Hakkımızda page created.
- [x] **Layout:** Responsive navigation with user states.
- [x] **Forum Feed:** Accessible card design.
- [x] **Editor:** Simple, accessible markdown editor for new topics.

## 🤖 Phase 4: AI Enrichment (Felix & Bora Focus)
- [x] **Summarizer:** Integrating GLM-4.5 to summarize long forum threads.
- [ ] **Alt-Text Assistant:** Automatically suggesting alt-text for uploaded images.

## 🏁 Phase 5: Verification & Polish
- [x] **Accessibility Fix:** High contrast colors and opacities resolved.
- [x] **Missing Pages:** Communities detail and Search pages added.
- [x] Final UI Polish and animations.
