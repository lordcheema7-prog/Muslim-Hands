---
name: Humanitarian Identity System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#3d494d'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#6d797e'
  outline-variant: '#bcc8ce'
  surface-tint: '#00677d'
  primary: '#00677d'
  on-primary: '#ffffff'
  primary-container: '#29b6d8'
  on-primary-container: '#004352'
  inverse-primary: '#57d6f9'
  secondary: '#555f6f'
  on-secondary: '#ffffff'
  secondary-container: '#d6e0f3'
  on-secondary-container: '#596373'
  tertiary: '#5c5f60'
  on-tertiary: '#ffffff'
  tertiary-container: '#a6a8aa'
  on-tertiary-container: '#3b3d3f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b2ebff'
  primary-fixed-dim: '#57d6f9'
  on-primary-fixed: '#001f27'
  on-primary-fixed-variant: '#004e5f'
  secondary-fixed: '#d9e3f6'
  secondary-fixed-dim: '#bdc7d9'
  on-secondary-fixed: '#121c2a'
  on-secondary-fixed-variant: '#3d4756'
  tertiary-fixed: '#e1e2e4'
  tertiary-fixed-dim: '#c5c6c8'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  headline-lg:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max: 1280px
---

## Brand & Style

This design system is engineered for a humanitarian institution that balances institutional authority with accessible compassion. The visual identity follows a **Corporate / Modern** style, emphasizing reliability and clarity to foster trust among donors and beneficiaries.

The narrative focuses on "Impactful Transparency"—using generous whitespace and a structured layout to make complex humanitarian data digestible. The aesthetic is clean and professional, avoiding decorative clutter in favor of meaningful functional elements. It evokes an emotional response of security, efficiency, and global solidarity.

## Colors

The palette is anchored by the brand's signature teal, used strategically for primary actions and progress indicators to symbolize hope and forward movement. 

- **Primary (#29B6D8):** Reserved for high-impact interactions: primary buttons, active progress bar fills, and brand-critical iconography.
- **Secondary (#1F2937):** A deep charcoal used for headlines and primary text to ensure maximum legibility and an authoritative tone.
- **Neutral/Background:** We use a "Soft White" approach, utilizing off-white and very light grey surfaces to reduce ocular strain while maintaining high contrast. 
- **Functional Tints:** Soft teal washes (10-15% opacity) are used for container backgrounds in the Complaint Center to denote organized, calm environments.

## Typography

The typography system pairs **Manrope** for headlines with **Work Sans** for body and UI elements. 

- **Manrope** provides a geometric, modern structure for titles, conveying a sense of organized efficiency.
- **Work Sans** is used for its exceptional legibility in data-heavy environments like the Complaint Center and Donation Portal.
- **Hierarchical Contrast:** Use `label-caps` for status badges and small metadata to distinguish them from narrative body text.
- **Scalability:** Large headlines scale down for mobile to maintain a compact, readable vertical rhythm.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop and a **Fluid** model for mobile. 

- **The 8pt Grid:** All internal spacing (padding, margins within components) follows a 4px/8px incremental scale to ensure mathematical harmony.
- **Rhythm:** Use "Generous Whitespace" between sections (64px+) to allow the user's eye to rest, which is critical when dealing with sensitive humanitarian content.
- **Donation Flow:** Center-aligned layouts are preferred for donation steps to minimize distraction and focus the user on the impact-driven UI elements.

## Elevation & Depth

To maintain an institutional yet modern feel, we avoid heavy, dark shadows.

- **Surface Tiers:** Use subtle tonal shifts (White vs. Light Grey) to separate content blocks.
- **Ambient Shadows:** Components like Cards and Modals use a "Low-Contrast Ambient" shadow: `0 4px 20px rgba(31, 41, 55, 0.06)`. This creates a soft lift without appearing "game-like" or overly digital.
- **Interactions:** On hover, primary buttons should slightly increase in shadow spread to provide tactile feedback.

## Shapes

The shape language is **Soft (Level 1)**, utilizing a 0.25rem (4px) base radius. This creates a professional, crisp appearance that feels precise yet approachable.

- **Standard Elements:** Buttons and input fields use the base 4px radius.
- **Large Containers:** Cards and Modals use `rounded-lg` (8px) to soften the overall interface composition.
- **Progress Bars:** These should use fully rounded (pill-shaped) caps to suggest fluidity and completion.

## Components

### Buttons
- **Primary:** Teal fill (#29B6D8) with white text. High-contrast, no border.
- **Secondary:** Charcoal outline or ghost style for less critical actions.

### Complaint Center Specifics
- **Status Badges:** Use low-saturation background tints with high-saturation text (e.g., a soft amber background for "Pending" with dark amber text).
- **Data Lists:** Clean rows with 1px light grey dividers; avoid heavy borders to keep the focus on the complaint status and ID.

### Donation Portal Specifics
- **Progress Bars:** Use a dual-tone teal. A light teal track with a full-vibrancy teal fill.
- **Impact Cards:** These should include a dedicated slot for photography, using a 1px internal border to frame the image professionally.
- **Input Fields:** Large, clear numerical inputs for donation amounts with the currency symbol clearly anchored to the left.

### Checkboxes & Radios
- Uses the primary teal for the active state. The "Soft" roundedness applies here, giving them a modern, custom-built appearance compared to browser defaults.