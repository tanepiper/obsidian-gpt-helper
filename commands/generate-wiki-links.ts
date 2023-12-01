import { Notice } from "obsidian";
import { agents, prompts } from "../lib/settings.js";
import type GPTHelper from "../main.js";

/**
 * Rename a file from it's contents
 * @param plugin The parent plugin
 * @returns
 */
export function generateWikiLinks(plugin: GPTHelper) {
	return {
		id: "dg-generate-wiki-links",
		name: "Generate WikiLinks for current file",
		checkCallback: async (checking: boolean) => {
			const file = plugin.app?.workspace?.getActiveFile();
			if (file?.path) {
				if (!checking) {
					const allMarkdownFiles = plugin.app.vault
						.getMarkdownFiles()
						.map((file) => file.path);

					let systemPrompt = `${agents.digitalGardener}\n\n${prompts.generateWikiLinks}`;
					systemPrompt += `\n\nThe following is a list of all markdown files in the current Obsidian vault:\n\n`;
					systemPrompt += JSON.stringify(allMarkdownFiles, null, 2);

					const paths = file.path?.split("/") ?? [];
					const currentFileName = paths.pop();
					new Notice(
						`🧑🏼‍🌾 Checking ${currentFileName} for new wikilinks`
					);
					const contents = await plugin.app.vault.cachedRead(file);
					const result = await plugin.openAI.requestJSON(
						systemPrompt,
						contents,
						plugin.settings.openAIModel
					);
					if (!result?.wikiLinks) {
						return false;
					}
					console.log(result.wikiLinks);
					const wikiLinks = Object.entries(result.wikiLinks)
						.map(([key, val]: [string, string]) => {
							console.log(key, file, file.path.includes(key));
							if (`/${file.path}` === key) {
								return null;
							}
							return `[[${key}|${val}]]`;
						})
						.filter((link) => link !== null);

					await plugin.app.fileManager.processFrontMatter(
						file,
						(frontmatter) => {
							Object.assign(frontmatter, { wikiLinks });
						}
					);
				}
				return true;
			}
			return false;
		},
	};
}
