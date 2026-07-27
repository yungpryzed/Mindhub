---
name: MindHub
description: Il tuo spazio personale multimediale
colors:
  primary: "#22c55e"
  neutral-bg: "#121212"
  surface: "#1e1e1e"
  surface-hover: "#1b1b1b"
  border-base: "#3a3a3a"
  text-pure: "#ffffff"
  text-muted: "#b4b8bf"
  danger: "#ef4444"
typography:
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
rounded:
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#000000"
    rounded: "{rounded.sm}"
    padding: "14px"
  content-tile:
    rounded: "{rounded.lg}"
---

# Design System: MindHub

## 1. Overview

**Creative North Star: "The Glass Command Center"**

MindHub is a deeply dark, sleek, and analytical personal dashboard. It fuses the visual density and efficiency of professional tools with the cinematic polish of modern media apps. The aesthetic relies on restraint—using subtle glassmorphism to separate layers rather than flat borders, keeping backgrounds predominantly dark, and deploying vibrant accents strictly for action and feedback. This system explicitly rejects luminous interfaces, default web themes, and chaotic multi-colored dashboards. 

**Key Characteristics:**
- Dark-first aesthetic with tonal layering.
- Strategic use of frosted glass (glassmorphism) over solid surfaces.
- High-contrast, hyper-legible typography.
- Dense but orderly layout for data and media.

## 2. Colors

The palette is anchored in deep blacks and dark grays, punctuated by luminous semantic accents.

### Primary
- **Vibrant Terminal Green** (#22c55e): Used exclusively for primary actions (like the Login button) and positive state changes.

### Neutral
- **Deep Void** (#121212): The foundational background for all views.
- **Glass Surface** (#1e1e1e): The base for cards, tiles, and modal windows.
- **Pure White Text** (#ffffff): Used for primary headings and active text for maximum contrast.
- **Muted Steel** (#b4b8bf): Used for secondary text, icons, and inactive states.
- **Base Border** (#3a3a3a): Used sparingly to define structural boundaries.

### Named Rules
**The Surgical Accent Rule.** The primary accent is used on ≤5% of any given screen. It is reserved for primary actions and active states. It never serves as background decoration.

## 3. Typography

**Body Font:** system-ui, -apple-system, Segoe UI, Roboto, sans-serif

**Character:** Native, fast, and familiar. We use the platform's native system font to ensure maximum legibility and zero-latency loading, blending seamlessly into the user's OS environment.

### Hierarchy
- **Title** (600, 1.75rem, -0.03em): Used for major view headers (e.g., Login title).
- **Body** (400, 1rem, normal): Used for all standard interface text and forms.
- **Label** (500, 0.85rem, normal): Used for form labels, metadata, and secondary actions.

### Named Rules
**The Density Rule.** Line heights in lists and tables are kept tight to support high-density information display without feeling cramped.

## 4. Elevation

Deep space: dark flat surfaces lifted only by subtle glassmorphism and glow on hover.

### Shadow Vocabulary
- **Card Hover** (`box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5)`): Deep shadow applied to content tiles and folders on hover to lift them off the dark background.
- **Action Glow** (`box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3)`): A soft tinted glow applied to primary buttons to indicate interactivity.

### Named Rules
**The Glass Priority Rule.** Depth is created through opacity and dark gradients (e.g., `linear-gradient(rgba(30,30,30,0.6), rgba(18,18,18,0.9))`) over solid borders.

## 5. Components

### Buttons
- **Shape:** Softly rounded (12px radius).
- **Primary:** Luminous Mint background, 14px padding, black text.
- **Hover / Focus:** Lifts up (`translateY(-2px)`), background brightens, glow intensifies.

### Cards / Containers (Content Tiles)
- **Corner Style:** 20px radius.
- **Background:** Subtle dark gradient with 1px border.
- **Shadow Strategy:** Flat at rest, deep shadow on hover.
- **Internal Padding:** Varies by content type.

### Inputs / Fields
- **Style:** 12px radius, dark translucent background (`rgba(0,0,0,0.2)`), 1px border.
- **Focus:** Border shifts to brighter white, subtle inner glow (`box-shadow: 0 0 0 4px rgba(255,255,255,0.05)`).

## 6. Do's and Don'ts

### Do:
- **Do** use surgical glassmorphism to maintain depth without adding visual noise.
- **Do** maintain a strict, dark visual scoping across movies, music, and notes.
- **Do** optimize layout space for high density (carousels, flex grids).

### Don't:
- **Don't** use luminous interfaces or light default themes (e.g., generic Bootstrap).
- **Don't** create chaotic, overloaded dashboards.
- **Don't** use stereotyped SaaS looks or cartoonish/sketchy illustrations.
