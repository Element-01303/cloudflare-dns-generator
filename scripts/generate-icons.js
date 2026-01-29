#!/usr/bin/env node
/**
 * Icon Generator Script
 * Creates app icons in all required formats
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

const iconsDir = path.join(__dirname, '..', 'assets', 'icons');

// Create a simple SVG icon (Cloudflare-inspired orange cloud with DNS)
const svgIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F38020;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E85D04;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background rounded square -->
  <rect x="32" y="32" width="960" height="960" rx="180" ry="180" fill="url(#bgGrad)"/>
  
  <!-- Cloud shape -->
  <ellipse cx="420" cy="480" rx="180" ry="140" fill="#FFFFFF"/>
  <ellipse cx="580" cy="520" rx="200" ry="160" fill="#FFFFFF"/>
  <ellipse cx="720" cy="540" rx="140" ry="110" fill="#FFFFFF"/>
  <rect x="240" y="480" width="600" height="180" fill="#FFFFFF"/>
  
  <!-- DNS text -->
  <text x="512" y="620" font-family="Arial, Helvetica, sans-serif" font-size="200" font-weight="bold" text-anchor="middle" fill="#F38020">DNS</text>
  
  <!-- Sync icon below -->
  <circle cx="512" cy="780" r="60" fill="none" stroke="#FFFFFF" stroke-width="20"/>
  <polygon points="512,700 540,740 484,740" fill="#FFFFFF"/>
  <polygon points="512,860 484,820 540,820" fill="#FFFFFF"/>
</svg>`;

async function generateIcons() {
  console.log('🎨 Generating application icons...\n');
  
  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Save SVG
  const svgPath = path.join(iconsDir, 'icon.svg');
  fs.writeFileSync(svgPath, svgIcon);
  console.log('✓ Created: icon.svg');

  // Generate PNG at various sizes
  const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];
  
  try {
    // Create main 1024x1024 PNG
    const pngBuffer = await sharp(Buffer.from(svgIcon))
      .resize(1024, 1024)
      .png()
      .toBuffer();
    
    fs.writeFileSync(path.join(iconsDir, 'icon.png'), pngBuffer);
    console.log('✓ Created: icon.png (1024x1024)');

    // Create iconset for macOS
    const iconsetDir = path.join(iconsDir, 'icon.iconset');
    if (!fs.existsSync(iconsetDir)) {
      fs.mkdirSync(iconsetDir, { recursive: true });
    }

    // macOS icon sizes
    const macSizes = [
      { size: 16, name: 'icon_16x16.png' },
      { size: 32, name: 'icon_16x16@2x.png' },
      { size: 32, name: 'icon_32x32.png' },
      { size: 64, name: 'icon_32x32@2x.png' },
      { size: 128, name: 'icon_128x128.png' },
      { size: 256, name: 'icon_128x128@2x.png' },
      { size: 256, name: 'icon_256x256.png' },
      { size: 512, name: 'icon_256x256@2x.png' },
      { size: 512, name: 'icon_512x512.png' },
      { size: 1024, name: 'icon_512x512@2x.png' }
    ];

    for (const { size, name } of macSizes) {
      const resized = await sharp(pngBuffer)
        .resize(size, size)
        .png()
        .toBuffer();
      fs.writeFileSync(path.join(iconsetDir, name), resized);
    }
    console.log('✓ Created: icon.iconset/ (macOS icons)');

    // Generate .icns for macOS
    try {
      execSync(`iconutil -c icns "${iconsetDir}" -o "${path.join(iconsDir, 'icon.icns')}"`, { stdio: 'pipe' });
      console.log('✓ Created: icon.icns (macOS app icon)');
    } catch (e) {
      console.log('⚠ Could not create .icns (iconutil not available)');
    }

    // For Windows, we need an .ico file
    // electron-builder can use PNG and convert it, so we'll create multi-size PNGs
    const icoSizes = [16, 32, 48, 64, 128, 256];
    console.log('✓ PNG icons ready for Windows .ico generation');

    console.log('\n✅ Icon generation complete!');
    console.log('\nGenerated files:');
    console.log('  - icon.svg (source)');
    console.log('  - icon.png (1024x1024 for Linux)');
    console.log('  - icon.icns (macOS)');
    console.log('  - icon.iconset/ (macOS source)');
    console.log('\nNote: electron-builder will generate .ico from PNG for Windows');

  } catch (error) {
    console.error('Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons();
