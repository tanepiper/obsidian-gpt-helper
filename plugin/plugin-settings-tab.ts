import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import { type GPTHelper } from "./plugin.js";
import {
	AVAILABLE_MODELS,
	DEFAULT_SETTINGS,
	type EmojiLevel,
} from "../lib/settings.js";

/**
 * This class provides the settings tab for the plugin
 */
export class GPTHelperSettingTab extends PluginSettingTab {
	/**
	 * The plugin instance
	 */
	plugin: GPTHelper;
	/**
	 *
	 * @param app The Obsidian App
	 * @param plugin The plugin instance
	 */
	constructor(app: App, plugin: GPTHelper) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async getSortedFolderList(): Promise<[string, string][]> {
		const rootPath = this.app.vault.getRoot().path;
		const allFolders: string[] = [];
		await this.recursiveFolderSearch(rootPath, allFolders);
		allFolders.sort();
		return allFolders.map((folder: string) => [folder, folder]);
	}

	async recursiveFolderSearch(path: string, folderList: string[]) {
		const list = await this.app.vault.adapter.list(path);
		let folders = list?.folders ?? [];
		folders = folders.filter((folder) => {
			if (folder.includes(".obsidian")) return false;
			if (folder.includes(".git")) return false;
			if (folder.includes(".space")) return false;
			if (folder.includes(".trash")) return false;
			return true;
		});

		// Check if the path contains directories and recursively search them
		for (const folder of folders) {
			folderList.push(folder);
			await this.recursiveFolderSearch(folder, folderList);
		}
	}

	async display(): Promise<void> {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "🧑🏼‍🌾 Digital Gardener" });
		containerEl.createEl("h3", { text: "A GPT built into Obsidian" });

		/**
		 * OpenAI Setting Section
		 */
		containerEl.createEl("h3", { text: "OpenAI Settings" });

		/**
		 * OpenAI API Key
		 */
		new Setting(containerEl)
			.setName("OpenAI API Key")
			.setDesc(
				"Enter the OpenAI API key you wish to use (please note you will be charged by OpenAI for any requests made)"
			)
			.addText((text) =>
				text
					.setPlaceholder("sa-")
					.setValue(this.plugin.settings.openAIAPIKey)
					.onChange(async (value) => {
						this.plugin.settings.openAIAPIKey = value;
						await this.plugin.saveSettings();
					})
			);

		/**
		 * OpenAI Model to use
		 */
		new Setting(containerEl)
			.setName("Default OpenAI Model")
			.setDesc(
				"Select the default OpenAI model to use for any requests (can be changed per request)"
			)
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(AVAILABLE_MODELS)
					.setValue(this.plugin.settings.openAIModel)
					.onChange(async (value) => {
						this.plugin.settings.openAIModel = value;
						await this.plugin.saveSettings();
					})
			);

		/**
		 * OpenAI Temperature
		 */
		new Setting(containerEl)
			.setName("Temperature")
			.setDesc(`Enter the temperature to use when generating text`)
			.addText((slider) =>
				slider
					.setValue(
						`${this.plugin.settings.oaiTemperature.toFixed(2)}`
					)
					.onChange(async (value) => {
						this.plugin.settings.oaiTemperature = parseFloat(value);
						await this.plugin.saveSettings();
					})
			);

		/**
		 * OpenAI Max Tokens
		 */
		new Setting(containerEl)
			.setName("Max Tokens")
			.setDesc(`The maximum number of tokens to use when generating text`)
			.addText((slider) =>
				slider
					.setValue(`${this.plugin.settings.oaiMaxTokens}`)
					.onChange(async (value) => {
						this.plugin.settings.oaiMaxTokens = parseInt(value);
						await this.plugin.saveSettings();
					})
			);

		/**
		 * About You Section
		 */
		containerEl.createEl("h3", { text: "About you" });

		/**
		 * User Name
		 */
		new Setting(containerEl)
			.setName("Your Name")
			.setDesc("What should I call you?")
			.addText((text) =>
				text
					.setPlaceholder(
						"Enter your prefered name here or leave blank"
					)
					.setValue(this.plugin.settings.userName)
					.onChange(async (value) => {
						this.plugin.settings.userName = value;
						await this.plugin.saveSettings();
					})
			);

		/**
		 * User Pronouns
		 */
		new Setting(containerEl)
			.setName("Pronouns")
			.setDesc("Your pronouns")
			.addText((text) =>
				text
					.setPlaceholder(
						"Enter your prefered pronouns here or leave blank"
					)
					.setValue(this.plugin.settings.userPronouns)
					.onChange(async (value) => {
						this.plugin.settings.userPronouns = value;
						await this.plugin.saveSettings();
					})
			);

		/**
		 * User Languages
		 */
		new Setting(containerEl)
			.setName("Languages")
			.setDesc(
				"What languages do you want to work in? Put in a comma-separated list"
			)
			.addText((text) =>
				text
					.setPlaceholder(
						"Enter your prefered languages here or leave blank"
					)
					.setValue(this.plugin.settings.userLanguages)
					.onChange(async (value) => {
						this.plugin.settings.userLanguages = value;
						await this.plugin.saveSettings();
					})
			);

		/**
		 * User Bio
		 */
		new Setting(containerEl)
			.setName("Tell me a bit about yourself")
			.setDesc(
				"Enter a short bio about yourself, as much or as little as you like but it will be used to help generate prompts, but please be aware this may introduce biases and false data"
			)
			.addTextArea((text) =>
				text
					.setPlaceholder("Enter as much or as little as you like...")
					.setValue(this.plugin.settings.userBio)
					.onChange(async (value) => {
						this.plugin.settings.userBio = value;
						await this.plugin.saveSettings();
					})
			);

		/**
		 * Agent Settings
		 */
		containerEl.createEl("h3", { text: "Agent Settings" });

		/**
		 * Digital Gardener Root Folder
		 */
		new Setting(containerEl)
			.setName("Digital Gardener Root Folder")
			.setDesc("Enter the folder to make the root of your Digital Garden")
			.addText((text) =>
				text
					.setPlaceholder("Enter a folder name")
					.setValue(this.plugin.settings.outputPath)
					.onChange(async (value) => {
						this.plugin.settings.outputPath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Root directory")
			.setDesc(
				`Select a root directory for your Digital Garden, this is where all files and notes will be stored in a particular folder layout
				\n Click the button to create the folder structure if it doesn't exist`
			)
			.addDropdown(async (dropdown) => {
				const folders = await this.getSortedFolderList();
				dropdown.addOptions(Object.fromEntries(folders));
				dropdown.setValue(this.plugin.settings.rootFolder);
				dropdown.onChange(async (value) => {
					this.plugin.settings.rootFolder = value;
					await this.plugin.saveSettings();
				});
			})
			.addButton(async (button) => {
				button
				.setButtonText("Use")
				.setDisabled(await this.app.vault.adapter.exists(`${this.plugin.settings.rootFolder}/agents`))
				.onClick(async () => {
					const { rootFolder } = this.plugin.settings;
					const agentPath = `${rootFolder}/agents`;
					const notesPath = `${rootFolder}/notes`;
					const promptsPath = `${rootFolder}/prompts`;

					let message = `Creating Digital Garden at ${rootFolder}`;
					if (!this.app.vault.adapter.exists(agentPath)) {
						this.app.vault.createFolder(agentPath);
						message += `\nCreated Agents folder`;
					}
					if (!this.app.vault.adapter.exists(notesPath)) {
						this.app.vault.createFolder(notesPath);
						message += `\nCreated Notes folder`;
					}
					if (!this.app.vault.adapter.exists(promptsPath)) {
						this.app.vault.createFolder(promptsPath);
						message += `\nCreated Prompts folder`;
					}
					new Notice(message);
				});
			})
		/**
		 * Emoji Level
		 */
		new Setting(containerEl)
			.setName("Emoji Level?")
			.setDesc("How many emojis should it use 🤔")
			.addDropdown((dropdown) => {
				dropdown.addOption("none", "None");
				dropdown.addOption("low", "⬇️ Low");
				dropdown.addOption("medium", "🎉 Some");
				dropdown.addOption("high", "🍒🔥💩");
				dropdown.setValue(this.plugin.settings.emojiLevel);
				dropdown.onChange(async (value) => {
					this.plugin.settings.emojiLevel = value as EmojiLevel;
					await this.plugin.saveSettings();
				});
			});

		/**
		 * Prompts Section
		 */

		/**
		 * Intro Text
		 */
		new Setting(containerEl)
			.setName("Agent Introductory Text")
			.setDesc(
				"This is the introductory text that will be used when sending all agent requests"
			)
			.addTextArea((text) =>
				text
					.setPlaceholder(
						"Enter the introductory text for your agent"
					)
					.setValue(this.plugin.settings.introText)
					.onChange(async (value) => {
						this.plugin.settings.introText = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Context Text")
			.setDesc(
				"This is the text to define how you prefer your markdow content to be generated"
			)
			.addTextArea((text) =>
				text
					.setPlaceholder(
						"Enter the introductory text for your agent"
					)
					.setValue(this.plugin.settings.contentText)
					.onChange(async (value) => {
						this.plugin.settings.contentText = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Frontmatter Text")
			.setDesc(
				"This is the text sent to define the frontmatter of your markdown files is created"
			)
			.addTextArea((text) =>
				text
					.setPlaceholder(
						"Enter the introductory text for your agent"
					)
					.setValue(this.plugin.settings.frontmatterText)
					.onChange(async (value) => {
						this.plugin.settings.frontmatterText = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("DataView Text")
			.setDesc(
				"This is the text sent to define the dataview of your markdown files is created"
			)
			.addTextArea((text) =>
				text
					.setPlaceholder(
						"Enter the introductory text for your agent"
					)
					.setValue(this.plugin.settings.dataViewText)
					.onChange(async (value) => {
						this.plugin.settings.dataViewText = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Reset To Default Prompts")
			.setDesc("Reset to all default prompts")
			.addButton((button) =>
				button.setButtonText("Reset").onClick(async () => {
					this.plugin.settings.introText = DEFAULT_SETTINGS.introText;
					this.plugin.settings.contentText =
						DEFAULT_SETTINGS.contentText;
					this.plugin.settings.frontmatterText =
						DEFAULT_SETTINGS.frontmatterText;
					this.plugin.settings.dataViewText =
						DEFAULT_SETTINGS.dataViewText;
					await this.plugin.saveSettings();
					new Notice(
						"Prompts reset to default, please reload this page to see changes"
					);
					this.hide();
				})
			);
	}
}
