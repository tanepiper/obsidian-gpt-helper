import { AVAILABLE_MODELS, type EmojiLevel } from "../lib/settings.js";
import DigitalGardener from "../main.js";
import {
	App,
	ButtonComponent,
	Modal,
	Setting,
	TextAreaComponent,
} from "obsidian";
import loadingSVG from "../assets/loader.svg";

export interface ModalCallOptions {
	includePersonalisation?: boolean;
	includeFilenames?: boolean;
	includeTags?: boolean;
	userQuery: string;
	openAIModel: string;
	oaiTemperature: number;
	oaiMaxTokens: number;
	emojiLevel: EmojiLevel;
}

/**
 * The digital gardener modal is where the plugin handles a users input request with
 * GPT using the agent prompts specified in the settings
 */
export class DigitalGardenerModal extends Modal {
	plugin: DigitalGardener;

	options: ModalCallOptions = {
		includePersonalisation: true,
		includeFilenames: true,
		includeTags: true,
		userQuery: "",
		openAIModel: "",
		oaiTemperature: 0.5,
		oaiMaxTokens: 150,
		emojiLevel: "low",
	};

	/**
	 * The callback to run when the modal is submitted
	 */
	onSubmit: (options: ModalCallOptions) => Promise<void>;

	constructor(
		plugin: DigitalGardener,
		onSubmit: (options: ModalCallOptions) => Promise<void>
	) {
		super(plugin.app);
		this.plugin = plugin;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		let queryContainer;
		let buttonContainer;
		let optionsArea: HTMLDivElement;

		contentEl.createEl("h1", { text: "🧑🏼‍🌾 How can I help?" });

		/** Query Container Start */
		queryContainer = contentEl.createDiv("query-container");
		queryContainer.createEl("p", {
			text: "Enter your query below and I'll do my best to help you out.",
		});
		new TextAreaComponent(queryContainer)
			.setPlaceholder("Enter the query you want to send to the agent")
			.onChange((value) => {
				this.options.userQuery = value;
			})
			.then((ta) => {
				ta.inputEl.style.width = "100%";
				ta.inputEl.style.minHeight = "100px";
				ta.inputEl.focus();
			});

		buttonContainer = queryContainer.createDiv("button-container");
		buttonContainer.style.display = "flex";
		buttonContainer.style.justifyContent = "space-around";
		const cancelButton = new ButtonComponent(buttonContainer)
			.setButtonText("Cancel")
			.onClick(async () => {
				this.close();
			});
		const submitButton = new ButtonComponent(buttonContainer)
			.setButtonText("Submit")
			.setCta()
			.onClick(async () => {
				cancelButton.setDisabled(true); // TODO: We need to be able to pass an AbortController to the request
				submitButton
					.setButtonText("Submitting...")
					.removeCta()
					.setDisabled(true);

				optionsArea.innerHTML = "";
				optionsArea.createEl("h2", { text: "Generating Response" });
				const loadingContainer =
					optionsArea.createDiv("loading-container");
				loadingContainer.innerHTML = loadingSVG;

				let time = 0;
				const timeoutOutput = loadingContainer.createEl("h3", {
					text: "Please wait, this may take a few seconds...",
				});
				const timeout = this.plugin.registerInterval(
					window.setInterval(() => {
						time++;
						timeoutOutput.innerText = `Please wait, this may take a few seconds... ${time}s`;
					}, 1000)
				);

				await this.onSubmit(this.options).then(() => {
					window.clearInterval(timeout);
					this.close();
				});
			});
		/** Query Container End */

		/** Options Container Start */
		optionsArea = contentEl.createDiv("options-container");

		optionsArea.createEl("h2", { text: "Include Options" });
		// Personalisation Toggle
		new Setting(optionsArea)
			.setName("Personalise Request")
			.setDesc("Use personalisation settings from the settings tab")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.state.settings.userName !== "");
				toggle.onChange((value) => {
					this.options.includePersonalisation = value;
				});
			});

		// Include Files Toggle
		new Setting(optionsArea)
			.setName("Include Files")
			.setDesc("Include file references in the request")
			.addToggle((toggle) => {
				toggle.setValue(true);
				toggle.onChange((value) => {
					this.options.includeFilenames = value;
				});
			});

		// Include Tags Toggle
		new Setting(optionsArea)
			.setName("Include Tags")
			.setDesc("Include tag references in the request")
			.addToggle((toggle) => {
				toggle.setValue(true);
				toggle.onChange((value) => {
					this.options.includeTags = value;
				});
			});

		new Setting(optionsArea)
			.setName("Emoji Level?")
			.setDesc("How many emojis should it use 🤔")
			.addDropdown((dropdown) => {
				dropdown.addOption("none", "None");
				dropdown.addOption("low", "⬇️ Low");
				dropdown.addOption("medium", "🎉 Some");
				dropdown.addOption("high", "🍒🔥💩");
				dropdown.setValue(this.plugin.state.settings.emojiLevel);
				dropdown.onChange(async (value) => {
					this.options.emojiLevel = value as EmojiLevel;
				});
			});

		optionsArea.createEl("h2", { text: "OpenAI Options" });
		/**
		 * OpenAI Model to use
		 */
		new Setting(optionsArea)
			.setName("OpenAI Model")
			.setDesc("Select the OpenAI model to use for this request")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(AVAILABLE_MODELS)
					.setValue(this.plugin.state.settings.openAIModel)
					.onChange(
						async (value) => (this.options.openAIModel = value)
					)
			);

		/**
		 * OpenAI Temperature
		 */
		new Setting(optionsArea)
			.setName("Temperature")
			.setDesc(`Enter the temperature to use when generating text`)
			.addText((text) =>
				text
					.setValue(
						`${this.plugin.state.settings.oaiTemperature.toFixed(2)}`
					)
					.onChange(async (value) => {
						this.options.oaiTemperature = parseFloat(value);
					})
			);

		/**
		 * OpenAI Max Tokens
		 */
		new Setting(optionsArea)
			.setName("Max Tokens")
			.setDesc(`The maximum number of tokens to use when generating text`)
			.addText((text) =>
				text
					.setValue(`${this.plugin.state.settings.oaiMaxTokens}`)
					.onChange(
						async (value) =>
							(this.options.oaiMaxTokens = parseInt(value))
					)
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
