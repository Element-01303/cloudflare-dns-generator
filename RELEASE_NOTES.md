## 1.0.2 - Theme Expansion

### Highlights
- Added Catppuccin flavors: Latte, Frappé, Macchiato, Mocha
- Theme toggle now cycles all flavors with official Catppuccin icons
- Simplified UI by removing the dropdown and adding hover tooltip for the current theme

---

## 🎉 Initial Release

### Features
- **Cross-Platform Support**: Runs on macOS, Linux, Windows, and Raspberry Pi
- **Multiple DNS Records**: Generate scripts for up to 20 DNS records
- **Smart Subdomain Entry**: Enter just the subdomain - FQDN is auto-generated
- **User-Friendly Interface**: Modern UI with dark mode support
- **Multiple Export Formats**: Bash (.sh), Batch (.bat), PowerShell (.ps1)
- **Raspberry Pi Compatible**: Scripts tested and working on Raspberry Pi OS

### Downloads
- **macOS (Intel)**: `Cloudflare DNS Updater-1.0.0.dmg`
- **macOS (Apple Silicon)**: `Cloudflare DNS Updater-1.0.0-arm64.dmg`
- **Windows**: `Cloudflare DNS Updater Setup 1.0.0.exe`
- **Linux (AppImage)**: `Cloudflare DNS Updater-1.0.0.AppImage`
- **Linux (Debian/Ubuntu)**: `cloudflare-dns-updater_1.0.0_amd64.deb`

### Requirements
- Cloudflare API token with Zone:DNS:Edit and Zone:Zone:Read permissions
- For generated scripts: `curl` and `jq` must be installed on the target system

### Quick Start
1. Download the installer for your operating system
2. Launch the application
3. Enter your Cloudflare API token and domain
4. Add DNS records (just the subdomain part)
5. Generate and save your update script
6. Set up a cron job or scheduled task to run the script periodically
