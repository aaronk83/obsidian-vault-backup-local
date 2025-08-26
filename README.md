# Auto Vault Backup Plugin for Obsidian

Automatically backs up your entire Obsidian vault to a zip file when you close the vault window. This plugin ensures you never lose your valuable notes and attachments.

## Features

- **Automatic Backup on Close**: Creates a backup zip file whenever you close your vault
- **Automatic Backup on Open**: Creates a backup when opening the vault (backup of previous session)
- **Manual Backup**: Create backups on-demand using the ribbon icon or command palette
- **Configurable Backup Content**: Choose what to include in your backups:
  - Markdown files (always included)
  - Attachments (images, videos, etc.)
  - Plugin files and settings (planned for future version)
- **Backup Management**: Automatically clean up old backups to save disk space
- **Custom Backup Location**: Specify where to store your backup files
- **Timestamped Backups**: Each backup includes a timestamp for easy identification

## Installation

### Manual Installation

1. Download the latest release from the releases page
2. Extract the zip file
3. Copy the extracted folder to your Obsidian vault's `.obsidian/plugins/` directory
4. Enable the plugin in Obsidian's Community Plugins settings

### From Source

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```
4. Copy the built files to your Obsidian vault's `.obsidian/plugins/auto-vault-backup/` directory
5. Enable the plugin in Obsidian's Community Plugins settings

## Usage

### Automatic Backup

The plugin can automatically create backups in two scenarios:

1. **On Close**: Creates a backup when you close your vault window
2. **On Open**: Creates a backup when you open your vault (useful for backing up the previous session's work)

The backup will be saved to:
- A custom directory (if specified in settings)
- Or the default location: `vault/backups/`

### Manual Backup

You can create a backup manually in two ways:
1. **Ribbon Icon**: Click the download icon in the left sidebar
2. **Command Palette**: Press `Ctrl/Cmd + Shift + P` and search for "Create Vault Backup"

### Settings

Access the plugin settings in Obsidian's Community Plugins settings:

- **Backup Directory**: Custom path for storing backups (leave empty for default)
- **Backup on Close**: Enable/disable automatic backup when closing vault
- **Backup on Open**: Enable/disable automatic backup when opening vault
- **Include Attachments**: Include non-markdown files in backup
- **Maximum Backups**: Limit the number of backups to keep (0 = unlimited)

## Backup File Format

Backup files are named with the following format:
```
{vault_name}_backup_{timestamp}.zip
```

Example: `MyVault_backup_2024-01-15T10-30-45-123Z.zip`

## File Structure

The backup zip file maintains the original vault structure:
```
backup.zip
├── note1.md
├── note2.md
├── attachments/
│   ├── image1.png
│   └── document.pdf
├── .obsidian/
│   ├── settings.json
│   └── plugins/
└── ...
```

## Requirements

- Obsidian 1.0.0 or higher
- Desktop application (not available for mobile)

## Development

### Building

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build
```

### Project Structure

```
auto-vault-backup/
├── main.ts              # Main plugin code
├── manifest.json        # Plugin manifest
├── package.json         # Dependencies and scripts
├── esbuild.config.mjs   # Build configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## Troubleshooting

### Backup Not Created

1. Check that the plugin is enabled in Community Plugins
2. Verify you have write permissions to the backup directory
3. Check the console for error messages (Ctrl/Cmd + Shift + I)

### Large Backup Files

- Disable "Include Attachments" if you have many large files
- Use a custom backup directory on a drive with more space
- Reduce the "Maximum Backups" setting to save disk space

### Performance Issues

- The backup process may take some time for large vaults
- Consider excluding plugins and settings if not needed
- Backup creation happens in the background and won't block Obsidian

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.
