import { findAllTags } from "lib/obsidian.js";
import { Command, Notice } from "obsidian";
import {
	DigitalGardenerModal,
	type ModalCallOptions,
} from "views/chat-modal.js";
import { createEmojiLevelSetting } from "../lib/dynamic-prompts";
import { agents } from "../lib/settings.js";
import DigitalGardener from "../main.js";
import { DGMessageModal } from "../views/simple-modal.js";
import generateFileFromQueryPrompt from "./generate-file-from-query.md";

/**
 * Rename a file from it's contents
 * @param plugin The parent plugin
 * @returns
 */
export function newFileFromPrompt(plugin: DigitalGardener): Command {
	const command: Command = {
		id: "dg-generate-file-from-query",
		name: "Generate New File From Query",
		icon: "file-plus",
		callback: async () => {
			new DigitalGardenerModal(
				plugin,
				async (options: ModalCallOptions) => {
					let prompt = `${agents.digitalGardener}\n\n`;

					prompt += `Some additional important information:\n\n`;
					prompt += `Today's date: ${new Date().toLocaleDateString()}\n\n`;
					if (options.includePersonalisation) {
						prompt += `The user has requested that you take the following personal information into account when generating the content:\n\n`;
						prompt += `Name: ${plugin.settings.userName}\n`;
						prompt += `Pronouns: ${plugin.settings.userPronouns}\n`;
						prompt += `Prefered Language: ${plugin.settings.userLanguages}\n`;
						prompt += `Biograph: ${plugin.settings.userBio}\n\n`;
					}
					prompt += `${createEmojiLevelSetting(
						options.emojiLevel
					)}\n\n`;

					prompt += `${generateFileFromQueryPrompt}\n\n`;

					// We need all files if the use will also want tags, so lets do it anyway
					const allMarkdownFiles =
						plugin.app.vault.getMarkdownFiles();

					if (options.includeFilenames) {
						const allMDFileNames = Object.fromEntries(
							allMarkdownFiles.map((file) => [
								file.path,
								file.name,
							])
						);
						prompt += `The following is a list of all markdown files in the current Obsidian vault:
					${JSON.stringify(allMDFileNames, null, 2)}
					When creating the content, create wikilinks to relevant files, these files exist in the list above
					Obsidian's [[FILENAME]] WikiLinks to connect the content.`;
					}

					if (options.includeTags) {
						const tags = new Set<string>();

						allMarkdownFiles.forEach((file) => {
							findAllTags(plugin.app, file, tags);
						});

						prompt += `\n\n`;
						prompt += `Here are all the tags available in the current vault, reuse ones that are relevant:
					${Array.from(tags).join(", ")}
					`;
					}

					const result = await plugin.openAI.requestJSON(
						prompt,
						`${options.userQuery}`,
						plugin.settings
					);

					if (result?.error) {
						new DGMessageModal(plugin, {
							title: "Error",
							message: `${result.message} ${result.error}`.trim(),
						}).open();
						return;
					}

					let output = "";
					if (result?.frontmatterRaw) {
						output += `${result.frontmatterRaw}\n\n`;
					}
					output += result.content;
					const filename = `${
						plugin.notesPath
					}/${result.filename.replace(".md", "")}.md`;
					const file = await plugin.app.vault.create(
						filename,
						output
					);
					new Notice(`🧑🏼‍🌾 New file\n${file.name}`);
					await plugin.app.workspace.getLeaf(false).openFile(file);
				}
			).open();
		},
	};
	return command;
}
