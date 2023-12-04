import { Notice, Plugin, WorkspaceLeaf } from "obsidian";
import { DG_CHAT_AGENT_VIEW } from "views/agent-view.js";
import {
	cmdGenerateFileFromQuery,
	cmdGenerateFileProperties,
	cmdGenerateWikiLinks,
	cmdRenameFileFromContents,
} from "../commands/index.js";
import { DGOpenAIClient, createOpenAIClient } from "../lib/gpt.js";
import {
	DEFAULT_SETTINGS,
	type DigitalGardenerSettings,
} from "../lib/settings.js";
import ChatView from "../views/chat-agent.js";
import {
	DGStateManager,
	DGStatusBar,
	DGVaultFileHandler,
} from "./lib/index.js";
import { createInstaller } from "./lib/install.js";
import { GPTHelperSettingTab } from "./plugin-settings-tab.js";

/**
 * The Digital Gardener is a plugin for Obsidian that works with OpenAI-compatible GPT APIs to allow
 * you to create agents that can help you with your Obsidian vault.
 */
export class DigitalGardener extends Plugin {
	/**
	 * File handler for working with Obsidian vaults and files
	 */
	private fileHandler: DGVaultFileHandler;

	/**
	 * A status bar for displaying information about the plugin
	 */
	statusBar: DGStatusBar;

	/**
	 * The state manager for the plugin
	 */
	state: DGStateManager;

	/**
	 * The default status bar text
	 */
	defaultStatusText: string;

	/**
	 * The OpenAI instance used for requests
	 */
	openAI: DGOpenAIClient;

	/**
	 * The root output path for the plugin to use to work with files
	 */
	rootFolder: string;

	/**
	 * Get the settings for the plugin from the state manager
	 */
	get settings(): DigitalGardenerSettings {
		return this.state.getSettings();
	}

	set settings(_settings: DigitalGardenerSettings) {
		this.state.updateSettings(_settings);
	}

	async saveSettings() {
		await this.state.saveSettings();
	}

	/**
	 * Set up additional classes that help with the plugin
	 */
	private async setupClassHelpers() {
		// Before other helpers load the settings
		this.state = new DGStateManager(this, DEFAULT_SETTINGS);
		await this.state.load();

		this.fileHandler = new DGVaultFileHandler(
			this.app,
			this.settings?.rootFolder ?? "digital-gardener"
		);
		this.statusBar = new DGStatusBar(this.addStatusBarItem());
	}

	/**
	 * Run the plugin installer
	 */
	private async installPlugin() {
		const installer = createInstaller(this.fileHandler);
		await installer.createConfigFolders([
			"notes",
			"agents",
			"prompts",
			"chats",
		]);
	}

	/**
	 * Setup views for the plugin
	 */
	private setupViews() {
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new GPTHelperSettingTab(this.app, this));

		this.registerView(
			DG_CHAT_AGENT_VIEW,
			(leaf) => new ChatView(leaf, this)
		);
		this.addRibbonIcon("bot", "Digital Gardener Chat", () => {
			this.activateView(DG_CHAT_AGENT_VIEW);
		});
	}

	/**
	 * Setup commands for the plugin
	 */
	private setupCommands() {
		this.addCommand(cmdRenameFileFromContents(this) as any);
		this.addCommand(cmdGenerateFileFromQuery(this) as any);
		this.addCommand(cmdGenerateFileProperties(this) as any);
		this.addCommand(cmdGenerateWikiLinks(this) as any);
	}

	async onload() {
		await this.setupClassHelpers();

		if (!(await this.fileHandler.rootFolderExists())) {
			await this.installPlugin();
		}
		this.setupViews();
		this.setupCommands();

		const { openAIAPIKey } = this.settings;

		if (!openAIAPIKey) {
			new Notice(
				"🧑🏼‍🌾 Digital Gardener Error:\n\nNo OpenAI API Key Set, please update this in Obsidian plugin settings"
			);
			this.statusBar.setContent("🧑🏼‍🌾 No API Key");
			return;
		}
		this.openAI = createOpenAIClient(this, openAIAPIKey);
		this.updateDefaultStatusText();
	}

	onunload() {}

	formatNumberWithK(num: number): string {
		if (num < 1000) {
			return num.toString();
		} else {
			return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + "k";
		}
	}

	async appendContentToActiveFile(content: string): Promise<void> {
		try {
			// Get the currently active file
			const activeFile = this.app.workspace.getActiveFile();
			if (!activeFile) {
				console.error("No active file selected");
				return;
			}

			// Perform the asynchronous operation to get new content

			// Append the new content to the file
			await this.app.vault.append(activeFile, "\n" + content);
		} catch (error) {
			console.error("Error appending content to the file:", error);
		}
	}

	updateDefaultStatusText(inProgressText = "") {
		const defaultStatusText = [
			`🧑🏼‍🌾 ${this.settings.openAIModel ?? "No Model Set"}`,
			`🔥 ${this.settings.oaiTemperature ?? "No Temperature Set"}`,
			`🔢 ${
				this.formatNumberWithK(this.settings.oaiMaxTokens) ??
				"No Max Tokens Set"
			}`,
		];
		if (inProgressText) defaultStatusText.push(`⏳ ${inProgressText}`);
		this.statusBar.setContent(defaultStatusText.join(" "));
	}

	async activateView(viewType: string) {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(viewType);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			await leaf.setViewState({ type: viewType, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf);
	}

	getMarkdownFilesAndNames(): Record<string, string> {
		const allMarkdownFiles = this.app.vault.getMarkdownFiles();
		return Object.fromEntries(
			allMarkdownFiles.map((file) => [file.path, file.name])
		);
	}

	async getAllUniqueFrontmatterKeys(): Promise<Set<string>> {
		const files = this.app.vault.getMarkdownFiles();
		const metadataCache = this.app.metadataCache;
		const uniqueKeys = new Set<string>();

		for (const file of files) {
			const metadata = metadataCache.getCache(file.path);
			if (metadata && metadata.frontmatter) {
				for (const key in metadata.frontmatter) {
					uniqueKeys.add(key);
				}
			}
		}

		return uniqueKeys;
	}
}
