import { AVAILABLE_MODELS, type EmojiLevel } from "../lib/settings.js";
import GPTHelper from "../main.js";
import { App, ButtonComponent, Modal, Setting } from "obsidian";

export interface ModalCallOptions {
	includePersonalisation?: boolean;
	userQuery: string;
	openAIModel: string;
	oaiTemperature: number;
	oaiMaxTokens: number;
	emojiLevel: EmojiLevel
}

/**
 * The digital gardener modal is where the plugin handles a users input request with
 * GPT using the agent prompts specified in the settings
 */
export class DigitalGardenerModal extends Modal {
	plugin: GPTHelper;

	options: ModalCallOptions = {
		includePersonalisation: true,
		userQuery: "",
		openAIModel: "",
		oaiTemperature: 0.5,
		oaiMaxTokens: 150,
		emojiLevel: "low"
	};

	/**
	 * The callback to run when the modal is submitted
	 */
	onSubmit: (options: ModalCallOptions) => Promise<void>;

	constructor(
		plugin: GPTHelper,
		onSubmit: (options: ModalCallOptions) => Promise<void>
	) {
		super(plugin.app);
		this.plugin = plugin;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "New Digital Gardener Query" });

		contentEl.createEl("h2", { text: "Request Options" });
		new Setting(contentEl)
			.setName("Personalise Request")
			.setDesc("Use personalisation settings from the settings tab")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.userName !== "");
				toggle.onChange((value) => {
					this.options.includePersonalisation = value;
				});
			});

			new Setting(contentEl)
			.setName("Emoji Level?")
			.setDesc("How many emojis should it use 🤔")
			.addDropdown((dropdown) => {
				
				dropdown.addOption("none", "None");
				dropdown.addOption("low", "⬇️ Low");
				dropdown.addOption("medium", "🎉 Some");
				dropdown.addOption("high", "🍒🔥💩");
				dropdown.setValue(this.plugin.settings.emojiLevel);
				dropdown.onChange(async (value) => {
					this.options.emojiLevel = value as EmojiLevel;
				});
			});

		new Setting(contentEl).setName("Your Query").addTextArea((text) => {
			text.setPlaceholder(
				"Enter the query you want to send to the agent"
			);
			text.onChange((value) => {
				this.options.userQuery = value;
			});
		});

		contentEl.createEl("h2", { text: "OpenAI Options" });
		/**
		 * OpenAI Model to use
		 */
		new Setting(contentEl)
			.setName("OpenAI Model")
			.setDesc("Select the OpenAI model to use for this request")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(AVAILABLE_MODELS)
					.setValue(this.plugin.settings.openAIModel)
					.onChange(
						async (value) => (this.options.openAIModel = value)
					)
			);

		/**
		 * OpenAI Temperature
		 */
		new Setting(contentEl)
			.setName("Temperature")
			.setDesc(`Enter the temperature to use when generating text`)
			.addText((text) =>
				text
					.setValue(
						`${this.plugin.settings.oaiTemperature.toFixed(2)}`
					)
					.onChange(async (value) => {
						this.options.oaiTemperature = parseFloat(value);
					})
			);

		/**
		 * OpenAI Max Tokens
		 */
		new Setting(contentEl)
			.setName("Max Tokens")
			.setDesc(`The maximum number of tokens to use when generating text`)
			.addText((text) =>
				text
					.setValue(`${this.plugin.settings.oaiMaxTokens}`)
					.onChange(
						async (value) =>
							(this.options.oaiMaxTokens = parseInt(value))
					)
			);

		// new Setting(contentEl)
		// 	.setName("Create frontmatter?")
		// 	.setDesc("Create or add frontmatter in a file")
		// 	.addToggle((toggle) => {
		// 		toggle.setValue(true);
		// 		toggle.onChange((value) => {
		// 			this.options.includeFrontMatterText = value;
		// 		});
		// 	});
		// new Setting(contentEl)
		// 	.setName("Create data views?")
		// 	.setDesc(
		// 		"If it finds an interesting data view, create it for the new file"
		// 	)
		// 	.addToggle((toggle) => {
		// 		toggle.setValue(true);
		// 		toggle.onChange((value) => {
		// 			this.options.includeDataViewsText = value;
		// 		});
		// 	});
		// new Setting(contentEl)
		// 	.setName("Emoji Level?")
		// 	.setDesc("How many emojis should it use 🤔")
		// 	.addDropdown((dropdown) => {
		// 		dropdown.addOption("0", "None");
		// 		dropdown.addOption("1", "Some");
		// 		dropdown.addOption("2", "🍒🔥💩");
		// 		dropdown.setValue(`${this.options.emojiLevel}`);
		// 		dropdown.onChange((value) => {
		// 			this.options.emojiLevel = parseInt(value);
		// 		});
		// 	});

		// new Setting(contentEl)
		// 	.setName("Create new file?")
		// 	.setDesc("Create a new file with the output from GPT")
		// 	.addToggle((toggle) => {
		// 		toggle.setValue(true);
		// 		toggle.onChange((value) => {
		// 			this.options.createNewFile = value;
		// 		});
		// 	});

		const buttonContainer = contentEl.createDiv("button-container");
		buttonContainer.style.display = "flex";
		buttonContainer.style.justifyContent = "space-around";
		new ButtonComponent(buttonContainer)
			.setButtonText("Cancel")
			.onClick(async () => {
				this.close();
			});
		const b = new ButtonComponent(buttonContainer)
			.setButtonText("Submit")
			.setCta()
			.onClick(async () => {
				b.setButtonText("Submitting...").setDisabled(true);
				await this.onSubmit(this.options).then(() => {
					this.close();
				});
			});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
