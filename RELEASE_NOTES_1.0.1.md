## 🔐 Security Update v1.0.1

This release focuses on security hardening and dependency upgrades.

### Highlights
- **Electron upgrade** to ^40.1.0
- **electron-builder upgrade** to ^26.6.0
- **@electron/rebuild** upgrade to ^4.0.3
- **Renderer sandboxing** enabled
- **Strict CSP** to limit resource loading
- **IPC input validation** for script saving and API validation
- **External navigation protection** (open in system browser)

### Builds
- macOS DMG (x64 + arm64)
- Windows NSIS (x64 + ia32)
- Linux AppImage + .deb

### Notes
- macOS signing is disabled for dev builds unless a valid signing identity is configured.
