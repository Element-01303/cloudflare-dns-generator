# Contributing to Cloudflare DNS Updater

Thank you for your interest in contributing to the Cloudflare DNS Updater! This document provides guidelines for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Exercise consideration and empathy
- Focus on what is best for the community
- Use welcoming and inclusive language

## How to Contribute

### Reporting Bugs

Before submitting a bug report, please:
1. Check the existing issues to avoid duplicates
2. Use the latest version of the application
3. Provide a clear and descriptive title
4. Include steps to reproduce the issue
5. Describe the expected vs actual behavior
6. Include system information (OS, version, etc.)

### Suggesting Features

Feature requests are welcome! Please:
1. Check existing issues for similar requests
2. Provide a clear and detailed explanation
3. Explain the use case and benefits
4. Consider the scope and complexity

### Development Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/LaboratoryZero/cloudflare-dns-updater.git
   cd cloudflare-dns-updater
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development**:
   ```bash
   npm run dev
   ```

### Development Guidelines

#### Code Style
- Use ES6+ JavaScript features
- Follow consistent naming conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

#### File Organization
```
src/
├── main.js          # Main Electron process
├── preload.js       # Secure IPC bridge
├── renderer.js      # UI logic and state management
├── index.html       # Application HTML structure
└── styles.css       # Application styling
```

#### Key Principles
- **Security First**: Always use context isolation and secure IPC
- **Cross-Platform**: Test on Windows, macOS, and Linux
- **User Experience**: Prioritize intuitive and responsive UI
- **Error Handling**: Provide clear error messages and graceful fallbacks

### Testing

Before submitting a pull request:

1. **Manual Testing**:
   - Test all major features
   - Try different DNS record configurations
   - Test script generation for all formats
   - Verify cross-platform compatibility

2. **API Testing**:
   - Test with valid and invalid API tokens
   - Test with different domain configurations
   - Verify error handling for network issues

3. **UI Testing**:
   - Test responsive design
   - Verify dark/light mode switching
   - Test keyboard shortcuts
   - Verify copy/paste functionality

### Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow the coding guidelines
   - Add appropriate comments
   - Update documentation if needed

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add feature: your feature description"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a pull request**:
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes

### Pull Request Checklist

- [ ] Code follows the project's style guidelines
- [ ] Changes have been tested on multiple platforms
- [ ] New features include appropriate error handling
- [ ] Documentation has been updated if necessary
- [ ] Commit messages are clear and descriptive
- [ ] No sensitive data (API keys, tokens) in code
- [ ] UI changes work in both light and dark modes

### Development Areas

We welcome contributions in these areas:

#### High Priority
- [ ] Unit tests for core functionality
- [ ] Integration tests for API interactions
- [ ] Improved error handling and user feedback
- [ ] Performance optimizations
- [ ] Accessibility improvements

#### Medium Priority
- [ ] Additional script templates
- [ ] CSV import/export functionality
- [ ] Scheduling integration
- [ ] Multiple API token management
- [ ] Plugin system architecture

#### Low Priority
- [ ] Advanced theming options
- [ ] Internationalization (i18n)
- [ ] Advanced logging and debugging
- [ ] Cloud backup/sync features

### API Integration

When working with the Cloudflare API:

1. **Error Handling**: Always handle API errors gracefully
2. **Rate Limiting**: Respect API rate limits
3. **Security**: Never log or store API tokens
4. **Testing**: Use test accounts when possible

### UI/UX Guidelines

- **Consistency**: Follow existing design patterns
- **Responsiveness**: Ensure UI works at different window sizes
- **Accessibility**: Support keyboard navigation and screen readers
- **Feedback**: Provide clear loading states and error messages
- **Theme Support**: Ensure features work in both light and dark modes

### Documentation

When making changes that affect users:
- Update README.md with new features or changed requirements
- Update DEV.md with development notes
- Add inline comments for complex code
- Update JSDoc comments for functions

### Release Process

(For maintainers)

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release builds for all platforms
4. Test installers on each platform
5. Create GitHub release with binaries
6. Update documentation

## Questions?

If you have questions about contributing:
- Open an issue for discussion
- Check existing issues and pull requests
- Review the project documentation

Thank you for contributing to make Cloudflare DNS Updater better for everyone!