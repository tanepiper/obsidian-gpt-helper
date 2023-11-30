import { renameFileFromContents } from "commands/rename-file-from-contents.js";
import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import {
	DGOpenAIClient,
	buildPrompt,
	createOpenAIClient,
} from "../lib/gpt.js";
import { DEFAULT_SETTINGS, type DigitalGardenerSettings } from "../lib/settings.js";
import { DigitalGardenerModal, ModalCallOptions } from "../views/chat-modal.js";
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
	outputPath: string;

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

	async onload() {
		await this.loadSettings();

		this.outputPath = `${this.app.vault.getRoot().path}/${
			this.settings.rootFolder
		}`;

		this.notesPath = `${this.outputPath}/notes`;
		this.agentsPath = `${this.outputPath}/agents`;

		if (!this.app.vault.adapter.exists(this.outputPath)) {
			await this.app.vault.createFolder(this.outputPath);
			await this.app.vault.createFolder(this.notesPath); // Create a notes folder
			await this.app.vault.createFolder(this.agentsPath); // Create an agents folder
		}

		this.openAI = createOpenAIClient(this.settings.openAIAPIKey);

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		this.statusBarItemEl = this.addStatusBarItem();
		this.statusBarItemEl.setText("GPT Helper: Waiting...");

		if (!this.settings.openAIAPIKey) {
			new Notice(
				"GPT Helper: To use this tool you require an OpenAI API Key. Please enter your API Key in the settings"
			);
			this.statusBarItemEl.setText("GPT Helper: No API Key");
			return;
		}

		this.addCommand(renameFileFromContents(this, this.settings) as any);

		this.addCommand({
			id: "dg-file_from_prompt",
			name: "Generate new file from prompt",
			callback: () => {
				new DigitalGardenerModal(
					this.app,
					async (options: ModalCallOptions) => {
						const prompt = buildPrompt(options, this.settings);

						const result = await this.openAI.requestChat(
							prompt,
							options.queryText,
							this.settings.openAIModel
						);
						const filename = `${
							this.notesPath
						}/gpt-${Date.now()}.md`;
						this.app.vault.create(filename, result);
						new Notice(
							`GPT Helper: ${filename} created with ${result.length} characters in length}`
						);
					}
				).open();
			},
		});

		this.addCommand({
			id: "gpt-helper_from_selection",
			name: "Generate new file text selection",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const sel = editor.getSelection();
				const result = await this.openAI.requestChat(
					this.settings.introText,
					sel,
					this.settings.openAIModel
				);
				const filename = `${this.outputPath}/gpt-${Date.now()}.md`;
				this.app.vault.create(filename, result);
				new Notice(
					`GPT Helper: ${filename} created with ${result.length} characters in length}`
				);
			},
		});

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
