import { Notice } from "obsidian";
import {
	DigitalGardenerModal,
	type ModalCallOptions,
} from "views/chat-modal.js";
import { agents, prompts } from "../lib/settings.js";
import GPTHelper from "../main.js";

/**
 * Rename a file from it's contents
 * @param plugin The parent plugin
 * @returns
 */
export function newFileFromPrompt(plugin: GPTHelper) {
	return {
		id: "dg-new-file-from-prompt",
		name: "New file from prompt",
		callback: async () => {
			new DigitalGardenerModal(
				plugin,
				async (options: ModalCallOptions) => {
					const allMarkdownFiles = plugin.app.vault
						.getMarkdownFiles()
						.map((file) => file.name);

					let prompt = `${agents.digitalGardener}\n\n${prompts.newFileFromPrompt}\n\n`;
					prompt += `The following is a list of all markdown files in the current Obsidian vault:

					${allMarkdownFiles.join("\n")}

					When creating the content, if you find any related content names, you can use
					Obsidian's [[FILENAME]] WikiLinks to connect the content.`;

					const result = await plugin.openAI.requestJSON(
						prompt,
						`${options.userQuery}`,
						plugin.settings.openAIModel
					);

					let output = "";
					if (result?.frontmatterRaw) {
						output += `${result.frontmatterRaw}\n\n`;
					}
					output += result.content;
					const filename = `${plugin.notesPath}/${result.title}.md`;
					plugin.app.vault.create(filename, output);
					new Notice(`🧑🏼‍🌾 New file\n${result.title}`, 0);
				}
			).open();
		},
	};
}
