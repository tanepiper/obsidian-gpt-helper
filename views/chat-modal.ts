import { App, Modal, Setting } from "obsidian";

export interface ModalCallOptions {
	queryText: string;
	createNewFile: boolean;
}

/**
 * The digital gardener modal is where the plugin handles a users input request with
 * GPT using the agent prompts specified in the settings
 */
export class DigitalGardenerModal extends Modal {
	/**
	 * The final query text to send to GPT
	 */
	queryText: string;
	/**
	 * Whether to create a new file or not
	 */
	createNewFile: boolean;

	includeIntroText: boolean;
	includeContentText: boolean;
	includeFrontMatterText: boolean;
	includeDataViewsText: boolean;
	emojLevel: number;
	/**
	 * The callback to run when the modal is submitted
	 */
	onSubmit: (options: ModalCallOptions) => Promise<void>;

	constructor(
		app: App,
		onSubmit: (options: ModalCallOptions) => Promise<void>
	) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "What would you like to do today?" });
		contentEl.createEl("p", {
			text: `The Digital Gardener is here to help you with your Obsidian notes, you can ask it to do anything like research a topic,
			get back a set of links, create new properties and more.`,
		});
		contentEl.createEl("p", {
			text: `You can select if you want a new file created, or the output at the cursor position in the current file if it's open,
			you can also create frontmatter and dataviews from properties for the new file`,
		});

		contentEl.createEl("h2", { text: "Request Options" });
		new Setting(contentEl)
			.setName("Add Content Template File?")
			.setDesc("Include the description of how to create content?")
			.addToggle((toggle) => {
				toggle.setValue(true);
				toggle.onChange((value) => {
					this.includeFrontMatterText = value;
				});
			});

		new Setting(contentEl)
			.setName("Create frontmatter?")
			.setDesc("Create or add frontmatter in a file")
			.addToggle((toggle) => {
				toggle.setValue(true);
				toggle.onChange((value) => {
					this.includeFrontMatterText = value;
				});
			});
		new Setting(contentEl)
			.setName("Create data views?")
			.setDesc(
				"If it finds an interesting data view, create it for the new file"
			)
			.addToggle((toggle) => {
				toggle.setValue(true);
				toggle.onChange((value) => {
					this.includeDataViewsText = value;
				});
			});
		new Setting(contentEl)
			.setName("Emoji Level?")
			.setDesc("How many emojis should it use 🤔")
			.addDropdown((dropdown) => {
				dropdown.addOption("0", "None");
				dropdown.addOption("1", "Some");
				dropdown.addOption("2", "🍒🔥💩");
				dropdown.setValue(`${this.emojLevel}`)
				dropdown.onChange((value) => {
					this.emojLevel = parseInt(value);
				});
			});

		new Setting(contentEl)
			.setName("Create new file?")
			.setDesc("Create a new file with the output from GPT")
			.addToggle((toggle) => {
				toggle.setValue(true);
				toggle.onChange((value) => {
					this.createNewFile = value;
				});
			});
		new Setting(contentEl)
			.setName("Your Query Prompt")
			.addTextArea((text) => {
				text.setPlaceholder("Enter your query prompt here");
				text.onChange((value) => {
					this.queryText = value;
				});
			});

		new Setting(contentEl).addButton((btn) =>
			btn.setButtonText("Cancel").onClick(async () => {
				this.close();
			})
		);

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(async () => {
					btn.setButtonText("Submitting...").setDisabled(true);
					await this.onSubmit({
						queryText: this.queryText,
						createNewFile: this.createNewFile,
					}).then(() => {
						this.close();
					});
				})
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
