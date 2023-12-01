import { Notice, Plugin } from "obsidian";
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

export class DigitalGardener extends Plugin {
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
		this.statusBarItemEl = this.addStatusBarItem();

		// Do initial setup routines
		await this.loadSettings();
		await this.setupFolders();

		if (!this.settings.openAIAPIKey) {
			new Notice(
				"🧑🏼‍🌾 Digital Gardener Error:\n\nNo OpenAI API Key Set, please update this in Obsidian plugin settings"
			);
			this.statusBarItemEl.setText("🧑🏼‍🌾 No API Key");
			return;
		}
		this.openAI = createOpenAIClient(this.settings.openAIAPIKey);
		this.updateDefaultStatusText();

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

		// this.addCommand({
		// 	id: "gpt-helper_from_selection",
		// 	name: "Generate new file text selection",
		// 	editorCallback: async (editor: Editor, view: MarkdownView) => {
		// 		const sel = editor.getSelection();
		// 		const result = await this.openAI.requestChat(
		// 			this.settings.introText,
		// 			sel,
		// 			this.settings.openAIModel
		// 		);
		// 		const filename = `${this.rootFolder}/gpt-${Date.now()}.md`;
		// 		this.app.vault.create(filename, result);
		// 		new Notice(
		// 			`GPT Helper: ${filename} created with ${result.length} characters in length}`
		// 		);
		// 	},
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new GPTHelperSettingTab(this.app, this));
	}

	onunload() {}

	/**
	 * Load the settings data from the plugin folder for the current user
	 */
	async loadSettings(): Promise<void> {
		const loadedSettings = await this.loadData();
		if (Object.keys(loadedSettings).length === 0) {
			this.settings = DEFAULT_SETTINGS;
			return;
		}
		this.settings = { ...this.settings, ...loadedSettings };
		this.updateDefaultStatusText();
	}

	/**
	 * Save the settings data to the plugin folder for the current user
	 */
	async saveSettings() {
		await this.saveData(this.settings);
		this.updateDefaultStatusText();
	}

	/**
	 * Get the paths for all the app folders and if they don't exist, create them
	 */
	async setupFolders() {
		this.rootFolder = `${this.app.vault.getRoot().path}${
			this.settings.rootFolder
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
			`🧑🏼‍🌾 ${this.settings?.openAIModel ?? "No Model Set"}`,
			`🔥 ${this.settings?.oaiTemperature ?? "No Temperature Set"}`,
			`🔢 ${
				this.formatNumberWithK(this.settings?.oaiMaxTokens) ??
				"No Max Tokens Set"
			}`,
		];
		if (inProgressText) defaultStatusText.push(`⏳ ${inProgressText}`);

		this.defaultStatusText = defaultStatusText.join(" ");

		this.statusBarItemEl.setText(this.defaultStatusText);
	}
}
