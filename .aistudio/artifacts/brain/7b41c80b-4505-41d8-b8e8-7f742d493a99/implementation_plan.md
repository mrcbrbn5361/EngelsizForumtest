# Accessibility and Developer Inspector Upgrade Plan

## Overview
This plan outlines the upgrade of the existing accessibility widget and the creation of a new, advanced developer inspection tool for the Engelliler İçin Forum Projesi, focusing on WCAG 2.1 AA/AAA compliance, enhanced usability for diverse user groups, and robust development debugging capabilities.

## 1. Accessibility Panel Upgrade
### A) Enhanced Features
- **Ready-Made Profiles:**
  - Nöbet Güvenli: Disable animations, remove flashing content, reduce saturation.
  - Görme Engelli: Increase font, high contrast, legible font.
  - Görme Engelli (Screen Reader): Improve ARIA and semantic structure.
  - DEHB Dostu: Reduce distractions, reading ruler.
  - Bilişsel Engel Dostu: Simplify content, big text, highlighted links.
  - Klavye (Motor Engelli): Enhance focus, skip links, tab navigation.
  - Disleksi Dostu: Disleksi font, enhanced spacing.
- **Advanced Tools:**
  - Web Speech API integration for navigation (e.g., "scroll down").
  - Content magnification under cursor.
  - Color blindness filters (protanopia, deuteranopia, tritanopia).

### B) Implementation
- Upgrade `AccessibilityMenu` in `/components/accessibility`.
- Use CSS variables for theme application.
- State management via `AccessibilityProvider`.

## 2. Developer Accessibility Inspector (Dev Widget)
### A) Features
- Scan DOM for:
  - Missing alt text in images.
  - Unlabeled form fields.
  - Empty links/buttons.
  - Heading hierarchy errors.
  - Color contrast violations (WCAG AA/AAA).
  - Incorrect ARIA roles/landmarks.
- Visual markers (red border, tooltip) on problematic elements.
- Export report (JSON/CSV).
- Triggerable via `?a11y-debug=1` or dev mode toggle.

### B) Implementation
- New component in `/components/dev/accessibility-inspector.tsx`.
- Client-side DOM scanning using `useEffect` on route/DOM changes.

## 3. Timeline & Next Steps
1. Develop the enhanced `AccessibilityMenu` component.
2. Develop the `AccessibilityInspector` dev widget.
3. Integrate and test (keyboard navigation, screen reader, mobil, cross-browser).
