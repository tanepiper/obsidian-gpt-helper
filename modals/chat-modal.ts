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
	includePersonalisation: boolean;
	includeFilenames: boolean;
	includeTags: boolean;
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
		includePersonalisation: false,
		includeFilenames: false,
		includeTags: false,
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
		optionsArea.style.marginTop = "10px";

		if (!this.plugin.settings?.userName) {
			this.options.includePersonalisation = false;
		} else {
			// Personalisation Toggle
			new Setting(optionsArea)
				.setName(
					`Personalise request for ${this.plugin.settings.userName}`
				)
				.setDesc(
					"Use the personalisation settings set for you as a user to personalise the request"
				)
				.addToggle((toggle) => {
					toggle.setValue(this.options.includePersonalisation);
					toggle.onChange((value) => {
						this.options.includePersonalisation = value;
					});
				});
		}

		// Include Files Toggle
		new Setting(optionsArea)
			.setName("Include all file references")
			.setDesc(
				"If enabled, before the requests is sent an object of all file paths and names will be passed to the request. Please note this will add to the total tokens sent to OpenAI"
			)
			.addToggle((toggle) => {
				toggle.setValue(this.options.includeFilenames);
				toggle.onChange((value) => {
					this.options.includeFilenames = value;
				});
			});

		// Include Tags Toggle
		new Setting(optionsArea)
			.setName("Include all tags")
			.setDesc(
				"If enabled, before the requests is sent comma seperated list of all tags will be passed to the request. Please note this will add to the total tokens sent to OpenAI"
			)

			.addToggle((toggle) => {
				toggle.setValue(this.options.includeTags);
				toggle.onChange((value) => {
					this.options.includeTags = value;
				});
			});

		this.options.emojiLevel = this.plugin.settings.emojiLevel;
		new Setting(optionsArea)
			.setName("Emoji Level?")
			.setDesc(
				"Select the amount of emojis the agent can use in the response, by default this will use the value from the settings."
			)
			.addDropdown((dropdown) => {
				dropdown.addOption("none", "None");
				dropdown.addOption("low", "⬇️ Low");
				dropdown.addOption("medium", "🎉 Some");
				dropdown.addOption("high", "🍒🔥💩");
				dropdown.setValue(this.options.emojiLevel);
				dropdown.onChange(async (value) => {
					this.options.emojiLevel = value as EmojiLevel;
				});
			});

		optionsArea.createEl("h2", { text: "OpenAI Options" });
		/**
		 * OpenAI Model to use
		 */
		this.options.openAIModel = this.plugin.settings.openAIModel;
		new Setting(optionsArea)
			.setName("OpenAI Model")
			.setDesc(
				"The OpenAI model to use.\nSelect to override the default OpenAI model from the plugin settings"
			)
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(AVAILABLE_MODELS)
					.setValue(this.options.openAIModel)
					.onChange(
						async (value) => (this.options.openAIModel = value)
					)
			);

		/**
		 * OpenAI Temperature
		 */
		this.options.oaiTemperature = this.plugin.settings.oaiTemperature;
		new Setting(optionsArea)
			.setName("Temperature")
			.setDesc(
				`The temperature to use when generating text. You can change this to get more or less random results, the current value is the plugin default temperature`
			)
			.addText((text) =>
				text
					.setValue(
						`${this.options.oaiTemperature.toFixed(
							2
						)}`
					)
					.onChange(async (value) => {
						this.options.oaiTemperature = parseFloat(value);
					})
			);

		/**
		 * OpenAI Max Tokens
		 */
		this.options.oaiMaxTokens = this.plugin.settings.oaiMaxTokens;
		new Setting(optionsArea)
			.setName("Max Tokens")
			.setDesc(
				`The maximum number of tokens to use when generating text. The current value is the plugin default max tokens`
			)
			.addText((text) =>
				text
					.setValue(`${this.options.oaiMaxTokens}`)
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
