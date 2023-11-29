import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import OpenAI from "openai";

/**
 * Settings for the GPT Helper plugin
 */
interface GPTHelperSettings {
	/**
	 * The users OpenAI API Key
	 */
	openAIAPIKey: string;
	/**
	 * The OpenAI Model to use
	 */
	openAIModel: string;
	openAISettings: string;
	outputPath: string;
}

const DEFAULT_SETTINGS: GPTHelperSettings = {
	openAIAPIKey: "",
	openAIModel: "gpt-4",
	openAISettings: `You are an agent for the Knowledge Management Tool, Obsidian.

		Your task is to return content only in markdown format with frontmatter, based on the request of the user.
		
		When giving a response the first part should be in frontmatter with any properties that area approritate, also tags can be included here.  An example of a frontmatter might be:
		
		---
		Chapter Order: 1
		Tags:
		  - #Foo
		  - #Bar
		Due Date: Fri, 19th October
		Team: Team A
		---
		
		# Markdown title here
		
		This is content
		
		Around this structure and metadata, try to fulfil the users request as much as possible`,
	outputPath: "gpt-helper",
};

export default class GPTHelper extends Plugin {
	/**
	 * The instance settings for the plugin
	 */
	settings: GPTHelperSettings;

	/**
	 * The OpenAI instance used for requests
	 */
	openAI: OpenAI;

	outputPath: string;

	/**
	 * Make a chat request to OpenAI using the settings provided
	 * @param content
	 * @returns Promise<string>
	 */
	async requestChat(content: string): Promise<string> {
		let result = "";

		try {
			const response = await this.openAI.chat.completions.create({
				messages: [
					{
						role: "system",
						content: this.settings.openAISettings,
					},
					{ role: "user", content },
				],
				model: this.settings.openAIModel,
				stream: false,
			});

			if (response?.choices?.[0]?.message) {
				result = response?.choices?.[0]?.message.content as string;
			}
		} catch (e) {
			console.log(e);
		}

		return result;
	}

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

		this.openAI = new OpenAI({
			apiKey: this.settings.openAIAPIKey,
			dangerouslyAllowBrowser: true,
		});

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
			id: "gpt-helper_from_prompt",
			name: "Generate text from prompt",
			callback: () => {
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				// if (!markdownView) {
				// 	new Notice(
				// 		"GPT Helper: You need to run this in a markdown file"
				// 	);
				// 	this.app.vault.create(`${this.outputPath}/gpt-${Date.now()}.md`, "");
				// }

				new GPTEntryModal(this.app, async (body) => {
					this.updateStatusBar();
					const timerId = this.registerInterval(
						window.setInterval(() => this.updateStatusBar(), 1000)
					);
					const result = await this.requestChat(body);
					const editor = this.app.workspace.activeEditor?.editor;
					if (!markdownView) {
						const filename = `${
							this.outputPath
						}/gpt-${Date.now()}.md`;
						this.app.vault.create(filename, result);
						new Notice(
							`GPT Helper: ${filename} created with ${result.length} characters in length}`
						);
					} else if (editor) {
						editor.replaceRange(
							`\n\n${result}\n\n`,
							editor.getCursor()
						);
					}
					window.clearInterval(timerId);
					this.statusBarItemEl.setText(
						`GPT Helper: Done in ${this.time}s`
					);
				}).open();
			},
		});

		this.addCommand({
			id: "gpt-helper_from_selection",
			name: "Generate text from text selection",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const sel = editor.getSelection();
				this.time = 0;

				this.updateStatusBar();
				const timerId = this.registerInterval(
					window.setInterval(() => this.updateStatusBar(), 1000)
				);

				const result = await this.requestChat(sel);
				window.clearInterval(timerId);
				if (!result) {
					new Notice(
						"GPT Helper: No text generated, please try again"
					);
					this.statusBarItemEl.setText(`GPT Helper: Idle`);
					return;
				}

				editor.replaceRange(`\n\n${result}\n\n`, editor.getCursor());

				new Notice(
					`GPT Helper: GPT returned a response ${result.length} characters in length`
				);
				window.clearInterval(timerId);
				this.statusBarItemEl.setText(
					`GPT Helper: Done in ${this.time}s`
				);
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new GPTHelperSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class GPTEntryModal extends Modal {
	body: string;
	onSubmit: (result: string) => Promise<void>;

	constructor(app: App, onSubmit: (result: string) => Promise<void>) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Enter your ChatGPT Query" });

		new Setting(contentEl)
			.setName("Your Query Prompt")
			.addTextArea((text) => {
				text.setPlaceholder("Enter your query prompt here");
				text.onChange((value) => {
					this.body = value;
				});
			});

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(async () => {
					this.close();
					await this.onSubmit(this.body);
				})
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class GPTHelperSettingTab extends PluginSettingTab {
	plugin: GPTHelper;

	constructor(app: App, plugin: GPTHelper) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("OpenAI API Key")
			.setDesc("Enter your OpenAI API key")
			.addText((text) =>
				text
					.setPlaceholder("sa-")
					.setValue(this.plugin.settings.openAIAPIKey)
					.onChange(async (value) => {
						this.plugin.settings.openAIAPIKey = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("OpenAI Model")
			.setDesc("Select your OpenAI Model")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("gpt-4-vision-preview", "GPT4 Turbo + Vision")
					.addOption("gpt-4-1106-preview", "GPT4 Turbo")
					.addOption("gpt-4", "GPT-4")
					.addOption("gpt-35-turbo", "GPT3.5 Turbo")
					.setValue(this.plugin.settings.openAIModel)
					.onChange(async (value) => {
						this.plugin.settings.openAIModel = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("GPT Output Path for new files")
			.setDesc("Enter the path to save new files generated by GPT")
			.addText((text) =>
				text
					.setPlaceholder(
						"Enter the path to save new files generated by GPT"
					)
					.setValue(this.plugin.settings.openAIAPIKey)
					.onChange(async (value) => {
						this.plugin.settings.openAIAPIKey = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Your Instructions")
			.setDesc("Enter the instructions to send to the GPT Model")
			.addTextArea((text) =>
				text
					.setPlaceholder("Enter your instructions here")
					.setValue(this.plugin.settings.openAISettings)
					.onChange(async (value) => {
						this.plugin.settings.openAISettings = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
