import {
	App,
	Notice,
	PluginSettingTab,
	Setting,
	normalizePath,
} from "obsidian";
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

		containerEl.createEl("h1", { text: "🧑🏼‍🌾 Digital Gardener" });
		containerEl.createEl("p", { text: "Built GPT-like agents directly in Obsidian" });

		/**
		 * OpenAI Setting Section
		 */
		containerEl.createEl("h2", { text: "OpenAI Settings" });

		/**
		 * OpenAI API Key
		 */
		new Setting(containerEl)
			.setName("OpenAI API Key")
			.setDesc(
				"The OpenAI API key to use for requests"
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
		containerEl.createEl("h2", { text: "About you" });

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
		containerEl.createEl("h2", { text: "Agent Settings" });

		new Setting(containerEl)
			.setName("Root directory")
			.setDesc(
				`Select a root directory for your Digital Garden, this is where all files and notes will be stored in a particular folder layout
				\n Click the button to create the folder structure if it doesn't exist`
			)
			.addDropdown(async (dropdown) => {
				const folders = await this.getSortedFolderList();
				dropdown.addOption("none", "None");
				dropdown.addOptions(Object.fromEntries(folders));
				dropdown.setValue(this.plugin.settings.rootFolder);
				dropdown.onChange(async (value) => {
					this.plugin.settings.rootFolder = value;
					await this.plugin.saveSettings();
				});
			})
			.addButton(async (button) => {
				button.setButtonText("Use").onClick(async () => {
					const { rootFolder } = this.plugin.settings;
					const agentPath = normalizePath(`${rootFolder}/agents`);
					const notesPath = normalizePath(`${rootFolder}/notes`);
					const promptsPath = normalizePath(`${rootFolder}/prompts`);

					console.log(agentPath, notesPath, promptsPath);

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
			});
		/**
		 * Emoji Level
		 */
		new Setting(containerEl)
			.setName("Emoji Level?")
			.setDesc("How many emojis should it use 🤔")
			.addDropdown((dropdown) => {
				dropdown.setValue(this.plugin.settings.emojiLevel);
				dropdown.addOption("none", "None");
				dropdown.addOption("low", "⬇️ Low");
				dropdown.addOption("medium", "🎉 Some");
				dropdown.addOption("high", "🍒🔥💩");
				dropdown.onChange(async (value) => {
					this.plugin.settings.emojiLevel = value as EmojiLevel;
					await this.plugin.saveSettings();
				});
			});
	}
}
