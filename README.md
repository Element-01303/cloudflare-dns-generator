# Cloudflare DNS Generator

A cross-platform desktop application for generating Cloudflare DNS update scripts. This application allows users to easily create automated DNS update scripts for multiple DNS records using their Cloudflare API token and domain information.

## Features

- **Cross-Platform Support**: Runs on macOS, Linux, and Windows
- **Multiple DNS Records**: Generate scripts for up to 20 DNS records simultaneously
- **User-Friendly Interface**: Modern, intuitive UI with dark mode support
- **Standard Interface Functions**: Full support for copy, paste, cut operations
- **Script Preview**: Review generated scripts before saving
- **Multiple Export Formats**: Save scripts in various formats (.sh, .bat, .ps1)
- **Visual Customization**: Resizable windows, theme options
- **Secure**: API tokens are handled securely and not stored permanently

## Screenshots

*Screenshots will be added as the application is developed*

## Installation

### From Releases (Recommended)
1. Go to the [Releases](https://github.com/yourusername/cloudflare-dns-generator/releases) page
2. Download the appropriate installer for your operating system:
   - **macOS**: `.dmg` file
   - **Windows**: `.exe` installer
   - **Linux**: `.AppImage` or `.deb` package
3. Run the installer and follow the setup instructions

### From Source
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cloudflare-dns-generator.git
   cd cloudflare-dns-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application:
   ```bash
   npm start
   ```

## Usage

### Basic Setup
1. **Launch the Application**: Open Cloudflare DNS Generator
2. **Enter API Token**: Input your Cloudflare API token (created from Cloudflare dashboard)
3. **Specify Domain**: Enter the domain you want to manage
4. **Add DNS Records**: Add up to 20 DNS records you want to update

### Adding DNS Records
1. Click the "Add Record" button
2. Enter the record details:
   - **Record Name**: Full domain name (e.g., `vpn.example.com`)
   - **Record Type**: A, AAAA, CNAME, etc.
   - **Proxied**: Whether the record should be proxied through Cloudflare
3. Repeat for additional records (max 20)

### Generating Scripts
1. Click "Generate Script" after adding all desired records
2. Review the generated script in the preview window
3. Choose your preferred format:
   - **Bash Script** (.sh) - For macOS/Linux
   - **Batch File** (.bat) - For Windows
   - **PowerShell** (.ps1) - For Windows PowerShell
4. Click "Save Script" to export to your desired location

### Setting Up Automated Updates
After saving your script:

#### macOS/Linux:
```bash
# Make the script executable
chmod +x your-dns-script.sh

# Set up a cron job to run every 5 minutes
crontab -e
# Add this line:
*/5 * * * * /path/to/your-dns-script.sh
```

#### Windows:
Use Task Scheduler to run your `.bat` or `.ps1` script at regular intervals.

## API Token Setup

To use this application, you need a Cloudflare API token:

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to "My Profile" → "API Tokens"
3. Click "Create Token"
4. Use the "Edit zone DNS" template or create a custom token with:
   - **Permissions**: Zone:DNS:Edit, Zone:Zone:Read
   - **Zone Resources**: Include specific zones you want to manage
5. Copy the generated token and paste it into the application

## Supported Record Types

- A (IPv4 address)
- AAAA (IPv6 address)
- CNAME (Canonical name)
- MX (Mail exchange)
- TXT (Text record)
- SRV (Service record)

## Requirements

- **Operating System**: macOS 10.14+, Windows 10+, or Linux (Ubuntu 18.04+)
- **Cloudflare Account**: With API access
- **Internet Connection**: Required for API validation and script generation

## Troubleshooting

### Common Issues

**"Invalid API Token" Error**
- Verify your API token has the correct permissions
- Ensure the token includes access to the zones you're trying to manage

**"Zone Not Found" Error**
- Check that the domain is correctly entered
- Verify the domain is managed by your Cloudflare account

**Script Generation Fails**
- Ensure all DNS record fields are properly filled
- Check that record names are valid domain names

### Getting Help

- Check our [FAQ](docs/FAQ.md)
- Report bugs on our [Issues](https://github.com/yourusername/cloudflare-dns-generator/issues) page
- Join our community discussions

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Electron](https://electronjs.org/) for cross-platform compatibility
- Uses [Cloudflare API](https://api.cloudflare.com/) for DNS management
- Inspired by the need for simple, automated DNS updates

## Roadmap

- [ ] Bulk import from CSV files
- [ ] Script scheduling within the application
- [ ] Multiple API token management
- [ ] DNS record validation
- [ ] Backup and restore configurations
- [ ] Plugin system for custom record types

---

**Note**: This application is not officially associated with Cloudflare, Inc. It's an independent tool that uses the Cloudflare API.