---
name: Luminous Play
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#005ac2'
  on-tertiary: '#ffffff'
  tertiary-container: '#71a1ff'
  on-tertiary-container: '#00367a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an encouraging, vibrant, and sacredly respectful learning environment tailored for young children (ages 4–12) and their parents. It pairs the joyful, high-motivation mechanics of gamified learning platforms with the refined geometry and light-filled warmth of contemporary Islamic design. 

The aesthetic is Tactile & Playful Minimal: rounded physical forms, cheerful layered depths, pillowy extruded buttons, and luminous celebratory states. The emotional tone avoids both rigid austerity and overstimulating visual chaos. Interfaces are warm, clean, and optimistic, creating an atmosphere of barakah (blessing), curiosity, and steady daily accomplishment.

## Colors

The palette draws directly from light, growth, and traditional architectural warmth:

- **Primary (`#10B981` Emerald Green):** The core active color, representing growth, vitality, and Islamic heritage. Used for primary buttons, completed milestones, progress rings, and major confirmation states.
- **Secondary (`#F59E0B` Amber Gold):** The reward and radiance color. Reserved for streaks, star counters, coin tallies, unlocked chests, and celebratory badges.
- **Tertiary (`#3B82F6` Soft Sky Blue):** The knowledge and exploration color. Applied to parent dashboards, informational tooltips, vocabulary cards, and calm recitation interfaces.
- **Neutral Canvas (`#FDFBF7` Warm Alabaster):** Replaces clinical bright whites with a parchment-like warmth. Paired with Slate surfaces (`#F8FAFC` to `#FFFFFF`) for soft card containers and high-contrast dark text (`#0F172A`).
- **Semantic Accents:** A soft coral-rose (`#F43F5E`) handles error indicators or low-heart health states without inducing anxiety.

## Typography

Typography relies on **Plus Jakarta Sans** across all roles to ensure maximum readability for early readers and bilingual learners. Its wide letterforms, generous apertures, and balanced x-height provide friendly clarity on both high-density mobile screens and desktop canvas layouts.

Arabic script elements (e.g., Quranic ayaat, Dua snippets, or Arabic alphabet practice blocks) require a minimum scale multiplier of 1.25× relative to Latin body text to ensure vowel markings (tashkeel/harakat) remain crisp and legible. Numbers inside streak counters and gem indicators consistently utilize the `label-lg` or `headline-sm` bold cuts with tabular spacing.

## Layout & Spacing

The layout is built upon an 8-point spatial cadence utilizing a 12-column responsive fluid grid for desktop and tablet, collapsing to a single-column stacked path on mobile.

- **Mobile (< 768px):** Uses an outer canvas margin of `margin` (1rem / 16px) and a `gutter` of 1rem. Content flows in a centered vertical quest path (winding lesson tree) optimized for thumb reach. The bottom navigation bar remains persistent.
- **Tablet (768px – 1024px):** Uses `margin-tablet` (2rem / 32px). Employs a split layout: main quest path on the left (8 columns) and daily streak/quest goals on the right (4 columns).
- **Desktop (> 1024px):** Clamped to a max-width container of 1200px centered with `margin-desktop` (3rem / 48px). Fixed left-hand navigation sidebar (260px) paired with a 2-column dynamic main stage (primary learning board + parent telemetry/gamification stats widget).

## Elevation & Depth

This system avoids blurred, hazy drop shadows in favor of crisp, tactile extrusions inspired by physical buttons, paired with soft tinted ambient glows for rewarded states:

- **Surface Floor (0dp):** The foundation canvas (`#FDFBF7`) sits flush with zero displacement.
- **Tactile Depth (Layered Buttons & Cards):** Interactive elements feature a bottom border lip (a 3D "lip" of 3px to 4px) in a slightly darker shade of the surface fill. Pressing an element translates it downward by 2px to 3px, collapsing the shadow for a tangible, toy-like click.
- **Card Float (Level 1):** Static cards sit on `#FFFFFF` with a crisp `1px solid #E2E8F0` border and a soft ambient drop shadow: `0 4px 12px -2px rgba(15, 23, 42, 0.05)`.
- **Celebration Glow (Level 2):** Milestones, active streaks, and badge rewards emit a radial colored luminescence:
  - Gold streaks: `0 8px 24px -4px rgba(245, 158, 11, 0.35)`
  - Emerald level-ups: `0 8px 24px -4px rgba(16, 185, 129, 0.3)`
- **Modals & Overlays (Level 3):** Lesson completion modals and parental gates feature a warm slate backdrop blur (`backdrop-filter: blur(8px)`) beneath a floating `#FFFFFF` dialog elevated via `0 20px 32px -8px rgba(15, 23, 42, 0.12)`.

## Shapes

The design system embraces an ultra-rounded, friendly shape philosophy (Pill-shaped, level 3). Rounded corners soften the interface, preventing clinical stiffness and welcoming younger children.

- **Base Components (Inputs, Chips, Small Badges):** Full pill curvature (`rounded-full` / 9999px).
- **Standard Cards & Lesson Modules:** `rounded-2xl` (1.5rem to 2rem) with smooth continuous squircle corners.
- **Hero Banners & Celebration Sheets:** `rounded-3xl` (2.5rem).
- **Geometric Accents:** Subtle, stylized modern eight-point star outlines (Khatim) and arch-shaped progress containers are applied with soft 4px corner filleting, unifying geometric heritage with high-tech software ergonomics.

## Components

### Buttons
- **Primary 3D Push Button:** Emerald background (`#10B981`) with a 4px bottom border lip in deep emerald (`#059669`), white bold text, and `rounded-full` geometry. On click/active: translates down 3px, reducing border lip to 1px.
- **Secondary (Streak/Gold):** Amber gold background (`#F59E0B`) with `#D97706` lip for celebratory actions and claims.
- **Ghost/Text Button:** Translucent emerald wash on hover with bold label, zero shadow.

### Chips & Badges
- **Streak Flame Indicator:** Pill shape with `#FEF3C7` background, `#D97706` text, featuring an animated amber flame icon and bold tabular numeral counter.
- **Harakat / Vocabulary Tag:** Soft Sky Blue fill (`#EFF6FF`), `#1D4ED8` text, `rounded-full`, padding `0.25rem 0.75rem`.

### Cards & Lesson Modules
- **Quest Path Node:** Circular (72px × 72px) floating node on the learning track. Unlocked nodes are bright emerald with a tactile bottom lip; locked nodes are muted warm gray (`#E2E8F0`); current active nodes feature a pulsating amber ring glow.
- **Parental Summary Card:** Warm white (`#FFFFFF`) card with `rounded-2xl`, 1px slate-100 border, containing circular radial progress trackers for surah completion and daily habit consistency.

### Checkboxes & Radio Selectors
- **Multiple Choice Option Card:** Large interactive pill-card with high hit area (minimum 56px height). Selected state activates an emerald border (2px), `#ECFDF5` background tint, and a bouncy checkmark icon.

### Form Inputs
- **Child-Friendly Input:** 52px height, pill radius, generous horizontal padding (1.25rem), warm slate borders (`#CBD5E1`), and large 18px text. Focus state expands an emerald outer halo (`0 0 0 4px rgba(16, 185, 129, 0.2)`).

### Specialized Islamic Gamification Modules
- **Dua / Ayah Player:** Clean audio bar with rounded scrubber, tactile replay toggle, slow-speed toggle (0.75× for phonetics), and highlighted phonetic karaoke cards.
- **Parent Gate Challenge:** An arithmetic or safety-entry modal with high-contrast text and a non-gamified, serene layout to restrict administrative and payment views.