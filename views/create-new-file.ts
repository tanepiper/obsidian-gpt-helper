import { AVAILABLE_MODELS, EmojiLevel } from "lib/settings.js";
import type DigitalGardener from "../main.js";
import {
	ButtonComponent,
	ItemView,
	Setting,
	TextAreaComponent,
	type WorkspaceLeaf,
} from "obsidian";

export const DG_CREATE_NEW_FILE_VIEW_TYPE = "dg-create-new-file-from-prompt";
export const DG_CREATE_NEW_FILE_VIEW_DISPLAY_TEXT =
	"Create New File from prompt";

/**
 * View for the creation of a new file in Obsidian using the Digital Gardener plugin.
 */
export class CreateNewFileView extends ItemView {
	plugin: DigitalGardener;
	headingContainer: Element;
	mainContainer: Element;

	options: {
		prompt: string;
		personalise: boolean;
		includeFileReferences: boolean;
		includeTags: boolean;
		emojiLevel: EmojiLevel;
		openAI: {
			model: string;
			temperature: number;
			max_tokens: number;
		};
	};

	constructor(leaf: WorkspaceLeaf, plugin: DigitalGardener) {
		super(leaf);
		this.plugin = plugin;
		this.options = {
			prompt: "",
			personalise: plugin.settings?.userName ? true : false,
			includeFileReferences: false,
			includeTags: false,
			emojiLevel: plugin.settings?.emojiLevel || "none",
			openAI: {
				model: plugin.settings?.openAIModel || "davinci",
				temperature: plugin.settings?.oaiTemperature || 0.5,
				max_tokens: plugin.settings?.oaiMaxTokens || 150,
			},
		};
	}

	getViewType() {
		return DG_CREATE_NEW_FILE_VIEW_TYPE;
	}

	getDisplayText() {
		return DG_CREATE_NEW_FILE_VIEW_DISPLAY_TEXT;
	}

	async onOpen() {
		this.headingContainer = this.containerEl.children[0];
		this.mainContainer = this.containerEl.children[1];
		this.mainContainer.empty();
		this.mainContainer.createEl("h6", {
			text: DG_CREATE_NEW_FILE_VIEW_DISPLAY_TEXT,
		});

		this.createChatArea(this.mainContainer);
		this.createOptionsArea(this.mainContainer);
		this.createOpenAIOptionsArea(this.mainContainer);
	}

	createChatArea(containerEl: Element) {
		/** Query Container Start */
		const queryContainer = containerEl.createDiv("query-container");
		queryContainer.createEl("h6", {
			text: "Your Prompt",
		});

		new TextAreaComponent(queryContainer)
			.setPlaceholder("Enter a prompt you want to send to the agent")
			.onChange((value) => (this.options.prompt = value))
			.then((textArea) => {
				textArea.inputEl.style.width = "100%";
				textArea.inputEl.style.minHeight = "100px";
				textArea.inputEl.focus();
			});
		this.createButtonArea(queryContainer);
	}

	createButtonArea(containerEl: Element) {
		const buttonContainer = containerEl.createDiv("button-container");
		buttonContainer.style.display = "flex";
		buttonContainer.style.justifyContent = "flex-end";
		// const cancelButton = new ButtonComponent(buttonContainer)
		// 	.setButtonText("Cancel")
		// 	.onClick(async () => {
		// 		this.plugin.
		// 	});
		const submitButton = new ButtonComponent(buttonContainer)
			.setButtonText("Submit")
			.setCta()
			.onClick(async () => {
				// cancelButton.setDisabled(true); // TODO: We need to be able to pass an AbortController to the request
				// submitButton
				// 	.setButtonText("Submitting...")
				// 	.removeCta()
				// 	.setDisabled(true);
				// optionsArea.innerHTML = "";
				// optionsArea.createEl("h2", { text: "Generating Response" });
				// const loadingContainer =
				// 	optionsArea.createDiv("loading-container");
				// loadingContainer.innerHTML = loadingSVG;
				// let time = 0;
				// const timeoutOutput = loadingContainer.createEl("h3", {
				// 	text: "Please wait, this may take a few seconds...",
				// });
				// const timeout = this.plugin.registerInterval(
				// 	window.setInterval(() => {
				// 		time++;
				// 		timeoutOutput.innerText = `Please wait, this may take a few seconds... ${time}s`;
				// 	}, 1000)
				// );
				// await this.onSubmit(this.options).then(() => {
				// 	window.clearInterval(timeout);
				// 	this.close();
				// });
			});
		/** Query Container End */
	}

	createOptionsArea(containerEl: Element) {
		containerEl.createEl("h6", {
			text: "Prompt Options",
		});
		const optionsArea = containerEl.createDiv("options-container");
		optionsArea.style.marginTop = "10px";

		if (!this.plugin.settings?.userName) {
			this.options.personalise = false;
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
					toggle.setValue(this.options.personalise);
					toggle.onChange((value) => {
						this.options.personalise = value;
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
				toggle.setValue(this.options.includeFileReferences);
				toggle.onChange((value) => {
					this.options.includeFileReferences = value;
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
	}

	createOpenAIOptionsArea(containerEl: Element) {
		containerEl.createEl("h6", { text: "OpenAI Options" });
		const optionsArea = containerEl.createDiv("options-container");
		optionsArea.style.marginTop = "10px";
		/**
		 * OpenAI Model to use
		 */
		new Setting(optionsArea)
			.setName("OpenAI Model")
			.setDesc(
				"The OpenAI model to use.\nSelect to override the default OpenAI model from the plugin settings"
			)
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(AVAILABLE_MODELS)
					.setValue(this.options.openAI.model)
					.onChange(
						async (value) => (this.options.openAI.model = value)
					)
			);

		/**
		 * OpenAI Temperature
		 */
		new Setting(optionsArea)
			.setName("Temperature")
			.setDesc(
				`The temperature to use when generating text. You can change this to get more or less random results, the current value is the plugin default temperature`
			)
			.addText((text) =>
				text
					.setValue(`${this.options.openAI.temperature.toFixed(2)}`)
					.onChange(async (value) => {
						this.options.openAI.temperature = parseFloat(value);
					})
			);

		/**
		 * OpenAI Max Tokens
		 */
		new Setting(optionsArea)
			.setName("Max Tokens")
			.setDesc(
				`The maximum number of tokens to use when generating text. The current value is the plugin default max tokens`
			)
			.addText((text) =>
				text
					.setValue(`${this.options.openAI.max_tokens}`)
					.onChange(
						async (value) =>
							(this.options.openAI.max_tokens = parseInt(value))
					)
			);
	}
}
