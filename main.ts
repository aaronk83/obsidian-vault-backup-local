import { App, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';
import JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';

interface AutoVaultBackupSettings {
	backupDirectory: string;
	includeAttachments: boolean;
	maxBackups: number;
	backupOnClose: boolean;
	backupOnOpen: boolean;
}

const DEFAULT_SETTINGS: AutoVaultBackupSettings = {
	backupDirectory: '',
	includeAttachments: true,
	maxBackups: 10,
	backupOnClose: true,
	backupOnOpen: false
}

export default class AutoVaultBackupPlugin extends Plugin {
	settings: AutoVaultBackupSettings;

	async onload() {
		await this.loadSettings();

		// Add settings tab
		this.addSettingTab(new AutoVaultBackupSettingTab(this.app, this));

		// Create backup on vault open if enabled
		if (this.settings.backupOnOpen) {
			// Use a small delay to ensure the vault is fully loaded
			setTimeout(async () => {
				await this.createBackup();
			}, 2000);
		}

		// Register event listener for window close
		if (this.settings.backupOnClose) {
			this.registerEvent(
				this.app.workspace.on('file-menu', (menu, file) => {
					// This is a workaround since Obsidian doesn't have a direct "close vault" event
					// We'll use the window beforeunload event instead
				})
			);

			// Add window beforeunload event listener
			window.addEventListener('beforeunload', async (event) => {
				if (this.settings.backupOnClose) {
					await this.createBackup();
				}
			});
		}

		// Add ribbon icon for manual backup
		this.addRibbonIcon('download', 'Create Vault Backup', async () => {
			await this.createBackup();
		});

		// Add command for manual backup
		this.addCommand({
			id: 'create-vault-backup',
			name: 'Create Vault Backup',
			callback: async () => {
				await this.createBackup();
			}
		});
	}

	onunload() {
		// Clean up event listeners
		window.removeEventListener('beforeunload', async (event) => {
			if (this.settings.backupOnClose) {
				await this.createBackup();
			}
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async createBackup() {
		try {
			const vault = this.app.vault;
			const vaultName = vault.getName();
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const backupFileName = `${vaultName}_backup_${timestamp}.zip`;
			
			// Determine backup directory
			let backupDir = this.settings.backupDirectory;
			if (!backupDir) {
				// Default to vault directory with a "backups" subfolder
				// For now, we'll use a relative path approach
				backupDir = 'backups';
			}

			// Create backup directory if it doesn't exist
			if (!fs.existsSync(backupDir)) {
				fs.mkdirSync(backupDir, { recursive: true });
			}

			const backupPath = path.join(backupDir, backupFileName);
			const zip = new JSZip();

			// Add markdown files
			const files = vault.getMarkdownFiles();
			for (const file of files) {
				const content = await vault.read(file);
				zip.file(file.path, content);
			}

			// Add attachments if enabled
			if (this.settings.includeAttachments) {
				const attachments = vault.getFiles().filter(file => !file.extension || !['md', 'canvas'].includes(file.extension));
				for (const attachment of attachments) {
					try {
						const arrayBuffer = await vault.readBinary(attachment);
						zip.file(attachment.path, arrayBuffer);
					} catch (error) {
						console.warn(`Failed to add attachment ${attachment.path}:`, error);
					}
				}
			}

			// Note: For plugins and settings, we'll need to use a different approach
			// since we can't directly access the file system from the plugin context
			// These features will be implemented in a future version

			// Generate zip file
			const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
			fs.writeFileSync(backupPath, zipContent);

			// Clean up old backups
			await this.cleanupOldBackups(backupDir);

			new Notice(`Vault backup created: ${backupFileName}`);
			console.log(`Vault backup created at: ${backupPath}`);

		} catch (error) {
			console.error('Failed to create vault backup:', error);
			new Notice('Failed to create vault backup. Check console for details.');
		}
	}



	private async cleanupOldBackups(backupDir: string) {
		if (this.settings.maxBackups <= 0) return;

		try {
			const files = fs.readdirSync(backupDir)
				.filter(file => file.endsWith('.zip'))
				.map(file => ({
					name: file,
					path: path.join(backupDir, file),
					mtime: fs.statSync(path.join(backupDir, file)).mtime
				}))
				.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

			// Remove old backups beyond the limit
			for (let i = this.settings.maxBackups; i < files.length; i++) {
				fs.unlinkSync(files[i].path);
				console.log(`Removed old backup: ${files[i].name}`);
			}
		} catch (error) {
			console.error('Failed to cleanup old backups:', error);
		}
	}
}

class AutoVaultBackupSettingTab extends PluginSettingTab {
	plugin: AutoVaultBackupPlugin;

	constructor(app: App, plugin: AutoVaultBackupPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Auto Vault Backup Settings' });

		new Setting(containerEl)
			.setName('Backup Directory')
			.setDesc('Directory where backups will be stored. Leave empty to use vault/backups folder.')
			.addText(text => text
				.setPlaceholder('Enter backup directory path')
				.setValue(this.plugin.settings.backupDirectory)
				.onChange(async (value) => {
					this.plugin.settings.backupDirectory = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Backup on Close')
			.setDesc('Automatically create backup when closing the vault')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.backupOnClose)
				.onChange(async (value) => {
					this.plugin.settings.backupOnClose = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Backup on Open')
			.setDesc('Automatically create backup when opening the vault (creates backup of previous session)')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.backupOnOpen)
				.onChange(async (value) => {
					this.plugin.settings.backupOnOpen = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Include Attachments')
			.setDesc('Include non-markdown files (images, videos, etc.) in backup')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.includeAttachments)
				.onChange(async (value) => {
					this.plugin.settings.includeAttachments = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Maximum Backups')
			.setDesc('Maximum number of backups to keep (0 = unlimited)')
			.addSlider(slider => slider
				.setLimits(0, 50, 1)
				.setValue(this.plugin.settings.maxBackups)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.maxBackups = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', { text: 'Manual Backup' });
		containerEl.createEl('p', { text: 'Use the ribbon icon or command palette to create a backup manually.' });
	}
}
