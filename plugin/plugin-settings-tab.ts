import {
	App,
	PluginSettingTab,
	Setting
} from "obsidian";
import {
	AVAILABLE_MODELS,
	type EmojiLevel
} from "../lib/settings.js";
import { type DigitalGardener } from "./plugin.js";

/**
 * This class provides the settings tab for the plugin
 */
export class GPTHelperSettingTab extends PluginSettingTab {
	/**
	 * The plugin instance
	 */
	plugin: DigitalGardener;
	/**
	 *
	 * @param app The Obsidian App
	 * @param plugin The plugin instance
	 */
	constructor(app: App, plugin: DigitalGardener) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async display(): Promise<void> {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h1", { text: "🧑🏼‍🌾 Digital Gardener" });
		containerEl.createEl("p", {
			text: "Built GPT-like agents directly in Obsidian",
		});

		/**
		 * OpenAI Setting Section
		 */
		containerEl.createEl("h2", { text: "OpenAI Settings" });

		/**
		 * OpenAI API Key
		 */
		new Setting(containerEl)
			.setName("OpenAI API Key")
			.setDesc("The OpenAI API key to use for requests")
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
	}
}
