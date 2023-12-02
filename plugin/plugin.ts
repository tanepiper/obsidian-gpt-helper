import { Notice, Plugin, WorkspaceLeaf } from "obsidian";
import { generateFileProperties } from "../commands/generate-file-properties.js";
import { generateWikiLinks } from "../commands/generate-wiki-links.js";
import { newFileFromPrompt } from "../commands/generate-file-from-query.js";
import { renameFileFromContents } from "../commands/rename-file-from-contents.js";
import { DGOpenAIClient, createOpenAIClient } from "../lib/gpt.js";
import {
	DEFAULT_SETTINGS,
	type DigitalGardenerSettings,
} from "../lib/settings.js";
import { GPTHelperSettingTab } from "./plugin-settings-tab.js";
import { DGChatAgentView, DG_CHAT_AGENT_VIEW } from "views/agent-view.js";
import { DGStateManager } from "./state.js";

export class DigitalGardener extends Plugin {
	state: DGStateManager;

	/**
	 * The instance settings for the plugin
	 */
	settings: DigitalGardenerSettings;

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
	 * The status bar item element
	 */
	statusBarItemEl: HTMLElement;

	/**
	 * The path to the notes folder
	 */
	notesPath: string;

	/**
	 * The path to the agents folder
	 */
	agentsPath: string;

	/**
	 * The path to the agents folder
	 */
	promptsPath: string;

	async onload() {
		this.state = new DGStateManager(this, DEFAULT_SETTINGS);
		await this.state.load();
		this.statusBarItemEl = this.addStatusBarItem();

		this.registerView(
			DG_CHAT_AGENT_VIEW,
			(leaf) => new DGChatAgentView(leaf, this)
		);

		// Do initial setup routines
		await this.setupFolders();

		const { openAIAPIKey } = this.state.settings;

		if (!openAIAPIKey) {
			new Notice(
				"🧑🏼‍🌾 Digital Gardener Error:\n\nNo OpenAI API Key Set, please update this in Obsidian plugin settings"
			);
			this.statusBarItemEl.setText("🧑🏼‍🌾 No API Key");
			return;
		}
		this.openAI = createOpenAIClient(openAIAPIKey);
		this.updateDefaultStatusText();
		this.addRibbonIcon("bot", "Digital Gardener Chat", () => {
			this.activateView(DG_CHAT_AGENT_VIEW);
		});

		/**
		 * Commands
		 */

		// Rename a file from it's contents
		this.addCommand(renameFileFromContents(this) as any);

		// Generate a new file from a prompt
		this.addCommand(newFileFromPrompt(this) as any);

		// Generate file properties
		this.addCommand(generateFileProperties(this) as any);

		// Generate WikiLinks
		this.addCommand(generateWikiLinks(this) as any);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new GPTHelperSettingTab(this.app, this));
	}

	onunload() {}

	/**
	 * Get the paths for all the app folders and if they don't exist, create them
	 */
	async setupFolders() {
		this.rootFolder = `${this.app.vault.getRoot().path}${
			this.state.settings.rootFolder
		}`;
		if (!this.app.vault.adapter.exists(this.rootFolder)) {
			await this.app.vault.createFolder(this.rootFolder);
		}

		this.notesPath = `${this.rootFolder}/notes`;
		if (!this.app.vault.adapter.exists(this.notesPath)) {
			await this.app.vault.createFolder(this.notesPath);
		}
		this.agentsPath = `${this.rootFolder}/agents`;
		if (!this.app.vault.adapter.exists(this.agentsPath)) {
			await this.app.vault.createFolder(this.agentsPath);
		}
		this.promptsPath = `${this.rootFolder}/prompts`;
		if (!this.app.vault.adapter.exists(this.promptsPath)) {
			await this.app.vault.createFolder(this.promptsPath);
		}
	}

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
			`🧑🏼‍🌾 ${this.state.settings.openAIModel ?? "No Model Set"}`,
			`🔥 ${this.state.settings.oaiTemperature ?? "No Temperature Set"}`,
			`🔢 ${
				this.formatNumberWithK(this.state.settings.oaiMaxTokens) ??
				"No Max Tokens Set"
			}`,
		];
		if (inProgressText) defaultStatusText.push(`⏳ ${inProgressText}`);

		this.defaultStatusText = defaultStatusText.join(" ");

		this.statusBarItemEl.setText(this.defaultStatusText);
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
}
