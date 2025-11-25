# Alchemy Color Mapping Guide

## Overview
This guide provides a simple find-and-replace mapping to convert components from the dark theme to the light white/black/gold theme.

## Theme Philosophy
- **Primary**: White backgrounds with subtle grey accents
- **Text**: Black for primary text, grey for secondary
- **Accents**: Gold gradients for CTAs, highlights, and premium elements
- **Borders**: Light grey for subtle separation

## Color Mapping Table

### Backgrounds
| Dark Theme | Light Theme | Usage |
|------------|-------------|-------|
| `bg-grey-900` | `bg-white` | Main backgrounds |
| `bg-grey-850` | `bg-gray-50` | Card backgrounds |
| `bg-grey-800` | `bg-gray-100` | Hover states |
| `bg-grey-700` | `bg-gray-200` | Secondary surfaces |
| `bg-black` | `bg-gray-900` | True black elements |

### Text Colors
| Dark Theme | Light Theme | Usage |
|------------|-------------|-------|
| `text-white` | `text-gray-900` | Primary text |
| `text-grey-100` | `text-gray-800` | Emphasis text |
| `text-grey-200` | `text-gray-700` | Standard text |
| `text-grey-300` | `text-gray-600` | Secondary text |
| `text-grey-400` | `text-gray-500` | Tertiary text |
| `text-grey-500` | `text-gray-400` | Disabled text |

### Borders
| Dark Theme | Light Theme | Usage |
|------------|-------------|-------|
| `border-grey-700` | `border-gray-200` | Default borders |
| `border-grey-600` | `border-gray-300` | Emphasized borders |
| `border-grey-500` | `border-gray-400` | Hover borders |

### Gold Accents (Keep Same)
- `bg-gold-500` - Primary buttons, CTAs
- `text-gold-500` - Links, highlights
- `border-gold-500` - Active states
- `bg-gradient-gold` - Premium elements
- `shadow-gold-md` - Glowing effects

### Status Colors (Update for Light)
| Dark Theme | Light Theme | Usage |
|------------|-------------|-------|
| `bg-blue-500/20 text-blue-400` | `bg-blue-50 text-blue-700 border-blue-200` | Info/Scheduled |
| `bg-green-500/20 text-green-400` | `bg-green-50 text-green-700 border-green-200` | Success/Published |
| `bg-red-500/20 text-red-400` | `bg-red-50 text-red-700 border-red-200` | Error/Failed |
| `bg-purple-500/20 text-purple-400` | `bg-purple-50 text-purple-700 border-purple-200` | Processing |
| `bg-amber-500/20 text-amber-400` | `bg-amber-50 text-amber-700 border-amber-200` | Warning |

### Gold Gradients & Effects

**Primary Gradients:**
- `bg-gradient-gold` - Diagonal gradient (light → medium → deep gold)
- `bg-gradient-gold-vertical` - Top-to-bottom gradient
- `bg-gradient-gold-horizontal` - Left-to-right gradient
- `bg-gradient-gold-rich` - Darker, richer gold tones
- `bg-gradient-gold-light` - Subtle light gold background
- `bg-gradient-gold-shimmer` - Multi-tone shimmer effect with 5 gold shades

**Overlays & Effects:**
- `bg-gradient-gold-subtle` - Subtle fade overlay (5% opacity)
- `bg-gradient-gold-overlay` - Bottom fade overlay (10% opacity)
- `bg-gradient-gold-radial` - Circular glow from center
- `bg-gradient-gold-glow` - Elliptical glow effect

**Gold Shadows:**
- `shadow-gold-sm` - Small gold glow (10px)
- `shadow-gold-md` - Medium gold glow (20px)
- `shadow-gold-lg` - Large gold glow (40px)

**Usage Examples:**
```tsx
// Primary CTA with gradient
<Button className="bg-gradient-gold text-black hover:bg-gradient-gold-rich">
  Get Started
</Button>

// Card with subtle gold background
<Card className="bg-gradient-gold-light border-gold-200">
  Premium Content
</Card>

// Icon with gold glow
<div className="bg-gradient-gold-radial p-4 rounded-full">
  <Sparkles className="w-6 h-6 text-gold-600" />
</div>

// Header with gold accent
<div className="bg-gradient-gold-vertical text-black p-6">
  <h1>Alchemy Platform</h1>
</div>
```

## Quick Find & Replace Commands

### For VSCode / Command Line
```bash
# Backgrounds
sed -i 's/bg-grey-900/bg-white/g' *.tsx
sed -i 's/bg-grey-850/bg-gray-50/g' *.tsx
sed -i 's/bg-grey-800/bg-gray-100/g' *.tsx

# Text
sed -i 's/text-white/text-gray-900/g' *.tsx
sed -i 's/text-grey-400/text-gray-500/g' *.tsx
sed -i 's/text-grey-300/text-gray-600/g' *.tsx

# Borders
sed -i 's/border-grey-700/border-gray-200/g' *.tsx
sed -i 's/border-grey-600/border-gray-300/g' *.tsx
```

## Component-Specific Guidelines

### Cards
**Before:**
```tsx
<Card className="bg-grey-850 border-grey-700">
```
**After:**
```tsx
<Card className="bg-white border-gray-200 shadow-sm">
```

### Buttons
**Before:**
```tsx
<Button className="bg-grey-700 hover:bg-grey-600 text-white">
```
**After:**
```tsx
<Button className="bg-gray-100 hover:bg-gray-200 text-gray-900">
```

### Primary CTA (Keep Gold)
```tsx
<Button className="bg-gold-500 hover:bg-gold-600 text-black">
```

### Inputs
**Before:**
```tsx
<Input className="bg-grey-900 border-grey-600 text-white" />
```
**After:**
```tsx
<Input className="bg-white border-gray-300 text-gray-900" />
```

### Badges (Status)
**Before:**
```tsx
<Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
```
**After:**
```tsx
<Badge className="bg-blue-50 text-blue-700 border border-blue-200">
```

## Files to Update

### Publishing Workflow
- `app/publish/page.tsx`
- `app/drafts/page.tsx`
- `components/publish/publish-history.tsx`
- `components/publish/platform-selector.tsx`

### Analytics
- `app/analytics/page.tsx`
- `components/analytics/performance-chart.tsx`
- `components/analytics/cost-tracker.tsx`
- `components/analytics/usage-metrics.tsx`
- `components/analytics/virality-scores.tsx`

### Brand Management
- `components/brands/brand-voice-wizard.tsx`
- `components/brands/audience-wizard.tsx`
- `components/brands/content-preferences.tsx`
- `components/layout/brand-switcher.tsx`

### Other
- `components/ideas/bulk-generate-modal.tsx`

## Testing Checklist
- [ ] All text is readable (black on white)
- [ ] Gold accents stand out appropriately
- [ ] Borders are subtle but visible
- [ ] Hover states are clear
- [ ] Status badges use appropriate colors
- [ ] Cards have subtle shadows
- [ ] Forms are clearly defined

## Example: Full Component Update

**Before (Dark):**
```tsx
<Card className="bg-grey-850 border-grey-700 p-6">
  <h3 className="text-white text-lg font-semibold">Title</h3>
  <p className="text-grey-400 mt-2">Description</p>
  <Button className="bg-gold-500 hover:bg-gold-600 text-black mt-4">
    Action
  </Button>
</Card>
```

**After (Light):**
```tsx
<Card className="bg-white border-gray-200 shadow-sm p-6">
  <h3 className="text-gray-900 text-lg font-semibold">Title</h3>
  <p className="text-gray-600 mt-2">Description</p>
  <Button className="bg-gold-500 hover:bg-gold-600 text-black mt-4">
    Action
  </Button>
</Card>
```

## Notes
- Gold elements (`gold-500`, `gold-600`, etc.) remain unchanged
- Gradient backgrounds (`bg-gradient-gold`) remain unchanged
- Chart colors are already updated in `globals.css`
- All semantic HTML variables are now light-theme compatible
