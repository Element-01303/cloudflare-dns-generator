# Icon Placeholder

This directory contains application icons for different platforms:

## Required Icons for Distribution:

### macOS (.icns)
- **icon.icns** - macOS application icon
- Sizes: 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024

### Windows (.ico)
- **icon.ico** - Windows application icon  
- Sizes: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256

### Linux (.png)
- **icon.png** - Linux application icon
- Size: 512x512 recommended

## Icon Design Guidelines:

The application icon should:
- Represent DNS/networking concepts
- Be recognizable at small sizes (16x16)
- Work well on both light and dark backgrounds
- Follow platform-specific design guidelines
- Use Cloudflare's brand colors appropriately (if permitted)

## Suggested Design Elements:
- Network/DNS symbols
- Globe or connectivity icons
- Gear/settings representations
- Clean, modern appearance
- High contrast for visibility

## Creating Icons:

For development, you can:
1. Create icons using design software (Figma, Sketch, Photoshop)
2. Use online icon generators
3. Convert from high-resolution PNG using tools like:
   - `iconutil` (macOS)
   - `convert` from ImageMagick
   - Online conversion services

## Placeholder Icons:

For development purposes, the Electron app will use default icons if these are not present. For production builds, proper icons should be created and placed here.