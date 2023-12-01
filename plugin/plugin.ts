import { Notice, Plugin } from "obsidian";
import { generateFileProperties } from "../commands/generate-file-properties.js";
import { generateWikiLinks } from "../commands/generate-wiki-links.js";
import { newFileFromPrompt } from "../commands/new-file-user-prompt.js";
import { renameFileFromContents } from "../commands/rename-file-from-contents.js";
import { DGOpenAIClient, createOpenAIClient } from "../lib/gpt.js";
import {
	DEFAULT_SETTINGS,
	type DigitalGardenerSettings,
} from "../lib/settings.js";
import { GPTHelperSettingTab } from "./plugin-settings-tab.js";

export class GPTHelper extends Plugin {
	/**
	 * The instance settings for the plugin
	 */
	settings: DigitalGardenerSettings;

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
		await this.loadSettings();

		this.rootFolder = `${this.app.vault.getRoot().path}${
			this.settings.rootFolder
		}`;

		this.notesPath = `${this.rootFolder}/notes`;
		this.agentsPath = `${this.rootFolder}/agents`;
		this.promptsPath = `${this.rootFolder}/prompts`;

		if (!this.app.vault.adapter.exists(this.rootFolder)) {
			await this.app.vault.createFolder(this.rootFolder);
			await this.app.vault.createFolder(this.notesPath); // Create a notes folder
			await this.app.vault.createFolder(this.agentsPath); // Create an agents folder
			await this.app.vault.createFolder(this.promptsPath);
		}

		this.openAI = createOpenAIClient(this.settings.openAIAPIKey);

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		this.statusBarItemEl = this.addStatusBarItem();
		if (!this.settings.openAIAPIKey) {
			new Notice(
				"🧑🏼‍🌾 No OpenAI API Key set\nplease set one in the settings"
			);
			this.statusBarItemEl.setText("🧑🏼‍🌾 No API Key");
			return;
		}

		this.statusBarItemEl.setText(`🧑🏼‍🌾 ${this.settings.openAIModel}`);

		this.addCommand(renameFileFromContents(this) as any);
		this.addCommand(newFileFromPrompt(this) as any);
		this.addCommand(generateFileProperties(this) as any);
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
	}

	/**
	 * Save the settings data to the plugin folder for the current user
	 */
	async saveSettings() {
		await this.saveData(this.settings);
	}
}
