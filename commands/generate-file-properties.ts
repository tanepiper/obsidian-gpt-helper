import { Notice } from "obsidian";
import { agents } from "../lib/settings.js";
import type DigitalGardener from "../main.js";
import generateFilePropertiesPrompt from "./generate-file-properties.md";
import { DGMessageModal } from "../modals/simple-modal.js";
/**
 * Rename a file from it's contents
 * @param plugin The parent plugin
 * @returns
 */
export function generateFileProperties(plugin: DigitalGardener) {
	const settings = plugin.state.getSettings();

	return {
		id: "dg-generate-file-properties",
		name: "Generate properties for current file",
		checkCallback: async (checking: boolean) => {
			const file = plugin.app?.workspace?.getActiveFile();
			if (file?.path) {
				if (!checking) {
					let prompt = `${agents.digitalGardener}\n\n`;
					prompt += `Some additional important information:\n\n`;
					prompt += `Today's date: ${new Date().toLocaleDateString()}\n\n`;
					prompt += `${generateFilePropertiesPrompt}\n\n`;

					const paths = file.path?.split("/") ?? [];
					const currentFileName = paths.pop();
					new Notice(
						`🧑🏼‍🌾 Checking ${currentFileName} for new properties`
					);
					const contents = await plugin.app.vault.cachedRead(file);
					const result = await plugin.openAI.requestJSON(
						prompt,
						contents,
						settings
					);

					if (!result?.frontmatter) {
						new DGMessageModal(plugin, {
							title: "No properties generated",
							message: `No properties were generated for ${currentFileName}`,
						}).open();
						return;
					}

					const propertiesMessage = Object.entries(result.frontmatter)
						.map(([key, val]: [string, string]) => {
							return `${key}: ${val}`;
						})
						.join("\n");

					new DGMessageModal(
						plugin,
						{
							title: "Properties generated",
							message: `Properties were generated for ${currentFileName}`,
						},
						undefined,
						async () => {
							await plugin.app.fileManager.processFrontMatter(
								file,
								(frontmatter) => {
									Object.assign(
										frontmatter,
										result.frontmatter
									);
								}
							);
						}
					).open();
				}
				return true;
			}
			return false;
		},
	};
}
