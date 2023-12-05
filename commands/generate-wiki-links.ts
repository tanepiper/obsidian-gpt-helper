import { ChatCompletionMessageParam } from "openai/resources/index.js";
import { agents } from "../lib/settings.js";
import type DigitalGardener from "../main.js";
import generateWikiLinksPrompt from "./generate-wiki-links.md";
import { Notice } from "obsidian";

interface WikiLink {
	fileName: string;
	linkLabel: string;
	reason: string;
	score: number;
}

/**
 * Rename a file from it's contents
 * @param plugin The parent plugin
 * @returns
 */
export function cmdGenerateWikiLinks(plugin: DigitalGardener) {
	const settings = plugin.state.getSettings();

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
					${JSON.stringify(allMDFileNames, null, 2)}`;

					new Notice(
						`🧑🏼‍🌾 Digital Gardener\nFinding WikiLinks for ${file.name}`
					);

					let time = 0;
					const timer = plugin.registerInterval(
						window.setInterval(() => {
							time++;
							plugin.updateDefaultStatusText(
								`Finding WikiLinks: ${time}s`
							);
						}, 1000)
					);

					const contents = await plugin.app.vault.cachedRead(file);
					const messages: ChatCompletionMessageParam[] = [
						{ role: "system", content: prompt },
						{ role: "user", content: `${contents}` },
					];
					const result = await plugin.openAI.requestJSON(messages);
					window.clearInterval(timer);
					plugin.updateDefaultStatusText();

					if (!result?.wikiLinks) {
						return false;
					} else if (result.wikiLinks.length > 0) {
						console.log(result.wikiLinks);
						const wikiLinks: string[] = result.wikiLinks.map(
							(wikiLink: WikiLink) => {
								const { fileName, linkLabel, reason, score } = wikiLink;
								if (file.path.includes(fileName)) {
									return "";
								}
								return `- [[${fileName}|${linkLabel}]] (Reason: ${reason}, Relevancy: ${score})`;
							}
						).filter((link: string) => link !== "");
						plugin.appendContentToActiveFile(wikiLinks.join("\n"));
					}
				}
				return true;
			}
			return false;
		},
	};
}
