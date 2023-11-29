import { DGOpenAIClient, createOpenAIClient } from "lib/gpt.js";
import { DEFAULT_SETTINGS, type GPTHelperSettings } from "../lib/settings.js";
import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import { DigitalGardenerModal, ModalCallOptions } from "../views/chat-modal.js";
import { GPTHelperSettingTab } from "./plugin-settings-tab.js";

export class GPTHelper extends Plugin {
	/**
	 * The instance settings for the plugin
	 */
	settings: GPTHelperSettings;

	/**
	 * The OpenAI instance used for requests
	 */
	openAI: DGOpenAIClient;

	outputPath: string;

	time = 0;
	statusBarItemEl: HTMLElement;

	updateStatusBar() {
		this.time += 1;
		this.statusBarItemEl.setText(
			`GPT Helper: Awaiting OpenAI response (${this.time}s)`
		);
	}

	async onload() {
		await this.loadSettings();

		this.outputPath = `${this.app.vault.getRoot().path}/${
			this.settings.outputPath
		}`;

		if (!this.app.vault.adapter.exists(this.outputPath)) {
			this.app.vault.createFolder(this.outputPath);
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

		this.addCommand({
			id: "digital-gardener_file_from_prompt",
			name: "Generate new file from prompt",
			callback: () => {
				new DigitalGardenerModal(
					this.app,
					async (options: ModalCallOptions) => {
						const activePrompts = this.getActivePromptOptions();
						let prompt = activePrompts.introText;
						prompt += activePrompts.contentText;
						prompt += activePrompts.frontMatterText;
						prompt += activePrompts.dataViewsText;
						prompt += "\n\n";

						if (activePrompts.emojiLevel > 0) {
							prompt +=
								"The user has selected a level of emoji usage of ";
							prompt +=
								activePrompts.emojiLevel === 2
									? "high - this means feel free to liberally use emojis in your response to make it more fun and engaging! 🎉"
									: "medium - this means the user is ok with some emoji in the response but not too many. 😊";
						} else {
							prompt +=
								"The user has selected that you use no emjois in your response, please keep this in mind when writing your response unless explicity asked by the user to give it";
						}
						if (activePrompts.userName) {
							prompt += "\n\n";
							prompt += `The user has asked that you address them as ${activePrompts.userName}. `;
						}
						if (activePrompts.userPronouns) {
							prompt += `The user has asked that you use the pronouns ${activePrompts.userPronouns}. `;
						}
						if (activePrompts.userLanguages) {
							prompt += `The user has asked that you use the following languages in responding: ${activePrompts.userLanguages}. `;
						}
						if (activePrompts.userBio) {
							prompt += `The user has given the following bio for you to use when considering responses to them: ${activePrompts.userBio}. `;
						}

						const result = await this.openAI.requestChat(
							prompt,
							options.queryText,
							this.settings.openAIModel
						);
						const filename = `${
							this.outputPath
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

	getActivePromptOptions() {
		return {
			introText: this.settings.introText,
			contentText: this.settings.contentText,
			frontMatterText: this.settings.frontmatterText,
			dataViewsText: this.settings.dataViewText,
			emojiLevel: this.settings.emojiLevel,
			userName: this.settings.userName,
			userPronouns: this.settings.userPronouns,
			userBio: this.settings.userBio,
			userLanguages: this.settings.userLanguages,
		};
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
		console.log(this.settings);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
