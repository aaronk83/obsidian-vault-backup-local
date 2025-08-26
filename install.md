# Installation Guide

## Quick Installation

1. **Download the plugin files**:
   - `main.js` (the compiled plugin)
   - `manifest.json` (plugin metadata)

2. **Create the plugin directory**:
   ```bash
   mkdir -p .obsidian/plugins/auto-vault-backup
   ```

3. **Copy the files**:
   ```bash
   cp main.js .obsidian/plugins/auto-vault-backup/
   cp manifest.json .obsidian/plugins/auto-vault-backup/
   ```

4. **Enable the plugin**:
   - Open Obsidian
   - Go to Settings → Community Plugins
   - Turn off Safe mode
   - Find "Auto Vault Backup" in the list
   - Enable it

## Manual Installation Steps

### Step 1: Locate your Obsidian vault
Your vault is the folder that contains your `.obsidian` directory.

### Step 2: Create the plugin folder
Inside your vault, navigate to `.obsidian/plugins/` and create a new folder called `auto-vault-backup`.

### Step 3: Copy the plugin files
Copy the following files into the `auto-vault-backup` folder:
- `main.js`
- `manifest.json`

### Step 4: Enable the plugin
1. Open Obsidian
2. Go to Settings (gear icon)
3. Click on "Community Plugins" in the left sidebar
4. Turn off "Safe mode" if it's enabled
5. Look for "Auto Vault Backup" in the list of installed plugins
6. Toggle the switch to enable it

## Verification

After installation, you should see:
- A download icon in the left sidebar (ribbon icon)
- The plugin listed in Settings → Community Plugins
- A new settings section for "Auto Vault Backup"

## Troubleshooting

If the plugin doesn't appear:
1. Make sure you copied both `main.js` and `manifest.json`
2. Check that the folder name is exactly `auto-vault-backup`
3. Restart Obsidian
4. Ensure Safe mode is turned off

## First Backup

Once enabled, the plugin will:
- Create a backup when you close the vault (if enabled in settings)
- Create a backup when you open the vault (if enabled in settings)
- Allow manual backups via the ribbon icon or command palette
- Store backups in a `backups` folder in your vault by default
