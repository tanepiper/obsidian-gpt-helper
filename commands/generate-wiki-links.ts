import { Notice } from "obsidian";
import { agents, prompts } from "../lib/settings.js";
import type DigitalGardener from "../main.js";
import generateWikiLinksPrompt from "./generate-wiki-links.md";

interface WikiLink {
	fileName: string;
	filePath: string;
	reason: string;
	score: number;
}

/**
 * Rename a file from it's contents
 * @param plugin The parent plugin
 * @returns
 */
export function generateWikiLinks(plugin: DigitalGardener) {
	return {
		id: "dg-generate-wiki-links",
		name: "Append WikiLinks to current file",
		checkCallback: async (checking: boolean) => {
			const file = plugin.app?.workspace?.getActiveFile();
			if (file?.path) {
				if (!checking) {
					let prompt = `${agents.digitalGardener}\n\n`;
					prompt += `${generateWikiLinksPrompt}\n\n`;

					// We need all files if the use will also want tags, so lets do it anyway
					const allMarkdownFiles =
						plugin.app.vault.getMarkdownFiles();

					const allMDFileNames = Object.fromEntries(
						allMarkdownFiles.map((file) => [file.path, file.name])
					);
					prompt += `The following is a list of all markdown files in the current Obsidian vault:
					${JSON.stringify(allMDFileNames, null, 2)}
					When creating the content, create wikilinks to relevant files, these files exist in the list above
					Obsidian's [[FILENAME]] WikiLinks to connect the content.`;

					const contents = await plugin.app.vault.cachedRead(file);
					const result = await plugin.openAI.requestJSON(
						prompt,
						contents,
						plugin.settings
					);
					if (!result?.wikiLinks) {
						return false;
					} else if (result.wikiLinks.length > 0) {
						let outputLinks = "";
						const wikiLinks = result.wikiLinks.map(
							(wikiLink: WikiLink) => {
								const { fileName, filePath, reason, score } =
									wikiLink;
								outputLinks += `- [[${filePath}|${fileName}]] (Reason: ${reason}, Relevancy: ${score})\n`;
							}
						);
						plugin.appendContentToActiveFile(outputLinks);
					}
				}
				return true;
			}
			return false;
		},
	};
}
