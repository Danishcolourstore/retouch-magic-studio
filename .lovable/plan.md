

# Retouch Studio — Mobile-First Retouch Interface

## Overview
A clean, premium mobile retouch UI with CSS-filter-based image editing, before/after comparison, presets, and export.

## Pages & Layout
- **Single-page app** — full-screen dark layout, no navigation
- **Top**: Large image preview area (fills available space)
- **Bottom**: Draggable bottom sheet with retouch controls

## Features

### 1. Image Upload
- Upload button (JPG/PNG) centered when no image loaded
- Full-width image preview after upload
- Resolution display badge (e.g. "3024 × 4032")

### 2. Before / After Interaction
- Press-and-hold on image shows original (no filters)
- Release returns to edited view
- Subtle "Original" label overlay while holding

### 3. Retouch Sliders
- **Exposure** (brightness filter)
- **Contrast** (contrast filter)
- **Warmth** (sepia filter blend)
- **Tint** (hue-rotate filter)
- **Skin Smooth** (blur filter, subtle)
- All applied via CSS `filter` on the image element
- Large touch-friendly slider controls (44px+ hit targets)

### 4. Preset Buttons
- **Natural Clean** — subtle exposure/contrast bump
- **Wedding Glow** — warm, soft, slightly bright
- **Soft Skin** — warmth + skin smooth
- **High Contrast** — strong contrast, slight desaturation
- Each button sets all slider values to predefined positions

### 5. Bottom Sheet Controls
- Collapsible panel with drag handle
- Two sections: Presets row (horizontal scroll) + Sliders
- Smooth open/close animation

### 6. Export
- "Download" button in top toolbar
- Uses `html-to-image` (or similar) to capture the filtered preview as a downloadable file

## Design
- Dark background (`#0a0a0a` / near-black)
- Minimal chrome, muted text, subtle borders
- Accent color: soft white or muted blue
- No hover effects — touch-optimized throughout
- Professional, dense layout

## Tech
- React + TypeScript + Tailwind (existing stack)
- CSS filters only — no canvas processing
- `html-to-image` for export
- No backend, no AI, no heavy processing

