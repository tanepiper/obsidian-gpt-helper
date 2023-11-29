import { Notice } from "obsidian";
import { DigitalGardenerModal, type ModalCallOptions } from "../views/chat-modal.js";

/**
 * Creates a new file from the user prompt in Obsidian
 * @returns 
 */
export default function newFileUserPrompt() {
	return {
		id: "gpt-helper_file_from_prompt",
		name: "Generate new file from prompt",
		callback: () => {
			new DigitalGardenerModal(this.app, async (options: ModalCallOptions) => {
				this.updateStatusBar();
				const timerId = this.registerInterval(
					window.setInterval(() => this.updateStatusBar(), 1000)
				);
				const result = await this.openAI.requestChat(
					this.settings.introText,
					options.queryText,
					this.settings.openAIModel
				);
				//if (!markdownView) {
				const filename = `${this.outputPath}/gpt-${Date.now()}.md`;
				this.app.vault.create(filename, result);
				new Notice(
					`GPT Helper: ${filename} created with ${result.length} characters in length}`
				);
				// } else if (editor) {
				// 	editor.replaceRange(
				// 		`\n\n${result}\n\n`,
				// 		editor.getCursor()
				// 	);
				// }
				window.clearInterval(timerId);
				this.statusBarItemEl.setText(
					`GPT Helper: Done in ${this.time}s`
				);
			}).open();
		},
	};
}
