import { Notice } from "obsidian";
import { agents, prompts } from "../lib/settings.js";
import type GPTHelper from "../main.js";

/**
 * Rename a file from it's contents
 * @param plugin The parent plugin
 * @returns
 */
export function generateFileProperties(plugin: GPTHelper) {
	return {
		id: "dg-generate-file-properties",
		name: "Generate properties for current file",
		checkCallback: async (checking: boolean) => {
			const file = plugin.app?.workspace?.getActiveFile();
			if (file?.path) {
				if (!checking) {
					const paths = file.path?.split("/") ?? [];
					const currentFileName = paths.pop();
					new Notice(
						`🧑🏼‍🌾 Checking ${currentFileName} for new properties`
					);
					const contents = await plugin.app.vault.cachedRead(file);
					const result = await plugin.openAI.requestJSON(
						`${agents.digitalGardener}\n\n${prompts.generateProperties}`,
						contents,
						plugin.settings.openAIModel
					);

					await plugin.app.fileManager.processFrontMatter(
						file,
						(frontmatter) => {
							Object.assign(frontmatter, result.frontmatter);
						}
					);
				}
				return true;
			}
			return false;
		},
	};
}
