import { findAllTags } from "lib/obsidian.js";
import { Command, Notice } from "obsidian";
import {
	DigitalGardenerModal,
	type ModalCallOptions,
} from "modals/chat-modal.js";
import {
	createEmojiLevelSetting,
	generateInitialPrompt,
} from "../lib/dynamic-prompts";
import DigitalGardener from "../main.js";
import { DGMessageModal } from "../modals/simple-modal.js";
import generateFileFromQueryPrompt from "./generate-file-from-query.md";
import { ChatCompletionMessageParam } from "openai/resources";
import { DG_CREATE_NEW_FILE_VIEW_TYPE } from "views/create-new-file";

/**
 * Rename a file from it's contents
 * @param plugin The parent plugin
 * @returns
 */
export function cmdGenerateFileFromQuery(plugin: DigitalGardener): Command {
	return {
		id: "dg-generate-file-from-query",
		name: "Generate New File From Query",
		icon: "file-plus",
		callback: async () => {

			await plugin.activateView(DG_CREATE_NEW_FILE_VIEW_TYPE);

			// new DigitalGardenerModal(
			// 	plugin,
			// 	async (options: ModalCallOptions) => {
			// 		let prompt = await generateInitialPrompt(plugin, options);
			// 		prompt += `${createEmojiLevelSetting(
			// 			options.emojiLevel
			// 		)}\n\n`;

			// 		prompt += `${generateFileFromQueryPrompt}\n\n`;

			// 		// We need all files if the use will also want tags, so lets do it anyway
			// 		const allMarkdownFiles =
			// 			plugin.app.vault.getMarkdownFiles();

			// 		if (options.includeFilenames) {
			// 			const allMDFileNames = Object.fromEntries(
			// 				allMarkdownFiles.map((file) => [
			// 					file.path,
			// 					file.name,
			// 				])
			// 			);
			// 			prompt += `The following is a list of all markdown files in the current Obsidian vault:
			// 		${JSON.stringify(allMDFileNames, null, 2)}
			// 		When creating the content, create wikilinks to relevant files, these files exist in the list above
			// 		Obsidian's [[FILENAME]] WikiLinks to connect the content.`;
			// 		}

			// 		if (options.includeTags) {
			// 			const tags = new Set<string>();

			// 			allMarkdownFiles.forEach((file) => {
			// 				findAllTags(plugin.app, file, tags);
			// 			});

			// 			prompt += `\n\n`;
			// 			prompt += `Here are all the tags available in the current vault, reuse ones that are relevant:
			// 		${Array.from(tags).join(", ")}
			// 		`;
			// 		}

			// 		const messages: ChatCompletionMessageParam[] = [
			// 			{ role: "system", content: prompt },
			// 			{ role: "user", content: `${options.userQuery}` },
			// 		];

			// 		const result = await plugin.openAI.requestJSON(
			// 			messages,
			// 			options
			// 		);

			// 		if (result?.error) {
			// 			new DGMessageModal(plugin, {
			// 				title: "Error",
			// 				message:
			// 					`${result.message}\n\n${result.error}`.trim(),
			// 			}).open();
			// 			return;
			// 		}

			// 		const filename = `${
			// 			plugin.settings.rootFolder
			// 		}/notes/${result.filename.replace(".md", "")}.md`;
			// 		const file = await plugin.fileHandler.createFile(
			// 			filename,
			// 			result.content
			// 		);
			// 		await plugin.app.fileManager.processFrontMatter(
			// 			file,
			// 			(frontmatter) => {
			// 				Object.assign(
			// 					frontmatter,
			// 					result?.frontmatter ?? {}
			// 				);
			// 			}
			// 		);
			// 		new Notice(`🧑🏼‍🌾 New file\n${file.name}`);
			// 		await plugin.app.workspace.getLeaf(false).openFile(file);
			// 	}
			// ).open();
		},
	};
}
